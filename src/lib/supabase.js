/**
 * Supabase Client — Singleton Instance
 * 
 * SETUP:
 * 1. Buat project di https://supabase.com
 * 2. Copy URL dan anon key
 * 3. Buat file .env di root project:
 *    VITE_SUPABASE_URL=https://xxxxx.supabase.co
 *    VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI...
 * 4. Jalankan schema.sql di SQL Editor Supabase
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Check if Supabase is configured
 * Jika belum ada env vars, app tetap jalan dengan mock data
 */
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL');
};

/** Supabase client instance */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export default supabase;
