/**
 * Guru Dashboard — Buku Kendali Digital
 * Dasbor guru untuk memantau progres santri, memberikan nilai,
 * dan approval "Lulus Tahap" untuk membuka akses materi.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import useProgressStore from '../../store/progressStore';
import { MOCK_USERS } from '../../data/mockUsers';
import { LEARNING_MODULES } from '../../data/modules';
import { calculateOverallProgress } from '../../utils/unlockLogic';
import { Card, Badge, Button, ProgressBar, Avatar, Modal } from '../../components/ui';
import './guru.css';

export default function GuruDashboard() {
  const { user } = useAuthStore();
  const {
    progressRecords, getSantriProgress, pendingReviews,
    approveStep, requestRetry
  } = useProgressStore();

  const [selectedSantri, setSelectedSantri] = useState(null);
  const [approveModal, setApproveModal] = useState(null); // { santriId, stepNumber }
  const [scores, setScores] = useState({ makhroj: 7, tajwid: 7, kelancaran: 7 });
  const [guruNotes, setGuruNotes] = useState('');

  // Get all santri assigned to this guru
  const santriList = MOCK_USERS.filter(u => u.role === 'santri' && u.assignedGuruId === user?.id);

  const handleApprove = () => {
    if (!approveModal) return;
    approveStep(approveModal.santriId, approveModal.stepNumber, user?.id, scores, guruNotes);
    setApproveModal(null);
    setScores({ makhroj: 7, tajwid: 7, kelancaran: 7 });
    setGuruNotes('');
  };

  const handleRetry = (santriId, stepNumber) => {
    requestRetry(santriId, stepNumber, user?.id, 'Silakan perbaiki dan ulangi.');
  };

  const STATUS_LABELS = {
    locked: { label: 'Terkunci', variant: 'default' },
    unlocked: { label: 'Belum Mulai', variant: 'default' },
    in_progress: { label: 'Sedang Belajar', variant: 'orange' },
    pending_review: { label: '⏳ Menunggu Review', variant: 'gold' },
    approved: { label: '✅ Lulus', variant: 'green' },
    needs_retry: { label: '🔄 Perlu Mengulang', variant: 'red' },
  };

  return (
    <div className="guru-page">
      {/* Header */}
      <motion.div
        className="guru-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1>📊 Buku Kendali Digital</h1>
          <p>Assalamu'alaikum, {user?.fullName}</p>
        </div>
        <div className="guru-header-stats">
          <div className="guru-stat">
            <span className="guru-stat-number">{santriList.length}</span>
            <span className="guru-stat-label">Santri</span>
          </div>
          <div className="guru-stat guru-stat-pending">
            <span className="guru-stat-number">{pendingReviews.length}</span>
            <span className="guru-stat-label">Pending</span>
          </div>
        </div>
      </motion.div>

      {/* Pending Reviews Alert */}
      {pendingReviews.length > 0 && (
        <motion.div
          className="guru-pending-alert"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="guru-pending-alert-icon">🔔</div>
          <div>
            <strong>{pendingReviews.length} santri</strong> menunggu review Anda
          </div>
        </motion.div>
      )}

      {/* Santri List */}
      <div className="guru-santri-list stagger-children">
        {santriList.map(santri => {
          const progress = getSantriProgress(santri.id);
          const overallPercent = calculateOverallProgress(progress);
          const santriPending = progress.filter(p => p.status === 'pending_review');
          const isExpanded = selectedSantri === santri.id;

          return (
            <Card
              key={santri.id}
              variant={santriPending.length > 0 ? 'glow' : 'elevated'}
              padding="md"
              className="guru-santri-card"
            >
              {/* Santri Header */}
              <div
                className="guru-santri-header"
                onClick={() => setSelectedSantri(isExpanded ? null : santri.id)}
              >
                <div className="guru-santri-info">
                  <Avatar name={santri.fullName} size={44} />
                  <div>
                    <h3>{santri.fullName}</h3>
                    <p>{santri.email}</p>
                  </div>
                </div>
                <div className="guru-santri-summary">
                  {santriPending.length > 0 && (
                    <Badge variant="gold" size="sm" icon="⏳">
                      {santriPending.length} Review
                    </Badge>
                  )}
                  <ProgressBar value={overallPercent} size="sm" variant="blue" />
                  <span className="guru-expand-icon">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded Detail — Step by Step */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className="guru-santri-detail"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="guru-step-list">
                      {LEARNING_MODULES.map(module => {
                        const record = progress.find(p => p.stepNumber === module.stepNumber);
                        const status = record?.status || 'locked';
                        const statusInfo = STATUS_LABELS[status];

                        return (
                          <div key={module.id} className={`guru-step-row guru-step-${status}`}>
                            <div className="guru-step-info">
                              <span className="guru-step-num">L{module.stepNumber}</span>
                              <div>
                                <span className="guru-step-title">{module.title}</span>
                                <Badge variant={statusInfo.variant} size="sm">
                                  {statusInfo.label}
                                </Badge>
                              </div>
                            </div>

                            {/* Scores if approved */}
                            {status === 'approved' && record && (
                              <div className="guru-step-scores">
                                <span>M:{record.scoreMakhroj}</span>
                                <span>T:{record.scoreTajwid}</span>
                                <span>K:{record.scoreKelancaran}</span>
                                <strong>= {record.scoreTotal}</strong>
                              </div>
                            )}

                            {/* Progress bar if in progress */}
                            {(status === 'in_progress' || status === 'pending_review') && record && (
                              <ProgressBar
                                value={record.exercisesCompleted}
                                max={record.exercisesTotal}
                                variant={status === 'pending_review' ? 'gold' : 'blue'}
                                size="sm"
                              />
                            )}

                            {/* Action buttons for pending review */}
                            {status === 'pending_review' && (
                              <div className="guru-step-actions">
                                <Button
                                  variant="success"
                                  size="sm"
                                  icon="✅"
                                  onClick={() => setApproveModal({
                                    santriId: santri.id,
                                    stepNumber: module.stepNumber,
                                    santriName: santri.fullName,
                                    moduleTitle: module.title,
                                  })}
                                >
                                  Lulus Tahap
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon="🔄"
                                  onClick={() => handleRetry(santri.id, module.stepNumber)}
                                >
                                  Ulangi
                                </Button>
                              </div>
                            )}

                            {/* Guru notes */}
                            {record?.guruNotes && (
                              <p className="guru-step-notes">💬 {record.guruNotes}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>

      {/* Approve Modal */}
      <AnimatePresence>
        {approveModal && (
          <Modal
            isOpen={!!approveModal}
            onClose={() => setApproveModal(null)}
            title="✅ Lulus Tahap"
            size="md"
          >
            <div className="guru-approve-modal">
              <p className="guru-approve-info">
                Memberikan kelulusan untuk <strong>{approveModal.santriName}</strong> pada tahap <strong>{approveModal.moduleTitle}</strong>.
              </p>

              {/* Score inputs */}
              <div className="guru-score-inputs">
                <div className="guru-score-group">
                  <label>Makhroj</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={scores.makhroj}
                    onChange={e => setScores(s => ({ ...s, makhroj: Number(e.target.value) }))}
                  />
                </div>
                <div className="guru-score-group">
                  <label>Tajwid</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={scores.tajwid}
                    onChange={e => setScores(s => ({ ...s, tajwid: Number(e.target.value) }))}
                  />
                </div>
                <div className="guru-score-group">
                  <label>Kelancaran</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={scores.kelancaran}
                    onChange={e => setScores(s => ({ ...s, kelancaran: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="guru-score-total">
                Nilai Total: <strong>{((scores.makhroj + scores.tajwid + scores.kelancaran) / 3).toFixed(1)}</strong>
              </div>

              {/* Notes */}
              <div className="guru-notes-group">
                <label>Catatan untuk Santri</label>
                <textarea
                  rows="3"
                  placeholder="Komentar atau saran untuk santri..."
                  value={guruNotes}
                  onChange={e => setGuruNotes(e.target.value)}
                />
              </div>

              <div className="guru-approve-actions">
                <Button variant="success" size="lg" fullWidth onClick={handleApprove}>
                  ✅ Setujui Kelulusan
                </Button>
                <Button variant="ghost" size="md" fullWidth onClick={() => setApproveModal(null)}>
                  Batal
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
