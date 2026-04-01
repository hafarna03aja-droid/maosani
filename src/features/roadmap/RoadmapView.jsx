/**
 * Roadmap View — Peta Belajar Santri
 * Menampilkan 9 Langkah + Tajwid dengan status locked/unlocked/completed
 * Visual: path-style roadmap dengan animasi unlock
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import useProgressStore from '../../store/progressStore';
import { LEARNING_MODULES, TAJWID_MODULES } from '../../data/modules';
import { calculateOverallProgress } from '../../utils/unlockLogic';
import { Card, Badge, ProgressRing, ProgressBar, Modal, Button } from '../../components/ui';
import './roadmap.css';

/* Status configurations */
const STATUS_CONFIG = {
  locked: { label: 'Terkunci', icon: '🔒', color: 'var(--gray-600)', badgeVariant: 'default' },
  unlocked: { label: 'Mulai', icon: '▶️', color: 'var(--blue-400)', badgeVariant: 'blue' },
  in_progress: { label: 'Sedang Belajar', icon: '📖', color: 'var(--warning)', badgeVariant: 'orange' },
  pending_review: { label: 'Menunggu Review', icon: '⏳', color: 'var(--gold-400)', badgeVariant: 'gold' },
  approved: { label: 'Lulus ✓', icon: '✅', color: 'var(--success)', badgeVariant: 'green' },
  needs_retry: { label: 'Perlu Mengulang', icon: '🔄', color: 'var(--red-400)', badgeVariant: 'red' },
};

export default function RoadmapView() {
  const { user } = useAuthStore();
  const { getStepStatus, startStep, submitForReview, getSantriProgress } = useProgressStore();
  const [selectedModule, setSelectedModule] = useState(null);
  const navigate = useNavigate();

  const santriProgress = getSantriProgress(user?.id);
  const overallProgress = calculateOverallProgress(santriProgress);

  const getModuleStatus = (stepNumber) => getStepStatus(user?.id, stepNumber);

  const handleStartStep = (stepNumber) => {
    const success = startStep(user?.id, stepNumber);
    if (success) {
      setSelectedModule(null);
      navigate(`/learn/${stepNumber}`);
    }
  };

  const handleContinue = (mod) => {
    setSelectedModule(null);
    if (mod.stepNumber >= 10) {
      navigate('/tajwid');
    } else {
      navigate(`/learn/${mod.stepNumber}`);
    }
  };

  return (
    <div className="roadmap-page">
      {/* Header with overall progress */}
      <motion.div
        className="roadmap-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="roadmap-header-info">
          <h1>Peta Belajar</h1>
          <p>9 Langkah Bisa Baca Al-Qur'an</p>
        </div>
        <ProgressRing value={overallProgress} size={72} color="var(--blue-400)" />
      </motion.div>

      {/* 9 Steps Roadmap */}
      <div className="roadmap-path stagger-children">
        {LEARNING_MODULES.map((module, index) => {
          const status = getModuleStatus(module.stepNumber);
          const config = STATUS_CONFIG[status];
          const isLocked = status === 'locked';
          const isActive = status === 'in_progress' || status === 'unlocked';
          const progressRecord = santriProgress.find(p => p.stepNumber === module.stepNumber);

          return (
            <motion.div
              key={module.id}
              className={`roadmap-step ${isLocked ? 'roadmap-step-locked' : ''} ${isActive ? 'roadmap-step-active' : ''} ${status === 'approved' ? 'roadmap-step-done' : ''}`}
              onClick={() => !isLocked && setSelectedModule(module)}
              whileHover={!isLocked ? { scale: 1.02 } : {}}
              whileTap={!isLocked ? { scale: 0.98 } : {}}
            >
              {/* Connector line */}
              {index > 0 && (
                <div className={`roadmap-connector ${status !== 'locked' ? 'roadmap-connector-active' : ''}`} />
              )}

              {/* Step number circle */}
              <div className="roadmap-step-circle" style={{ borderColor: config.color }}>
                <span className="roadmap-step-number">
                  {status === 'approved' ? '✓' : module.stepNumber}
                </span>
              </div>

              {/* Step content */}
              <div className="roadmap-step-content">
                <div className="roadmap-step-top">
                  <h3 className="roadmap-step-title">{module.title}</h3>
                  <Badge variant={config.badgeVariant} size="sm">
                    {config.label}
                  </Badge>
                </div>
                <p className="roadmap-step-desc">{module.description}</p>

                {/* Progress bar if in progress */}
                {progressRecord && status !== 'locked' && (
                  <ProgressBar
                    value={progressRecord.exercisesCompleted}
                    max={progressRecord.exercisesTotal}
                    variant={status === 'approved' ? 'green' : 'blue'}
                    size="sm"
                  />
                )}

                {/* Score if approved */}
                {status === 'approved' && progressRecord?.scoreTotal && (
                  <div className="roadmap-step-score">
                    <span>⭐ Nilai: {progressRecord.scoreTotal}</span>
                  </div>
                )}
              </div>

              {/* Module icon */}
              <div className="roadmap-step-icon">
                <span>{isLocked ? '🔒' : module.icon}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tajwid Section */}
      <motion.div
        className="roadmap-tajwid-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="roadmap-tajwid-header">
          <h2>📜 TAJWID Metode Selembar</h2>
          <Badge
            variant={getModuleStatus(10) === 'locked' ? 'default' : 'green'}
            size="md"
          >
            {getModuleStatus(10) === 'locked' ? '🔒 Selesaikan 9 Langkah' : '🔓 Terbuka'}
          </Badge>
        </div>

        <div className="roadmap-tajwid-grid">
          {TAJWID_MODULES.map(module => {
            const status = getModuleStatus(module.stepNumber);
            const isLocked = status === 'locked';

            return (
              <Card
                key={module.id}
                variant={isLocked ? 'default' : 'elevated'}
                padding="md"
                className={`roadmap-tajwid-card ${isLocked ? 'roadmap-tajwid-locked' : ''}`}
                onClick={!isLocked ? () => setSelectedModule(module) : undefined}
              >
                <span className="roadmap-tajwid-icon">{isLocked ? '🔒' : module.icon}</span>
                <h4>{module.title}</h4>
                <p className="arabic-ui">{module.titleAr}</p>
                <p className="roadmap-tajwid-desc">{module.description}</p>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Step Detail Modal */}
      <AnimatePresence>
        {selectedModule && (
          <Modal
            isOpen={!!selectedModule}
            onClose={() => setSelectedModule(null)}
            title={selectedModule.title}
            size="md"
          >
            <div className="roadmap-modal-content">
              <div className="roadmap-modal-icon">{selectedModule.icon}</div>
              {selectedModule.titleAr && (
                <p className="arabic-large" style={{ marginBottom: 'var(--space-4)' }}>
                  {selectedModule.titleAr}
                </p>
              )}
              <p className="roadmap-modal-desc">{selectedModule.description}</p>

              {selectedModule.estimatedMinutes && (
                <div className="roadmap-modal-meta">
                  <span>⏱️ Estimasi: {selectedModule.estimatedMinutes} menit</span>
                  {selectedModule.features && (
                    <span>📋 {selectedModule.features.length} fitur latihan</span>
                  )}
                </div>
              )}

              {selectedModule.requiresValidation && (
                <div className="roadmap-modal-warning">
                  ⚠️ {selectedModule.validationMessage}
                </div>
              )}

              {selectedModule.uiRules?.includes('no-pause-mid-line') && (
                <div className="roadmap-modal-info">
                  ℹ️ Mode: Anda harus menyelesaikan bacaan satu baris penuh tanpa pause.
                </div>
              )}

              <div className="roadmap-modal-actions">
                {getModuleStatus(selectedModule.stepNumber) === 'unlocked' && (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => handleStartStep(selectedModule.stepNumber)}
                  >
                    🚀 Mulai Belajar
                  </Button>
                )}
                {getModuleStatus(selectedModule.stepNumber) === 'in_progress' && (
                  <>
                    <Button variant="primary" size="lg" fullWidth onClick={() => handleContinue(selectedModule)}>
                      📖 Lanjutkan Belajar
                    </Button>
                    <Button
                      variant="gold"
                      size="md"
                      fullWidth
                      onClick={() => submitForReview(user?.id, selectedModule.stepNumber)}
                    >
                      📤 Submit untuk Review Guru
                    </Button>
                  </>
                )}
                {getModuleStatus(selectedModule.stepNumber) === 'pending_review' && (
                  <div className="roadmap-modal-pending">
                    <span className="animate-pulse-glow" style={{ display: 'inline-block', padding: '8px' }}>⏳</span>
                    <p>Menunggu review dari Guru...</p>
                  </div>
                )}
                {getModuleStatus(selectedModule.stepNumber) === 'approved' && (
                  <Button variant="ghost" size="md" fullWidth onClick={() => handleContinue(selectedModule)}>
                    📚 Lihat Materi Lagi
                  </Button>
                )}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
