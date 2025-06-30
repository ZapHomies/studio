import { User, Mission } from './types';

export const initialUser: User = {
  name: 'Abdullah',
  level: 1,
  xp: 0,
  xpToNextLevel: 150,
  completedMissions: [],
  title: 'Muslim Baru',
};

export const initialMissions: Mission[] = [
  {
    id: 'mission-1',
    title: 'Selesaikan 5 Salat Wajib',
    description: 'Lakukan salat lima waktu. Unggah foto sajadah Anda setelah salah satu salat untuk mendapatkan bonus 25 XP.',
    xp: 50,
    bonusXp: 25,
    type: 'photo',
  },
  {
    id: 'mission-2',
    title: 'Berbuat Kebaikan',
    description: 'Lakukan satu perbuatan baik. Ini bisa berupa membantu tetangga atau bersedekah. Ambil foto yang mewakili perbuatan baik Anda untuk bonus 15 XP.',
    xp: 30,
    bonusXp: 15,
    type: 'photo',
  },
  {
    id: 'mission-3',
    title: 'Membaca Al-Quran',
    description: 'Gunakan fitur "Latihan Mengaji" untuk membaca Al-Quran. Misi ini selesai secara otomatis dan memberikan 40 XP setelah Anda menyelesaikan satu sesi.',
    xp: 40,
    type: 'auto',
  },
    {
    id: 'mission-4',
    title: 'Mendoakan Orang Lain',
    description: 'Luangkan waktu untuk berdoa dengan tulus. Unggah foto tangan Anda saat berdoa untuk bonus 10 XP.',
    xp: 20,
    bonusXp: 10,
    type: 'photo',
  },
  {
    id: 'mission-5',
    title: 'Ucapkan Istighfar 100x',
    description: 'Luangkan waktu untuk berzikir dengan mengucapkan "Astaghfirullah" sebanyak 100 kali. Tandai sebagai selesai untuk mendapatkan 20 XP.',
    xp: 20,
    type: 'action',
  },
    {
    id: 'mission-6',
    title: 'Ucapkan Basmallah 100x',
    description: 'Mulailah aktivitas Anda dengan niat baik dan ucapkan "Bismillah" sebanyak 100 kali sepanjang hari. Tandai selesai untuk 20 XP.',
    xp: 20,
    type: 'action',
  },
];
