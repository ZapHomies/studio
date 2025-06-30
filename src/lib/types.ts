export interface User {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  completedMissions: string[];
  title: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  xp: number;
  type: 'photo' | 'action' | 'auto';
  bonusXp?: number;
}
