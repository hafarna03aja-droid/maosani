/**
 * Learning Module View — Halaman Pembelajaran Per Langkah
 * 
 * Menampilkan konten materi berdasarkan step yang dipilih:
 * - Step 1-2: Display huruf hijaiyah + audio staccato + animasi bersambung
 * - Step 3-4: Harakat/Tanwin + aturan one-line-rule
 * - Step 5-6: Kaidah panjang + nada stabil/ayunan
 * - Step 7-9: Sukun, Tasydid, Lafadz Allah
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import useProgressStore from '../../store/progressStore';
import useAudioStore from '../../store/audioStore';
import learningService from '../../services/learningService';
import { LEARNING_MODULES } from '../../data/modules';
import { HIJAIYAH_LETTERS, HARAKAT } from '../../data/hijaiyah';
import { Card, Badge, Button, ProgressBar, Modal } from '../../components/ui';
import StepQuiz from '../quiz/StepQuiz';
import './learning.css';

/** Sub-component: Huruf Hijaiyah Grid (Step 1-2) */
function HurufDisplay({ letterRange, audioMode }) {
  const { playLetter, currentLetter, isPlaying } = useAudioStore();
  const letters = HIJAIYAH_LETTERS.filter(
    l => l.order >= letterRange[0] && l.order <= letterRange[1]
  );

  const [showConnected, setShowConnected] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <div className="learning-huruf-section">
      {/* Toggle: Huruf Tunggal / Bersambung */}
      <div className="learning-toggle-bar">
        <button
          className={`learning-toggle-btn ${!showConnected ? 'active' : ''}`}
          onClick={() => setShowConnected(false)}
        >
          Huruf Tunggal
        </button>
        <button
          className={`learning-toggle-btn ${showConnected ? 'active' : ''}`}
          onClick={() => setShowConnected(true)}
        >
          Huruf Bersambung
        </button>
      </div>

      {/* Letter Grid */}
      <div className="learning-letter-grid">
        {letters.map((letter, i) => (
          <motion.div
            key={letter.id}
            className={`learning-letter-card ${currentLetter === letter.id ? 'learning-letter-playing' : ''}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => {
              playLetter(letter);
              setSelectedLetter(letter);
            }}
            whileTap={{ scale: 0.92 }}
          >
            <span className="learning-letter-arabic arabic">
              {showConnected ? null : letter.arabic}
            </span>

            {/* Connected forms display */}
            {showConnected && (
              <div className="learning-connected-forms">
                <span className="arabic" title="Awal">{letter.initial}</span>
                <span className="arabic" title="Tengah">{letter.medial}</span>
                <span className="arabic" title="Akhir">{letter.final}</span>
              </div>
            )}

            <span className="learning-letter-name">{letter.name}</span>
            <span className="learning-letter-order">{letter.order}</span>

            {/* Playing indicator */}
            {currentLetter === letter.id && (
              <motion.div
                className="learning-letter-pulse"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Selected Letter Detail */}
      <AnimatePresence>
        {selectedLetter && (
          <motion.div
            className="learning-letter-detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card variant="glow" padding="lg" className="learning-detail-card">
              <button className="learning-detail-close" onClick={() => setSelectedLetter(null)}>×</button>
              
              <div className="learning-detail-grid">
                {/* Left: Visual/Arabic - Enhanced Hero Section */}
                <div className="learning-detail-visual">
                  <div className="learning-detail-hero">
                    <div className="learning-hero-bg"></div>
                    <div className="learning-detail-main-char">
                      <span className="arabic-xl animate-float">{selectedLetter.arabic}</span>
                    </div>
                  </div>
                  <div className="learning-detail-info">
                    <span className="learning-info-label">Nama Huruf</span>
                    <h2 className="learning-detail-name">{selectedLetter.name}</h2>
                    {selectedLetter.transliteration && (
                      <span className="learning-detail-trans">{selectedLetter.transliteration}</span>
                    )}
                  </div>
                  <div className="learning-detail-forms">
                    <div className="learning-form-item">
                      <span className="learning-form-label">Tunggal</span>
                      <span className="arabic">{selectedLetter.isolated}</span>
                    </div>
                    <div className="learning-form-item">
                      <span className="learning-form-label">Awal</span>
                      <span className="arabic">{selectedLetter.initial}</span>
                    </div>
                    <div className="learning-form-item">
                      <span className="learning-form-label">Tengah</span>
                      <span className="arabic">{selectedLetter.medial}</span>
                    </div>
                    <div className="learning-form-item">
                      <span className="learning-form-label">Akhir</span>
                      <span className="arabic">{selectedLetter.final}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Pedagogy (Makhraj) */}
                <div className="learning-detail-pedagogy">
                  <div className="learning-makhraj-header">
                    <Badge variant="blue" size="sm">📍 TITIK PENGUCAPAN (MAKHRAJ)</Badge>
                    <button 
                      className="learning-makhraj-toggle"
                      onClick={() => setShowTechnical(!showTechnical)}
                    >
                      {showTechnical ? '← Kembali ke Pemula' : '🎓 Versi Mahir'}
                    </button>
                  </div>

                  <div className="learning-makhraj-content">
                    <div className="learning-makhraj-main">
                      <span className="learning-makhraj-label">Keluar dari:</span>
                      <h4 className="learning-makhraj-value">
                        {showTechnical ? selectedLetter.makhraj.technical : selectedLetter.makhraj.simple}
                      </h4>
                    </div>

                    <div className="learning-makhraj-tongue">
                      <span className="learning-makhraj-label">👅 Posisi Lidah & Mulut:</span>
                      <p>{selectedLetter.makhraj.tongue}</p>
                    </div>

                    <div className="learning-makhraj-desc">
                      <span className="learning-makhraj-label">💡 Tips & Deskripsi:</span>
                      <p>{selectedLetter.makhraj.description}</p>
                    </div>
                  </div>

                  <div className="learning-detail-actions">
                    <Button variant="primary" size="md" icon="🔊" fullWidth onClick={() => playLetter(selectedLetter)}>
                      {audioMode === 'staccato' ? 'Dengar (Staccato)' : 'Dengar Suara'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Sub-component: Harakat Display (Step 3-4) */
function HarakatDisplay({ type }) {
  const { playLetter, isPlaying, currentLetter } = useAudioStore();
  const harakatSet = type === 'vokal'
    ? HARAKAT.filter(h => ['fathah', 'kasrah', 'dhammah'].includes(h.id))
    : HARAKAT.filter(h => ['fathatain', 'kasratain', 'dhammatain'].includes(h.id));

  // Pecah 28 huruf menjadi 4 kelompok (7 huruf per baris)
  const letterGroups = [
    HIJAIYAH_LETTERS.slice(0, 7),   // Alif - Kha
    HIJAIYAH_LETTERS.slice(7, 14),  // Dal - Zay
    HIJAIYAH_LETTERS.slice(14, 21), // Sin - Ghain
    HIJAIYAH_LETTERS.slice(21, 28)  // Fa - Ya
  ];

  const [activeRowId, setActiveRowId] = useState(null); // ID format: {harakatId}-{groupIdx}
  const [rowCompleted, setRowCompleted] = useState({});

  /**
   * One-by-one play for specific character
   */
  const handlePlaySingle = (harakat, letter) => {
    if (isPlaying && !activeRowId) return; // Don't interrupt row play but allow individual play
    playLetter({ ...letter, id: `${letter.id}-${harakat.id}`, type: 'harakat' });
  };

  /**
   * ONE-LINE RULE: Santri harus menyelesaikan bacaan satu baris penuh.
   * Tidak bisa di-pause atau diulang di tengah baris.
   */
  const handlePlayRow = async (harakat, groupIndex, letters) => {
    const rowId = `${harakat.id}-${groupIndex}`;
    if (isPlaying) return; 
    
    setActiveRowId(rowId);

    // Prepare sequence of { type, id }
    const sequence = letters.map(letter => ({
      type: 'harakat',
      id: `${letter.id}-${harakat.id}`
    }));

    await useAudioStore.getState().playSequence(sequence, () => {
      setActiveRowId(null);
      setRowCompleted(prev => ({ ...prev, [rowId]: true }));
    });
  };

  return (
    <div className="learning-harakat-section">
      <div className="learning-harakat-info">
        <Badge variant="red" size="md">⚠️ Aturan Bagian: Selesaikan satu baris penuh</Badge>
        <p>Klik tiap huruf untuk mendengar bunyinya, atau klik "Putar Baris" untuk melatih kelancaran.</p>
      </div>

      {harakatSet.map((harakat) => (
        <Card key={harakat.id} variant="default" padding="md" className="learning-harakat-row">
          <div className="learning-harakat-header">
            <div>
              <span className="arabic" style={{ fontSize: '2rem' }}>
                بـ{harakat.symbol}
              </span>
              <h4>{harakat.name}</h4>
              <p>Bunyi: "{harakat.sound}" — {harakat.description}</p>
            </div>
          </div>

          {/* Render 4 groups (rows) for this harakat */}
          <div className="learning-harakat-groups-container">
            {letterGroups.map((group, gIdx) => {
              const rowId = `${harakat.id}-${gIdx}`;
              const isCurrentRowActive = activeRowId === rowId;
              
              return (
                <div key={rowId} className="learning-harakat-group-row">
                  <div className="learning-group-controls">
                    <span className="learning-group-label">Bagian {gIdx + 1} (1-28)</span>
                    <Button
                      variant={rowCompleted[rowId] ? 'success' : 'primary'}
                      size="sm"
                      icon={isCurrentRowActive ? '⏳' : '▶️'}
                      disabled={isPlaying && !isCurrentRowActive}
                      onClick={() => handlePlayRow(harakat, gIdx, group)}
                    >
                      {rowCompleted[rowId] ? '✓ Selesai' : 'Putar Baris'}
                    </Button>
                  </div>

                  {/* Row of letters with harakat */}
                  <div className="learning-harakat-letters" dir="rtl">
                    {group.map((letter, li) => {
                      const harakatCharId = `harakat-${letter.id}-${harakat.id}`;
                      const isActiveChar = currentLetter === harakatCharId;

                      return (
                        <motion.button
                          key={letter.id}
                          className={`learning-harakat-char arabic ${isCurrentRowActive || isActiveChar ? 'learning-harakat-active' : ''}`}
                          animate={isCurrentRowActive || isActiveChar ? {
                            color: ['#CBD5E1', '#3395FF', '#CBD5E1'],
                            scale: [1, 1.25, 1],
                          } : {}}
                          transition={isCurrentRowActive ? { delay: li * 0.4, duration: 0.6 } : { duration: 0.3 }}
                          onClick={() => handlePlaySingle(harakat, letter)}
                        >
                          <span className="harakat-letter-box">
                            {letter.arabic}{harakat.symbol}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}

/** Sub-component: Mad / Panjang Display (Step 5-6) */
function MadDisplay({ audioMode }) {
  const { playAudio, currentLetter } = useAudioStore();
  const madLetters = [
    { id: 'mad-alif', letter: 'ا', name: 'Alif', harakat: 'َ', example: 'قَالَ', meaning: 'Dia berkata', duration: audioMode === 'nada-stabil' ? 2 : 4, audioId: 'mad_alif' },
    { id: 'mad-waw', letter: 'و', name: 'Waw', harakat: 'ُ', example: 'يَقُولُ', meaning: 'Dia berkata', duration: audioMode === 'nada-stabil' ? 2 : 4, audioId: 'mad_waw' },
    { id: 'mad-ya', letter: 'ي', name: 'Ya', harakat: 'ِ', example: 'قِيلَ', meaning: 'Dikatakan', duration: audioMode === 'nada-stabil' ? 2 : 6, audioId: 'mad_ya' },
  ];

  return (
    <div className="learning-mad-section">
      <div className="learning-mad-info">
        <Badge variant="blue" size="md">
          {audioMode === 'nada-stabil' ? '📏 Nada Stabil — 2 Harakat' : '🎵 Nada Ayunan — 4-6 Harakat'}
        </Badge>
      </div>

      {madLetters.map(mad => (
        <Card key={mad.id} variant="elevated" padding="md" className="learning-mad-card">
          <div className="learning-mad-header">
            <span className="arabic-large">{mad.letter}</span>
            <div>
              <h4>Mad {mad.name}</h4>
              <p>Panjang: {mad.duration} harakat</p>
            </div>
          </div>

          {/* Duration indicator */}
          <div className="learning-duration-bar">
            <div className="learning-duration-label">Durasi:</div>
            <div className="learning-duration-track">
              {Array.from({ length: mad.duration }).map((_, i) => (
                <motion.div
                  key={i}
                  className="learning-duration-unit"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: i * 0.15, duration: 0.3 }}
                />
              ))}
            </div>
            <span className="learning-duration-count">{mad.duration}×</span>
          </div>

          <div className="learning-mad-example">
            <div className="learning-mad-example-text">
              <span className="learning-mad-example-label">Contoh:</span>
              <span className="arabic-large">{mad.example}</span>
              <span className="learning-mad-meaning">({mad.meaning})</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              icon={currentLetter === `example-${mad.audioId}` ? '⏳' : '🔊'}
              onClick={() => playAudio('example', mad.audioId)}
            >
              Dengarkan
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

/** Sub-component: Sukun / Tasydid / Lafadz (Step 7-9) */
function AdvancedDisplay({ type }) {
  const { playAudio, currentLetter } = useAudioStore();
  const content = {
    sukun: {
      title: 'Huruf Sukun (Mati)',
      description: 'Sukun (ـْـ) menandakan huruf mati — bunyi konsonan tanpa vokal.',
      examples: [
        { text: 'مَسْجِد', transliteration: 'Mas-jid', note: 'Sin mati → bunyi "s" saja', audioId: 'sukun_masjid' },
        { text: 'يَعْلَم', transliteration: "Ya'-lam", note: "'Ain mati → bunyi glottal stop", audioId: 'sukun_yalam' },
        { text: 'قَلْب', transliteration: 'Qal-b', note: 'Lam mati → transisi hidup ke mati', audioId: 'sukun_qalb' },
      ],
    },
    tasydid: {
      title: 'Huruf Tasydid (Syaddah)',
      description: 'Tasydid (ـّـ) artinya huruf ganda — dibaca tebal, lancar tanpa putus.',
      examples: [
        { text: 'مُحَمَّد', transliteration: 'Muham-mad', note: 'Mim ganda — audio lancar', audioId: 'tasydid_muhammad' },
        { text: 'رَبَّنَا', transliteration: 'Rab-bana', note: 'Ba ganda — tidak boleh putus', audioId: 'tasydid_rabbana' },
        { text: 'إِنَّ', transliteration: 'In-na', note: 'Nun ganda — tekan dan lancar', audioId: 'tasydid_inna' },
      ],
    },
    lafadz: {
      title: 'Lafadz Allah',
      description: 'Aturan tebal (tafkhim) dan tipis (tarqiq) pada lafadz الله.',
      examples: [
        { text: 'بِسْمِ ٱللَّهِ', transliteration: 'Bismillah', note: '🔵 TIPIS — sebelumnya kasrah', isThin: true, audioId: 'lafadz_bismillah' },
        { text: 'عَبْدُ ٱللَّهِ', transliteration: "'Abdullah", note: '🔴 TEBAL — sebelumnya fathah/dhammah', isThin: false, audioId: 'lafadz_abdullah' },
        { text: 'قَالَ ٱللَّهُ', transliteration: 'Qalallahu', note: '🔴 TEBAL — sebelumnya fathah', isThin: false, audioId: 'lafadz_qalallahu' },
      ],
    },
  };

  const c = content[type] || content.sukun;

  return (
    <div className="learning-advanced-section">
      <h3>{c.title}</h3>
      <p className="learning-advanced-desc">{c.description}</p>

      <div className="learning-advanced-examples">
        {c.examples.map((ex, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <Card variant="elevated" padding="md" className="learning-advanced-card">
              <div className="learning-advanced-body">
                <div className="learning-advanced-arabic">
                  <span className={`arabic-large ${type === 'lafadz' ? (ex.isThin ? 'lafadz-thin' : 'lafadz-thick') : ''}`}>
                    {ex.text}
                  </span>
                </div>
                <div className="learning-advanced-info">
                  <span className="learning-transliteration">{ex.transliteration}</span>
                  <span className="learning-note">{ex.note}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  icon={currentLetter === `example-${ex.audioId}` ? '⏳' : '🔊'}
                  onClick={() => playAudio('example', ex.audioId)}
                >
                  Dengarkan
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ======================== MAIN COMPONENT ======================== */
export default function LearningModule() {
  const { stepId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getStepStatus, startStep, submitForReview, updateExerciseProgress } = useProgressStore();
  const { setPlaybackMode } = useAudioStore();

  const stepNumber = parseInt(stepId) || 1;
  const module = LEARNING_MODULES.find(m => m.stepNumber === stepNumber);
  const [activeTab, setActiveTab] = useState('materi');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [dbContent, setDbContent] = useState([]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  // Fetch content from DB
  useEffect(() => {
    const fetchContent = async () => {
      setIsLoadingContent(true);
      const data = await learningService.getStepContent(stepNumber);
      setDbContent(data);
      setIsLoadingContent(false);
    };
    fetchContent();
  }, [stepNumber]);

  // Redirect if locked
  useEffect(() => {
    if (status === 'locked') {
      navigate('/roadmap');
    }
    if (module?.audioMode) {
      setPlaybackMode(module.audioMode);
    }
    // Auto start step if unlocked
    if (status === 'unlocked') {
      startStep(user?.id, stepNumber);
    }
  }, [stepNumber, status]);

  if (!module) {
    return (
      <div className="learning-page">
        <Card variant="default" padding="lg" className="learning-not-found">
          <h2>Modul tidak ditemukan</h2>
          <Button variant="primary" onClick={() => navigate('/roadmap')}>Kembali ke Peta Belajar</Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = () => {
    submitForReview(user?.id, stepNumber);
    setShowSubmitModal(false);
    navigate('/roadmap');
  };

  const renderContent = () => {
    switch (module.type) {
      case 'huruf':
        return <HurufDisplay letterRange={module.letterRange} audioMode={module.audioMode} />;
      case 'vokal':
        return <HarakatDisplay type="vokal" />;
      case 'tanwin':
        return <HarakatDisplay type="tanwin" />;
      case 'panjang':
        return <MadDisplay audioMode={module.audioMode} />;
      case 'sukun':
        return <AdvancedDisplay type="sukun" />;
      case 'tasydid':
        return <AdvancedDisplay type="tasydid" />;
      case 'lafadz':
        return <AdvancedDisplay type="lafadz" />;
      default:
        return <p>Konten segera hadir...</p>;
    }
  };

  return (
    <div className="learning-page">
      {/* Module Header */}
      <motion.div
        className="learning-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className="learning-back" onClick={() => navigate('/roadmap')}>
          ← Kembali
        </button>
        <div className="learning-header-info">
          <div className="learning-header-top">
            <Badge variant="blue" size="md">Langkah {stepNumber}</Badge>
            <Badge
              variant={status === 'approved' ? 'green' : status === 'pending_review' ? 'gold' : 'orange'}
              size="sm"
            >
              {status === 'approved' ? '✅ Lulus' : status === 'pending_review' ? '⏳ Menunggu Review' : '📖 Sedang Belajar'}
            </Badge>
          </div>
          <h1>{module.title}</h1>
          <p className="arabic-ui" style={{ color: 'var(--blue-300)' }}>{module.titleAr}</p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="learning-tabs">
        {[
          { id: 'materi', label: '📖 Materi', icon: '📖' },
          { id: 'latihan', label: '✍️ Latihan', icon: '✍️' },
          { id: 'kuis', label: '📝 Kuis', icon: '📝' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`learning-tab ${activeTab === tab.id ? 'learning-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="learning-content"
        >
          {activeTab === 'materi' && renderContent()}

          {activeTab === 'latihan' && (
            <div className="learning-exercise-placeholder">
              <Card variant="default" padding="lg" className="learning-exercise-card">
                <span style={{ fontSize: '3rem' }}>✍️</span>
                <h3>Latihan Menulis</h3>
                <p>Latih menulis huruf yang telah dipelajari pada kanvas digital</p>
                <Button variant="primary" size="md" onClick={() => navigate('/canvas')}>
                  Buka Kanvas Menulis
                </Button>
              </Card>
              <Card variant="default" padding="lg" className="learning-exercise-card">
                <span style={{ fontSize: '3rem' }}>📖</span>
                <h3>Cari Huruf di Al-Qur'an</h3>
                <p>Temukan huruf yang baru dipelajari dalam ayat Al-Qur'an</p>
                <Button variant="outline" size="md" onClick={() => navigate('/quran')}>
                  Buka Quran Explorer
                </Button>
              </Card>
              <Card variant="default" padding="lg" className="learning-exercise-card">
                <span style={{ fontSize: '3rem' }}>🎤</span>
                <h3>Rekam Bacaan</h3>
                <p>Rekam bacaan Anda untuk dievaluasi oleh Guru</p>
                <Button variant="ghost" size="md" onClick={() => navigate('/voice')}>
                  Buka Rekaman Suara
                </Button>
              </Card>
            </div>
          )}

          {activeTab === 'kuis' && (
            <div className="learning-quiz-section">
              {quizActive ? (
                <StepQuiz
                  stepNumber={stepNumber}
                  module={module}
                  onComplete={(score) => {
                    setQuizActive(false);
                    if (score >= 70) {
                      updateExerciseProgress(user?.id, stepNumber, 10);
                    }
                  }}
                  onClose={() => setQuizActive(false)}
                />
              ) : (
                <>
                  <Card variant="elevated" padding="lg">
                    <h3>📝 Kuis Langkah {stepNumber}</h3>
                    <p>Uji pemahaman Anda tentang materi yang telah dipelajari.</p>
                    <div className="learning-quiz-info">
                      <span>📊 10 pertanyaan</span>
                      <span>⏱️ 30 detik per soal</span>
                      <span>🎯 Minimal 70% untuk lulus</span>
                    </div>
                    <Button
                      variant="primary" size="lg" fullWidth
                      style={{ marginTop: 'var(--space-4)' }}
                      onClick={() => setQuizActive(true)}
                    >
                      🚀 Mulai Kuis
                    </Button>
                  </Card>

                  {status === 'in_progress' && (
                    <Card variant="glow" padding="md" className="learning-submit-section">
                      <h3>📤 Sudah Siap?</h3>
                      <p>Jika Anda merasa sudah menguasai materi ini, kirim ke Guru untuk direview.</p>
                      <Button variant="gold" size="lg" fullWidth onClick={() => setShowSubmitModal(true)}>
                        📤 Submit untuk Review Guru
                      </Button>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="📤 Submit untuk Review"
        size="sm"
      >
        <div className="learning-submit-modal">
          <p>Apakah Anda yakin ingin mengirim <strong>Langkah {stepNumber}</strong> untuk direview oleh Guru?</p>
          <p className="learning-submit-note">Guru akan memeriksa kemampuan Anda dan memberikan penilaian.</p>
          <div className="learning-submit-actions">
            <Button variant="gold" size="lg" fullWidth onClick={handleSubmit}>
              ✅ Ya, Kirim untuk Review
            </Button>
            <Button variant="ghost" size="md" fullWidth onClick={() => setShowSubmitModal(false)}>
              Batal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
