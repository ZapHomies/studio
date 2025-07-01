import { User, Mission } from './types';

export const avatarPool: { url: string; hint: string }[] = [
  { url: 'https://placehold.co/100x100/3498db/ffffff.png', hint: 'muslim man' },
  { url: 'https://placehold.co/100x100/e74c3c/ffffff.png', hint: 'muslim woman' },
  { url: 'https://placehold.co/100x100/2ecc71/ffffff.png', hint: 'man beard' },
  { url: 'https://placehold.co/100x100/f1c40f/ffffff.png', hint: 'woman niqab' },
  { url: 'https://placehold.co/100x100/9b59b6/ffffff.png', hint: 'islamic boy' },
  { url: 'https://placehold.co/100x100/1abc9c/ffffff.png', hint: 'islamic girl' },
];

export const initialUser: User = {
  name: 'Abdullah',
  avatarUrl: avatarPool[0].url,
  level: 1,
  xp: 0,
  xpToNextLevel: 150,
  completedMissions: [],
  title: 'Muslim Baru',
  lastDailyReset: new Date(0).toISOString(),
  lastWeeklyReset: new Date(0).toISOString(),
  lastMonthlyReset: new Date(0).toISOString(),
};

// --- Static Missions ---
// Hanya misi yang memiliki logika khusus (seperti penyelesaian otomatis) yang harus ada di sini.
// Sisanya akan dibuat oleh AI.
export const staticMissions: Mission[] = [
  {
    id: 'monthly-quran-recite',
    title: 'Latihan Mengaji',
    description: 'Gunakan fitur "Latihan Mengaji" untuk membaca Al-Quran. Misi ini selesai secara otomatis.',
    xp: 150, // XP dasar, bisa bertambah
    type: 'auto',
    category: 'Bulanan',
  },
];
