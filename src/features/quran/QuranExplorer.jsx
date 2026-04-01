/**
 * Quran Explorer — Mini-game Simulasi Mushaf
 * Santri bisa mengklik/mencari huruf yang baru dipelajari dalam teks Al-Qur'an
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HIJAIYAH_LETTERS, QURAN_SAMPLES } from '../../data/hijaiyah';
import { Card, Badge, Button } from '../../components/ui';
import './quran.css';

// Membantu menormalkan huruf Arab untuk pencarian (misal: Alif dengan hamzah tetap terbaca Alif)
const normalizeArabic = (str) => {
  return str.replace(/[أإآٱ]/g, 'ا').replace(/[ى]/g, 'ي').replace(/[ة]/g, 'ه');
};

// Cek kecocokan grapheme dengan huruf target
const isMatchTarget = (grapheme, targetStr) => {
  return normalizeArabic(grapheme).includes(normalizeArabic(targetStr));
};

export default function QuranExplorer() {
  const [targetLetter, setTargetLetter] = useState(HIJAIYAH_LETTERS[0]);
  const [foundPositions, setFoundPositions] = useState([]);
  const [selectedVerse, setSelectedVerse] = useState(0);
  const [score, setScore] = useState(0);
  const [showHints, setShowHints] = useState(false);

  const verse = QURAN_SAMPLES[selectedVerse];

  // Memecah ayat menjadi grapheme (huruf dasar + harakat disatukan agar tidak rusak saat di-render terpisah)
  const verseGraphemes = useMemo(() => {
    const str = verse.text;
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter('ar', { granularity: 'grapheme' });
      return Array.from(segmenter.segment(str)).map(s => s.segment);
    }
    // Fallback regex base character + combining marks
    return str.match(/[\s\S][\u064B-\u065F\u0670\u0651\u0653-\u0655\u06DF-\u06E8\u06EA-\u06ED]*/g) || str.split('');
  }, [verse.text]);

  // Find all occurrences of target letter in verse graphemes
  const letterPositions = useMemo(() => {
    const positions = [];
    verseGraphemes.forEach((grapheme, idx) => {
      if (isMatchTarget(grapheme, targetLetter.arabic)) {
        positions.push(idx);
      }
    });
    return positions;
  }, [verseGraphemes, targetLetter]);

  const handleCharClick = (index) => {
    const grapheme = verseGraphemes[index];
    if (isMatchTarget(grapheme, targetLetter.arabic) && !foundPositions.includes(index)) {
      setFoundPositions(prev => [...prev, index]);
      setScore(s => s + 10);
    }
  };

  const resetGame = () => {
    setFoundPositions([]);
    setScore(0);
    setShowHints(false);
  };

  const nextVerse = () => {
    setSelectedVerse((selectedVerse + 1) % QURAN_SAMPLES.length);
    resetGame();
  };

  const allFound = letterPositions.length > 0 && foundPositions.length === letterPositions.length;

  return (
    <div className="quran-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="quran-header"
      >
        <h1>🔍 Quran Explorer</h1>
        <p>Cari huruf yang ditentukan dalam ayat Al-Qur'an dengan mengetuk (klik) pada huruf tersebut.</p>
      </motion.div>

      {/* Target Letter Picker */}
      <div className="quran-target-section">
        <Card variant="glow" padding="md" className="quran-target-card">
          <span className="quran-target-label">Cari huruf:</span>
          <span className="quran-target-arabic arabic-xl">{targetLetter.arabic}</span>
          <span className="quran-target-name">{targetLetter.name}</span>
          <div className="quran-target-stats">
            <Badge variant="blue" size="sm">
              🎯 {foundPositions.length}/{letterPositions.length} ditemukan
            </Badge>
            <Badge variant="gold" size="sm">
              ⭐ Skor: {score}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Letter selector */}
      <div className="quran-letter-picker">
        {HIJAIYAH_LETTERS.slice(0, 14).map(letter => (
          <button
            key={letter.id}
            className={`quran-letter-btn ${targetLetter.id === letter.id ? 'active' : ''}`}
            onClick={() => { setTargetLetter(letter); resetGame(); }}
          >
            <span className="arabic">{letter.arabic}</span>
          </button>
        ))}
      </div>

      {/* Quran Verse Display */}
      <Card variant="elevated" padding="lg" className="quran-verse-card">
        <div className="quran-verse-header">
          <Badge variant="blue" size="md">{verse.surah} : {verse.ayah}</Badge>
          <div className="quran-verse-actions">
            <Button variant="ghost" size="sm" onClick={() => setShowHints(!showHints)}>
              {showHints ? '🙈 Sembunyikan' : '💡 Petunjuk'}
            </Button>
          </div>
        </div>

        {/* Interactive verse text */}
        <div className="quran-verse-text arabic" dir="rtl">
          {verseGraphemes.map((grapheme, i) => {
            const isTarget = isMatchTarget(grapheme, targetLetter.arabic);
            const isFound = foundPositions.includes(i);
            const isHinted = showHints && isTarget && !isFound;

            return (
              <motion.span
                key={i}
                className={`quran-char ${isTarget ? 'quran-char-target' : ''} ${isFound ? 'quran-char-found' : ''} ${isHinted ? 'quran-char-hint' : ''}`}
                onClick={() => handleCharClick(i)}
                whileTap={isTarget ? { scale: 1.3 } : {}}
                animate={isFound ? { scale: [1, 1.3, 1], color: '#1A56DB' } : {}}
              >
                {grapheme}
              </motion.span>
            );
          })}
        </div>

        {/* Translation */}
        <p className="quran-verse-translation">
          <em>{verse.translation}</em>
        </p>

        {/* All found celebration */}
        {allFound && letterPositions.length > 0 && (
          <motion.div
            className="quran-celebration"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            🎉 MasyaAllah! Semua huruf <span className="arabic">{targetLetter.arabic}</span> ditemukan!
          </motion.div>
        )}
      </Card>

      {/* Navigation */}
      <div className="quran-nav-actions">
        <Button variant="ghost" size="md" onClick={resetGame} icon="🔄">
          Reset
        </Button>
        <Button variant="primary" size="md" onClick={nextVerse} icon="➡️">
          Ayat Berikutnya
        </Button>
      </div>
    </div>
  );
}
