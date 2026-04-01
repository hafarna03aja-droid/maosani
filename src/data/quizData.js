/**
 * Quiz Data Generator — Membuat soal kuis dinamis berdasarkan tipe step
 * 
 * Step 1-2: Identifikasi huruf hijaiyah
 * Step 3-4: Identifikasi harakat/tanwin  
 * Step 5-6: Aturan mad (panjang)
 * Step 7: Sukun
 * Step 8: Tasydid
 * Step 9: Lafadz Allah
 */
import { HIJAIYAH_LETTERS, HARAKAT } from './hijaiyah';

const QUESTIONS_PER_QUIZ = 10;
const PASSING_SCORE = 70;

/** Shuffle array (Fisher-Yates) */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick N random unique items from array */
function pickRandom(arr, n) {
  return shuffle(arr).slice(0, n);
}

/** Generate wrong options for a letter question */
function generateWrongOptions(correctLetter, allLetters, count = 3) {
  return pickRandom(
    allLetters.filter(l => l.id !== correctLetter.id),
    count
  );
}

// ===================== QUESTION GENERATORS =====================

/** Step 1-2: Huruf Hijaiyah questions */
function generateHurufQuestions(letterRange) {
  const letters = HIJAIYAH_LETTERS.filter(
    l => l.order >= letterRange[0] && l.order <= letterRange[1]
  );
  const questions = [];

  // Type 1: "Apa nama huruf ini?" (Arabic → Name)
  const identifyLetters = pickRandom(letters, Math.min(5, letters.length));
  identifyLetters.forEach(letter => {
    const wrongs = generateWrongOptions(letter, HIJAIYAH_LETTERS);
    questions.push({
      type: 'identify',
      question: 'Apa nama huruf ini?',
      display: letter.arabic,
      displayClass: 'arabic-xl',
      correctId: letter.id,
      correctLabel: letter.name,
      options: shuffle([
        { id: letter.id, label: letter.name },
        ...wrongs.map(w => ({ id: w.id, label: w.name })),
      ]),
    });
  });

  // Type 2: "Mana huruf X?" (Name → Arabic)
  const findLetters = pickRandom(letters, Math.min(5, letters.length));
  findLetters.forEach(letter => {
    const wrongs = generateWrongOptions(letter, HIJAIYAH_LETTERS);
    questions.push({
      type: 'find',
      question: `Mana huruf "${letter.name}"?`,
      display: null,
      correctId: letter.id,
      correctLabel: letter.arabic,
      options: shuffle([
        { id: letter.id, label: letter.arabic, isArabic: true },
        ...wrongs.map(w => ({ id: w.id, label: w.arabic, isArabic: true })),
      ]),
    });
  });

  // Type 3: "Bentuk awal huruf X?" (Connected forms)
  const connectedLetters = pickRandom(letters.filter(l => l.initial !== l.isolated), Math.min(3, letters.length));
  connectedLetters.forEach(letter => {
    const wrongs = generateWrongOptions(letter, HIJAIYAH_LETTERS.filter(l => l.initial !== l.isolated));
    questions.push({
      type: 'connected',
      question: `Bentuk AWAL huruf "${letter.name}" adalah?`,
      display: letter.arabic,
      displayClass: 'arabic-xl',
      correctId: letter.id,
      correctLabel: letter.initial,
      options: shuffle([
        { id: letter.id, label: letter.initial, isArabic: true },
        ...wrongs.map(w => ({ id: w.id, label: w.initial, isArabic: true })),
      ]),
    });
  });

  return shuffle(questions).slice(0, QUESTIONS_PER_QUIZ);
}

/** Step 3: Harakat (Vokal) questions */
function generateHarakatQuestions() {
  const vokalHarakat = HARAKAT.filter(h => ['fathah', 'kasrah', 'dhammah'].includes(h.id));
  const sampleLetters = pickRandom(HIJAIYAH_LETTERS, 6);
  const questions = [];

  // Type 1: "Apa bunyi huruf + harakat ini?"
  sampleLetters.forEach(letter => {
    const harakat = vokalHarakat[Math.floor(Math.random() * vokalHarakat.length)];
    const combined = letter.arabic + harakat.symbol;
    const correctSound = letter.name.toLowerCase().charAt(0) + harakat.sound;

    questions.push({
      type: 'harakat-sound',
      question: 'Apa bunyi huruf berharakat ini?',
      display: combined,
      displayClass: 'arabic-xl',
      correctId: harakat.id,
      correctLabel: `${letter.name} + ${harakat.name} = "${correctSound}"`,
      options: shuffle(
        vokalHarakat.map(h => ({
          id: h.id,
          label: `${h.name} — bunyi "${h.sound}"`,
        }))
      ),
    });
  });

  // Type 2: "Mana harakat X?"
  vokalHarakat.forEach(h => {
    questions.push({
      type: 'harakat-identify',
      question: `Mana tanda harakat "${h.name}"?`,
      display: null,
      correctId: h.id,
      correctLabel: h.symbol,
      options: shuffle(
        vokalHarakat.map(vh => ({
          id: vh.id,
          label: `بـ${vh.symbol} (${vh.name})`,
          isArabic: true,
        }))
      ),
    });
  });

  return shuffle(questions).slice(0, QUESTIONS_PER_QUIZ);
}

/** Step 4: Tanwin questions */
function generateTanwinQuestions() {
  const tanwinHarakat = HARAKAT.filter(h => ['fathatain', 'kasratain', 'dhammatain'].includes(h.id));
  const sampleLetters = pickRandom(HIJAIYAH_LETTERS, 6);
  const questions = [];

  sampleLetters.forEach(letter => {
    const harakat = tanwinHarakat[Math.floor(Math.random() * tanwinHarakat.length)];
    questions.push({
      type: 'tanwin-sound',
      question: 'Apa bunyi tanwin pada huruf ini?',
      display: letter.arabic + harakat.symbol,
      displayClass: 'arabic-xl',
      correctId: harakat.id,
      correctLabel: `${harakat.name} — bunyi "${harakat.sound}"`,
      options: shuffle(
        tanwinHarakat.map(t => ({
          id: t.id,
          label: `${t.name} — bunyi "${t.sound}"`,
        }))
      ),
    });
  });

  // Bonus: perbedaan harakat vs tanwin
  questions.push({
    type: 'knowledge',
    question: 'Apa perbedaan Tanwin dengan Harakat biasa?',
    display: null,
    correctId: 'nun-ending',
    correctLabel: 'Tanwin menambahkan bunyi "N" di akhir',
    options: shuffle([
      { id: 'nun-ending', label: 'Menambahkan bunyi "N" di akhir' },
      { id: 'double', label: 'Membuat huruf ganda' },
      { id: 'long', label: 'Memperpanjang bacaan' },
      { id: 'silent', label: 'Membuat huruf mati' },
    ]),
  });

  return shuffle(questions).slice(0, QUESTIONS_PER_QUIZ);
}

/** Step 5-6: Mad (Panjang) questions */
function generateMadQuestions(audioMode) {
  const questions = [];

  // Huruf mad
  questions.push({
    type: 'knowledge',
    question: 'Apa saja 3 huruf mad (huruf panjang)?',
    display: null,
    correctId: 'alif-waw-ya',
    correctLabel: 'Alif (ا), Waw (و), Ya (ي)',
    options: shuffle([
      { id: 'alif-waw-ya', label: 'Alif (ا), Waw (و), Ya (ي)' },
      { id: 'ba-ta-tsa', label: 'Ba (ب), Ta (ت), Tsa (ث)' },
      { id: 'ha-kha-jim', label: 'Ha (ح), Kha (خ), Jim (ج)' },
      { id: 'dal-dzal-ra', label: 'Dal (د), Dzal (ذ), Ra (ر)' },
    ]),
  });

  // Duration
  const isStabil = audioMode === 'nada-stabil';
  questions.push({
    type: 'knowledge',
    question: isStabil
      ? 'Berapa panjang Mad Thabi\'i (asli)?'
      : 'Berapa panjang Mad Wajib Muttashil?',
    display: null,
    correctId: isStabil ? '2-harakat' : '4-5-harakat',
    correctLabel: isStabil ? '2 harakat' : '4-5 harakat',
    options: shuffle([
      { id: '2-harakat', label: '2 harakat' },
      { id: '4-5-harakat', label: '4-5 harakat' },
      { id: '6-harakat', label: '6 harakat' },
      { id: '1-harakat', label: '1 harakat' },
    ]),
  });

  // Example recognition
  const madExamples = [
    { text: 'قَالَ', answer: 'alif', name: 'Alif', reason: 'Alif setelah fathah' },
    { text: 'يَقُولُ', answer: 'waw', name: 'Waw', reason: 'Waw setelah dhammah' },
    { text: 'قِيلَ', answer: 'ya', name: 'Ya', reason: 'Ya setelah kasrah' },
  ];

  madExamples.forEach(ex => {
    questions.push({
      type: 'mad-identify',
      question: `Huruf mad apa yang ada dalam kata ini?`,
      display: ex.text,
      displayClass: 'arabic-xl',
      correctId: ex.answer,
      correctLabel: `${ex.name} — ${ex.reason}`,
      options: shuffle([
        { id: 'alif', label: 'Mad Alif (ا)' },
        { id: 'waw', label: 'Mad Waw (و)' },
        { id: 'ya', label: 'Mad Ya (ي)' },
        { id: 'none', label: 'Tidak ada mad' },
      ]),
    });
  });

  // Fill to 10
  while (questions.length < QUESTIONS_PER_QUIZ) {
    questions.push({
      type: 'knowledge',
      question: 'Mad Thabi\'i terjadi ketika...',
      correctId: 'no-obstacle',
      correctLabel: 'Huruf mad tidak diikuti hambatan (sukun/tasydid)',
      options: shuffle([
        { id: 'no-obstacle', label: 'Huruf mad tanpa hambatan setelahnya' },
        { id: 'has-sukun', label: 'Huruf mad diikuti sukun' },
        { id: 'has-hamzah', label: 'Huruf mad diikuti hamzah' },
        { id: 'end-word', label: 'Huruf mad di akhir kata' },
      ]),
    });
  }

  return shuffle(questions).slice(0, QUESTIONS_PER_QUIZ);
}

/** Step 7-9: Advanced questions */
function generateAdvancedQuestions(type) {
  const questions = [];

  if (type === 'sukun') {
    questions.push(
      {
        type: 'knowledge', question: 'Apa fungsi tanda sukun (ـْـ)?',
        correctId: 'mati', correctLabel: 'Menandakan huruf mati (tanpa vokal)',
        options: shuffle([
          { id: 'mati', label: 'Menandakan huruf mati (tanpa vokal)' },
          { id: 'panjang', label: 'Memperpanjang bacaan' },
          { id: 'ganda', label: 'Menggandakan huruf' },
          { id: 'nasal', label: 'Menambahkan dengung' },
        ]),
      },
      {
        type: 'identify', question: 'Mana contoh huruf mati (sukun)?',
        display: null, correctId: 'masjid', correctLabel: 'مَسْجِد',
        options: shuffle([
          { id: 'masjid', label: 'مَسْجِد (Sin mati)', isArabic: false },
          { id: 'kataba', label: 'كَتَبَ (semua hidup)', isArabic: false },
          { id: 'huwa', label: 'هُوَ (semua hidup)', isArabic: false },
          { id: 'lahu', label: 'لَهُ (semua hidup)', isArabic: false },
        ]),
      },
    );
  } else if (type === 'tasydid') {
    questions.push(
      {
        type: 'knowledge', question: 'Tasydid (Syaddah) artinya...',
        correctId: 'double', correctLabel: 'Huruf dibaca ganda',
        options: shuffle([
          { id: 'double', label: 'Huruf dibaca ganda' },
          { id: 'silent', label: 'Huruf dibaca diam' },
          { id: 'long', label: 'Huruf dibaca panjang' },
          { id: 'nasal', label: 'Huruf dibaca dengang' },
        ]),
      },
      {
        type: 'knowledge', question: 'Bagaimana cara membaca huruf bertasydid?',
        correctId: 'smooth', correctLabel: 'Ditekan, lancar tanpa putus',
        options: shuffle([
          { id: 'smooth', label: 'Ditekan, lancar tanpa putus' },
          { id: 'fast', label: 'Dibaca sangat cepat' },
          { id: 'pause', label: 'Berhenti sejenak lalu lanjut' },
          { id: 'whisper', label: 'Dibaca berbisik' },
        ]),
      },
    );
  } else if (type === 'lafadz') {
    questions.push(
      {
        type: 'knowledge',
        question: 'Kapan lafadz الله dibaca TEBAL (tafkhim)?',
        correctId: 'fathah-dhammah', correctLabel: 'Sebelumnya huruf ber-fathah atau dhammah',
        options: shuffle([
          { id: 'fathah-dhammah', label: 'Sebelumnya ber-fathah/dhammah' },
          { id: 'kasrah', label: 'Sebelumnya ber-kasrah' },
          { id: 'always', label: 'Selalu dibaca tebal' },
          { id: 'never', label: 'Tidak pernah dibaca tebal' },
        ]),
      },
      {
        type: 'identify',
        question: 'Mana bacaan yang Lafadz-nya dibaca TIPIS?',
        display: null, correctId: 'bismillah', correctLabel: 'بِسْمِ ٱللَّهِ',
        options: shuffle([
          { id: 'bismillah', label: 'بِسْمِ ٱللَّهِ (kasrah sebelumnya)', isArabic: false },
          { id: 'abdullah', label: 'عَبْدُ ٱللَّهِ (dhammah sebelumnya)', isArabic: false },
          { id: 'qalallah', label: 'قَالَ ٱللَّهُ (fathah sebelumnya)', isArabic: false },
          { id: 'nasrullah', label: 'نَصْرُ ٱللَّهِ (dhammah sebelumnya)', isArabic: false },
        ]),
      },
    );
  }

  // Pad to 10 with general review questions
  const generalQuestions = [
    {
      type: 'knowledge', question: 'Berapa jumlah huruf hijaiyah?',
      correctId: '28', correctLabel: '28 huruf',
      options: shuffle([
        { id: '28', label: '28 huruf' }, { id: '26', label: '26 huruf' },
        { id: '30', label: '30 huruf' }, { id: '29', label: '29 huruf' },
      ]),
    },
    {
      type: 'knowledge', question: 'Apa itu harakat?',
      correctId: 'vowel', correctLabel: 'Tanda vokal pada huruf',
      options: shuffle([
        { id: 'vowel', label: 'Tanda vokal pada huruf' }, { id: 'consonant', label: 'Huruf konsonan' },
        { id: 'number', label: 'Angka Arab' }, { id: 'punctuation', label: 'Tanda baca umum' },
      ]),
    },
  ];

  while (questions.length < QUESTIONS_PER_QUIZ) {
    const q = generalQuestions[questions.length % generalQuestions.length];
    if (!questions.find(qq => qq.question === q.question)) {
      questions.push(q);
    } else {
      break;
    }
  }

  return shuffle(questions).slice(0, QUESTIONS_PER_QUIZ);
}

// ===================== MAIN EXPORT =====================

/**
 * Generate quiz questions based on step number
 * @param {number} stepNumber - 1-9
 * @param {object} module - module config from modules.js
 * @returns {Array} Array of question objects
 */
export function generateStepQuiz(stepNumber, module) {
  switch (stepNumber) {
    case 1:
    case 2:
      return generateHurufQuestions(module.letterRange || [1, 28]);
    case 3:
      return generateHarakatQuestions();
    case 4:
      return generateTanwinQuestions();
    case 5:
    case 6:
      return generateMadQuestions(module.audioMode);
    case 7:
      return generateAdvancedQuestions('sukun');
    case 8:
      return generateAdvancedQuestions('tasydid');
    case 9:
      return generateAdvancedQuestions('lafadz');
    default:
      return generateHurufQuestions([1, 28]);
  }
}

export { QUESTIONS_PER_QUIZ, PASSING_SCORE };
