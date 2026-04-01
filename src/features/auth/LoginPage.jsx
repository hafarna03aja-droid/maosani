/**
 * Login & Register Page
 * Menangani otentikasi Supabase untuk Santri dan Guru
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import { Button } from '../../components/ui';
import './auth.css';

export default function LoginPage() {
  const { login, register, loginAs, isLoading, error, clearError, isSupabase } = useAuthStore();
  
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('santri');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      register(email, password, fullName, role);
    } else {
      login(email, password);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    clearError();
  };

  return (
    <div className="login-page">
      {/* Background Decoration */}
      <div className="login-bg-decor">
        <div className="login-bg-circle login-bg-circle-1" />
        <div className="login-bg-circle login-bg-circle-2" />
        <div className="login-bg-circle login-bg-circle-3" />
      </div>

      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo & Title */}
        <div className="login-header">
          <motion.div
            className="login-logo"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <span className="login-logo-icon">📖</span>
          </motion.div>
          <h1 className="login-title">MAOSANI</h1>
          <p className="login-subtitle">Belajar Al-Qur'an — Metode 9 Langkah</p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          
          <AnimatePresence mode="popLayout">
            {isRegister && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="form-group">
                  <label htmlFor="fullName">Nama Lengkap</label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required={isRegister}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Mendaftar Sebagai</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <Button 
                      type="button" 
                      variant={role === 'santri' ? 'primary' : 'outline'}
                      onClick={() => setRole('santri')}
                      style={{ flex: 1 }}
                    >
                      Santri
                    </Button>
                    <Button 
                      type="button" 
                      variant={role === 'guru' ? 'primary' : 'outline'}
                      onClick={() => setRole('guru')}
                      style={{ flex: 1 }}
                    >
                      Guru
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Masukkan email anda"
              value={email}
              onChange={e => { setEmail(e.target.value); clearError(); }}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <motion.div
              className="login-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              {error}
            </motion.div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            style={{ marginTop: '8px' }}
          >
            {isRegister ? 'Daftar Sekarang' : 'Masuk'}
          </Button>
          
          {isSupabase && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
              </span>
              <button 
                type="button" 
                onClick={toggleMode}
                style={{ background: 'none', border: 'none', color: '#3395FF', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
              >
                {isRegister ? 'Masuk di sini' : 'Daftar baru'}
              </button>
            </div>
          )}
        </form>

        {/* Quick Login — Hanya muncul jika BUKAN mode live supabase */}
        {!isSupabase && (
          <>
            <div className="login-divider">
              <span>atau masuk cepat (Mock)</span>
            </div>

            <div className="login-quick-buttons">
              <Button variant="outline" size="md" icon="🎓" onClick={() => loginAs('santri')} fullWidth>
                Santri (Ahmad Fauzi)
              </Button>
              <Button variant="outline" size="md" icon="👨‍🏫" onClick={() => loginAs('guru')} fullWidth>
                Guru (Ustadz Rizki)
              </Button>
              <Button variant="ghost" size="md" icon="🛡️" onClick={() => loginAs('admin')} fullWidth>
                Admin (Administrator)
              </Button>
            </div>
          </>
        )}

        <p className="login-footer" style={{ marginTop: '24px' }}>
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </p>
      </motion.div>
    </div>
  );
}
