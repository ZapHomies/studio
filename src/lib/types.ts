'use client';

export interface User {
  id: string; // Will use Supabase Auth UUID
  name: string;
  email: string;
  avatarUrl: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  completedMissions: string[];
  missions: Mission[]; // Missions are now stored per-user
  title: string;
  // Timestamps for reset logic
  lastDailyReset: string;
  lastWeeklyReset: string;
  lastMonthlyReset: string;
  // Flag for onboarding
  hasSeenWelcome: boolean;
  // Rewards feature
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
  cost: number;
  type: 'theme' | 'border';
  value: string;
  style?: 'solid' | 'gradient';
  season?: 'Ramadan';
}

export interface ForumComment {
  id: string;
  authorId: string;
  postId: string;
  content: string;
  timestamp: string;
  // Joined data from users table
  author?: Pick<User, 'name' | 'avatarUrl'>;
}

export interface ForumPost {
  id:string;
  authorId: string;
  title: string;
  content: string;
  timestamp: string;
  comments: ForumComment[];
  // Joined data from users table
  author?: Pick<User, 'name' | 'avatarUrl'>;
}
