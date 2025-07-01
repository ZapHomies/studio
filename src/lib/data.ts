import { User, Mission, Reward } from './types';

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
    xp: 150,
    coins: 50,
    type: 'auto',
    category: 'Bulanan',
  },
];

export const rewards: Reward[] = [
  // FREE REWARDS
  {
    id: 'border-welcome',
    name: 'Bingkai Selamat Datang',
    description: 'Hadiah gratis untuk memulai perjalanan imanmu!',
    cost: 0,
    type: 'border',
    style: 'solid',
    value: 'border-primary',
  },
  // RAMADAN REWARDS (SEASONAL)
  {
    id: 'theme-ramadan',
    name: 'Cahaya Ramadan',
    description: 'Tema spesial yang hanya tersedia di bulan suci.',
    cost: 500,
    type: 'theme',
    value: 'Ramadan',
    season: 'Ramadan',
  },
  {
    id: 'border-ramadan-lantern',
    name: 'Lentera Ramadan',
    description: 'Sambut bulan penuh berkah dengan bingkai hangat ini.',
    cost: 250,
    type: 'border',
    style: 'gradient',
    value: 'bg-gradient-to-tr from-amber-400 via-orange-500 to-red-600',
    season: 'Ramadan',
  },
  // THEMES
  {
    id: 'theme-sakura',
    name: 'Tema Sakura',
    description: 'Nuansa merah muda yang lembut dan menenangkan.',
    cost: 750,
    type: 'theme',
    value: 'Sakura',
  },
  {
    id: 'theme-sunset',
    name: 'Tema Senja',
    description: 'Bawa kehangatan senja ke dalam aplikasi Anda.',
    cost: 1000,
    type: 'theme',
    value: 'Sunset',
  },
  {
    id: 'theme-royal',
    name: 'Tema Royal',
    description: 'Tampilan elegan dengan nuansa biru tua dan emas.',
    cost: 1200,
    type: 'theme',
    value: 'Royal',
  },
  // SOLID BORDERS
  {
    id: 'border-gold',
    name: 'Bingkai Emas',
    description: 'Tunjukkan pencapaian Anda dengan bingkai emas.',
    cost: 300,
    type: 'border',
    style: 'solid',
    value: 'border-amber-400',
  },
  {
    id: 'border-amethyst',
    name: 'Bingkai Kecubung',
    description: 'Bingkai ungu misterius dan menawan.',
    cost: 450,
    type: 'border',
    style: 'solid',
    value: 'border-fuchsia-600',
  },
  // GRADIENT BORDERS
  {
    id: 'border-rose-garden',
    name: 'Taman Mawar',
    description: 'Keindahan mawar yang mekar di profil Anda.',
    cost: 600,
    type: 'border',
    style: 'gradient',
    value: 'bg-gradient-to-br from-red-300 via-rose-500 to-green-400',
  },
  {
    id: 'border-aurora-sky',
    name: 'Langit Aurora',
    description: 'Cahaya aurora yang menari di bingkai profilmu.',
    cost: 800,
    type: 'border',
    style: 'gradient',
    value: 'bg-gradient-to-tr from-cyan-300 via-purple-500 to-pink-400',
  },
  {
    id: 'border-ocean-pearl',
    name: 'Mutiara Samudra',
    description: 'Kilau mutiara dari kedalaman lautan.',
    cost: 800,
    type: 'border',
    style: 'gradient',
    value: 'bg-gradient-to-b from-teal-200 via-sky-300 to-blue-400',
  },
  {
    id: 'border-neon-light',
    name: 'Cahaya Neon',
    description: 'Sinar biru-ungu neon yang modern dan bersinar.',
    cost: 1000,
    type: 'border',
    style: 'gradient',
    value: 'bg-gradient-to-r from-sky-400 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/80',
  }
];
