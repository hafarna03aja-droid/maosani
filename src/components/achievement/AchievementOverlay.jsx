import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGamificationStore from '../../store/gamificationStore';
import './achievement.css';

export default function AchievementOverlay() {
  const { recentAchievement, clearAchievement } = useGamificationStore();

  useEffect(() => {
    if (recentAchievement) {
      const timer = setTimeout(() => {
        clearAchievement();
      }, 5000); // Tampilkan selama 5 detik
      return () => clearTimeout(timer);
    }
  }, [recentAchievement, clearAchievement]);

  if (!recentAchievement) return null;

  const { type, data } = recentAchievement;

  return (
    <AnimatePresence>
      <div className="achievement-overlay">
        <motion.div
          className={`achievement-card achievement-${type}`}
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          transition={{ type: 'spring', damping: 15, stiffness: 100 }}
        >
          <div className="achievement-glow" />
          
          <div className="achievement-content">
            <motion.div 
              className="achievement-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              {data.icon}
            </motion.div>
            
            <div className="achievement-info">
              <span className="achievement-label">
                {type === 'level' ? '✨ LEVEL UP! ✨' : '🏆 BADGE DIBUKA! 🏆'}
              </span>
              <h2 className="achievement-title">{data.name}</h2>
              {type === 'level' && <p className="achievement-arabic">{data.nameAr}</p>}
              {type === 'badge' && <p className="achievement-desc">{data.description}</p>}
            </div>
          </div>

          <button className="achievement-close" onClick={clearAchievement}>×</button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
