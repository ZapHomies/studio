'use client';

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { type User, type Mission } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { initialMissions, initialUser } from '@/lib/data';
import { useRouter, usePathname } from 'next/navigation';

interface UserDataContextType {
  user: User;
  missions: Mission[];
  isAuthenticated: boolean;
  completeMission: (missionId: string, bonusXp?: number) => void;
  login: (name: string) => void;
  logout: () => void;
  register: (name: string) => void;
  isLoading: boolean;
}

export const UserDataContext = createContext<UserDataContextType>({
  user: initialUser,
  missions: initialMissions,
  isAuthenticated: false,
  isLoading: true,
  completeMission: () => {},
  login: () => {},
  logout: () => {},
  register: () => {},
});

const getTitleForLevel = (level: number): string => {
  if (level >= 20) return 'Bintang Hidayah';
  if (level >= 15) return 'Sahabat Al-Quran';
  if (level >= 10) return 'Pencari Ilmu';
  if (level >= 5) return 'Pejuang Iman';
  return 'Muslim Baru';
};


export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(initialUser);
  const [missions] = useState<Mission[]>(initialMissions);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simulate checking auth status from storage
    const loggedInUser = localStorage.getItem('deen-daily-user');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/register') {
      router.push('/');
    }
    if (!isLoading && isAuthenticated && (pathname === '/' || pathname === '/register')) {
      router.push('/missions');
    }
  }, [isAuthenticated, isLoading, pathname, router]);


  const login = (name: string) => {
    // In a real app, you'd verify credentials
    const existingUserRaw = localStorage.getItem('deen-daily-user');
    if (existingUserRaw) {
        const existingUser = JSON.parse(existingUserRaw);
        if (existingUser.name.toLowerCase() === name.toLowerCase()) {
            setUser(existingUser);
            setIsAuthenticated(true);
            router.push('/missions');
            return;
        }
    }
    toast({
        title: 'Login Gagal',
        description: 'Pengguna tidak ditemukan. Silakan daftar terlebih dahulu.',
        variant: 'destructive',
    });
  };

  const register = (name: string) => {
    const newUser = { ...initialUser, name: name, title: getTitleForLevel(1) };
    localStorage.setItem('deen-daily-user', JSON.stringify(newUser));
    setUser(newUser);
    setIsAuthenticated(true);
    router.push('/missions');
  };
  
  const logout = () => {
    localStorage.removeItem('deen-daily-user');
    setUser(initialUser);
    setIsAuthenticated(false);
    router.push('/');
  };

  const completeMission = (missionId: string, bonusXp: number = 0) => {
    if (user.completedMissions.includes(missionId)) {
      return;
    }

    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;

    // Calculate new state based on current user state
    const totalXpGained = mission.xp + bonusXp;
    let currentXp = user.xp + totalXpGained;
    let currentLevel = user.level;
    let currentXpToNextLevel = user.xpToNextLevel;
    let currentTitle = user.title;
    let leveledUp = false;

    while (currentXp >= currentXpToNextLevel) {
      leveledUp = true;
      currentXp -= currentXpToNextLevel;
      currentLevel += 1;
      currentXpToNextLevel = currentLevel * 150;
      currentTitle = getTitleForLevel(currentLevel);
    }

    // Create the final updated user object
    const updatedUser: User = {
      ...user,
      xp: currentXp,
      level: currentLevel,
      xpToNextLevel: currentXpToNextLevel,
      title: currentTitle,
      completedMissions: [...user.completedMissions, missionId],
    };
    
    // Set state and perform side-effects
    setUser(updatedUser);
    localStorage.setItem('deen-daily-user', JSON.stringify(updatedUser));
    
    if (leveledUp) {
      toast({
        title: 'Naik Level!',
        description: `Selamat! Anda telah mencapai Level ${currentLevel} dan meraih gelar "${currentTitle}".`,
        variant: 'success',
      });
    }
  };

  const value = { user, missions, isAuthenticated, completeMission, login, logout, register, isLoading };

  if (isLoading) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            {/* You can replace this with a beautiful spinner */}
            <p>Loading...</p> 
        </div>
    );
  }

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};
