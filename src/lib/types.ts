'use client';

export interface User {
  id: string; // Akan menggunakan email untuk kesederhanaan
  name: string;
  email: string;
  password: string; // Di aplikasi nyata, ini akan menjadi hash. Di sini, disimpan apa adanya.
  avatarUrl: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  completedMissions: string[];
  title: string;
  // Timestamps untuk reset misi
  lastDailyReset: string;
  lastWeeklyReset: string;
  lastMonthlyReset: string;
  // Flag untuk onboarding
  hasSeenWelcome: boolean;
  // Fitur Hadiah
  unlockedRewardIds: string[];
  activeBorderId: string | null;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  xp: number;
  coins: number;
  type: 'photo' | 'action' | 'auto';
  bonusXp?: number;
  category: 'Harian' | 'Mingguan' | 'Bulanan';
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number; // Sekarang dalam Koin
  type: 'theme' | 'border';
  value: string; // Nama tema atau kelas CSS untuk border
  style?: 'solid' | 'gradient'; // Menambahkan style untuk membedakan tipe border
  season?: 'Ramadan';
}

export interface ForumComment {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
}

export interface ForumPost {
  id: string;
  authorId: string;
  title: string;
  content: string;
  timestamp: string;
  comments: ForumComment[];
}
