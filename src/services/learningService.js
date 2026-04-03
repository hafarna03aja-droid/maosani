import { supabase } from '../lib/supabase';
import { HIJAIYAH_LETTERS } from '../data/hijaiyah';

const learningService = {
  /**
   * Mendapatkan URL publik untuk file audio di Supabase Storage
   * @param {string} path - Path file di dalam bucket 'audio'
   */
  getAudioUrl: (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    const { data } = supabase
      .storage
      .from('audio')
      .getPublicUrl(path);
      
    return data.publicUrl;
  },

  /** 
   * Get content for a specific step 
   * Fetches from Supabase 'materi_belajar' if available
   */
  getStepContent: async (stepNumber) => {
    try {
      // 1. Coba ambil dari Supabase jika dikonfigurasi
      if (supabase) {
        const { data, error } = await supabase
          .from('materi_belajar')
          .select('*')
          .eq('step_number', stepNumber)
          .order('order_index', { ascending: true });

        if (!error && data && data.length > 0) {
          // Map data untuk menyertakan URL audio penuh
          return data.map(item => ({
            ...item,
            audio_url: item.audio_path ? learningService.getAudioUrl(item.audio_path) : null
          }));
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data dari Supabase:', err);
    }

    // 2. Fallback ke Mock Data / Hardcoded
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (stepNumber === 1) {
      return HIJAIYAH_LETTERS.slice(0, 14);
    } else if (stepNumber === 2) {
      return HIJAIYAH_LETTERS.slice(14);
    }
    
    return [];
  }
};

export default learningService;
