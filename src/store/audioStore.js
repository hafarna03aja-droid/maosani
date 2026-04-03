/**
 * Audio Store — Zustand
 * Manages audio playback for hijaiyah lessons
 * Uses real MP3 files instead of Web Speech API
 */
import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Singleton audio instance untuk mencegah overlap
const audioPlayer = new Audio();

const useAudioStore = create((set, get) => ({
  // State
  isPlaying: false,
  currentLetter: null,
  playbackMode: 'staccato', // 'staccato' | 'nada-stabil' | 'nada-ayunan' | 'continuous'
  volume: 1.0,
  playbackRate: 1.0,

  // Actions
  setPlaybackMode: (mode) => set({ playbackMode: mode }),
  
  setVolume: (vol) => {
    const safeVol = Math.max(0, Math.min(1, vol));
    audioPlayer.volume = safeVol;
    set({ volume: safeVol });
  },
  
  setPlaybackRate: (rate) => {
    audioPlayer.playbackRate = rate;
    set({ playbackRate: rate });
  },

  /**
   * Mendapatkan sumber URL audio (Supabase Storage vs Local)
   */
  getAudioSrc: (type, id) => {
    if (!id) return '';
    if (id.startsWith('http')) return id;

    // Jika Supabase terkonfigurasi, ambil dari Storage Bucket 'audio'
    if (isSupabaseConfigured() && supabase) {
      const { data } = supabase.storage
        .from('audio')
        .getPublicUrl(`${type}/${id}.mp3`);
      
      return data.publicUrl;
    }

    // Fallback ke folder public lokal
    return `/audio/${type}/${id}.mp3`;
  },

  /**
   * Play audio MP3 (Local or Remote)
   * @param {string} type - 'hijaiyah', 'harakat', 'tajwid', 'example'
   * @param {string} id - The filename OR a full absolute URL
   */
  playAudio: async (type, id) => {
    const { stopAudio, volume, playbackRate, getAudioSrc } = get();
    stopAudio();

    const isFullUrl = id?.startsWith('http');
    set({ isPlaying: true, currentLetter: isFullUrl ? id : `${type}-${id}` });

    try {
      // Dapatkan URL sumber (Supabase jika ada, else Local)
      audioPlayer.src = getAudioSrc(type, id);
      audioPlayer.volume = volume;
      audioPlayer.playbackRate = playbackRate;
      
      audioPlayer.onended = () => {
        set({ isPlaying: false, currentLetter: null });
      };

      await audioPlayer.play();
    } catch (error) {
      console.warn(`Audio playback failed for ${id}:`, error);
      set({ isPlaying: false, currentLetter: null });
    }
  },

  /**
   * Deprecated: Use playAudio('hijaiyah', letter.id) instead.
   * Keeping for backward compatibility.
   */
  playLetter: async (letter) => {
    // Gunakan audioRef jika ada (hapus .mp3 karena getAudioSrc akan menambahkannya), fallback ke id
    const audioId = letter.audioRef ? letter.audioRef.replace('.mp3', '') : letter.id;
    const type = letter.type || 'hijaiyah';
    return get().playAudio(type, audioId);
  },

  stopAudio: () => {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    set({ isPlaying: false, currentLetter: null });
  },

  /**
   * Play sequence — for One-Line Rule
   * @param {Array} items - Array of { type, id }
   */
  playSequence: async (items, onComplete) => {
    const { volume, playbackRate, playbackMode } = get();
    set({ isPlaying: true });

    for (let i = 0; i < items.length; i++) {
      if (!get().isPlaying) break;

      const { type, id } = items[i];
      set({ currentLetter: `${type}-${id}` });

      try {
        await new Promise((resolve, reject) => {
          // Dapatkan URL sumber (Supabase jika ada, else Local)
          audioPlayer.src = get().getAudioSrc(type, id);
          audioPlayer.volume = volume;
          audioPlayer.playbackRate = playbackRate;
          
          audioPlayer.onended = resolve;
          audioPlayer.onerror = reject;

          audioPlayer.play().catch(reject);
        });
      } catch (err) {
        console.warn(`Gagal memutar ${type}/${id}.mp3`, err);
        await new Promise(r => setTimeout(r, 400));
      }

      // Add a small delay between items based on mode
      if (playbackMode === 'staccato') {
        await new Promise(r => setTimeout(r, 450));
      } else if (playbackMode === 'continuous-no-break') {
        // No extra break
      } else {
        await new Promise(r => setTimeout(r, 150));
      }
    }

    set({ isPlaying: false, currentLetter: null });
    onComplete?.();
  },
}));

export default useAudioStore;
