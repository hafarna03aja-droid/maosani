/**
 * Progress Service — Supabase CRUD for Buku Kendali Digital
 * Falls back gracefully when Supabase is not configured
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const progressService = {
  /**
   * Get all progress records for a santri
   */
  getSantriProgress: async (santriId) => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('santri_id', santriId)
      .order('step_number');

    return error ? [] : data;
  },

  /**
   * Start a step (create or update to in_progress)
   */
  startStep: async (santriId, stepNumber, exercisesTotal = 10) => {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('progress')
      .upsert({
        santri_id: santriId,
        step_number: stepNumber,
        status: 'in_progress',
        exercises_total: exercisesTotal,
        started_at: new Date().toISOString(),
      }, {
        onConflict: 'santri_id,step_number',
      })
      .select()
      .single();

    return error ? null : data;
  },

  /**
   * Submit step for guru review
   */
  submitForReview: async (santriId, stepNumber) => {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('progress')
      .update({
        status: 'pending_review',
        completed_at: new Date().toISOString(),
      })
      .eq('santri_id', santriId)
      .eq('step_number', stepNumber)
      .select()
      .single();

    // Create notification for guru(s)
    if (!error) {
      const { data: gurus } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['guru', 'admin']);

      if (gurus?.length) {
        const notifications = gurus.map(guru => ({
          user_id: guru.id,
          type: 'review_requested',
          title: `Langkah ${stepNumber} menunggu review`,
          message: `Santri telah menyelesaikan Langkah ${stepNumber} dan menunggu penilaian.`,
          data: { santri_id: santriId, step_number: stepNumber },
        }));
        await supabase.from('notifications').insert(notifications);
      }
    }

    return error ? null : data;
  },

  /**
   * Guru: Approve step
   */
  approveStep: async (santriId, stepNumber, guruId, scores, notes) => {
    if (!isSupabaseConfigured()) return null;

    const scoreTotal = ((scores.makhroj + scores.tajwid + scores.kelancaran) / 3).toFixed(1);

    const { data, error } = await supabase
      .from('progress')
      .update({
        status: 'approved',
        score_makhroj: scores.makhroj,
        score_tajwid: scores.tajwid,
        score_kelancaran: scores.kelancaran,
        score_total: scoreTotal,
        approved_by: guruId,
        guru_notes: notes,
        approved_at: new Date().toISOString(),
      })
      .eq('santri_id', santriId)
      .eq('step_number', stepNumber)
      .select()
      .single();

    // Notify santri
    if (!error) {
      await supabase.from('notifications').insert({
        user_id: santriId,
        type: 'step_approved',
        title: `Langkah ${stepNumber} Disetujui! ✅`,
        message: `Selamat! Nilai Anda: ${scoreTotal}. ${notes || ''}`,
        data: { step_number: stepNumber, score: scoreTotal },
      });
    }

    return error ? null : data;
  },

  /**
   * Guru: Request retry
   */
  requestRetry: async (santriId, stepNumber, guruId, notes) => {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('progress')
      .update({
        status: 'needs_retry',
        guru_notes: notes,
        approved_by: guruId,
      })
      .eq('santri_id', santriId)
      .eq('step_number', stepNumber)
      .select()
      .single();

    if (!error) {
      await supabase.from('notifications').insert({
        user_id: santriId,
        type: 'step_rejected',
        title: `Langkah ${stepNumber} Perlu Diulang`,
        message: notes || 'Guru meminta Anda mengulang langkah ini.',
        data: { step_number: stepNumber },
      });
    }

    return error ? null : data;
  },

  /**
   * Update exercise progress
   */
  updateExercises: async (santriId, stepNumber, completed) => {
    if (!isSupabaseConfigured()) return null;

    const { error } = await supabase
      .from('progress')
      .update({ exercises_completed: completed })
      .eq('santri_id', santriId)
      .eq('step_number', stepNumber);

    return !error;
  },

  /**
   * Get all pending reviews (for guru dashboard)
   */
  getPendingReviews: async () => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('progress')
      .select(`
        *,
        santri:profiles!santri_id (id, full_name, email, avatar_url)
      `)
      .eq('status', 'pending_review')
      .order('completed_at', { ascending: true });

    return error ? [] : data;
  },

  /**
   * Save quiz result
   */
  saveQuizResult: async (santriId, stepNumber, result) => {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('quiz_results')
      .insert({
        santri_id: santriId,
        step_number: stepNumber,
        score: result.score,
        total_questions: result.totalQuestions,
        correct_answers: result.correctAnswers,
        passed: result.passed,
        answers: result.answers,
        time_taken_seconds: result.timeTaken,
      })
      .select()
      .single();

    return error ? null : data;
  },

  /**
   * Subscribe to progress changes (real-time)
   */
  subscribeToProgress: (santriId, callback) => {
    if (!isSupabaseConfigured()) return { unsubscribe: () => {} };

    const channel = supabase
      .channel(`progress:${santriId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'progress',
          filter: `santri_id=eq.${santriId}`,
        },
        (payload) => callback(payload)
      )
      .subscribe();

    return { unsubscribe: () => supabase.removeChannel(channel) };
  },

  /**
   * Reset all progress and results for a santri (Dev only)
   */
  resetProgress: async (santriId) => {
    if (!isSupabaseConfigured()) return true;

    // Delete progress records
    const { error: pError } = await supabase
      .from('progress')
      .delete()
      .eq('santri_id', santriId);

    // Delete quiz results
    const { error: qError } = await supabase
      .from('quiz_results')
      .delete()
      .eq('santri_id', santriId);
    
    // Reset gamification (XP, etc)
    const { error: gError } = await supabase
      .from('gamification')
      .update({ 
        xp: 0, 
        streak_current: 0, 
        total_quizzes: 0, 
        total_correct_answers: 0,
        canvas_strokes: 0,
        letters_found: 0,
        recordings_saved: 0
      })
      .eq('santri_id', santriId);

    return !pError && !qError && !gError;
  },
};

export default progressService;
