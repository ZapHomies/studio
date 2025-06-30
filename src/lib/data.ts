import { User, Mission } from './types';
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';

// Helper to get a consistent unique-ish ID from a string
const stringToId = (str: string) => {
  return str.toLowerCase().replace(/\s+/g, '-').slice(0, 20);
};

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

// --- Mission Pools ---

export const dailyMissionPool: Mission[] = [
  {
    id: 'daily-salat-dhuha',
    title: 'Salat Dhuha',
    description: 'Laksanakan salat Dhuha minimal 2 rakaat. Unggah foto sajadahmu untuk bonus.',
    xp: 25,
    bonusXp: 15,
    type: 'photo',
    category: 'Harian',
  },
  {
    id: 'daily-istighfar-100',
    title: 'Ucapkan Istighfar 100x',
    description: 'Luangkan waktu untuk berzikir dengan mengucapkan "Astaghfirullah" sebanyak 100 kali.',
    xp: 20,
    type: 'action',
    category: 'Harian',
  },
  {
    id: 'daily-basmallah-50',
    title: 'Ucapkan Basmalah 50x',
    description: 'Mulailah aktivitas Anda dengan niat baik dan ucapkan "Bismillah" 50 kali sepanjang hari.',
    xp: 20,
    type: 'action',
    category: 'Harian',
  },
  {
    id: 'daily-sedekah',
    title: 'Berbuat Kebaikan (Sedekah)',
    description: 'Lakukan satu perbuatan baik hari ini, seperti bersedekah. Ambil foto yang mewakili untuk bonus.',
    xp: 30,
    bonusXp: 15,
    type: 'photo',
    category: 'Harian',
  },
    {
    id: 'daily-doa-orangtua',
    title: 'Mendoakan Orang Tua',
    description: 'Luangkan waktu sejenak untuk mendoakan kebaikan bagi kedua orang tua Anda.',
    xp: 20,
    type: 'action',
    category: 'Harian',
  },
  {
    id: 'daily-baca-hadits',
    title: 'Baca Satu Hadits',
    description: 'Baca dan renungkan satu hadits hari ini. Tandai selesai untuk mendapatkan XP.',
    xp: 15,
    type: 'action',
    category: 'Harian'
  },
  {
    id: 'daily-senyum',
    title: 'Beri Senyuman pada 3 Orang',
    description: 'Senyum adalah sedekah. Berikan senyuman tulus kepada tiga orang yang Anda temui hari ini.',
    xp: 10,
    type: 'action',
    category: 'Harian'
  }
];

export const weeklyMissionPool: Mission[] = [
  {
    id: 'weekly-salat-5-waktu',
    title: 'Selesaikan 5 Salat Wajib Selama 3 Hari',
    description: 'Lakukan salat lima waktu setidaknya selama 3 hari dalam seminggu ini. Unggah foto sajadah Anda untuk bonus.',
    xp: 100,
    bonusXp: 50,
    type: 'photo',
    category: 'Mingguan',
  },
  {
    id: 'weekly-alkahfi',
    title: 'Baca Surat Al-Kahfi',
    description: 'Baca Surat Al-Kahfi pada hari Jumat. Tandai selesai untuk mendapatkan XP.',
    xp: 75,
    type: 'action',
    category: 'Mingguan'
  },
  {
    id: 'weekly-kunjungi-masjid',
    title: 'Kunjungi Masjid',
    description: 'Lakukan salat berjamaah di masjid setidaknya sekali minggu ini. Unggah foto masjid untuk bonus XP.',
    xp: 80,
    bonusXp: 40,
    type: 'photo',
    category: 'Mingguan'
  }
];

export const monthlyMissionPool: Mission[] = [
  {
    id: 'monthly-quran-recite',
    title: 'Latihan Mengaji',
    description: 'Gunakan fitur "Latihan Mengaji" untuk membaca Al-Quran. Misi ini selesai secara otomatis.',
    xp: 150, // XP dasar, bisa bertambah
    type: 'auto',
    category: 'Bulanan',
  },
  {
    id: 'monthly-puasa-sunnah',
    title: 'Puasa Sunnah Senin-Kamis',
    description: 'Selesaikan puasa sunnah Senin-Kamis setidaknya sekali dalam sebulan.',
    xp: 200,
    type: 'action',
    category: 'Bulanan'
  }
];
