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
 * - makhraj: informasi tempat keluar bunyi & teknik pengucapan
 */

export const HIJAIYAH_LETTERS = [
  { id: 'alif', name: 'Alif/Hamzah', arabic: 'ا', isolated: 'ا', initial: 'ا', medial: 'ـا', final: 'ـا', audioRef: 'alif.mp3', order: 1, 
    makhraj: { simple: 'Tenggorokan Bawah', technical: 'Aqshol Halq', description: 'Suara lepas dari dasar tenggorokan.', tongue: 'Lidah datar, suara jernih.' } },
  { id: 'ba', name: 'Ba', arabic: 'ب', isolated: 'ب', initial: 'بـ', medial: 'ـبـ', final: 'ـب', audioRef: 'ba.mp3', order: 2,
    makhraj: { simple: 'Dua Bibir', technical: 'Asy-Syafatain', description: 'Bibir tertutup rapat, suara memantul kuat.', tongue: 'Lidah rileks.' } },
  { id: 'ta', name: 'Ta', arabic: 'ت', isolated: 'ت', initial: 'تـ', medial: 'ـتـ', final: 'ـت', audioRef: 'ta.mp3', order: 3,
    makhraj: { simple: 'Ujung Lidah & Pangkal Gigi', technical: 'Nath\'iyyah', description: 'Ujung lidah menempel pangkal gigi seri atas.', tongue: 'Lidah menyentuh langit-langit depan.' } },
  { id: 'tsa', name: 'Tsa', arabic: 'ث', isolated: 'ث', initial: 'ثـ', medial: 'ـثـ', final: 'ـث', audioRef: 'tsa.mp3', order: 4,
    makhraj: { simple: 'Ujung Lidah & Ujung Gigi', technical: 'Litsawiyyah', description: 'Ujung lidah menyentuh sedikit ujung gigi atas.', tongue: 'Lidah sedikit keluar.' } },
  { id: 'jim', name: 'Jim', arabic: 'ج', isolated: 'ج', initial: 'جـ', medial: 'ـجـ', final: 'ـج', audioRef: 'jim.mp3', order: 5,
    makhraj: { simple: 'Tengah Lidah', technical: 'Syajariyyah', description: 'Tengah lidah naik menempel langit-langit.', tongue: 'Lidah terangkat di tengah.' } },
  { id: 'ha', name: 'Ha', arabic: 'ح', isolated: 'ح', initial: 'حـ', medial: 'ـحـ', final: 'ـح', audioRef: 'ha_kecil.mp3', order: 6,
    makhraj: { simple: 'Tenggorokan Tengah', technical: 'Wasthul Halq', description: 'Suara bersih ditekan di tengah tenggorokan.', tongue: 'Lidah rileks.' } },
  { id: 'kha', name: 'Kha', arabic: 'خ', isolated: 'خ', initial: 'خـ', medial: 'ـخـ', final: 'ـخ', audioRef: 'kha.mp3', order: 7,
    makhraj: { simple: 'Tenggorokan Atas', technical: 'Adnal Halq', description: 'Suara seperti orang berdehem/ngorok halus.', tongue: 'Pangkal lidah mendekati langit-langit.' } },
  { id: 'dal', name: 'Dal', arabic: 'د', isolated: 'د', initial: 'د', medial: 'ـد', final: 'ـد', audioRef: 'dal.mp3', order: 8,
    makhraj: { simple: 'Ujung Lidah & Pangkal Gigi', technical: 'Nath\'iyyah', description: 'Ujung lidah menyentuh pangkal gigi atas.', tongue: 'Lidah mirip "Ta" tapi lunak.' } },
  { id: 'dzal', name: 'Dzal', arabic: 'ذ', isolated: 'ذ', initial: 'ذ', medial: 'ـذ', final: 'ـذ', audioRef: 'dzal.mp3', order: 9,
    makhraj: { simple: 'Ujung Lidah & Ujung Gigi', technical: 'Litsawiyyah', description: 'Ujung lidah menempel ujung gigi atas.', tongue: 'Lidah sedikit keluar, bergetar.' } },
  { id: 'ra', name: 'Ra', arabic: 'ر', isolated: 'ر', initial: 'ر', medial: 'ـر', final: 'ـر', audioRef: 'ra.mp3', order: 10,
    makhraj: { simple: 'Ujung Lidah', technical: 'Dzalqiyyah', description: 'Ujung lidah menyentuh langit-langit depan.', tongue: 'Lidah bergetar sedikit.' } },
  { id: 'zay', name: 'Zay', arabic: 'ز', isolated: 'ز', initial: 'ز', medial: 'ـز', final: 'ـز', audioRef: 'zay.mp3', order: 11,
    makhraj: { simple: 'Ujung Lidah', technical: 'Asaliyyah', description: 'Lidah di antara gigi atas dan bawah.', tongue: 'Suara mendesis tajam (lebah).' } },
  { id: 'sin', name: 'Sin', arabic: 'س', isolated: 'س', initial: 'سـ', medial: 'ـسـ', final: 'ـس', audioRef: 'sin.mp3', order: 12,
    makhraj: { simple: 'Ujung Lidah', technical: 'Asaliyyah', description: 'Lidah di antara gigi seri.', tongue: 'Desisan halus seperti "S".' } },
  { id: 'syin', name: 'Syin', arabic: 'ش', isolated: 'ش', initial: 'شـ', medial: 'ـشـ', final: 'ـش', audioRef: 'syin.mp3', order: 13,
    makhraj: { simple: 'Tengah Lidah', technical: 'Syajariyyah', description: 'Udara menyebar luas di dalam mulut.', tongue: 'Tengah lidah naik, tidak menempel.' } },
  { id: 'shad', name: 'Shad', arabic: 'ص', isolated: 'ص', initial: 'صـ', medial: 'ـصـ', final: 'ـص', audioRef: 'shad.mp3', order: 14,
    makhraj: { simple: 'Ujung Lidah (Tebal)', technical: 'Asaliyyah', description: 'Mendesis kuat dengan pangkal lidah naik.', tongue: 'Lidah melengkung ke atas.' } },
  { id: 'dhad', name: 'Dhad', arabic: 'ض', isolated: 'ض', initial: 'ضـ', medial: 'ـضـ', final: 'ـض', audioRef: 'dhad.mp3', order: 15,
    makhraj: { simple: 'Tepi Lidah', technical: 'Janbiyyah', description: 'Sisi lidah menempel ke geraham atas.', tongue: 'Paling sulit, lidah melebar.' } },
  { id: 'tha', name: 'Tha', arabic: 'ط', isolated: 'ط', initial: 'طـ', medial: 'ـطـ', final: 'ـط', audioRef: 'tha.mp3', order: 16,
    makhraj: { simple: 'Ujung Lidah (Kuat)', technical: 'Nath\'iyyah', description: 'Ujung lidah menempel pangkal gigi atas.', tongue: 'Pangkal lidah naik ke langit-langit.' } },
  { id: 'zha', name: 'Zha', arabic: 'ظ', isolated: 'ظ', initial: 'ظـ', medial: 'ـظـ', final: 'ـظ', audioRef: 'zha.mp3', order: 17,
    makhraj: { simple: 'Ujung Lidah & Gigi', technical: 'Litsawiyyah', description: 'Ujung lidah menempel ujung gigi atas.', tongue: 'Sangat tebal, lidah terangkat.' } },
  { id: 'ain', name: "'Ain", arabic: 'ع', isolated: 'ع', initial: 'عـ', medial: 'ـعـ', final: 'ـع', audioRef: 'ain.mp3', order: 18,
    makhraj: { simple: 'Tenggorokan Tengah', technical: 'Wasthul Halq', description: 'Suara ditekan jernih di tengah tenggorokan.', tongue: 'Tenggorokan menyempit sedikit.' } },
  { id: 'ghain', name: 'Ghain', arabic: 'غ', isolated: 'غ', initial: 'غـ', medial: 'ـغـ', final: 'ـغ', audioRef: 'ghain.mp3', order: 19,
    makhraj: { simple: 'Tenggorokan Atas', technical: 'Adnal Halq', description: 'Suara seperti berkumur (gurgling).', tongue: 'Langkai lidah naik mendekati tekak.' } },
  { id: 'fa', name: 'Fa', arabic: 'ف', isolated: 'ف', initial: 'فـ', medial: 'ـفـ', final: 'ـف', audioRef: 'fa.mp3', order: 20,
    makhraj: { simple: 'Bibir & Gigi', technical: 'Asy-Syafatain', description: 'Gigi seri atas menyentuh bibir bawah.', tongue: 'Bibir bawah tertekuk ke dalam.' } },
  { id: 'qaf', name: 'Qaf', arabic: 'ق', isolated: 'ق', initial: 'قـ', medial: 'ـقـ', final: 'ـق', audioRef: 'qaf.mp3', order: 21,
    makhraj: { simple: 'Pangkal Lidah (Dalam)', technical: 'Lahawiyyah', description: 'Pangkal lidah menempel langit-langit lunak.', tongue: 'Lidah paling belakang terangkat.' } },
  { id: 'kaf', name: 'Kaf', arabic: 'ك', isolated: 'ك', initial: 'كـ', medial: 'ـكـ', final: 'ـك', audioRef: 'kaf.mp3', order: 22,
    makhraj: { simple: 'Pangkal Lidah (Luar)', technical: 'Lahawiyyah', description: 'Pangkal lidah menempel langit-langit keras.', tongue: 'Sedikit depan makhraj Qaf.' } },
  { id: 'lam', name: 'Lam', arabic: 'ل', isolated: 'ل', initial: 'لـ', medial: 'ـلـ', final: 'ـل', audioRef: 'lam.mp3', order: 23,
    makhraj: { simple: 'Ujung Sisi Lidah', technical: 'Dzalqiyyah', description: 'Sisi lidah menyentuh gusi atas depan.', tongue: 'Menempel gusi atas.' } },
  { id: 'mim', name: 'Mim', arabic: 'م', isolated: 'م', initial: 'مـ', medial: 'ـمـ', final: 'ـم', audioRef: 'mim.mp3', order: 24,
    makhraj: { simple: 'Dua Bibir (Ghunnah)', technical: 'Asy-Syafatain', description: 'Dua bibir rapat, suara lewat hidung.', tongue: 'Bibir tertutup.' } },
  { id: 'nun', name: 'Nun', arabic: 'ن', isolated: 'ن', initial: 'نـ', medial: 'ـنـ', final: 'ـن', audioRef: 'nun.mp3', order: 25,
    makhraj: { simple: 'Ujung Lidah (Ghunnah)', technical: 'Dzalqiyyah', description: 'Ujung lidah menyentuh langit-langit.', tongue: 'Suara keluar lewat hidung.' } },
  { id: 'ha2', name: 'Ha', arabic: 'ه', isolated: 'ه', initial: 'هـ', medial: 'ـهـ', final: 'ـه', audioRef: 'ha.mp3', order: 26,
    makhraj: { simple: 'Tenggorokan Bawah', technical: 'Aqshol Halq', description: 'Suara lepas tanpa hambatan.', tongue: 'Dasar tenggorokan.' } },
  { id: 'waw', name: 'Waw', arabic: 'و', isolated: 'و', initial: 'و', medial: 'ـو', final: 'ـو', audioRef: 'wau.mp3', order: 27,
    makhraj: { simple: 'Dua Bibir (Bulat)', technical: 'Asy-Syafatain', description: 'Bibir mencucu/monyong membentuk bulatan.', tongue: 'Bibir tidak rapat.' } },
  { id: 'ya', name: 'Ya', arabic: 'ي', isolated: 'ي', initial: 'يـ', medial: 'ـيـ', final: 'ـي', audioRef: 'ya.mp3', order: 28,
    makhraj: { simple: 'Tengah Lidah', technical: 'Syajariyyah', description: 'Tengah lidah naik tanpa menempel rapat.', tongue: 'Lidah melengkung di tengah.' } },
];

/** Harakal / Tanda Baca */
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
    text: 'قُل| أَعُوذُ بِرَبِّ ٱل|فَلَقِ',
    translation: 'Katakanlah, "Aku berlindung kepada Tuhan yang menguasai subuh."'
  },
  {
    surah: 'An-Nas',
    ayah: 1,
    text: 'قُل| أَعُوذُ بِ|رَبِّ ٱل|نَّاسِ',
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
    text: 'ذَٰلِكَ ٱل|كِتَـٰبُ لَا رَيْبَ فِيهِ هُدًى لِّل|مُتَّقِينَ',
    translation: 'Kitab (Al-Qur\'an) ini tidak ada keraguan padanya; petunjuk bagi mereka yang bertakwa.'
  },
];

export default HIJAIYAH_LETTERS;
