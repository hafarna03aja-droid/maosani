/**
 * Digital Tracing Canvas
 * Komponen layar kanvas untuk santri menulis/menggambar huruf hijaiyah
 * Mendukung touch (mobile) dan mouse (desktop)
 * Mendukung 3 Level: Tunggal, Posisi, dan Sambung
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useCanvas from '../../hooks/useCanvas';
import { HIJAIYAH_LETTERS } from '../../data/hijaiyah';
import { WRITING_LEVELS, CONNECTED_WORDS } from '../../data/writingLevels';
import useGamificationStore from '../../store/gamificationStore';
import { Button, Card, Badge } from '../../components/ui';
import './canvas.css';

export default function TracingCanvas() {
  const [selectedLevel, setSelectedLevel] = useState(WRITING_LEVELS[0]);
  const [selectedLetter, setSelectedLetter] = useState(HIJAIYAH_LETTERS[0]);
  const [selectedPosition, setSelectedPosition] = useState('isolated'); // isolated, initial, medial, final
  const [selectedWord, setSelectedWord] = useState(CONNECTED_WORDS[0]);
  
  const [lineColor, setLineColor] = useState('#FFFFFF');
  const [lineWidth, setLineWidth] = useState(4);
  const [result, setResult] = useState(null); // { score: number, message: string }

  const { addXP, incrementStat } = useGamificationStore();

  // Determine the guide letter based on level
  const guideText = useMemo(() => {
    if (selectedLevel.id === 1) return selectedLetter.arabic;
    if (selectedLevel.id === 2) {
      return selectedLetter[selectedPosition] || selectedLetter.arabic;
    }
    if (selectedLevel.id === 3) return selectedWord.text;
    return selectedLetter.arabic;
  }, [selectedLevel, selectedLetter, selectedPosition, selectedWord]);

  // Determine the label name
  const targetName = useMemo(() => {
    if (selectedLevel.id === 1) return selectedLetter.name;
    if (selectedLevel.id === 2) {
      const posMap = { isolated: 'Tunggal', initial: 'Awal', medial: 'Tengah', final: 'Akhir' };
      return `${selectedLetter.name} (${posMap[selectedPosition]})`;
    }
    if (selectedLevel.id === 3) return selectedWord.name;
    return selectedLetter.name;
  }, [selectedLevel, selectedLetter, selectedPosition, selectedWord]);

  const { canvasRef, clearCanvas, undoLastStroke, strokeCount, calculateScore } = useCanvas({
    width: 320,
    height: 320,
    lineColor,
    lineWidth,
    guideLetter: guideText,
    guideColor: 'rgba(0, 112, 224, 0.12)',
    guideFontSize: 220,
  });

  const colors = [
    { name: 'Putih', value: '#FFFFFF' },
    { name: 'Biru', value: '#3395FF' },
    { name: 'Emas', value: '#FBBF24' },
    { name: 'Merah', value: '#FF6B63' },
    { name: 'Hijau', value: '#10B981' },
  ];

  const handleFinish = () => {
    const score = calculateScore();
    let message = 'Ayo Coba Lagi!';
    let xpReward = 0;

    if (score >= 80) {
      message = 'Sempurna! ✨';
      xpReward = 10;
    } else if (score >= 50) {
      message = 'Bagus! 👍';
      xpReward = 5;
    }

    setResult({ score, message, xpReward });
    
    // Reward gamification
    incrementStat('canvasStrokes', strokeCount);
    if (xpReward > 0) {
      addXP(xpReward, `Latihan Menulis ${selectedLevel.name}: ${targetName}`);
    }
  };

  const resetCanvas = () => {
    setResult(null);
    clearCanvas();
  };

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    resetCanvas();
  };

  return (
    <div className="tracing-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="tracing-header"
      >
        <h1>✍️ Latihan Menulis</h1>
        <p>Tingkatkan kemampuan menulis Arab Anda</p>
      </motion.div>

      {/* Level Selector */}
      <div className="tracing-level-tabs">
        {WRITING_LEVELS.map(level => (
          <button
            key={level.id}
            className={`level-tab ${selectedLevel.id === level.id ? 'active' : ''}`}
            onClick={() => handleLevelChange(level)}
          >
            <span className="level-icon">{level.icon}</span>
            <span className="level-name">{level.name}</span>
          </button>
        ))}
      </div>

      {/* Sub-selectors Based on Level */}
      <div className="tracing-sub-selector">
        {selectedLevel.id === 1 && (
          <div className="tracing-letter-scroll">
            {HIJAIYAH_LETTERS.map(letter => (
              <motion.button
                key={letter.id}
                className={`tracing-letter-btn ${selectedLetter.id === letter.id ? 'tracing-letter-active' : ''}`}
                onClick={() => { setSelectedLetter(letter); resetCanvas(); }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="arabic">{letter.arabic}</span>
                <span className="tracing-letter-name">{letter.name}</span>
              </motion.button>
            ))}
          </div>
        )}

        {selectedLevel.id === 2 && (
          <div className="level-2-controls">
            <div className="tracing-letter-scroll">
              {HIJAIYAH_LETTERS.map(letter => (
                <motion.button
                  key={letter.id}
                  className={`tracing-letter-btn ${selectedLetter.id === letter.id ? 'tracing-letter-active' : ''}`}
                  onClick={() => { setSelectedLetter(letter); resetCanvas(); }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="arabic">{letter.arabic}</span>
                  <span className="tracing-letter-name">{letter.name}</span>
                </motion.button>
              ))}
            </div>
            <div className="position-selector">
              {['isolated', 'initial', 'medial', 'final'].map(pos => (
                <button
                  key={pos}
                  className={`pos-btn ${selectedPosition === pos ? 'active' : ''}`}
                  onClick={() => { setSelectedPosition(pos); resetCanvas(); }}
                >
                  {pos === 'isolated' ? 'Tunggal' : pos === 'initial' ? 'Awal' : pos === 'medial' ? 'Tengah' : 'Akhir'}
                  <span className="pos-arabic">{selectedLetter[pos] || selectedLetter.arabic}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedLevel.id === 3 && (
          <div className="tracing-letter-scroll">
            {CONNECTED_WORDS.map(word => (
              <motion.button
                key={word.id}
                className={`tracing-letter-btn ${selectedWord.id === word.id ? 'tracing-letter-active' : ''}`}
                onClick={() => { setSelectedWord(word); resetCanvas(); }}
                whileTap={{ scale: 0.9 }}
                style={{ minWidth: '100px' }}
              >
                <span className="arabic" style={{ fontSize: '1.2rem' }}>{word.text}</span>
                <span className="tracing-letter-name">{word.name}</span>
                <span className="tracing-letter-name" style={{ fontSize: '9px', opacity: 0.6 }}>{word.difficulty}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <motion.div
        className="tracing-canvas-area"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="elevated" padding="md" className="tracing-canvas-card">
          {/* Current target label */}
          <div className="tracing-canvas-label">
            <div style={{ textAlign: 'right' }}>
              <span className="arabic" style={{ fontSize: '1.5rem', display: 'block' }}>{guideText}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{targetName}</span>
            </div>
            <div className="canvas-stats">
              <Badge variant="blue">{selectedLevel.name}</Badge>
              <span className="tracing-stroke-count">{strokeCount} goresan</span>
            </div>
          </div>

          {/* Canvas */}
          <div className="tracing-canvas-wrapper" style={{ position: 'relative' }}>
            <canvas
              ref={canvasRef}
              className="tracing-canvas"
              id="hijaiyah-tracing-canvas"
              style={{ filter: result ? 'blur(3px)' : 'none', transition: 'filter 0.3s' }}
            />
            {/* Result Overlay */}
            <AnimatePresence>
              {result && (
                <motion.div 
                  className="tracing-result-overlay"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(10, 22, 40, 0.84)', borderRadius: '16px', zIndex: 10,
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <motion.div
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                  >
                    <h2 style={{ color: result.score >= 50 ? '#10B981' : '#FF6B63', fontSize: '2.2rem', marginBottom: '8px', fontWeight: 800 }}>
                      {result.message}
                    </h2>
                  </motion.div>
                  <p style={{ color: 'white', fontSize: '1.2rem', marginBottom: '16px' }}>
                    Akurasi: <span style={{ color: 'var(--blue-400)', fontWeight: 700 }}>{result.score}%</span>
                  </p>
                  {result.xpReward > 0 && (
                    <Badge variant="gold" icon="⭐" size="md">+{result.xpReward} XP</Badge>
                  )}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <Button variant="ghost" onClick={resetCanvas}>
                      Ulangi
                    </Button>
                    <Button variant="primary" onClick={resetCanvas}>
                      Lanjut
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Color picker */}
          <div className="tracing-colors">
            {colors.map(c => (
              <button
                key={c.value}
                className={`tracing-color-btn ${lineColor === c.value ? 'tracing-color-active' : ''}`}
                style={{ background: c.value }}
                onClick={() => setLineColor(c.value)}
                title={c.name}
              />
            ))}
            <div className="tracing-width-control">
              <label>Ketebalan</label>
              <input
                type="range"
                min="2"
                max="12"
                value={lineWidth}
                onChange={e => setLineWidth(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="tracing-actions">
            <Button
              variant="ghost"
              size="sm"
              icon="↩️"
              onClick={undoLastStroke}
              disabled={strokeCount === 0 || result !== null}
            >
              Undo
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon="🗑️"
              onClick={resetCanvas}
              disabled={strokeCount === 0 && !result}
            >
              Hapus
            </Button>
            <Button
              variant="success"
              size="md"
              icon="✅"
              onClick={handleFinish}
              disabled={strokeCount < 1 || result !== null}
              style={{ paddingLeft: '2rem', paddingRight: '2rem' }}
            >
              Selesai
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Level Descriptions */}
      <div className="level-info-card">
        <h3>{selectedLevel.icon} {selectedLevel.name}</h3>
        <p>{selectedLevel.description}</p>
      </div>
    </div>
  );
}
