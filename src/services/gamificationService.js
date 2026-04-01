/**
 * Gamification Service — Supabase CRUD for XP, Badges, Streak
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const gamificationService = {
  /**
   * Get gamification data for a santri
   */
  getGamification: async (santriId) => {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('gamification')
      .select('*')
      .eq('santri_id', santriId)
      .single();

    return error ? null : data;
  },

  /**
   * Initialize gamification record
   */
  initGamification: async (santriId) => {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('gamification')
      .upsert({
        santri_id: santriId,
        xp: 0,
        streak_current: 0,
        streak_best: 0,
        last_login_date: new Date().toISOString().split('T')[0],
      }, { onConflict: 'santri_id' })
      .select()
      .single();

    return error ? null : data;
  },

  /**
   * Add XP
   */
  addXP: async (santriId, amount) => {
    if (!isSupabaseConfigured()) return null;

    const { data: current } = await supabase
      .from('gamification')
      .select('xp')
      .eq('santri_id', santriId)
      .single();

    if (!current) return null;

    const newXP = (current.xp || 0) + amount;
    const { error } = await supabase
      .from('gamification')
      .update({ xp: newXP })
      .eq('santri_id', santriId);

    return error ? null : newXP;
  },

  /**
   * Check and update streak
   */
  checkStreak: async (santriId) => {
    if (!isSupabaseConfigured()) return null;

    const { data } = await supabase
      .from('gamification')
      .select('streak_current, streak_best, last_login_date')
      .eq('santri_id', santriId)
      .single();

    if (!data) return null;

    const today = new Date().toISOString().split('T')[0];
    if (data.last_login_date === today) return data; // Already checked today

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const isConsecutive = data.last_login_date === yesterday;
    const newStreak = isConsecutive ? data.streak_current + 1 : 1;
    const newBest = Math.max(data.streak_best, newStreak);

    await supabase
      .from('gamification')
      .update({
        streak_current: newStreak,
        streak_best: newBest,
        last_login_date: today,
      })
      .eq('santri_id', santriId);

    return { streak_current: newStreak, streak_best: newBest, last_login_date: today };
  },

  /**
   * Earn a badge
   */
  earnBadge: async (santriId, badgeId) => {
    if (!isSupabaseConfigured()) return false;

    // Check if already earned
    const { data: existing } = await supabase
      .from('earned_badges')
      .select('id')
      .eq('santri_id', santriId)
      .eq('badge_id', badgeId)
      .single();

    if (existing) return false; // Already earned

    const { error } = await supabase
      .from('earned_badges')
      .insert({ santri_id: santriId, badge_id: badgeId });

    return !error;
  },

  /**
   * Get all earned badges for a santri
   */
  getEarnedBadges: async (santriId) => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('earned_badges')
      .select('badge_id, earned_at')
      .eq('santri_id', santriId)
      .order('earned_at');

    return error ? [] : data.map(b => b.badge_id);
  },

  /**
   * Update stats (increment)
   */
  incrementStat: async (santriId, statKey, amount = 1) => {
    if (!isSupabaseConfigured()) return null;

    const columnMap = {
      totalQuizzes: 'total_quizzes',
      totalCorrectAnswers: 'total_correct_answers',
      canvasStrokes: 'canvas_strokes',
      lettersFound: 'letters_found',
      recordingsSaved: 'recordings_saved',
    };

    const column = columnMap[statKey] || statKey;

    const { data: current } = await supabase
      .from('gamification')
      .select(column)
      .eq('santri_id', santriId)
      .single();

    if (!current) return null;

    await supabase
      .from('gamification')
      .update({ [column]: (current[column] || 0) + amount })
      .eq('santri_id', santriId);

    return true;
  },

  /**
   * Get notifications for a user
   */
  getNotifications: async (userId) => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    return error ? [] : data;
  },

  /**
   * Mark notification as read
   */
  markNotificationRead: async (notificationId) => {
    if (!isSupabaseConfigured()) return;

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
  },

  /**
   * Subscribe to notifications (real-time)
   */
  subscribeToNotifications: (userId, callback) => {
    if (!isSupabaseConfigured()) return { unsubscribe: () => {} };

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => callback(payload.new)
      )
      .subscribe();

    return { unsubscribe: () => supabase.removeChannel(channel) };
  },
};

export default gamificationService;
