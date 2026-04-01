import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import authService from '../../services/authService';
import { Button } from '../../components/ui';

export default function AdminDashboard() {
  const [pendingGurus, setPendingGurus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingGurus();
  }, []);

  const fetchPendingGurus = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await authService.getPendingGurus();
    
    if (error) {
      setError(error.message || 'Gagal mengambil data pendaftar.');
    } else {
      setPendingGurus(data || []);
    }
    setIsLoading(false);
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('Apakah Anda yakin ingin menyetujui akun ini sebagai Guru?')) return;

    const { error } = await authService.approveGuru(userId);
    if (error) {
      alert('Gagal menyetujui: ' + error.message);
    } else {
      alert('Berhasil disetujui!');
      // Refresh list
      fetchPendingGurus();
    }
  };

  return (
    <motion.div 
      className="container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', color: 'white' }}
    >
      <h1 style={{ marginBottom: '8px' }}>Dashboard Admin</h1>
      <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>
        Kelola pendaftaran Ustadz baru (Moderasi Guru).
      </p>

      {error && (
        <div style={{ background: 'rgba(255,50,50,0.1)', color: '#ff6b6b', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <p>Memuat data...</p>
      ) : pendingGurus.length === 0 ? (
        <div style={{ background: '#1c2838', padding: '32px', textAlign: 'center', borderRadius: '12px' }}>
          <p style={{ fontSize: '1.2rem', margin: 0 }}>🎉 Tidak ada antrean persetujuan.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pendingGurus.map((guru) => (
            <div key={guru.id} style={{ 
              background: '#1c2838', 
              padding: '24px', 
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderLeft: '4px solid #f5a623'
            }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>{guru.full_name}</h3>
                <p style={{ margin: '0 0 4px 0', color: 'rgba(255,255,255,0.7)' }}>📧 {guru.email}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                  📅 Mendaftar: {new Date(guru.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div>
                <Button 
                  onClick={() => handleApprove(guru.id)}
                  variant="primary"
                >
                  Setujui Jadi Guru
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
