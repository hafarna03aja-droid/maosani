import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useProgressStore from '../../store/progressStore';
import { Button, Card } from '../ui';
import './DevToolDrawer.css';

/**
 * DevToolDrawer — Floating panel for development only
 * Allows Master Unlock, Auto-Login, and Progress Reset
 */
export default function DevToolDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isTester, toggleTesterMode, loginAsMaster, isAuthenticated } = useAuthStore();
  const { resetAllProgress, isLoading } = useProgressStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle URL parameters for testing/auto-login
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('dev') === 'true') {
      setIsOpen(true);
    }
    if (params.get('autologin') === 'true' && !isAuthenticated) {
      handleMasterLogin();
    }
  }, [location.search, isAuthenticated]);

  const handleMasterLogin = async () => {
    await loginAsMaster();
    navigate('/roadmap');
    setIsOpen(false);
  };

  const handleResetProgress = async () => {
    if (window.confirm('Hapus seluruh progres belajar Anda? Tindakan ini tidak dapat dibatalkan.')) {
      await resetAllProgress(user?.id);
      alert('Progres berhasil direset.');
      setIsOpen(false);
    }
  };

  return (
    <div className={`dev-drawer-container ${isOpen ? 'dev-drawer-open' : ''}`}>
      {/* Floating Toggle Button */}
      <button 
        className="dev-drawer-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        title="Developer Tools"
      >
        {isOpen ? '✖' : '⚡'}
      </button>

      {/* Drawer Content */}
      <div className="dev-drawer-content">
        <Card variant="elevated" padding="md">
          <div className="dev-drawer-header">
            <h4>🛠️ Dev Control Panel</h4>
            <span className="dev-drawer-mode">Development Mode</span>
          </div>

          <div className="dev-drawer-section">
            <label className="dev-drawer-switch">
              <input 
                type="checkbox" 
                checked={isTester} 
                onChange={toggleTesterMode} 
              />
              <span className="dev-drawer-slider"></span>
              <span className="dev-drawer-label">Master Unlock (Bypass)</span>
            </label>
            <p className="dev-drawer-hint">Gunakan untuk membuka gembok materi secara instan.</p>
          </div>

          <div className="dev-drawer-actions">
            {!isAuthenticated && (
              <Button 
                variant="primary" 
                size="sm" 
                fullWidth 
                onClick={handleMasterLogin}
              >
                🔐 Login as Master
              </Button>
            )}
            
            {isAuthenticated && (
              <Button 
                variant="red" 
                size="sm" 
                fullWidth 
                onClick={handleResetProgress}
                disabled={isLoading}
              >
                🗑️ Reset My Progress
              </Button>
            )}
          </div>

          <div className="dev-drawer-info">
            <span>Role: {user?.role || 'Guest'}</span>
            <span>Tester: {isTester ? 'Active' : 'Off'}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
