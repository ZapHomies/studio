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
    xp: 150, // XP dasar, bisa bertambah
    type: 'auto',
    category: 'Bulanan',
  },
];

export const rewards: Reward[] = [
  {
    id: 'theme-sunset',
    name: 'Tema Senja',
    description: 'Bawa kehangatan senja ke dalam aplikasi Anda.',
    cost: 1200,
    type: 'theme',
    value: 'Sunset',
  },
  {
    id: 'theme-royal',
    name: 'Tema Royal',
    description: 'Tampilan elegan dengan nuansa biru tua dan emas.',
    cost: 1500,
    type: 'theme',
    value: 'Royal',
  },
  {
    id: 'theme-emerald',
    name: 'Tema Zamrud',
    description: 'Nuansa hijau yang sejuk dan menenangkan.',
    cost: 1000,
    type: 'theme',
    value: 'Emerald',
  },
  {
    id: 'border-silver',
    name: 'Bingkai Perak',
    description: 'Bingkai perak berkilau untuk avatar Anda.',
    cost: 250,
    type: 'border',
    value: 'border-slate-400',
  },
  {
    id: 'border-gold',
    name: 'Bingkai Emas',
    description: 'Tunjukkan pencapaian Anda dengan bingkai emas.',
    cost: 500,
    type: 'border',
    value: 'border-amber-400',
  },
  {
    id: 'border-amethyst',
    name: 'Bingkai Kecubung',
    description: 'Bingkai ungu misterius dan menawan.',
    cost: 750,
    type: 'border',
    value: 'border-fuchsia-600',
  },
  {
    id: 'border-ruby',
    name: 'Bingkai Rubi',
    description: 'Bingkai merah delima yang gagah berani.',
    cost: 1000,
    type: 'border',
    value: 'border-red-600',
  },
];
