/**
 * MAOSANI Audio Downloader
 * Mengambil (mencuri secara halus 😁) file mp3 dari Google Translate TTS
 * Menggunakan aksen Arab 'ar'
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as googleTTS from 'google-tts-api';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Direktori output
const AUDIO_DIR = path.join(__dirname, '../public/audio/hijaiyah');

// Pastikan direktori ada
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// 28 Huruf Hijaiyah dengan tulisan Arabnya untuk keakuratan mesin TTS
const hijaiyahLetters = [
  { id: 'alif', ar: 'أَلِف' },
  { id: 'ba', ar: 'بَا' },
  { id: 'ta', ar: 'تَا' },
  { id: 'tsa', ar: 'ثَا' },
  { id: 'jim', ar: 'جِيم' },
  { id: 'ha', ar: 'حَا' },
  { id: 'kha', ar: 'خَا' },
  { id: 'dal', ar: 'دَال' },
  { id: 'dzal', ar: 'ذَال' },
  { id: 'ra', ar: 'رَا' },
  { id: 'zay', ar: 'زَاي' },
  { id: 'sin', ar: 'سِين' },
  { id: 'syin', ar: 'شِين' },
  { id: 'shad', ar: 'صَاد' },
  { id: 'dhad', ar: 'ضَاد' },
  { id: 'tha', ar: 'طَا' },
  { id: 'zha', ar: 'ظَا' },
  { id: 'ain', ar: 'عَيْن' },
  { id: 'ghain', ar: 'غَيْن' },
  { id: 'fa', ar: 'فَا' },
  { id: 'qaf', ar: 'قَاف' },
  { id: 'kaf', ar: 'كَاف' },
  { id: 'lam', ar: 'لَام' },
  { id: 'mim', ar: 'مِيم' },
  { id: 'nun', ar: 'نُون' },
  { id: 'ha_kecil', ar: 'هَا' },
  { id: 'wau', ar: 'وَاو' },
  { id: 'ya', ar: 'يَا' },
];

// Helper: Download dari URL langsung ke file sistem lokal
const downloadFile = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    });
  });
};

async function generateAllAudio() {
  console.log('🕌 Mulai mengumpulkan audio Hijaiyah...');

  for (const letter of hijaiyahLetters) {
    const filename = `${letter.id}.mp3`;
    const filepath = path.join(AUDIO_DIR, filename);

    if (fs.existsSync(filepath)) {
      console.log(`✅ [SKIP] ${filename} sudah ada.`);
      continue;
    }

    try {
      // Dapatkan URL dari Google Translate
      const url = googleTTS.getAudioUrl(letter.ar, {
        lang: 'ar',    // Bahasa Arab
        slow: true,    // Pelan agar makhraj jelas 
        host: 'https://translate.google.com',
      });

      // Simpan ke disk
      await downloadFile(url, filepath);
      console.log(`⬇️ [DONE] ${filename} tersimpan!`);
      
      // Delay kecil biar tidak diblokir Google (Rate limit avoidance)
      await new Promise(r => setTimeout(r, 800));
    } catch (err) {
      console.error(`❌ [ERROR] Gagal download ${filename}:`, err.message);
    }
  }

  console.log('✅ Selesai! Semua audio Hijaiyah lengkap.');
}

generateAllAudio();
