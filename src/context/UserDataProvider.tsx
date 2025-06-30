
'use client';

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { type User, type Mission } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { initialUser, dailyMissionPool, weeklyMissionPool, monthlyMissionPool, avatarPool } from '@/lib/data';
import { useRouter, usePathname } from 'next/navigation';
import { isToday, isThisWeek, isThisMonth } from 'date-fns';

interface UserDataContextType {
  user: User;
  missions: Mission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  completeMission: (missionId: string, bonusXp?: number, overrideXp?: number) => void;
  login: (name: string) => void;
  logout: () => void;
  register: (name: string) => void;
  updateUser: (updatedData: Partial<User>) => void;
}

const NUM_DAILY = 4;
const NUM_WEEKLY = 2;
const NUM_MONTHLY = 2;

export const UserDataContext = createContext<UserDataContextType>({
  user: initialUser,
  missions: [],
  isAuthenticated: false,
  isLoading: true,
  completeMission: () => {},
  login: () => {},
  logout: () => {},
  register: () => {},
  updateUser: () => {},
});

const getTitleForLevel = (level: number): string => {
  if (level >= 20) return 'Bintang Hidayah';
  if (level >= 15) return 'Sahabat Al-Quran';
  if (level >= 10) return 'Pencari Ilmu';
  if (level >= 5) return 'Pejuang Iman';
  return 'Muslim Baru';
};

// Helper to get N random items from a pool
const getRandomMissions = (pool: Mission[], count: number, excludeIds: string[] = []): Mission[] => {
  const available = pool.filter(m => !excludeIds.includes(m.id));
  return available.sort(() => 0.5 - Math.random()).slice(0, count);
};


export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(initialUser);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);
    const storedDataRaw = localStorage.getItem('deen-daily-data');
    let loadedUser = null;
    let loadedMissions = [];

    if (storedDataRaw) {
      try {
        const storedData = JSON.parse(storedDataRaw);
        if (storedData.user && storedData.missions) {
            loadedUser = storedData.user;
            loadedMissions = storedData.missions;
            setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        localStorage.removeItem('deen-daily-data'); // Clear corrupted data
      }
    }
    
    if (loadedUser) {
        // --- Mission Reset Logic ---
        const now = new Date();
        let userToUpdate = { ...loadedUser };
        let missionsToUpdate = [...loadedMissions];
        let didUpdate = false;

        // Daily Reset
        if (!isToday(new Date(userToUpdate.lastDailyReset))) {
            const oldDailyIds = missionsToUpdate.filter(m => m.category === 'Harian').map(m => m.id);
            userToUpdate.completedMissions = userToUpdate.completedMissions.filter(id => !oldDailyIds.includes(id));
            missionsToUpdate = missionsToUpdate.filter(m => m.category !== 'Harian');
            const newDailyMissions = getRandomMissions(dailyMissionPool, NUM_DAILY);
            missionsToUpdate.push(...newDailyMissions);
            userToUpdate.lastDailyReset = now.toISOString();
            didUpdate = true;
        }

        // Weekly Reset
        if (!isThisWeek(new Date(userToUpdate.lastWeeklyReset), { weekStartsOn: 1 })) {
            const oldWeeklyIds = missionsToUpdate.filter(m => m.category === 'Mingguan').map(m => m.id);
            userToUpdate.completedMissions = userToUpdate.completedMissions.filter(id => !oldWeeklyIds.includes(id));
            missionsToUpdate = missionsToUpdate.filter(m => m.category !== 'Mingguan');
            const newWeeklyMissions = getRandomMissions(weeklyMissionPool, NUM_WEEKLY);
            missionsToUpdate.push(...newWeeklyMissions);
            userToUpdate.lastWeeklyReset = now.toISOString();
            didUpdate = true;
        }

        // Monthly Reset
        if (!isThisMonth(new Date(userToUpdate.lastMonthlyReset))) {
            const oldMonthlyIds = missionsToUpdate.filter(m => m.category === 'Bulanan').map(m => m.id);
            userToUpdate.completedMissions = userToUpdate.completedMissions.filter(id => !oldMonthlyIds.includes(id));
            missionsToUpdate = missionsToUpdate.filter(m => m.category !== 'Bulanan');
            const newMonthlyMissions = getRandomMissions(monthlyMissionPool, NUM_MONTHLY);
            missionsToUpdate.push(...newMonthlyMissions);
            userToUpdate.lastMonthlyReset = now.toISOString();
            didUpdate = true;
        }
        
        setUser(userToUpdate);
        setMissions(missionsToUpdate);
        if(didUpdate) {
            localStorage.setItem('deen-daily-data', JSON.stringify({ user: userToUpdate, missions: missionsToUpdate }));
        }

    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/register' && pathname !== '/') {
      router.push('/');
    }
    if (!isLoading && isAuthenticated && (pathname === '/' || pathname === '/register')) {
      router.push('/missions');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const saveData = (userToSave: User, missionsToSave: Mission[]) => {
      setUser(userToSave);
      setMissions(missionsToSave);
      localStorage.setItem('deen-daily-data', JSON.stringify({ user: userToSave, missions: missionsToSave }));
  }

  const generateNewUserMissions = (): Mission[] => {
      const daily = getRandomMissions(dailyMissionPool, NUM_DAILY);
      const weekly = getRandomMissions(weeklyMissionPool, NUM_WEEKLY);
      const monthly = getRandomMissions(monthlyMissionPool, NUM_MONTHLY);
      return [...daily, ...weekly, ...monthly];
  }

  const login = (name: string) => {
    const storedDataRaw = localStorage.getItem('deen-daily-data');
    if (storedDataRaw) {
        const storedData = JSON.parse(storedDataRaw);
        if (storedData.user.name.toLowerCase() === name.toLowerCase()) {
            setIsAuthenticated(true);
            // Let the useEffect hook handle redirect and data loading
            window.location.reload(); // Force a reload to ensure fresh state
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
    const now = new Date();
    const newUser: User = { 
        ...initialUser, 
        name: name, 
        title: getTitleForLevel(1),
        avatarUrl: avatarPool[Math.floor(Math.random() * avatarPool.length)].url,
        lastDailyReset: now.toISOString(),
        lastWeeklyReset: now.toISOString(),
        lastMonthlyReset: now.toISOString(),
    };
    const newMissions = generateNewUserMissions();
    saveData(newUser, newMissions);
    setIsAuthenticated(true);
    router.push('/missions');
  };
  
  const logout = () => {
    localStorage.removeItem('deen-daily-data');
    setUser(initialUser);
    setMissions([]);
    setIsAuthenticated(false);
    router.push('/');
  };

  const updateUser = (updatedData: Partial<User>) => {
    const updatedUser = { ...user, ...updatedData };
    saveData(updatedUser, missions);
    toast({
        title: 'Profil Diperbarui!',
        description: 'Informasi profil Anda telah berhasil disimpan.',
        variant: 'success'
    });
  };

  const completeMission = (missionId: string, bonusXp: number = 0, overrideXp?: number) => {
    if (user.completedMissions.includes(missionId)) {
      return;
    }

    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;

    let leveledUp = false;
    let newTitle = user.title;

    const xpFromMission = overrideXp !== undefined ? overrideXp : mission.xp;
    const totalXpGained = xpFromMission + bonusXp;
    
    let updatedUser: User;
    let finalMissions = [...missions];

    setUser(currentUser => {
        updatedUser = { ...currentUser };
        updatedUser.xp += totalXpGained;
        
        while (updatedUser.xp >= updatedUser.xpToNextLevel) {
          leveledUp = true;
          updatedUser.xp -= updatedUser.xpToNextLevel;
          updatedUser.level += 1;
          updatedUser.xpToNextLevel = updatedUser.level * 150;
          newTitle = getTitleForLevel(updatedUser.level);
        }
        updatedUser.title = newTitle;
        updatedUser.completedMissions = [...currentUser.completedMissions, missionId];
        
        // Replace daily mission if completed
        if (mission.category === 'Harian') {
            const currentMissionIds = finalMissions.map(m => m.id);
            const newMission = getRandomMissions(dailyMissionPool, 1, currentMissionIds)[0];
            if (newMission) {
                const missionIndex = finalMissions.findIndex(m => m.id === missionId);
                if(missionIndex !== -1) {
                    finalMissions[missionIndex] = newMission;
                }
            }
        }

        saveData(updatedUser, finalMissions);

        if (leveledUp) {
          toast({
            title: 'Naik Level!',
            description: `Selamat! Anda telah mencapai Level ${updatedUser.level} dan meraih gelar "${updatedUser.title}".`,
            variant: 'success',
          });
        }
        return updatedUser;
    });
  };

  const value = { user, missions, isAuthenticated, isLoading, completeMission, login, logout, register, updateUser };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};
