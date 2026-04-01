/**
 * Audio Store — Zustand
 * Manages audio playback for hijaiyah lessons
 * Uses real MP3 files instead of Web Speech API
 */
import { create } from 'zustand';

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
   * Play audio MP3 lokal per huruf
   */
  playLetter: async (letter) => {
    const { stopAudio, volume, playbackRate } = get();
    stopAudio();

    set({ isPlaying: true, currentLetter: letter.id });

    try {
      // Mapping ke folder public/audio/hijaiyah/
      audioPlayer.src = `/audio/hijaiyah/${letter.id}.mp3`;
      audioPlayer.volume = volume;
      audioPlayer.playbackRate = playbackRate;
      
      // Handle the end of the audio track
      audioPlayer.onended = () => {
        set({ isPlaying: false, currentLetter: null });
      };

      await audioPlayer.play();
    } catch (error) {
      console.warn('Audio playback failed or file missing:', error);
      // Fallback UI state if file is missing
      set({ isPlaying: false, currentLetter: null });
    }
  },

  stopAudio: () => {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    set({ isPlaying: false, currentLetter: null });
  },

  /**
   * Play sequence — untuk mode one-line-rule (Langkah 3-4)
   * Memainkan urutan huruf berdasarkan audio MP3
   */
  playSequence: async (letters, onComplete) => {
    const { volume, playbackRate, playbackMode } = get();
    set({ isPlaying: true });

    for (let i = 0; i < letters.length; i++) {
      // Jika di-stop di tengah jalan
      if (!get().isPlaying) break;

      const letter = letters[i];
      set({ currentLetter: letter.id });

      try {
        await new Promise((resolve, reject) => {
          audioPlayer.src = `/audio/hijaiyah/${letter.id}.mp3`;
          audioPlayer.volume = volume;
          audioPlayer.playbackRate = playbackRate;
          
          audioPlayer.onended = resolve;
          audioPlayer.onerror = reject;

          audioPlayer.play().catch(reject);
        });
      } catch (err) {
        console.warn(`Gagal memutar ${letter.id}.mp3`, err);
        // Tetap lanjut ke huruf berikutnya jika ada error
        await new Promise(r => setTimeout(r, 500));
      }

      // Pause between letters based on mode
      if (playbackMode === 'staccato') {
        await new Promise(r => setTimeout(r, 400));
      } else if (playbackMode === 'continuous-no-break') {
        await new Promise(r => setTimeout(r, 50));
      }
    }

    set({ isPlaying: false, currentLetter: null });
    onComplete?.();
  },
}));

export default useAudioStore;
