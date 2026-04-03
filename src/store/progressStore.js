/**
 * Progress Store — Zustand
 * Manages learning progress, unlock logic, and Buku Kendali Digital
 * Integrates with Supabase conditionally
 */
import { create } from 'zustand';
import { MOCK_PROGRESS } from '../data/mockUsers';
import { LEARNING_MODULES, TAJWID_MODULES, ALL_MODULES } from '../data/modules';
import progressService from '../services/progressService';
import { isSupabaseConfigured } from '../lib/supabase';
import useAuthStore from './authStore';

const useProgressStore = create((set, get) => ({
  // State
  progressRecords: isSupabaseConfigured() ? [] : [...MOCK_PROGRESS],
  pendingReviews: [],
  allModules: ALL_MODULES,
  isSupabase: isSupabaseConfigured(),
  isLoading: false,

  /** Fetch progress for a santri */
  fetchProgress: async (santriId) => {
    if (!santriId) return;
    set({ isLoading: true });
    
    if (get().isSupabase) {
      const dbProgress = await progressService.getSantriProgress(santriId);
      // Map DB snake_case to camelCase
      const formatted = dbProgress.map(p => ({
        id: p.id,
        santriId: p.santri_id,
        stepNumber: p.step_number,
        status: p.status,
        scoreMakhroj: p.score_makhroj,
        scoreTajwid: p.score_tajwid,
        scoreKelancaran: p.score_kelancaran,
        scoreTotal: p.score_total,
        approvedBy: p.approved_by,
        guruNotes: p.guru_notes,
        exercisesCompleted: p.exercises_completed,
        exercisesTotal: p.exercises_total,
        attempts: p.attempts,
        startedAt: p.started_at,
        completedAt: p.completed_at,
        approvedAt: p.approved_at,
      }));
      set({ progressRecords: formatted, isLoading: false });
    } else {
      set({ progressRecords: [...MOCK_PROGRESS].filter(p => p.santriId === santriId), isLoading: false });
    }
  },

  /** Fetch pending reviews for guru */
  fetchPendingReviews: async () => {
    set({ isLoading: true });
    if (get().isSupabase) {
      const reviews = await progressService.getPendingReviews();
      const formatted = reviews.map(p => ({
        id: p.id,
        santriId: p.santri_id,
        stepNumber: p.step_number,
        status: p.status,
        scoreMakhroj: p.score_makhroj,
        scoreTajwid: p.score_tajwid,
        scoreKelancaran: p.score_kelancaran,
        scoreTotal: p.score_total,
        completedAt: p.completed_at,
        santriName: p.santri?.full_name || 'Santri',
      }));
      set({ pendingReviews: formatted, isLoading: false });
    } else {
      const mockPending = [...MOCK_PROGRESS].filter(p => p.status === 'pending_review').map(p => ({
        ...p, santriName: 'Ahmad Fauzi (Mock)'
      }));
      set({ pendingReviews: mockPending, isLoading: false });
    }
  },

  getStepStatus: (santriId, stepNumber) => {
    // Master Bypass if Tester Mode is ON
    if (useAuthStore.getState().isTester) return 'unlocked';

    const { progressRecords } = get();
    const record = progressRecords.find(p => p.stepNumber === stepNumber); // Assuming single user context mostly
    if (record) return record.status;

    const canUnlock = get().canUnlockStep(santriId, stepNumber);
    return canUnlock ? 'unlocked' : 'locked';
  },

  canUnlockStep: (santriId, stepNumber) => {
    const auth = useAuthStore.getState();
    const { user, isTester } = auth;

    // Master Bypass 
    if (isTester) return true;

    if (stepNumber === 1) return true;

    // Placement test override
    const isCompleted = user?.placement_test_completed || user?.placementTestCompleted;
    const startStep = user?.placement_start_step || user?.placementStartStep || 1;

    if (isCompleted && stepNumber <= startStep) {
      return true;
    }

    const { progressRecords } = get();
    const module = ALL_MODULES.find(m => m.stepNumber === stepNumber);
    if (!module) return false;

    return module.prerequisites.every(prereqStep => {
      const prereqRecord = progressRecords.find(p => p.stepNumber === prereqStep);
      return prereqRecord?.status === 'approved';
    });
  },

  getSantriProgress: () => {
    return get().progressRecords;
  },

  getFullRoadmap: (santriId) => {
    const { getStepStatus } = get();
    return ALL_MODULES.map(module => ({
      ...module,
      status: getStepStatus(santriId, module.stepNumber),
    }));
  },

  startStep: async (santriId, stepNumber) => {
    const { progressRecords, canUnlockStep, isSupabase } = get();
    if (!canUnlockStep(santriId, stepNumber)) return false;

    const module = ALL_MODULES.find(m => m.stepNumber === stepNumber);
    const exercisesTotal = module?.type === 'huruf' ? 14 : 10;

    if (isSupabase) {
      const dbResult = await progressService.startStep(santriId, stepNumber, exercisesTotal);
      if (dbResult) await get().fetchProgress(santriId);
    } else {
      const existing = progressRecords.find(p => p.stepNumber === stepNumber);
      if (existing) {
        set({
          progressRecords: progressRecords.map(p =>
            p.stepNumber === stepNumber ? { ...p, status: 'in_progress', startedAt: new Date().toISOString() } : p
          ),
        });
      } else {
        set({
          progressRecords: [
            ...progressRecords,
            { id: `mock-${Date.now()}`, santriId, stepNumber, status: 'in_progress', exercisesCompleted: 0, exercisesTotal, attempts: 1, startedAt: new Date().toISOString() }
          ],
        });
      }
    }
    return true;
  },

  submitForReview: async (santriId, stepNumber) => {
    if (get().isSupabase) {
      await progressService.submitForReview(santriId, stepNumber);
      await get().fetchProgress(santriId);
    } else {
      set(state => ({
        progressRecords: state.progressRecords.map(p =>
          p.stepNumber === stepNumber ? { ...p, status: 'pending_review', completedAt: new Date().toISOString() } : p
        ),
      }));
    }
  },

  approveStep: async (santriId, stepNumber, guruId, scores, notes) => {
    if (get().isSupabase) {
      await progressService.approveStep(santriId, stepNumber, guruId, scores, notes);
      await get().fetchPendingReviews(); // Refresh guru dash
    } else {
      set(state => ({
        progressRecords: state.progressRecords.map(p =>
          p.santriId === santriId && p.stepNumber === stepNumber
            ? {
                ...p,
                status: 'approved',
                scoreMakhroj: scores.makhroj,
                scoreTajwid: scores.tajwid,
                scoreKelancaran: scores.kelancaran,
                scoreTotal: ((scores.makhroj + scores.tajwid + scores.kelancaran) / 3).toFixed(1),
                approvedBy: guruId,
                guruNotes: notes,
                approvedAt: new Date().toISOString(),
              }
            : p
        ),
      }));
    }
  },

  requestRetry: async (santriId, stepNumber, guruId, notes) => {
    if (get().isSupabase) {
      await progressService.requestRetry(santriId, stepNumber, guruId, notes);
      await get().fetchPendingReviews(); // Refresh guru dash
    } else {
      set(state => ({
        progressRecords: state.progressRecords.map(p =>
          p.santriId === santriId && p.stepNumber === stepNumber
            ? { ...p, status: 'needs_retry', guruNotes: notes, attempts: (p.attempts || 1) + 1 } : p
        ),
      }));
    }
  },

  updateExerciseProgress: async (santriId, stepNumber, completedCount) => {
    if (get().isSupabase) {
      await progressService.updateExercises(santriId, stepNumber, completedCount);
      // Wait for re-fetch or optimistically update
      set(state => ({
        progressRecords: state.progressRecords.map(p =>
          p.stepNumber === stepNumber ? { ...p, exercisesCompleted: completedCount } : p
        ),
      }));
    } else {
      set(state => ({
        progressRecords: state.progressRecords.map(p =>
          p.stepNumber === stepNumber ? { ...p, exercisesCompleted: completedCount } : p
        ),
      }));
    }
  },

  updateQuranExplorerProgress: (santriId, stepNumber, score) => {
    set(state => ({
      progressRecords: state.progressRecords.map(p =>
        p.stepNumber === stepNumber
          ? {
              ...p,
              quranExplorerScore: score,
              exercisesCompleted: Math.min((p.exercisesCompleted || 0) + 2, p.exercisesTotal || 10)
            }
          : p
      ),
    }));
  },

  /** 
   * Reset all progress (Dev only)
   */
  resetAllProgress: async (santriId) => {
    if (!santriId) return;
    set({ isLoading: true });
    
    await progressService.resetProgress(santriId);
    
    set({ 
      progressRecords: [], 
      pendingReviews: [],
      isLoading: false 
    });
  },
}));

export default useProgressStore;
