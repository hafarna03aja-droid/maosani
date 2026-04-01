/**
 * Learning Modules — 9 Langkah Bisa Baca Al-Qur'an + Tajwid
 * 
 * Logika Sequential Unlock:
 * - Step N bisa dibuka HANYA jika Step N-1 berstatus 'approved'
 * - Step 3-4 memerlukan validasi hafal 28 huruf
 * - Modul Tajwid hanya bisa diakses setelah Step 9 approved
 */

export const LEARNING_MODULES = [
  {
    id: 'step-1',
    stepNumber: 1,
    title: 'Mengenal Huruf Hijaiyah (Bagian 1)',
    titleAr: 'تعرّف على الحروف الهجائية',
    description: 'Mengenal 14 huruf hijaiyah pertama (Alif - Zay) dengan teknik staccato/terputus.',
    icon: '🔤',
    type: 'huruf',
    prerequisites: [],
    features: ['letter-display', 'audio-staccato', 'letter-animation', 'tracing-canvas'],
    letterRange: [1, 14], // order 1-14
    audioMode: 'staccato', // terputus, hentakan
    estimatedMinutes: 45,
  },
  {
    id: 'step-2',
    stepNumber: 2,
    title: 'Mengenal Huruf Hijaiyah (Bagian 2)',
    titleAr: 'الحروف الهجائية - الجزء الثاني',
    description: 'Mengenal 14 huruf hijaiyah berikutnya (Sin - Ya) dan animasi huruf bersambung dari kanan.',
    icon: '🔡',
    type: 'huruf',
    prerequisites: [1],
    features: ['letter-display', 'audio-staccato', 'connected-animation', 'tracing-canvas'],
    letterRange: [15, 28], // order 15-28
    audioMode: 'staccato',
    estimatedMinutes: 45,
  },
  {
    id: 'step-3',
    stepNumber: 3,
    title: 'Harakat (Vokal)',
    titleAr: 'الحَرَكَات',
    description: 'Fathah, Kasrah, Dhammah — bunyi vokal dasar. WAJIB hafal 28 huruf.',
    icon: 'َ',
    type: 'vokal',
    prerequisites: [1, 2],
    features: ['harakat-display', 'audio-playback', 'one-line-rule'],
    requiresValidation: true, // harus validasi hafalan 28 huruf
    validationMessage: 'Anda harus menghafal 28 huruf hijaiyah sebelum melanjutkan.',
    audioMode: 'continuous',
    uiRules: ['no-pause-mid-line', 'complete-full-line'], // tidak bisa pause di tengah baris
    estimatedMinutes: 60,
  },
  {
    id: 'step-4',
    stepNumber: 4,
    title: 'Tanwin (Nunasi)',
    titleAr: 'التَنْوِين',
    description: 'Fathatain, Kasratain, Dhammatain — huruf berbunyi "N" di akhir.',
    icon: 'ً',
    type: 'tanwin',
    prerequisites: [1, 2, 3],
    features: ['tanwin-display', 'audio-playback', 'one-line-rule'],
    requiresValidation: true,
    audioMode: 'continuous',
    uiRules: ['no-pause-mid-line', 'complete-full-line'],
    estimatedMinutes: 60,
  },
  {
    id: 'step-5',
    stepNumber: 5,
    title: 'Kaidah Panjang (Mad Asli)',
    titleAr: 'المَدّ الأصلي',
    description: 'Huruf mad (Alif, Waw, Ya) dengan nada stabil 2 harakat.',
    icon: '📏',
    type: 'panjang',
    prerequisites: [1, 2, 3, 4],
    features: ['mad-display', 'audio-nada-stabil', 'duration-indicator'],
    audioMode: 'nada-stabil', // 2 harakat
    estimatedMinutes: 45,
  },
  {
    id: 'step-6',
    stepNumber: 6,
    title: 'Kaidah Panjang Lanjutan',
    titleAr: 'المَدّ الفرعي',
    description: 'Mad Far\'i dengan "nada ayunan" 4-6 harakat.',
    icon: '🎵',
    type: 'panjang',
    prerequisites: [1, 2, 3, 4, 5],
    features: ['mad-fari-display', 'audio-nada-ayunan', 'duration-indicator'],
    audioMode: 'nada-ayunan', // 4-6 harakat, pitch variation
    estimatedMinutes: 60,
  },
  {
    id: 'step-7',
    stepNumber: 7,
    title: 'Huruf Sukun (Mati)',
    titleAr: 'السُّكُون',
    description: 'Transisi dari huruf hidup ke huruf mati (sukun). Pengenalan kata hidup-mati.',
    icon: '⏹️',
    type: 'sukun',
    prerequisites: [1, 2, 3, 4, 5, 6],
    features: ['sukun-display', 'live-dead-transition', 'audio-playback'],
    audioMode: 'transitional',
    estimatedMinutes: 45,
  },
  {
    id: 'step-8',
    stepNumber: 8,
    title: 'Huruf Tasydid (Syaddah)',
    titleAr: 'التَّشْدِيد',
    description: 'Huruf bertasydid — audio lancar tanpa putus untuk huruf ganda.',
    icon: 'ّ',
    type: 'tasydid',
    prerequisites: [1, 2, 3, 4, 5, 6, 7],
    features: ['tasydid-display', 'audio-continuous', 'no-break-playback'],
    audioMode: 'continuous-no-break', // lancar tanpa putus
    estimatedMinutes: 45,
  },
  {
    id: 'step-9',
    stepNumber: 9,
    title: 'Lafadz Allah & Kaidah Khusus',
    titleAr: 'لفظ الجلالة',
    description: 'Aturan tebal-tipis pada Lafadz Allah. Warna ketebalan visual.',
    icon: '🕌',
    type: 'lafadz',
    prerequisites: [1, 2, 3, 4, 5, 6, 7, 8],
    features: ['lafadz-display', 'thickness-coloring', 'audio-playback'],
    audioMode: 'special',
    uiRules: ['bold-thin-coloring'], // tebal-tipis pada Lafadz Allah
    estimatedMinutes: 60,
  },
];

/** Modul Tajwid Selembar — hanya bisa diakses setelah Step 9 approved */
export const TAJWID_MODULES = [
  {
    id: 'tajwid-1',
    stepNumber: 10,
    title: 'Hukum Nun Sukun & Tanwin',
    titleAr: 'أحكام النون الساكنة والتنوين',
    description: 'Izhar, Idgham, Iqlab, Ikhfa',
    icon: 'ن',
    type: 'tajwid',
    isTajwid: true,
    prerequisites: [9],
    subTopics: ['izhar', 'idgham', 'iqlab', 'ikhfa'],
  },
  {
    id: 'tajwid-2',
    stepNumber: 11,
    title: 'Hukum Mim Sukun',
    titleAr: 'أحكام الميم الساكنة',
    description: 'Ikhfa Syafawi, Idgham Mimi, Izhar Syafawi',
    icon: 'م',
    type: 'tajwid',
    isTajwid: true,
    prerequisites: [9],
    subTopics: ['ikhfa-syafawi', 'idgham-mimi', 'izhar-syafawi'],
  },
  {
    id: 'tajwid-3',
    stepNumber: 12,
    title: 'Hukum Mad (Panjang)',
    titleAr: 'أحكام المَدّ',
    description: 'Mad Thabi\'i, Mad Wajib, Mad Jaiz, Mad Lazim, dll.',
    icon: '📐',
    type: 'tajwid',
    isTajwid: true,
    prerequisites: [9],
    subTopics: ['mad-thabii', 'mad-wajib', 'mad-jaiz', 'mad-lazim', 'mad-aridh'],
  },
  {
    id: 'tajwid-4',
    stepNumber: 13,
    title: 'Hukum Qalqalah & Lainnya',
    titleAr: 'القلقلة وغيرها',
    description: 'Qalqalah Sughra & Kubra, Waqaf & Ibtida',
    icon: '💫',
    type: 'tajwid',
    isTajwid: true,
    prerequisites: [9],
    subTopics: ['qalqalah-sughra', 'qalqalah-kubra', 'waqaf', 'ibtida'],
  },
];

export const ALL_MODULES = [...LEARNING_MODULES, ...TAJWID_MODULES];

export default LEARNING_MODULES;
