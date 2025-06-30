export interface User {
  name: string;
  avatarUrl: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  completedMissions: string[];
  title: string;
  // Timestamps for mission resets
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
