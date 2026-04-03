/**
 * Profile Page — Statistik Belajar + Gamifikasi
 * XP, Level, Badges, Streak, Pengaturan
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import useGamificationStore, { LEVEL_THRESHOLDS, ALL_BADGES } from '../../store/gamificationStore';
import useProgressStore from '../../store/progressStore';
import { Card, Badge, Button, ProgressBar, Modal } from '../../components/ui';
import MasteryRadar from '../../components/profile/MasteryRadar';
import './profile.css';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const {
    xp, earnedBadges, streak, stats,
    getLevel, getNextLevel, getXPProgress, getBadgeStatus, calculateMastery
  } = useGamificationStore();
  const { progressRecords } = useProgressStore();

  const [showBadgeModal, setShowBadgeModal] = useState(null);
  const [activeSection, setActiveSection] = useState('stats');

  const currentLevel = getLevel();
  const nextLevel = getNextLevel();
  const xpProgress = getXPProgress();
  const masteryData = calculateMastery(progressRecords);

  return (
    <div className="profile-page">
      {/* Hero Section */}
      <motion.div
        className="profile-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="profile-avatar-container">
          <div className="profile-avatar-ring" style={{
            background: `conic-gradient(var(--blue-400) ${xpProgress * 3.6}deg, rgba(255,255,255,0.06) 0deg)`
          }}>
            <div className="profile-avatar-inner">
              <span className="profile-avatar-emoji">{currentLevel.icon}</span>
            </div>
          </div>
          <div className="profile-level-badge">Lv.{currentLevel.level}</div>
        </div>

        <h1>{user?.fullName}</h1>
        <p className="profile-level-name">
          {currentLevel.icon} {currentLevel.name}
          <span className="arabic-ui" style={{ marginLeft: '8px' }}>{currentLevel.nameAr}</span>
        </p>

        {/* XP Bar */}
        <div className="profile-xp-section">
          <div className="profile-xp-label">
            <span>⭐ {xp} XP</span>
            <span>{nextLevel.level > currentLevel.level ? `${nextLevel.minXP} XP untuk ${nextLevel.name}` : 'Level Maks!'}</span>
          </div>
          <ProgressBar
            value={xpProgress}
            max={100}
            variant="gold"
            size="md"
            showLabel={false}
          />
        </div>
      </motion.div>

      {/* Streak Card */}
      <Card variant="glow" padding="md" className="profile-streak-card">
        <div className="profile-streak-content">
          <span className="profile-streak-fire">🔥</span>
          <div className="profile-streak-info">
            <span className="profile-streak-number">{streak.current} Hari</span>
            <span className="profile-streak-label">Streak Saat Ini</span>
          </div>
          <div className="profile-streak-divider" />
          <div className="profile-streak-info">
            <span className="profile-streak-number">{streak.best} Hari</span>
            <span className="profile-streak-label">Streak Terbaik</span>
          </div>
        </div>
        {/* Week dots */}
        <div className="profile-streak-week">
          {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, i) => {
            const isActive = i < streak.current % 7;
            return (
              <div key={i} className={`profile-streak-dot ${isActive ? 'profile-dot-active' : ''}`}>
                <span className="profile-dot-label">{day}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Section Tabs */}
      <div className="profile-tabs">
        {[
          { id: 'stats', label: '📊 Statistik' },
          { id: 'badges', label: '🏆 Pencapaian' },
          { id: 'levels', label: '📈 Level' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`profile-tab ${activeSection === tab.id ? 'profile-tab-active' : ''}`}
            onClick={() => setActiveSection(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Section */}
      {activeSection === 'stats' && (
        <motion.div className="profile-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          
          {/* Mastery Radar Chart */}
          <div className="profile-radar-section">
            <h3 className="profile-section-title">🗺️ Pemetaan Kemahiran</h3>
            <Card variant="elevated" padding="lg">
              <MasteryRadar data={masteryData} size={window.innerWidth > 500 ? 400 : 320} />
              <p className="profile-radar-hint">Statistik ini menunjukkan tingkat penguasaan Anda pada setiap kategori materi.</p>
            </Card>
          </div>

          <div className="profile-stats-grid">
            <Card variant="default" padding="md" className="profile-stat-item">
              <span className="profile-stat-num">{stats.totalQuizzes}</span>
              <span className="profile-stat-label">Kuis Selesai</span>
            </Card>
            <Card variant="default" padding="md" className="profile-stat-item">
              <span className="profile-stat-num">
                {stats.totalQuizzes > 0
                  ? Math.round((stats.totalCorrectAnswers / (stats.totalQuizzes * 10)) * 100)
                  : 0}%
              </span>
              <span className="profile-stat-label">Akurasi Kuis</span>
            </Card>
            <Card variant="default" padding="md" className="profile-stat-item">
              <span className="profile-stat-num">{stats.canvasStrokes}</span>
              <span className="profile-stat-label">Goresan Tulis</span>
            </Card>
            <Card variant="default" padding="md" className="profile-stat-item">
              <span className="profile-stat-num">{stats.lettersFound}</span>
              <span className="profile-stat-label">Huruf Ditemukan</span>
            </Card>
            <Card variant="default" padding="md" className="profile-stat-item">
              <span className="profile-stat-num">{stats.recordingsSaved}</span>
              <span className="profile-stat-label">Rekaman Suara</span>
            </Card>
            <Card variant="default" padding="md" className="profile-stat-item">
              <span className="profile-stat-num">{streak.best}</span>
              <span className="profile-stat-label">Best Streak</span>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Badges Section */}
      {activeSection === 'badges' && (
        <motion.div className="profile-badges" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="profile-badges-header">
            <span>{earnedBadges.length}/{ALL_BADGES.length} Terbuka</span>
          </div>
          <div className="profile-badges-grid">
            {ALL_BADGES.map(badge => {
              const earned = getBadgeStatus(badge.id);
              return (
                <motion.div
                  key={badge.id}
                  className={`profile-badge-card ${earned ? 'profile-badge-earned' : 'profile-badge-locked'}`}
                  onClick={() => setShowBadgeModal(badge)}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="profile-badge-icon">
                    {earned ? badge.icon : '🔒'}
                  </span>
                  <span className="profile-badge-name">{badge.name}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Levels Section */}
      {activeSection === 'levels' && (
        <motion.div className="profile-levels" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {LEVEL_THRESHOLDS.map(level => {
            const isCurrentLevel = level.level === currentLevel.level;
            const isReached = xp >= level.minXP;
            return (
              <Card
                key={level.level}
                variant={isCurrentLevel ? 'glow' : 'default'}
                padding="md"
                className={`profile-level-card ${isReached ? 'profile-level-reached' : 'profile-level-unreached'}`}
              >
                <span className="profile-level-icon">{level.icon}</span>
                <div className="profile-level-info">
                  <h4>
                    {level.name}
                    <span className="arabic-ui" style={{ marginLeft: '8px', fontSize: '0.9rem' }}>{level.nameAr}</span>
                  </h4>
                  <span>{level.minXP} XP</span>
                </div>
                {isCurrentLevel && <Badge variant="blue" size="sm">Sekarang</Badge>}
                {isReached && !isCurrentLevel && <span style={{ color: 'var(--success)' }}>✓</span>}
                {!isReached && <span style={{ color: 'var(--gray-600)' }}>🔒</span>}
              </Card>
            );
          })}
        </motion.div>
      )}

      {/* Badge Detail Modal */}
      <Modal
        isOpen={!!showBadgeModal}
        onClose={() => setShowBadgeModal(null)}
        title="Detail Pencapaian"
        size="sm"
      >
        {showBadgeModal && (
          <div className="profile-badge-modal">
            <span className="profile-badge-modal-icon">
              {getBadgeStatus(showBadgeModal.id) ? showBadgeModal.icon : '🔒'}
            </span>
            <h3>{showBadgeModal.name}</h3>
            <p>{showBadgeModal.description}</p>
            <Badge
              variant={getBadgeStatus(showBadgeModal.id) ? 'green' : 'default'}
              size="md"
            >
              {getBadgeStatus(showBadgeModal.id) ? '✅ Diperoleh' : '🔒 Belum Diperoleh'}
            </Badge>
            {showBadgeModal.xpReward && (
              <span className="profile-badge-reward">⭐ Hadiah: +{showBadgeModal.xpReward} XP</span>
            )}
          </div>
        )}
      </Modal>

      {/* Logout */}
      <div className="profile-logout-section">
        <Button variant="ghost" size="md" fullWidth onClick={logout}>
          🚪 Keluar / Ganti Akun
        </Button>
      </div>
    </div>
  );
}
