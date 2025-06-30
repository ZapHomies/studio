'use client';

import React, { createContext, useState, ReactNode } from 'react';
import { type User, type Mission } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { initialMissions, initialUser } from '@/lib/data';

interface UserDataContextType {
  user: User;
  missions: Mission[];
  completeMission: (missionId: string) => void;
}

export const UserDataContext = createContext<UserDataContextType>({
  user: initialUser,
  missions: initialMissions,
  completeMission: () => {},
});

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(initialUser);
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const { toast } = useToast();

  const completeMission = (missionId: string) => {
    // Prevent re-completing
    if (user.completedMissions.includes(missionId)) {
      return;
    }

    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;

    setUser((prevUser) => {
      let newXp = prevUser.xp + mission.xp;
      let newLevel = prevUser.level;
      let newXpToNextLevel = prevUser.xpToNextLevel;

      if (newXp >= newXpToNextLevel) {
        newLevel += 1;
        newXp -= newXpToNextLevel;
        newXpToNextLevel = newLevel * 150; // Increase XP requirement for next level
        toast({
          title: 'Level Up!',
          description: `Congratulations! You've reached Level ${newLevel}.`,
        });
      }

      return {
        ...prevUser,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: newXpToNextLevel,
        completedMissions: [...prevUser.completedMissions, missionId],
      };
    });
  };

  return (
    <UserDataContext.Provider value={{ user, missions, completeMission }}>
      {children}
    </UserDataContext.Provider>
  );
};
