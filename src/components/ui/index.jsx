/**
 * Reusable UI Components
 * Design system compliant, mobile-first
 */
import { motion } from 'framer-motion';
import './ui.css';

/* ======================== BUTTON ======================== */
export function Button({
  children, variant = 'primary', size = 'md', icon, disabled = false,
  loading = false, fullWidth = false, onClick, className = '', ...props
}) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      {icon && !loading && <span className="btn-icon">{icon}</span>}
      {children}
    </motion.button>
  );
}

/* ======================== CARD ======================== */
export function Card({ children, variant = 'default', padding = 'md', className = '', onClick, ...props }) {
  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick ? {
    whileHover: { scale: 1.01, y: -2 },
    whileTap: { scale: 0.99 },
  } : {};

  return (
    <Component
      className={`card card-${variant} card-pad-${padding} ${onClick ? 'card-clickable' : ''} ${className}`}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
}

/* ======================== BADGE ======================== */
export function Badge({ children, variant = 'default', size = 'sm', icon }) {
  return (
    <span className={`badge badge-${variant} badge-${size}`}>
      {icon && <span className="badge-icon">{icon}</span>}
      {children}
    </span>
  );
}

/* ======================== PROGRESS BAR ======================== */
export function ProgressBar({ value = 0, max = 100, variant = 'blue', showLabel = true, size = 'md' }) {
  const percentage = Math.round((value / max) * 100);
  return (
    <div className={`progress-bar-container progress-bar-${size}`}>
      {showLabel && <span className="progress-label">{percentage}%</span>}
      <div className="progress-track">
        <motion.div
          className={`progress-fill progress-fill-${variant}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

/* ======================== PROGRESS RING ======================== */
export function ProgressRing({ value = 0, max = 100, size = 80, strokeWidth = 6, color = 'var(--blue-400)' }) {
  const percentage = (value / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="progress-ring-bg"
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          className="progress-ring-fill"
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="progress-ring-value">
        <span className="progress-ring-number">{Math.round(percentage)}</span>
        <span className="progress-ring-percent">%</span>
      </div>
    </div>
  );
}

/* ======================== MODAL ======================== */
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`modal-content modal-${size}`}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ======================== AVATAR ======================== */
export function Avatar({ name, url, size = 40, className = '' }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const colors = ['#0070E0', '#E8453C', '#D97706', '#10B981', '#8B5CF6'];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

  if (url) {
    return <img src={url} alt={name} className={`avatar ${className}`} style={{ width: size, height: size }} />;
  }

  return (
    <div
      className={`avatar avatar-initials ${className}`}
      style={{ width: size, height: size, background: colors[colorIndex] }}
    >
      {initials}
    </div>
  );
}

/* ======================== EMPTY STATE ======================== */
export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">{icon}</span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
