/**
 * App.jsx — Main Application Entry
 * Role-based routing: Santri vs Guru view
 */
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import LoginPage from './features/auth/LoginPage';
import RoadmapView from './features/roadmap/RoadmapView';
import TracingCanvas from './features/canvas/TracingCanvas';
import GuruDashboard from './features/guru/GuruDashboard';
import PlacementTest from './features/placement/PlacementTest';
import QuranExplorer from './features/quran/QuranExplorer';
import VoiceRecorder from './features/voice/VoiceRecorder';
import SantriHome from './features/home/SantriHome';
import LearningModule from './features/learning/LearningModule';
import TajwidModule from './features/tajwid/TajwidModule';
import ProfilePage from './features/profile/ProfilePage';
import AdminDashboard from './features/admin/AdminDashboard';
import { Avatar } from './components/ui';
import './App.css';

/** Route guard — only authenticated users pass */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

/** Route guard — only guru role */
function GuruRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'guru' && user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

/** Route guard — only admin role */
function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

/** Halaman Ruang Tunggu bagi Pendatang (Ustadz) */
function GuruPendingView() {
  const { logout } = useAuthStore();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#0a1628', color: 'white', padding: '24px', textAlign: 'center' }}>
      <span style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</span>
      <h2 style={{ fontFamily: 'Inter' }}>Menunggu Persetujuan Admin</h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '400px', marginBottom: '24px', fontFamily: 'Inter', lineHeight: 1.5 }}>
        Akun Ustadz Anda telah berhasil dibuat namun masih dalam tahap peninjauan. Silakan hubungi Admin MAOSANI untuk mempercepat persetujuan.
      </p>
      <button onClick={logout} style={{ padding: '8px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter' }}>Kembali ke Login</button>
    </div>
  );
}

/** Mobile Bottom Navigation — Santri */
function SantriNav() {
  const navItems = [
    { path: '/', icon: '🏠', label: 'Beranda' },
    { path: '/roadmap', icon: '🗺️', label: 'Belajar' },
    { path: '/canvas', icon: '✍️', label: 'Menulis' },
    { path: '/quran', icon: '📖', label: 'Mushaf' },
    { path: '/profile', icon: '👤', label: 'Profil' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'bottom-nav-active' : ''}`}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

/** Mobile Bottom Navigation — Guru */
function GuruNav() {
  const navItems = [
    { path: '/guru', icon: '📊', label: 'Dashboard' },
    { path: '/guru/kendali', icon: '📚', label: 'Kendali' },
  ];

  return (
    <nav className="bottom-nav bottom-nav-guru">
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'bottom-nav-active' : ''}`}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

/** Top Navbar */
function TopNavbar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="top-navbar">
      <div className="top-navbar-brand">
        <span className="top-navbar-logo">📖</span>
        <span className="top-navbar-title">MAOSANI</span>
      </div>
      <div className="top-navbar-right">
        <div className="top-navbar-user">
          <Avatar name={user?.fullName} size={32} />
          <div className="top-navbar-user-info">
            <span className="top-navbar-name">{user?.fullName}</span>
            <span className="top-navbar-role">{user?.role === 'guru' ? 'Guru' : 'Santri'}</span>
          </div>
        </div>
        <button className="top-navbar-logout" onClick={logout} title="Keluar">
          🚪
        </button>
      </div>
    </header>
  );
}

/** Animated page transition wrapper */
function PageTransition({ children }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        style={{ flex: 1 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** Main App layout */
function AppLayout() {
  const { user } = useAuthStore();
  const isGuru = user?.role === 'guru' || user?.role === 'admin';
  const location = useLocation();

  return (
    <div className="app-layout">
      <TopNavbar />
      <main className="app-main">
        <PageTransition>
          <Routes location={location}>
            {/* Santri Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                {isGuru ? <Navigate to="/guru" replace /> : <SantriHome />}
              </ProtectedRoute>
            } />
            <Route path="/roadmap" element={<ProtectedRoute><RoadmapView /></ProtectedRoute>} />
            <Route path="/canvas" element={<ProtectedRoute><TracingCanvas /></ProtectedRoute>} />
            <Route path="/placement" element={<ProtectedRoute><PlacementTest /></ProtectedRoute>} />
            <Route path="/quran" element={<ProtectedRoute><QuranExplorer /></ProtectedRoute>} />
            <Route path="/voice" element={<ProtectedRoute><VoiceRecorder /></ProtectedRoute>} />
            <Route path="/learn/:stepId" element={<ProtectedRoute><LearningModule /></ProtectedRoute>} />
            <Route path="/tajwid" element={<ProtectedRoute><TajwidModule /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Guru Routes */}
            <Route path="/guru" element={<GuruRoute><GuruDashboard /></GuruRoute>} />
            <Route path="/guru/kendali" element={<GuruRoute><GuruDashboard /></GuruRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
      </main>
      {isGuru ? <GuruNav /> : <SantriNav />}
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading, initialize, user } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#0a1628' }}>
        <p style={{ color: 'white', fontFamily: 'Inter' }}>Memuat Sesi...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        } />
        <Route path="/*" element={
          !isAuthenticated ? <Navigate to="/login" replace /> :
          user?.role === 'guru_pending' ? <GuruPendingView /> :
          <AppLayout />
        } />
      </Routes>
    </BrowserRouter>
  );
}
