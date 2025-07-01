export interface User {
  id: string; // Akan menggunakan email untuk kesederhanaan
  name: string;
  email: string;
  password: string; // Di aplikasi nyata, ini akan menjadi hash. Di sini, disimpan apa adanya.
  avatarUrl: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  completedMissions: string[];
  title: string;
  // Timestamps untuk reset misi
  lastDailyReset: string;
  lastWeeklyReset: string;
  lastMonthlyReset: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  xp: number;
  type: 'photo' | 'action' | 'auto';
  bonusXp?: number;
  category: 'Harian' | 'Mingguan' | 'Bulanan';
}
