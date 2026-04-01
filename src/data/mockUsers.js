/**
 * Mock Users & Progress Data
 * Digunakan untuk development sebelum integrasi Supabase
 */

export const MOCK_USERS = [
  {
    id: 'santri-001',
    email: 'ahmad@maosani.id',
    fullName: 'Ahmad Fauzi',
    role: 'santri',
    avatarUrl: null,
    assignedGuruId: 'guru-001',
    placementTestCompleted: true,
    placementTestResult: { recommendedStep: 1, totalScore: 15 },
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'santri-002',
    email: 'siti@maosani.id',
    fullName: 'Siti Aisyah',
    role: 'santri',
    avatarUrl: null,
    assignedGuruId: 'guru-001',
    placementTestCompleted: true,
    placementTestResult: { recommendedStep: 3, totalScore: 72 },
    createdAt: '2026-01-20T08:00:00Z',
  },
  {
    id: 'santri-003',
    email: 'umar@maosani.id',
    fullName: 'Umar Abdullah',
    role: 'santri',
    avatarUrl: null,
    assignedGuruId: 'guru-001',
    placementTestCompleted: false,
    placementTestResult: null,
    createdAt: '2026-02-01T08:00:00Z',
  },
  {
    id: 'guru-001',
    email: 'ustadz@maosani.id',
    fullName: 'Ustadz Muhammad Rizki',
    role: 'guru',
    avatarUrl: null,
    assignedGuruId: null,
    placementTestCompleted: false,
    placementTestResult: null,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'admin-001',
    email: 'admin@maosani.id',
    fullName: 'Administrator',
    role: 'admin',
    avatarUrl: null,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'pending-001',
    email: 'ustadz.baru@maosani.id',
    full_name: 'Ustadz Ahmad Mansur', // Using full_name to match DB preference in some parts
    role: 'guru_pending',
    createdAt: '2026-03-20T10:00:00Z',
  },
];

/** Mock Progress Data — Buku Kendali Digital */
export const MOCK_PROGRESS = [
  // Ahmad Fauzi — sedang di Step 2
  { id: 'prog-001', santriId: 'santri-001', stepNumber: 1, status: 'approved', scoreMakhroj: 8.5, scoreTajwid: 8.0, scoreKelancaran: 7.5, scoreTotal: 8.0, approvedBy: 'guru-001', guruNotes: 'Mahir mengenal huruf. Lanjutkan!', exercisesCompleted: 14, exercisesTotal: 14, attempts: 1 },
  { id: 'prog-002', santriId: 'santri-001', stepNumber: 2, status: 'in_progress', scoreMakhroj: null, scoreTajwid: null, scoreKelancaran: null, scoreTotal: null, approvedBy: null, guruNotes: null, exercisesCompleted: 8, exercisesTotal: 14, attempts: 1 },
  { id: 'prog-003', santriId: 'santri-001', stepNumber: 3, status: 'locked', scoreMakhroj: null, scoreTajwid: null, scoreKelancaran: null, scoreTotal: null, approvedBy: null, guruNotes: null, exercisesCompleted: 0, exercisesTotal: 10, attempts: 0 },

  // Siti Aisyah — sudah di Step 5 (placement test skip ke step 3)
  { id: 'prog-004', santriId: 'santri-002', stepNumber: 1, status: 'approved', scoreMakhroj: 9.0, scoreTajwid: 9.0, scoreKelancaran: 9.5, scoreTotal: 9.2, approvedBy: 'guru-001', guruNotes: 'Luar biasa!', exercisesCompleted: 14, exercisesTotal: 14, attempts: 1 },
  { id: 'prog-005', santriId: 'santri-002', stepNumber: 2, status: 'approved', scoreMakhroj: 8.5, scoreTajwid: 8.5, scoreKelancaran: 9.0, scoreTotal: 8.7, approvedBy: 'guru-001', guruNotes: 'Bagus sekali.', exercisesCompleted: 14, exercisesTotal: 14, attempts: 1 },
  { id: 'prog-006', santriId: 'santri-002', stepNumber: 3, status: 'approved', scoreMakhroj: 8.0, scoreTajwid: 8.5, scoreKelancaran: 8.0, scoreTotal: 8.2, approvedBy: 'guru-001', guruNotes: 'Vokal baik.', exercisesCompleted: 10, exercisesTotal: 10, attempts: 1 },
  { id: 'prog-007', santriId: 'santri-002', stepNumber: 4, status: 'approved', scoreMakhroj: 7.5, scoreTajwid: 8.0, scoreKelancaran: 8.0, scoreTotal: 7.8, approvedBy: 'guru-001', guruNotes: 'Tanwin cukup baik.', exercisesCompleted: 10, exercisesTotal: 10, attempts: 2 },
  { id: 'prog-008', santriId: 'santri-002', stepNumber: 5, status: 'pending_review', scoreMakhroj: null, scoreTajwid: null, scoreKelancaran: null, scoreTotal: null, approvedBy: null, guruNotes: null, exercisesCompleted: 8, exercisesTotal: 8, attempts: 1 },

  // Umar Abdullah — belum placement test
];

export default MOCK_USERS;
