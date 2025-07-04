'use client';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  level: number;
  xp: number;
  xp_to_next_level: number;
  coins: number;
  completed_missions: string[];
  missions: Mission[];
  title: string;
  last_daily_reset: string;
  last_weekly_reset: string;
  last_monthly_reset: string;
  has_seen_welcome: boolean;
  unlocked_reward_ids: string[];
  active_border_id: string | null;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  xp: number;
  coins: number;
  type: 'photo' | 'action' | 'auto';
  bonus_xp?: number;
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
  author_id: string;
  post_id: string;
  content: string;
  timestamp: string;
  author?: Pick<User, 'name' | 'avatar_url'>;
}

export interface ForumPost {
  id:string;
  author_id: string;
  title: string;
  content: string;
  timestamp: string;
  comments: ForumComment[];
  author?: Pick<User, 'name' | 'avatar_url'>;
}
