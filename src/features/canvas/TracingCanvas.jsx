/**
 * Digital Tracing Canvas
 * Komponen layar kanvas untuk santri menulis/menggambar huruf hijaiyah
 * Mendukung touch (mobile) dan mouse (desktop)
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useCanvas from '../../hooks/useCanvas';
import { HIJAIYAH_LETTERS } from '../../data/hijaiyah';
import useGamificationStore from '../../store/gamificationStore';
import { Button, Card, Badge } from '../../components/ui';
import './canvas.css';

export default function TracingCanvas() {
  const [selectedLetter, setSelectedLetter] = useState(HIJAIYAH_LETTERS[0]);
  const [lineColor, setLineColor] = useState('#FFFFFF');
  const [lineWidth, setLineWidth] = useState(4);
  const [result, setResult] = useState(null); // { score: number, message: string }

  const { addXP, incrementStat } = useGamificationStore();

  const { canvasRef, clearCanvas, undoLastStroke, strokeCount, calculateScore } = useCanvas({
    width: 320,
    height: 320,
    lineColor,
    lineWidth,
    guideLetter: selectedLetter.arabic,
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
      addXP(xpReward, `Latihan Menulis: ${selectedLetter.name}`);
    }
  };

  const resetCanvas = () => {
    setResult(null);
    clearCanvas();
  };

  return (
    <div className="tracing-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="tracing-header"
      >
        <h1>✍️ Latihan Menulis</h1>
        <p>Ikuti garis huruf yang ditampilkan</p>
      </motion.div>

      {/* Letter selector (horizontal scroll) */}
      <div className="tracing-letter-selector">
        <div className="tracing-letter-scroll">
          {HIJAIYAH_LETTERS.map(letter => (
            <motion.button
              key={letter.id}
              className={`tracing-letter-btn ${selectedLetter.id === letter.id ? 'tracing-letter-active' : ''}`}
              onClick={() => setSelectedLetter(letter)}
              whileTap={{ scale: 0.9 }}
            >
              <span className="arabic">{letter.arabic}</span>
              <span className="tracing-letter-name">{letter.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <motion.div
        className="tracing-canvas-area"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="elevated" padding="md" className="tracing-canvas-card">
          {/* Current letter label */}
          <div className="tracing-canvas-label">
            <span className="arabic" style={{ fontSize: '1.5rem' }}>{selectedLetter.arabic}</span>
            <span>{selectedLetter.name}</span>
            <span className="tracing-stroke-count">{strokeCount} goresan</span>
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
                    background: 'rgba(10, 22, 40, 0.8)', borderRadius: '16px', zIndex: 10
                  }}
                >
                  <h2 style={{ color: result.score >= 50 ? '#10B981' : '#FF6B63', fontSize: '2rem', marginBottom: '8px' }}>
                    {result.message}
                  </h2>
                  <p style={{ color: 'white', fontSize: '1.2rem', marginBottom: '16px' }}>
                    Akurasi: {result.score}%
                  </p>
                  {result.xpReward > 0 && (
                    <Badge variant="warning" icon="⭐">+{result.xpReward} XP</Badge>
                  )}
                  <Button variant="primary" style={{ marginTop: '24px' }} onClick={resetCanvas}>
                    Tulis Ulang
                  </Button>
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
                max="10"
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
              disabled={strokeCount === 0}
            >
              Undo
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon="🗑️"
              onClick={clearCanvas}
              disabled={strokeCount === 0}
            >
              Hapus
            </Button>
            <Button
              variant="success"
              size="sm"
              icon="✅"
              onClick={handleFinish}
              disabled={strokeCount < 1 || result !== null}
            >
              Selesai
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Instructions */}
      <Card variant="default" padding="md" className="tracing-instructions">
        <h3>📝 Cara Menulis</h3>
        <ol>
          <li>Pilih huruf yang ingin dilatih dari daftar di atas</li>
          <li>Ikuti garis biru transparan pada kanvas</li>
          <li>Gunakan jari (mobile) atau mouse (desktop) untuk menggambar</li>
          <li>Tekan <strong>Undo</strong> untuk membatalkan goresan terakhir</li>
          <li>Tekan <strong>Selesai</strong> jika sudah puas dengan tulisan</li>
        </ol>
      </Card>
    </div>
  );
}
