/**
 * Step Quiz — Kuis Per Langkah
 * 10 soal, timer, score calculation, result breakdown
 */
import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateStepQuiz, QUESTIONS_PER_QUIZ, PASSING_SCORE } from '../../data/quizData';
import useGamificationStore from '../../store/gamificationStore';
import { Button, Card, Badge, ProgressBar } from '../../components/ui';
import './quiz.css';

const TIMER_SECONDS = 30; // per question

export default function StepQuiz({ stepNumber, module, onComplete, onClose }) {
  const [phase, setPhase] = useState('ready'); // ready | playing | result
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef(null);

  const { recordQuizResult, addXP } = useGamificationStore();
  const questions = useMemo(() => generateStepQuiz(stepNumber, module), [stepNumber]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || showFeedback) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Time's up — mark as wrong
          handleAnswer(null);
          return TIMER_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, currentQ, showFeedback]);

  const handleAnswer = (optionId) => {
    if (showFeedback) return;
    clearInterval(timerRef.current);

    setSelectedOption(optionId);
    setShowFeedback(true);

    const q = questions[currentQ];
    const isCorrect = optionId === q.correctId;
    const newAnswers = [...answers, {
      questionIndex: currentQ,
      selectedId: optionId,
      correctId: q.correctId,
      correct: isCorrect,
      question: q.question,
      correctLabel: q.correctLabel,
    }];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelectedOption(null);
        setShowFeedback(false);
        setTimeLeft(TIMER_SECONDS);
      } else {
        // Quiz complete
        const correctCount = newAnswers.filter(a => a.correct).length;
        const score = Math.round((correctCount / questions.length) * 100);
        recordQuizResult(stepNumber, score, questions.length);
        setPhase('result');
      }
    }, 1200);
  };

  const correctCount = answers.filter(a => a.correct).length;
  const score = Math.round((correctCount / QUESTIONS_PER_QUIZ) * 100);
  const passed = score >= PASSING_SCORE;

  // ========== READY PHASE ==========
  if (phase === 'ready') {
    return (
      <div className="quiz-container">
        <motion.div className="quiz-ready" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="quiz-ready-icon">📝</div>
          <h2>Kuis Langkah {stepNumber}</h2>
          <p>{module?.title}</p>

          <div className="quiz-info-grid">
            <div className="quiz-info-item">
              <span>📊</span>
              <strong>{QUESTIONS_PER_QUIZ}</strong>
              <span>Soal</span>
            </div>
            <div className="quiz-info-item">
              <span>⏱️</span>
              <strong>{TIMER_SECONDS}s</strong>
              <span>Per Soal</span>
            </div>
            <div className="quiz-info-item">
              <span>🎯</span>
              <strong>{PASSING_SCORE}%</strong>
              <span>Minimal</span>
            </div>
          </div>

          <div className="quiz-ready-tips">
            <h4>💡 Tips:</h4>
            <ul>
              <li>Baca soal dengan teliti sebelum menjawab</li>
              <li>Anda punya {TIMER_SECONDS} detik per soal</li>
              <li>Nilai minimal {PASSING_SCORE}% untuk lulus</li>
              <li>Jawaban salah tidak mengurangi nilai</li>
            </ul>
          </div>

          <Button variant="primary" size="lg" fullWidth onClick={() => setPhase('playing')}>
            🚀 Mulai Kuis
          </Button>
          <Button variant="ghost" size="md" fullWidth onClick={onClose}>
            ← Kembali
          </Button>
        </motion.div>
      </div>
    );
  }

  // ========== RESULT PHASE ==========
  if (phase === 'result') {
    return (
      <div className="quiz-container">
        <motion.div className="quiz-result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="quiz-result-icon">{passed ? '🎉' : '💪'}</div>
          <h2>{passed ? 'Alhamdulillah!' : 'Coba Lagi!'}</h2>

          <div className={`quiz-score-circle ${passed ? 'quiz-score-pass' : 'quiz-score-fail'}`}>
            <span className="quiz-score-number">{score}%</span>
            <span className="quiz-score-label">{correctCount}/{QUESTIONS_PER_QUIZ} Benar</span>
          </div>

          <div className="quiz-result-badges">
            {passed && <Badge variant="green" size="md">✅ Lulus!</Badge>}
            {!passed && <Badge variant="red" size="md">❌ Belum Lulus (min. {PASSING_SCORE}%)</Badge>}
            {score === 100 && <Badge variant="gold" size="md">💯 Sempurna!</Badge>}
          </div>

          {/* XP Earned */}
          <Card variant="glow" padding="md" className="quiz-xp-card">
            <span>⭐ XP Diperoleh: +{score === 100 ? 50 : 20} XP</span>
          </Card>

          {/* Answer Breakdown */}
          <div className="quiz-breakdown">
            <h4>📋 Rincian Jawaban:</h4>
            <div className="quiz-breakdown-list">
              {answers.map((a, i) => (
                <div key={i} className={`quiz-breakdown-item ${a.correct ? 'quiz-b-correct' : 'quiz-b-wrong'}`}>
                  <span className="quiz-b-num">{i + 1}</span>
                  <span className="quiz-b-question">{a.question}</span>
                  <span className="quiz-b-icon">{a.correct ? '✅' : '❌'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="quiz-result-actions">
            {passed ? (
              <Button variant="primary" size="lg" fullWidth onClick={() => onComplete?.(score)}>
                ✅ Lanjutkan
              </Button>
            ) : (
              <Button variant="primary" size="lg" fullWidth onClick={() => {
                setPhase('ready');
                setCurrentQ(0);
                setAnswers([]);
                setSelectedOption(null);
                setShowFeedback(false);
                setTimeLeft(TIMER_SECONDS);
              }}>
                🔄 Coba Lagi
              </Button>
            )}
            <Button variant="ghost" size="md" fullWidth onClick={onClose}>
              ← Kembali ke Materi
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ========== PLAYING PHASE ==========
  const q = questions[currentQ];
  const timerPercent = (timeLeft / TIMER_SECONDS) * 100;
  const timerDanger = timeLeft <= 10;

  return (
    <div className="quiz-container">
      {/* Header */}
      <div className="quiz-header">
        <div className="quiz-progress-info">
          <span>Soal {currentQ + 1}/{questions.length}</span>
          <ProgressBar value={currentQ + 1} max={questions.length} variant="blue" size="sm" showLabel={false} />
        </div>
        <div className={`quiz-timer ${timerDanger ? 'quiz-timer-danger' : ''}`}>
          <span>⏱️ {timeLeft}s</span>
          <div className="quiz-timer-bar">
            <motion.div
              className="quiz-timer-fill"
              animate={{ width: `${timerPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          className="quiz-question"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.25 }}
        >
          <p className="quiz-q-text">{q.question}</p>

          {q.display && (
            <div className={`quiz-q-display ${q.displayClass || ''}`}>
              {q.display}
            </div>
          )}

          <div className="quiz-options">
            {q.options.map(opt => {
              let optClass = 'quiz-option';
              if (showFeedback) {
                if (opt.id === q.correctId) optClass += ' quiz-opt-correct';
                else if (opt.id === selectedOption) optClass += ' quiz-opt-wrong';
                else optClass += ' quiz-opt-dimmed';
              }
              if (opt.id === selectedOption && !showFeedback) optClass += ' quiz-opt-selected';

              return (
                <motion.button
                  key={opt.id}
                  className={optClass}
                  onClick={() => handleAnswer(opt.id)}
                  whileTap={{ scale: 0.95 }}
                  disabled={showFeedback}
                >
                  <span className={opt.isArabic ? 'arabic' : ''} style={opt.isArabic ? { fontSize: '1.5rem' } : {}}>
                    {opt.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Score tracker */}
      <div className="quiz-live-score">
        <span>✅ {answers.filter(a => a.correct).length}</span>
        <span>❌ {answers.filter(a => !a.correct).length}</span>
      </div>
    </div>
  );
}
