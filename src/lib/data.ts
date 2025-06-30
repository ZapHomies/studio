import { User, Mission } from './types';

export const initialUser: User = {
  name: 'Abdullah',
  level: 1,
  xp: 20,
  xpToNextLevel: 150,
  completedMissions: [],
  title: 'Muslim Baru',
};

export const initialMissions: Mission[] = [
  {
    id: 'mission-1',
    title: 'Selesaikan 5 Salat Wajib',
    description: 'Lakukan salat lima waktu: Subuh, Zuhur, Asar, Magrib, dan Isya. Unggah foto sajadah Anda setelah salah satu salat.',
    xp: 50,
  },
  {
    id: 'mission-2',
    title: 'Berbuat Kebaikan',
    description: 'Lakukan satu perbuatan baik kepada seseorang. Ini bisa berupa membantu tetangga, memberi makan hewan liar, atau bersedekah. Ambil foto yang mewakili perbuatan baik Anda.',
    xp: 30,
  },
  {
    id: 'mission-3',
    title: 'Membaca Satu Halaman Al-Quran',
    description: 'Baca setidaknya satu halaman dari Al-Quran dan renungkan maknanya. Kirimkan foto halaman yang Anda baca.',
    xp: 25,
  },
    {
    id: 'mission-4',
    title: 'Mendoakan Orang Lain',
    description: 'Luangkan waktu sejenak untuk berdoa (Dua) dengan tulus untuk anggota keluarga, teman, atau seseorang yang membutuhkan. Unggah foto tangan Anda saat berdoa.',
    xp: 20,
  },
];
