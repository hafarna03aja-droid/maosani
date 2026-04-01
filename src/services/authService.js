/**
 * Auth Service — Supabase Auth wrapper
 * Handles signup, login, logout, session management
 * Falls back to mock auth when Supabase is not configured
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const authService = {
  /**
   * Sign up with email/password
   * @param {string} email
   * @param {string} password
   * @param {object} metadata - { full_name, role }
   */
  signUp: async (email, password, metadata = {}) => {
    if (!isSupabaseConfigured()) return { data: null, error: { message: 'Supabase not configured' } };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.fullName || email,
          role: metadata.role || 'santri',
        },
      },
    });

    if (!error && data?.user) {
      // Initialize gamification record
      await supabase.from('gamification').insert({
        santri_id: data.user.id,
        xp: 0,
        streak_current: 0,
        streak_best: 0,
      });
    }

    return { data, error };
  },

  /**
   * Sign in with email/password
   */
  signIn: async (email, password) => {
    if (!isSupabaseConfigured()) return { data: null, error: { message: 'Supabase not configured' } };

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle: async () => {
    if (!isSupabaseConfigured()) return { data: null, error: { message: 'Supabase not configured' } };

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { data, error };
  },

  /**
   * Sign out
   */
  signOut: async () => {
    if (!isSupabaseConfigured()) return;
    await supabase.auth.signOut();
  },

  /**
   * Get current session
   */
  getSession: async () => {
    if (!isSupabaseConfigured()) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  /**
   * Get current user with profile
   */
  getCurrentUser: async () => {
    if (!isSupabaseConfigured()) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return profile ? { ...user, ...profile } : user;
  },

  /**
   * Update profile
   */
  updateProfile: async (userId, updates) => {
    if (!isSupabaseConfigured()) return { error: { message: 'Supabase not configured' } };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    return { error };
  },

  /**
   * Get all users with 'guru_pending' role
   * Requires admin privileges (handled by RLS)
   */
  getPendingGurus: async () => {
    if (!isSupabaseConfigured()) {
      const { MOCK_USERS } = await import('../data/mockUsers');
      const pendingGurus = MOCK_USERS.filter(u => u.role === 'guru_pending').map(u => ({
        ...u,
        full_name: u.fullName || u.full_name || u.email,
        created_at: u.createdAt || new Date().toISOString(),
      }));
      return { data: pendingGurus, error: null };
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'guru_pending')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  /**
   * Approve a pending guru to 'guru'
   * Requires admin privileges
   */
  approveGuru: async (userId) => {
    if (!isSupabaseConfigured()) return { error: null }; // Simulate success in mock mode

    const { error } = await supabase
      .from('profiles')
      .update({ role: 'guru' })
      .eq('id', userId);

    return { error };
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange: (callback) => {
    if (!isSupabaseConfigured()) return { data: { subscription: { unsubscribe: () => {} } } };
    return supabase.auth.onAuthStateChange(callback);
  },
};

export default authService;
