/**
 * Data Level Menulis untuk Tracing Canvas
 */

export const WRITING_LEVELS = [
  {
    id: 1,
    name: 'Huruf Tunggal',
    description: 'Berlatih menulis huruf hijaiyah dalam bentuk aslinya (berdiri sendiri).',
    icon: '🔤',
  },
  {
    id: 2,
    name: 'Posisi Huruf',
    description: 'Mengenal perubahan bentuk huruf di awal, tengah, dan akhir kata.',
    icon: '📍',
  },
  {
    id: 3,
    name: 'Huruf Sambung',
    description: 'Berlatih menyambung 2-3 huruf menjadi potongan kata sederhana.',
    icon: '🔗',
  }
];

export const CONNECTED_WORDS = [
  { id: 'w1', text: 'ببب', name: 'Ba-Ba-Ba', difficulty: 'Easy' },
  { id: 'w2', text: 'كتب', name: 'Kataba', difficulty: 'Medium' },
  { id: 'w3', text: 'حمد', name: 'Hamada', difficulty: 'Medium' },
  { id: 'w4', text: 'صبر', name: 'Shobaro', difficulty: 'Medium' },
  { id: 'w5', text: 'نصر', name: 'Nashoro', difficulty: 'Hard' },
  { id: 'w6', text: 'علم', name: 'Alama', difficulty: 'Hard' },
];

export default WRITING_LEVELS;
