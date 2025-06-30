export interface User {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  completedMissions: string[];
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  xp: number;
}
