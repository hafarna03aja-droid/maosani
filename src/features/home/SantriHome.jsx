/**
 * Santri Home — Dashboard Beranda
 * Overview progres belajar, quick actions, dan motivasi
 */
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useProgressStore from '../../store/progressStore';
import useGamificationStore from '../../store/gamificationStore';
import { calculateOverallProgress } from '../../utils/unlockLogic';
import { Card, Badge, Button, ProgressRing, ProgressBar } from '../../components/ui';
import { LEARNING_MODULES } from '../../data/modules';
import { usePWA } from '../../hooks/usePWA';
import './home.css';

export default function SantriHome() {
  const { user } = useAuthStore();
  const { getSantriProgress, getStepStatus } = useProgressStore();
  const { xp, streak, getLevel, getXPProgress, checkStreak } = useGamificationStore();
  const navigate = useNavigate();
  const { canInstall, isInstalled, installApp } = usePWA();

  // Check streak and init gamification on mount
  useEffect(() => {
    if (user?.id) {
      checkStreak();
    }
  }, [user?.id, checkStreak]);

  const progress = getSantriProgress(user?.id);
  const overallPercent = calculateOverallProgress(progress);

  // Find current active step
  const currentStep = LEARNING_MODULES.find(m => {
    const status = getStepStatus(user?.id, m.stepNumber);
    return status === 'in_progress' || status === 'unlocked';
  });

  const approvedCount = progress.filter(p => p.status === 'approved').length;

  // Motivational messages
  const motivations = [
    'بِسْمِ ٱللَّهِ — Bismillah, mulai hari ini!',
    'مَنْ جَدَّ وَجَدَ — Siapa bersungguh-sungguh, pasti berhasil!',
    'اِقْرَأْ — Bacalah! (QS. Al-Alaq: 1)',
    'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ — Sebaik-baik kalian yang belajar Al-Qur\'an',
  ];
  const todayMotivation = motivations[new Date().getDay() % motivations.length];

  return (
    <div className="home-page">
      {/* Greeting */}
      <motion.div
        className="home-greeting"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1>Assalamu'alaikum 👋</h1>
          <h2>{user?.fullName}</h2>
          {import.meta.env.DEV && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Button size="xs" variant="ghost" onClick={() => useGamificationStore.getState().addXP(500, 'Test Level Up')}>🚀 Test Level</Button>
              <Button size="xs" variant="ghost" onClick={() => useGamificationStore.getState().earnBadge('quiz-perfect')}>🏆 Test Badge</Button>
            </div>
          )}
        </div>
        <ProgressRing
          value={overallPercent}
          size={68}
          color={overallPercent >= 70 ? 'var(--success)' : 'var(--blue-400)'}
        />
      </motion.div>

      {/* XP & Streak Mini Bar */}
      <motion.div
        className="home-gamification-bar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="home-gam-item" onClick={() => navigate('/profile')}>
          <span>{getLevel().icon}</span>
          <span className="home-gam-value">Lv.{getLevel().level}</span>
        </div>
        <div className="home-gam-item" onClick={() => navigate('/profile')}>
          <span>⭐</span>
          <span className="home-gam-value">{xp} XP</span>
        </div>
        <div className="home-gam-item" onClick={() => navigate('/profile')}>
          <span>🔥</span>
          <span className="home-gam-value">{streak.current} Hari</span>
        </div>
      </motion.div>

      {/* Motivation */}
      <motion.div
        className="home-motivation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="arabic-ui">{todayMotivation}</p>
      </motion.div>
      {/* PWA Install Banner */}
      {canInstall && !isInstalled && (
        <motion.div
          className="home-install-banner"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card variant="glow" padding="md" className="home-install-card">
            <div className="home-install-content">
              <span className="home-install-icon">📲</span>
              <div>
                <h4>Install MAOSANI</h4>
                <p>Pasang di HP untuk akses cepat & belajar offline</p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={installApp}>
              Install
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Placement Test CTA (if not completed) */}
      {!user?.placementTestCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glow" padding="lg" className="home-placement-cta" onClick={() => navigate('/placement')}>
            <div className="home-placement-icon">📝</div>
            <div>
              <h3>Tes Penempatan</h3>
              <p>Ikuti tes singkat untuk menentukan titik mulai belajar Anda</p>
            </div>
            <span className="home-placement-arrow">→</span>
          </Card>
        </motion.div>
      )}

      {/* Current Step Card */}
      {currentStep && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="elevated" padding="lg" className="home-current-step" onClick={() => navigate('/roadmap')}>
            <div className="home-current-step-header">
              <Badge variant="blue" size="md">Langkah {currentStep.stepNumber}</Badge>
              <span className="home-current-step-icon">{currentStep.icon}</span>
            </div>
            <h3>{currentStep.title}</h3>
            <p>{currentStep.description}</p>
            {progress.find(p => p.stepNumber === currentStep.stepNumber) && (
              <ProgressBar
                value={progress.find(p => p.stepNumber === currentStep.stepNumber)?.exercisesCompleted || 0}
                max={progress.find(p => p.stepNumber === currentStep.stepNumber)?.exercisesTotal || 10}
                variant="blue"
                size="md"
              />
            )}
            <Button variant="primary" size="md" style={{ marginTop: 'var(--space-3)' }}>
              {getStepStatus(user?.id, currentStep.stepNumber) === 'in_progress' ? '📖 Lanjutkan' : '🚀 Mulai'}
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="home-stats stagger-children">
        <Card variant="default" padding="md" className="home-stat-card">
          <span className="home-stat-icon">✅</span>
          <span className="home-stat-number">{approvedCount}</span>
          <span className="home-stat-label">Langkah Selesai</span>
        </Card>
        <Card variant="default" padding="md" className="home-stat-card">
          <span className="home-stat-icon">📊</span>
          <span className="home-stat-number">{overallPercent}%</span>
          <span className="home-stat-label">Total Progres</span>
        </Card>
        <Card variant="default" padding="md" className="home-stat-card">
          <span className="home-stat-icon">⭐</span>
          <span className="home-stat-number">
            {progress.filter(p => p.scoreTotal).length > 0
              ? (progress.reduce((sum, p) => sum + (parseFloat(p.scoreTotal) || 0), 0) / progress.filter(p => p.scoreTotal).length).toFixed(1)
              : '-'}
          </span>
          <span className="home-stat-label">Rata-rata Nilai</span>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="home-quick-actions">
        <h3>Aksi Cepat</h3>
        <div className="home-actions-grid">
          <Card variant="default" padding="md" className="home-action-card" onClick={() => navigate('/roadmap')}>
            <span>🗺️</span>
            <span>Peta Belajar</span>
          </Card>
          <Card variant="default" padding="md" className="home-action-card" onClick={() => navigate('/canvas')}>
            <span>✍️</span>
            <span>Latihan Menulis</span>
          </Card>
          <Card variant="default" padding="md" className="home-action-card" onClick={() => navigate('/quran')}>
            <span>📖</span>
            <span>Quran Explorer</span>
          </Card>
          <Card variant="default" padding="md" className="home-action-card" onClick={() => navigate('/voice')}>
            <span>🎤</span>
            <span>Rekam Bacaan</span>
          </Card>
        </div>
      </div>
    </div>
  );
}
