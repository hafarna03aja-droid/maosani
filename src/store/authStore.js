/**
 * Auth Store — Zustand
 * Manages authentication state and role-based access
 * Uses Supabase if configured, otherwise falls back to mock data
 */
import { create } from 'zustand';
import authService from '../services/authService';
import { isSupabaseConfigured } from '../lib/supabase';
import { MOCK_USERS } from '../data/mockUsers';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start loading to check session
  error: null,
  isSupabase: isSupabaseConfigured(),
  isTester: localStorage.getItem('maosani_tester_mode') === 'true',

  // Actions
  initialize: async () => {
    try {
      if (get().isSupabase) {
        const user = await authService.getCurrentUser();
        if (user) {
          // Auto enable tester mode if login as admin@test.com
          if (user.email === 'admin@test.com') {
            set({ isTester: true });
            localStorage.setItem('maosani_tester_mode', 'true');
          }
          set({ user, isAuthenticated: true, isLoading: false });
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        // Mock mode: no persistent session for simplicity, or check localStorage
        const storedUser = localStorage.getItem('maosani_mock_user');
        if (storedUser) {
          set({ user: JSON.parse(storedUser), isAuthenticated: true, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      }
    } catch (err) {
      console.error('Session check failed:', err);
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    if (get().isSupabase) {
      const { error } = await authService.signIn(email, password);
      if (error) {
        set({ error: error.message, isLoading: false });
      } else {
        const profileUser = await authService.getCurrentUser();
        if (email === 'admin@test.com') {
          set({ isTester: true });
          localStorage.setItem('maosani_tester_mode', 'true');
        }
        set({ user: profileUser, isAuthenticated: true, isLoading: false });
      }
    } else {
      // Mock mode
      setTimeout(() => {
        const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
        // Fallback for simple email match if password isn't checked strictly in mock
        const fallbackUser = !foundUser ? MOCK_USERS.find(u => u.email === email) : foundUser;

        if (fallbackUser) {
          localStorage.setItem('maosani_mock_user', JSON.stringify(fallbackUser));
          set({ user: fallbackUser, isAuthenticated: true, isLoading: false });
        } else {
          set({ error: 'Email atau password salah.', isLoading: false });
        }
      }, 800);
    }
  },

  register: async (email, password, fullName, role = 'santri') => {
    set({ isLoading: true, error: null });

    if (get().isSupabase) {
      const { data, error } = await authService.signUp(email, password, { fullName, role });
      if (error) {
        set({ error: error.message, isLoading: false });
      } else {
        // Jika Supabase membutuhkan konfirmasi email, session akan null setelah signup
        if (!data.session) {
          set({
            error: 'Registrasi berhasil! Silakan cek kotak masuk / spam email Anda (' + email + ') untuk link verifikasi sebelum mulai masuk.',
            isLoading: false
          });
        } else {
          // Secara otomatis login jika email confirmation dimatikan di Supabase
          const profileUser = await authService.getCurrentUser();
          set({ user: profileUser, isAuthenticated: true, isLoading: false });
        }
      }
    } else {
      set({ error: 'Registrasi hanya tersedia di Mode Live (Supabase).', isLoading: false });
    }
  },

  /** Quick login — langsung login sebagai role tertentu (Dev only or mock mode) */
  loginAs: async (role) => {
    set({ isLoading: true, error: null });

    // In Supabase mode, we might not support loginAs easily without knowing passwords,
    // but for demo purposes, we can try to login with standard demo accounts.
    if (get().isSupabase) {
      const demoEmail = role === 'guru' ? 'ustadz@maosani.id' : 'ahmad@maosani.id';
      const demoPassword = 'password123'; // Assume default demo password
      const { error } = await authService.signIn(demoEmail, demoPassword);
      if (!error) {
        const profileUser = await authService.getCurrentUser();
        set({ user: profileUser, isAuthenticated: true, isLoading: false });
      } else {
        set({ error: `Gagal login sebagai ${role} di Supabase. Pastikan user ada.`, isLoading: false });
      }
    } else {
      const user = MOCK_USERS.find(u => u.role === role);
      if (user) {
        localStorage.setItem('maosani_mock_user', JSON.stringify(user));
        set({ user, isAuthenticated: true, isLoading: false, error: null });
      }
    }
  },

  logout: async () => {
    if (get().isSupabase) {
      await authService.signOut();
    } else {
      localStorage.removeItem('maosani_mock_user');
    }
    set({ user: null, isAuthenticated: false, isTester: false, error: null });
    localStorage.removeItem('maosani_tester_mode');
  },

  /** Switch Tester Mode (Dev Only) */
  toggleTesterMode: () => {
    const newVal = !get().isTester;
    set({ isTester: newVal });
    localStorage.setItem('maosani_tester_mode', newVal.toString());
  },

  /** Login as Admin Tester */
  loginAsMaster: async () => {
    await get().login('admin@test.com', 'testing123');
  },

  /** Cek apakah user adalah guru */
  isGuru: () => {
    const { user } = get();
    return user?.role === 'guru' || user?.role === 'admin';
  },

  /** Cek apakah user adalah santri */
  isSantri: () => {
    const { user } = get();
    return user?.role === 'santri';
  },

  /** Cek apakah user masih menunggu persetujuan (guru pending) */
  isPendingGuru: () => {
    const { user } = get();
    return user?.role === 'guru_pending';
  },

  /** Cek apakah user adalah admin */
  isAdmin: () => {
    const { user } = get();
    return user?.role === 'admin';
  },

  /** Simpan hasil tes penempatan */
  completePlacementTest: async (recommendedStep) => {
    const { user, isSupabase } = get();
    if (!user) return;

    if (isSupabase) {
      const { error } = await authService.updateProfile(user.id, {
        placement_test_completed: true,
        placement_start_step: recommendedStep
      });
      if (!error) {
        set({ 
          user: { 
            ...user, 
            placement_test_completed: true, 
            placement_start_step: recommendedStep,
            // Also set camelCase for UI compatibility (SantriHome, etc)
            placementTestCompleted: true,
            placementStartStep: recommendedStep
          } 
        });
      }
    } else {
      // Mock mode
      const updatedUser = { 
        ...user, 
        placement_test_completed: true, 
        placement_start_step: recommendedStep,
        placementTestCompleted: true,
        placementStartStep: recommendedStep
      };
      localStorage.setItem('maosani_mock_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
