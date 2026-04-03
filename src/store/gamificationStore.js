/**
 * Gamification Store — Zustand
 * XP, Badges, Streaks, Level
 * Integrates with gamificationService (Supabase)
 */
import { create } from 'zustand';
import gamificationService from '../services/gamificationService';
import { isSupabaseConfigured } from '../lib/supabase';
import useAuthStore from './authStore';

const LEVEL_THRESHOLDS = [
  { level: 1, name: 'Pemula', nameAr: 'مبتدئ', minXP: 0, icon: '🌱' },
  { level: 2, name: 'Pelajar', nameAr: 'طالب', minXP: 100, icon: '📖' },
  { level: 3, name: 'Rajin', nameAr: 'مجتهد', minXP: 300, icon: '⭐' },
  { level: 4, name: 'Mahir', nameAr: 'ماهر', minXP: 600, icon: '🌟' },
  { level: 5, name: 'Lancar', nameAr: 'فصيح', minXP: 1000, icon: '🏆' },
  { level: 6, name: 'Hafiz', nameAr: 'حافظ', minXP: 1500, icon: '👑' },
];

const ALL_BADGES = [
  // ... omitting specific icons for brevity, keeping IDs matching Phase 3
  { id: 'first-login', name: 'Langkah Pertama', icon: '👣', description: 'Login pertama kali', xpReward: 10 },
  { id: 'hafal-14', name: 'Pengenal Huruf', icon: '🔤', description: 'Selesaikan Langkah 1', xpReward: 50 },
  { id: 'hafal-28', name: 'Hafal 28 Huruf', icon: '🎓', description: 'Selesaikan Langkah 2', xpReward: 50 },
  { id: 'harakat-master', name: 'Paham Harakat', icon: 'َ', description: 'Selesaikan Langkah 3', xpReward: 50 },
  { id: 'tanwin-master', name: 'Paham Tanwin', icon: 'ً', description: 'Selesaikan Langkah 4', xpReward: 50 },
  { id: 'mad-master', name: 'Ahli Mad', icon: '📏', description: 'Selesaikan Langkah 5 & 6', xpReward: 75 },
  { id: 'sukun-master', name: 'Ahli Sukun', icon: '⏹️', description: 'Selesaikan Langkah 7', xpReward: 50 },
  { id: 'tasydid-master', name: 'Ahli Tasydid', icon: 'ّ', description: 'Selesaikan Langkah 8', xpReward: 50 },
  { id: 'lafadz-master', name: 'Ahli Lafadz', icon: '🕌', description: 'Selesaikan Langkah 9', xpReward: 100 },
  { id: 'nine-steps', name: '9 Langkah Selesai!', icon: '🏅', description: 'Selesaikan semua 9 langkah', xpReward: 200 },
  { id: 'quiz-perfect', name: 'Nilai Sempurna', icon: '💯', description: 'Raih 100% di kuis', xpReward: 30 },
  { id: 'streak-3', name: 'Rajin 3 Hari', icon: '🔥', description: 'Login 3 hari berturut', xpReward: 20 },
  { id: 'streak-7', name: 'Seminggu Penuh', icon: '🔥', description: 'Login 7 hari berturut', xpReward: 50 },
  { id: 'streak-30', name: 'Istiqomah', icon: '💎', description: 'Login 30 hari berturut', xpReward: 200 },
];

const XP_REWARDS = { daily_login: 5, quiz_complete: 20, quiz_perfect: 50, placement_test: 15 };

const useGamificationStore = create((set, get) => ({
  // State
  xp: 120,
  earnedBadges: ['first-login', 'hafal-14'],
  streak: { current: 3, best: 7, lastLoginDate: new Date().toISOString().split('T')[0] },
  stats: { totalQuizzes: 2, totalCorrectAnswers: 16, totalExercises: 5, canvasStrokes: 23, lettersFound: 12, recordingsSaved: 1 },
  xpHistory: [],
  recentAchievement: null, // { type: 'badge' | 'level', data: Badge | Level }
  isSupabase: isSupabaseConfigured(),
  isLoading: false,

  /** Fetch initial gamification data */
  fetchData: async (santriId) => {
    if (!get().isSupabase || !santriId) return;
    set({ isLoading: true });
    try {
      const data = await gamificationService.getGamification(santriId);
      const badges = await gamificationService.getEarnedBadges(santriId);
      if (data) {
        set({
          xp: data.xp,
          streak: { current: data.streak_current, best: data.streak_best, lastLoginDate: data.last_login_date },
          stats: {
            totalQuizzes: data.total_quizzes,
            totalCorrectAnswers: data.total_correct_answers,
            canvasStrokes: data.canvas_strokes,
            lettersFound: data.letters_found,
            recordings_saved: data.recordings_saved, // pastikan naming matching
          },
          earnedBadges: badges,
          isLoading: false,
        });
      } else {
        await gamificationService.initGamification(santriId);
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('Failed to fetch gamification:', err);
      set({ isLoading: false });
    }
  },

  getLevel: () => {
    let currentLevel = LEVEL_THRESHOLDS[0];
    for (const level of LEVEL_THRESHOLDS) if (get().xp >= level.minXP) currentLevel = level;
    return currentLevel;
  },

  getNextLevel: () => {
    const next = LEVEL_THRESHOLDS.find(l => l.minXP > get().xp);
    return next || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  },

  getXPProgress: () => {
    const current = get().getLevel();
    const next = get().getNextLevel();
    if (current.level === next.level) return 100;
    return Math.round(((get().xp - current.minXP) / (next.minXP - current.minXP)) * 100);
  },

  getBadgeStatus: (badgeId) => get().earnedBadges.includes(badgeId),

  clearAchievement: () => set({ recentAchievement: null }),

  addXP: async (amount, reason) => {
    const user = useAuthStore.getState().user;
    const oldLevel = get().getLevel();
    
    set(state => ({
      xp: state.xp + amount,
      xpHistory: [...state.xpHistory.slice(-20), { amount, reason, timestamp: Date.now() }],
    }));

    // Check for level up
    const newLevel = get().getLevel();
    if (newLevel.level > oldLevel.level) {
      set({ recentAchievement: { type: 'level', data: newLevel } });
    }

    if (get().isSupabase && user) await gamificationService.addXP(user.id, amount);
  },

  earnBadge: async (badgeId) => {
    if (get().earnedBadges.includes(badgeId)) return;
    const badge = ALL_BADGES.find(b => b.id === badgeId);
    if (!badge) return;

    set(state => ({ 
      earnedBadges: [...state.earnedBadges, badgeId],
      recentAchievement: { type: 'badge', data: badge } 
    }));
    
    if (badge.xpReward) await get().addXP(badge.xpReward, `Badge: ${badge.name}`);
    
    const user = useAuthStore.getState().user;
    if (get().isSupabase && user) await gamificationService.earnBadge(user.id, badgeId);
  },

  checkStreak: async () => {
    const user = useAuthStore.getState().user;
    if (get().isSupabase && user) {
      const data = await gamificationService.checkStreak(user.id);
      if (data) {
        set({ streak: { current: data.streak_current, best: data.streak_best, lastLoginDate: data.last_login_date } });
        if (data.streak_current === 1) await get().addXP(XP_REWARDS.daily_login, 'Login Harian');
        if (data.streak_current >= 3) get().earnBadge('streak-3');
        if (data.streak_current >= 7) get().earnBadge('streak-7');
      }
    } else {
      const { streak } = get();
      const today = new Date().toISOString().split('T')[0];
      if (streak.lastLoginDate === today) return;

      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const isConsecutive = streak.lastLoginDate === yesterday;
      set(state => ({
        streak: {
          current: isConsecutive ? state.streak.current + 1 : 1,
          best: isConsecutive ? Math.max(state.streak.best, state.streak.current + 1) : state.streak.best,
          lastLoginDate: today,
        },
      }));
      get().addXP(XP_REWARDS.daily_login, 'Login harian');
    }
  },

  recordQuizResult: async (stepNumber, score, totalQuestions) => {
    const user = useAuthStore.getState().user;
    
    set(state => ({
      stats: { ...state.stats, totalQuizzes: state.stats.totalQuizzes + 1, totalCorrectAnswers: state.stats.totalCorrectAnswers + Math.round((score / 100) * totalQuestions) },
    }));
    await get().addXP(XP_REWARDS.quiz_complete, `Kuis Langkah ${stepNumber}`);
    if (score === 100) {
      await get().addXP(XP_REWARDS.quiz_perfect - XP_REWARDS.quiz_complete, 'Nilai sempurna!');
      await get().earnBadge('quiz-perfect');
    }

    const map = { 1: 'hafal-14', 2: 'hafal-28', 3: 'harakat-master', 4: 'tanwin-master', 7: 'sukun-master', 8: 'tasydid-master', 9: 'lafadz-master' };
    if (map[stepNumber] && score >= 70) await get().earnBadge(map[stepNumber]);
    if (stepNumber === 6 && score >= 70) await get().earnBadge('mad-master');

    if (get().isSupabase && user) {
      gamificationService.incrementStat(user.id, 'totalQuizzes', 1);
      gamificationService.incrementStat(user.id, 'totalCorrectAnswers', Math.round((score / 100) * totalQuestions));
    }
  },

  incrementStat: (statKey, amount = 1) => {
    set(state => ({ stats: { ...state.stats, [statKey]: (state.stats[statKey] || 0) + amount } }));
    const user = useAuthStore.getState().user;
    if (get().isSupabase && user) gamificationService.incrementStat(user.id, statKey, amount);
  },

  /** 
   * Calculate mastery levels for Radar Chart 
   * Categories: Hijaiyah, Harakat, Tanwin, Mad, Sukun, Tajwid
   */
  calculateMastery: (progressRecords) => {
    const categories = [
      { name: 'Hijaiyah', steps: [1, 2] },
      { name: 'Harakat', steps: [3] },
      { name: 'Tanwin', steps: [4] },
      { name: 'Mad', steps: [5, 6] },
      { name: 'Sukun/Tasydid', steps: [7, 8] },
      { name: 'Tajwid', steps: [9] },
    ];

    return categories.map(cat => {
      let score = 0;
      cat.steps.forEach(s => {
        const record = progressRecords.find(p => p.stepNumber === s);
        if (record?.status === 'approved') {
          score += 100 / cat.steps.length;
        } else if (record?.status === 'pending_review' || record?.status === 'in_progress') {
          score += 40 / cat.steps.length;
        }
      });
      return { 
        subject: cat.name, 
        value: Math.min(100, Math.round(score)),
        fullMark: 100 
      };
    });
  },
}));

export { LEVEL_THRESHOLDS, ALL_BADGES, XP_REWARDS };
export default useGamificationStore;
