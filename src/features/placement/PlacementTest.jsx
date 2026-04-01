/**
 * Placement Test — Evaluasi Awal Pengenalan Huruf Hijaiyah
 * 
 * Logika:
 * - 10 pertanyaan acak tentang huruf hijaiyah
 * - Skor menentukan step mulai (1, 2, 3, atau 5)
 * - Hasil tersimpan dan digunakan untuk unlock override
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HIJAIYAH_LETTERS } from '../../data/hijaiyah';
import { getPlacementRecommendation } from '../../utils/unlockLogic';
import { Button, Card, ProgressBar } from '../../components/ui';
import './placement.css';

const TOTAL_QUESTIONS = 10;

/** Generate quiz questions */
function generateQuestions() {
  const shuffled = [...HIJAIYAH_LETTERS].sort(() => Math.random() - 0.5);
  const questions = [];

  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const correctLetter = shuffled[i % shuffled.length];
    // Generate 3 wrong options
    const wrongOptions = HIJAIYAH_LETTERS
      .filter(l => l.id !== correctLetter.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [...wrongOptions, correctLetter].sort(() => Math.random() - 0.5);

    questions.push({
      id: i + 1,
      type: i < 6 ? 'identify' : 'name', // Mix of question types
      arabic: correctLetter.arabic,
      correctId: correctLetter.id,
      correctName: correctLetter.name,
      options: options.map(o => ({
        id: o.id,
        label: i < 6 ? o.name : o.arabic,
        display: i < 6 ? o.name : o.arabic,
      })),
    });
  }
  return questions;
}

export default function PlacementTest() {
  const [phase, setPhase] = useState('intro'); // 'intro' | 'quiz' | 'result'
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const questions = useMemo(() => generateQuestions(), []);

  const handleAnswer = (optionId) => {
    if (showFeedback) return;
    setSelectedOption(optionId);
    setShowFeedback(true);

    const isCorrect = optionId === questions[currentQ].correctId;
    const newAnswers = [...answers, { questionId: currentQ, answer: optionId, correct: isCorrect }];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQ < TOTAL_QUESTIONS - 1) {
        setCurrentQ(currentQ + 1);
        setSelectedOption(null);
        setShowFeedback(false);
      } else {
        setPhase('result');
      }
    }, 1200);
  };

  const score = Math.round((answers.filter(a => a.correct).length / TOTAL_QUESTIONS) * 100);
  const recommendation = getPlacementRecommendation(score);

  // --- INTRO ---
  if (phase === 'intro') {
    return (
      <div className="placement-page">
        <motion.div
          className="placement-intro"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="placement-intro-icon">📝</div>
          <h1>Tes Penempatan</h1>
          <p>
            Tes singkat ini akan menentukan titik mulai belajar Anda.
            Jawab {TOTAL_QUESTIONS} pertanyaan tentang huruf hijaiyah.
          </p>
          <div className="placement-intro-info">
            <div>⏱️ Estimasi: 3-5 menit</div>
            <div>📊 {TOTAL_QUESTIONS} pertanyaan</div>
            <div>🎯 Tidak ada hukuman nilai salah</div>
          </div>
          <Button variant="primary" size="lg" onClick={() => setPhase('quiz')}>
            🚀 Mulai Tes
          </Button>
        </motion.div>
      </div>
    );
  }

  // --- RESULT ---
  if (phase === 'result') {
    return (
      <div className="placement-page">
        <motion.div
          className="placement-result"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="placement-result-icon">
            {score >= 70 ? '🌟' : score >= 40 ? '💪' : '📖'}
          </div>
          <h1>Hasil Tes</h1>

          <div className="placement-score-ring">
            <div className="placement-score-number">{score}%</div>
            <div className="placement-score-label">
              {answers.filter(a => a.correct).length}/{TOTAL_QUESTIONS} Benar
            </div>
          </div>

          <Card variant="glow" padding="lg" className="placement-recommendation">
            <h3>📍 Rekomendasi: Mulai dari Langkah {recommendation.recommendedStep}</h3>
            <p>{recommendation.message}</p>
          </Card>

          <div className="placement-result-actions">
            <Button variant="primary" size="lg" fullWidth>
              ✅ Terima & Mulai Belajar
            </Button>
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={() => {
                setPhase('intro');
                setCurrentQ(0);
                setAnswers([]);
                setSelectedOption(null);
                setShowFeedback(false);
              }}
            >
              🔄 Ulangi Tes
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- QUIZ ---
  const q = questions[currentQ];
  const isIdentify = q.type === 'identify';

  return (
    <div className="placement-page">
      <div className="placement-quiz">
        {/* Progress */}
        <div className="placement-progress">
          <span>Soal {currentQ + 1}/{TOTAL_QUESTIONS}</span>
          <ProgressBar value={currentQ + 1} max={TOTAL_QUESTIONS} variant="blue" size="sm" showLabel={false} />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            className="placement-question"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {isIdentify ? (
              <>
                <p className="placement-q-label">Apa nama huruf ini?</p>
                <div className="placement-q-arabic arabic-xl">{q.arabic}</div>
              </>
            ) : (
              <>
                <p className="placement-q-label">Mana huruf <strong>"{q.correctName}"</strong>?</p>
              </>
            )}

            {/* Options */}
            <div className="placement-options">
              {q.options.map(opt => {
                let optClass = 'placement-option';
                if (showFeedback) {
                  if (opt.id === q.correctId) optClass += ' placement-option-correct';
                  else if (opt.id === selectedOption) optClass += ' placement-option-wrong';
                  else optClass += ' placement-option-dimmed';
                }
                if (opt.id === selectedOption && !showFeedback) optClass += ' placement-option-selected';

                return (
                  <motion.button
                    key={opt.id}
                    className={optClass}
                    onClick={() => handleAnswer(opt.id)}
                    whileTap={{ scale: 0.95 }}
                    disabled={showFeedback}
                  >
                    <span className={isIdentify ? '' : 'arabic'}
                          style={!isIdentify ? { fontSize: '2rem' } : {}}>
                      {opt.display}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
