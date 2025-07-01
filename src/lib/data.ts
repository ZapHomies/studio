import { User, Mission } from './types';

export const avatarPool: { url: string; hint: string }[] = [
  { url: 'https://placehold.co/128x128/1abc9c/ffffff.png', hint: 'muslim man turquoise' },
  { url: 'https://placehold.co/128x128/3498db/ffffff.png', hint: 'muslim woman blue hijab' },
  { url: 'https://placehold.co/128x128/9b59b6/ffffff.png', hint: 'man purple turban' },
  { url: 'https://placehold.co/128x128/e74c3c/ffffff.png', hint: 'woman red hijab' },
  { url: 'https://placehold.co/128x128/f1c40f/333333.png', hint: 'islamic boy yellow' },
  { url: 'https://placehold.co/128x128/2ecc71/ffffff.png', hint: 'islamic girl green' },
];

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
