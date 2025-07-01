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
  // THEMES
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
  // SOLID BORDERS
  {
    id: 'border-silver',
    name: 'Bingkai Perak',
    description: 'Bingkai perak berkilau untuk avatar Anda.',
    cost: 250,
    type: 'border',
    style: 'solid',
    value: 'border-slate-400',
  },
  {
    id: 'border-gold',
    name: 'Bingkai Emas',
    description: 'Tunjukkan pencapaian Anda dengan bingkai emas.',
    cost: 500,
    type: 'border',
    style: 'solid',
    value: 'border-amber-400',
  },
  {
    id: 'border-amethyst',
    name: 'Bingkai Kecubung',
    description: 'Bingkai ungu misterius dan menawan.',
    cost: 750,
    type: 'border',
    style: 'solid',
    value: 'border-fuchsia-600',
  },
  // GRADIENT & SPECIAL BORDERS (INSPIRED BY IMAGE)
  {
    id: 'border-watercolor-splash',
    name: 'Percikan Cat Air',
    description: 'Efek cat air hijau-kuning yang artistik dan segar.',
    cost: 900,
    type: 'border',
    style: 'gradient',
    value: 'bg-gradient-to-tr from-teal-200 via-emerald-300 to-yellow-200',
  },
  {
    id: 'border-butterfly-dream',
    name: 'Mimpi Kupu-kupu',
    description: 'Gradasi ungu lembut seperti sayap kupu-kupu.',
    cost: 800,
    type: 'border',
    style: 'gradient',
    value: 'bg-gradient-to-br from-fuchsia-300 via-purple-400 to-sky-300',
  },
  {
    id: 'border-sunflower-field',
    name: 'Ladang Bunga Matahari',
    description: 'Kehangatan emas dan kuning dari bunga matahari.',
    cost: 1100,
    type: 'border',
    style: 'gradient',
    value: 'bg-gradient-to-b from-amber-300 via-yellow-400 to-orange-400',
  },
  {
    id: 'border-neon-light',
    name: 'Cahaya Neon',
    description: 'Sinar biru-ungu neon yang modern dan bersinar.',
    cost: 1500,
    type: 'border',
    style: 'gradient',
    value: 'bg-gradient-to-r from-sky-400 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/80',
  }
];
