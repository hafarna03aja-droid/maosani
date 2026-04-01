/**
 * Data 28 Huruf Hijaiyah
 * Alif & Hamzah digabung sesuai Metode MAOSANI
 * 
 * Setiap huruf memiliki:
 * - id: identifier unik
 * - name: nama Latin
 * - arabic: karakter Unicode Arabic
 * - isolated: bentuk tunggal
 * - initial: bentuk awal (di awal kata)
 * - medial: bentuk tengah (di tengah kata)
 * - final: bentuk akhir (di akhir kata)
 * - audioRef: referensi file audio
 * - order: urutan dalam metode
 */

export const HIJAIYAH_LETTERS = [
  { id: 'alif', name: 'Alif/Hamzah', arabic: 'ا', isolated: 'ا', initial: 'ا', medial: 'ـا', final: 'ـا', audioRef: 'alif.mp3', order: 1 },
  { id: 'ba', name: 'Ba', arabic: 'ب', isolated: 'ب', initial: 'بـ', medial: 'ـبـ', final: 'ـب', audioRef: 'ba.mp3', order: 2 },
  { id: 'ta', name: 'Ta', arabic: 'ت', isolated: 'ت', initial: 'تـ', medial: 'ـتـ', final: 'ـت', audioRef: 'ta.mp3', order: 3 },
  { id: 'tsa', name: 'Tsa', arabic: 'ث', isolated: 'ث', initial: 'ثـ', medial: 'ـثـ', final: 'ـث', audioRef: 'tsa.mp3', order: 4 },
  { id: 'jim', name: 'Jim', arabic: 'ج', isolated: 'ج', initial: 'جـ', medial: 'ـجـ', final: 'ـج', audioRef: 'jim.mp3', order: 5 },
  { id: 'ha', name: 'Ha', arabic: 'ح', isolated: 'ح', initial: 'حـ', medial: 'ـحـ', final: 'ـح', audioRef: 'ha.mp3', order: 6 },
  { id: 'kha', name: 'Kha', arabic: 'خ', isolated: 'خ', initial: 'خـ', medial: 'ـخـ', final: 'ـخ', audioRef: 'kha.mp3', order: 7 },
  { id: 'dal', name: 'Dal', arabic: 'د', isolated: 'د', initial: 'د', medial: 'ـد', final: 'ـد', audioRef: 'dal.mp3', order: 8 },
  { id: 'dzal', name: 'Dzal', arabic: 'ذ', isolated: 'ذ', initial: 'ذ', medial: 'ـذ', final: 'ـذ', audioRef: 'dzal.mp3', order: 9 },
  { id: 'ra', name: 'Ra', arabic: 'ر', isolated: 'ر', initial: 'ر', medial: 'ـر', final: 'ـر', audioRef: 'ra.mp3', order: 10 },
  { id: 'zay', name: 'Zay', arabic: 'ز', isolated: 'ز', initial: 'ز', medial: 'ـز', final: 'ـز', audioRef: 'zay.mp3', order: 11 },
  { id: 'sin', name: 'Sin', arabic: 'س', isolated: 'س', initial: 'سـ', medial: 'ـسـ', final: 'ـس', audioRef: 'sin.mp3', order: 12 },
  { id: 'syin', name: 'Syin', arabic: 'ش', isolated: 'ش', initial: 'شـ', medial: 'ـشـ', final: 'ـش', audioRef: 'syin.mp3', order: 13 },
  { id: 'shad', name: 'Shad', arabic: 'ص', isolated: 'ص', initial: 'صـ', medial: 'ـصـ', final: 'ـص', audioRef: 'shad.mp3', order: 14 },
  { id: 'dhad', name: 'Dhad', arabic: 'ض', isolated: 'ض', initial: 'ضـ', medial: 'ـضـ', final: 'ـض', audioRef: 'dhad.mp3', order: 15 },
  { id: 'tha', name: 'Tha', arabic: 'ط', isolated: 'ط', initial: 'طـ', medial: 'ـطـ', final: 'ـط', audioRef: 'tha.mp3', order: 16 },
  { id: 'zha', name: 'Zha', arabic: 'ظ', isolated: 'ظ', initial: 'ظـ', medial: 'ـظـ', final: 'ـظ', audioRef: 'zha.mp3', order: 17 },
  { id: 'ain', name: "'Ain", arabic: 'ع', isolated: 'ع', initial: 'عـ', medial: 'ـعـ', final: 'ـع', audioRef: 'ain.mp3', order: 18 },
  { id: 'ghain', name: 'Ghain', arabic: 'غ', isolated: 'غ', initial: 'غـ', medial: 'ـغـ', final: 'ـغ', audioRef: 'ghain.mp3', order: 19 },
  { id: 'fa', name: 'Fa', arabic: 'ف', isolated: 'ف', initial: 'فـ', medial: 'ـفـ', final: 'ـف', audioRef: 'fa.mp3', order: 20 },
  { id: 'qaf', name: 'Qaf', arabic: 'ق', isolated: 'ق', initial: 'قـ', medial: 'ـقـ', final: 'ـق', audioRef: 'qaf.mp3', order: 21 },
  { id: 'kaf', name: 'Kaf', arabic: 'ك', isolated: 'ك', initial: 'كـ', medial: 'ـكـ', final: 'ـك', audioRef: 'kaf.mp3', order: 22 },
  { id: 'lam', name: 'Lam', arabic: 'ل', isolated: 'ل', initial: 'لـ', medial: 'ـلـ', final: 'ـل', audioRef: 'lam.mp3', order: 23 },
  { id: 'mim', name: 'Mim', arabic: 'م', isolated: 'م', initial: 'مـ', medial: 'ـمـ', final: 'ـم', audioRef: 'mim.mp3', order: 24 },
  { id: 'nun', name: 'Nun', arabic: 'ن', isolated: 'ن', initial: 'نـ', medial: 'ـنـ', final: 'ـن', audioRef: 'nun.mp3', order: 25 },
  { id: 'ha2', name: 'Ha', arabic: 'ه', isolated: 'ه', initial: 'هـ', medial: 'ـهـ', final: 'ـه', audioRef: 'ha2.mp3', order: 26 },
  { id: 'waw', name: 'Waw', arabic: 'و', isolated: 'و', initial: 'و', medial: 'ـو', final: 'ـو', audioRef: 'waw.mp3', order: 27 },
  { id: 'ya', name: 'Ya', arabic: 'ي', isolated: 'ي', initial: 'يـ', medial: 'ـيـ', final: 'ـي', audioRef: 'ya.mp3', order: 28 },
];

/** Harakat / Tanda Baca */
export const HARAKAT = [
  { id: 'fathah', name: 'Fathah', symbol: 'َ', sound: 'a', description: 'Bunyi "A" di atas huruf' },
  { id: 'kasrah', name: 'Kasrah', symbol: 'ِ', sound: 'i', description: 'Bunyi "I" di bawah huruf' },
  { id: 'dhammah', name: 'Dhammah', symbol: 'ُ', sound: 'u', description: 'Bunyi "U" di atas huruf' },
  { id: 'fathatain', name: 'Fathatain (Tanwin)', symbol: 'ً', sound: 'an', description: 'Bunyi "AN"' },
  { id: 'kasratain', name: 'Kasratain (Tanwin)', symbol: 'ٍ', sound: 'in', description: 'Bunyi "IN"' },
  { id: 'dhammatain', name: 'Dhammatain (Tanwin)', symbol: 'ٌ', sound: 'un', description: 'Bunyi "UN"' },
  { id: 'sukun', name: 'Sukun', symbol: 'ْ', sound: '-', description: 'Huruf mati' },
  { id: 'tasydid', name: 'Tasydid/Syaddah', symbol: 'ّ', sound: 'double', description: 'Huruf ganda/tebal' },
];

/** Contoh ayat Al-Qur'an untuk Quran Explorer */
export const QURAN_SAMPLES = [
  {
    surah: 'Al-Fatihah',
    ayah: 1,
    text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    translation: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.'
  },
  {
    surah: 'Al-Fatihah',
    ayah: 2,
    text: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
    translation: 'Segala puji bagi Allah, Tuhan seluruh alam.'
  },
  {
    surah: 'Al-Ikhlas',
    ayah: 1,
    text: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
    translation: 'Katakanlah (Muhammad), "Dialah Allah, Yang Maha Esa."'
  },
  {
    surah: 'Al-Ikhlas',
    ayah: 2,
    text: 'ٱللَّهُ ٱلصَّمَدُ',
    translation: 'Allah tempat meminta segala sesuatu.'
  },
  {
    surah: 'Al-Falaq',
    ayah: 1,
    text: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ',
    translation: 'Katakanlah, "Aku berlindung kepada Tuhan yang menguasai subuh."'
  },
  {
    surah: 'An-Nas',
    ayah: 1,
    text: 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ',
    translation: 'Katakanlah, "Aku berlindung kepada Tuhannya manusia."'
  },
  {
    surah: 'Al-Baqarah',
    ayah: 1,
    text: 'الٓمٓ',
    translation: 'Alif Lam Mim.'
  },
  {
    surah: 'Al-Baqarah',
    ayah: 2,
    text: 'ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ',
    translation: 'Kitab (Al-Qur\'an) ini tidak ada keraguan padanya; petunjuk bagi mereka yang bertakwa.'
  },
];

export default HIJAIYAH_LETTERS;
