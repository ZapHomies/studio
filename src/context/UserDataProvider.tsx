
'use client';

import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { type User, type Mission } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { initialUser, staticMissions, avatarPool } from '@/lib/data';
import { useRouter, usePathname } from 'next/navigation';
import { isToday, isThisWeek, isThisMonth } from 'date-fns';
import { generateMissions } from '@/ai/flows/generate-missions';

interface UserDataContextType {
  user: User;
  missions: Mission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  completeMission: (missionId: string, bonusXp?: number, overrideXp?: number) => Promise<void>;
  login: (name: string) => Promise<void>;
  logout: () => void;
  register: (name: string) => Promise<void>;
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
  completeMission: async () => {},
  login: async () => {},
  logout: () => {},
  register: async () => {},
  updateUser: () => {},
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
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const processAndSetUserData = useCallback(async (loadedUser: User, loadedMissions: Mission[]): Promise<{ user: User, missions: Mission[] }> => {
    const now = new Date();
    let userToUpdate = { ...loadedUser };
    let missionsToUpdate = [...loadedMissions];

    // Daily Reset
    if (!isToday(new Date(userToUpdate.lastDailyReset))) {
      missionsToUpdate = missionsToUpdate.filter(m => m.category !== 'Harian');
      const { missions: newDaily } = await generateMissions({ level: userToUpdate.level, existingMissionIds: missionsToUpdate.map(m => m.id), count: NUM_DAILY, category: 'Harian' });
      missionsToUpdate.push(...newDaily);
      userToUpdate.lastDailyReset = now.toISOString();
    }

    // Weekly Reset
    if (!isThisWeek(new Date(userToUpdate.lastWeeklyReset), { weekStartsOn: 1 })) {
      missionsToUpdate = missionsToUpdate.filter(m => m.category !== 'Mingguan');
      const { missions: newWeekly } = await generateMissions({ level: userToUpdate.level, existingMissionIds: missionsToUpdate.map(m => m.id), count: NUM_WEEKLY, category: 'Mingguan' });
      missionsToUpdate.push(...newWeekly);
      userToUpdate.lastWeeklyReset = now.toISOString();
    }

    // Monthly Reset
    if (!isThisMonth(new Date(userToUpdate.lastMonthlyReset))) {
      missionsToUpdate = missionsToUpdate.filter(m => m.category !== 'Bulanan' || m.type === 'auto'); // Keep auto-complete missions
      const { missions: newMonthly } = await generateMissions({ level: userToUpdate.level, existingMissionIds: missionsToUpdate.map(m => m.id), count: NUM_MONTHLY - staticMissions.length, category: 'Bulanan' });
      missionsToUpdate.push(...newMonthly);
      userToUpdate.lastMonthlyReset = now.toISOString();
    }
    
    const currentMissionIds = new Set(missionsToUpdate.map(m => m.id));
    const staticAutoMissionIds = new Set(staticMissions.filter(m => m.type === 'auto').map(m => m.id));
    userToUpdate.completedMissions = userToUpdate.completedMissions.filter(id => currentMissionIds.has(id) || staticAutoMissionIds.has(id));

    const finalData = { user: userToUpdate, missions: missionsToUpdate };
    
    setUser(finalData.user);
    setMissions(finalData.missions);
    localStorage.setItem('deen-daily-data', JSON.stringify(finalData));
    
    return finalData;
  }, []);

  const loadUserFromStorage = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedDataRaw = localStorage.getItem('deen-daily-data');
      if (storedDataRaw) {
        const storedData = JSON.parse(storedDataRaw);
        if (storedData.user && storedData.missions) {
          await processAndSetUserData(storedData.user, storedData.missions);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error("Gagal memuat sesi:", error);
      localStorage.removeItem('deen-daily-data');
    } finally {
      setIsLoading(false);
    }
  }, [processAndSetUserData]);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && (pathname === '/' || pathname === '/register')) {
        router.push('/missions');
      } else if (!isAuthenticated && pathname !== '/' && pathname !== '/register') {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const generateNewUserMissions = async (level: number): Promise<Mission[]> => {
      const existingIds = staticMissions.map(m => m.id);
      const dailyPromise = generateMissions({ level, existingMissionIds: existingIds, count: NUM_DAILY, category: 'Harian' });
      const weeklyPromise = generateMissions({ level, existingMissionIds: existingIds, count: NUM_WEEKLY, category: 'Mingguan' });
      const monthlyPromise = generateMissions({ level, existingMissionIds: existingIds, count: NUM_MONTHLY - staticMissions.length, category: 'Bulanan' });
      const [dailyResult, weeklyResult, monthlyResult] = await Promise.all([dailyPromise, weeklyPromise, monthlyPromise]);
      return [...staticMissions, ...dailyResult.missions, ...weeklyResult.missions, ...monthlyResult.missions];
  }

  const login = async (name: string) => {
    setIsLoading(true);
    try {
      const storedDataRaw = localStorage.getItem('deen-daily-data');
      if (storedDataRaw) {
          const storedData = JSON.parse(storedDataRaw);
          if (storedData.user && storedData.user.name.toLowerCase() === name.toLowerCase()) {
              await processAndSetUserData(storedData.user, storedData.missions);
              setIsAuthenticated(true);
              toast({
                title: `Selamat Datang Kembali, ${storedData.user.name}!`,
                variant: 'success'
              });
              return;
          }
      }
      toast({
          title: 'Login Gagal',
          description: 'Pengguna tidak ditemukan. Silakan daftar atau periksa kembali nama Anda.',
          variant: 'destructive',
      });
    } catch (error) {
      console.error("Login failed:", error);
      toast({
          title: 'Login Gagal',
          description: 'Terjadi kesalahan. Data mungkin rusak.',
          variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string) => {
    setIsLoading(true);
    try {
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
      const newMissions = await generateNewUserMissions(newUser.level);
      
      setUser(newUser);
      setMissions(newMissions);
      localStorage.setItem('deen-daily-data', JSON.stringify({ user: newUser, missions: newMissions }));
      setIsAuthenticated(true);

      toast({
        title: `Selamat Bergabung, ${name}!`,
        description: 'Akun Anda berhasil dibuat. Selamat memulai perjalanan!',
        variant: 'success'
      });
    } catch(error) {
       console.error("Register failed:", error);
       toast({
          title: 'Pendaftaran Gagal',
          description: 'Terjadi kesalahan saat membuat akun Anda. Coba lagi nanti.',
          variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
    setUser(updatedUser);
    localStorage.setItem('deen-daily-data', JSON.stringify({ user: updatedUser, missions }));
    toast({
        title: 'Profil Diperbarui!',
        description: 'Informasi profil Anda telah berhasil disimpan.',
        variant: 'success'
    });
  };

  const completeMission = async (missionId: string, bonusXp: number = 0, overrideXp?: number) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || user.completedMissions.includes(missionId)) return;

    const xpFromMission = overrideXp !== undefined ? overrideXp : mission.xp;
    const totalXpGained = xpFromMission + bonusXp;
    let leveledUp = false;
    let newXp = user.xp + totalXpGained;
    let newLevel = user.level;
    let newXpToNextLevel = user.xpToNextLevel;

    while (newXp >= newXpToNextLevel) {
      leveledUp = true;
      newXp -= newXpToNextLevel;
      newLevel += 1;
      newXpToNextLevel = newLevel * 150;
    }
    const newTitle = getTitleForLevel(newLevel);
    
    let replacementMission: Mission | null = null;
    if (mission.category === 'Harian') {
      try {
        const { missions: newMissions } = await generateMissions({
            level: newLevel,
            existingMissionIds: missions.map(m => m.id),
            count: 1,
            category: 'Harian'
        });
        if (newMissions && newMissions.length > 0) {
           replacementMission = newMissions[0];
        }
      } catch (error) {
        console.error("Gagal membuat misi pengganti:", error);
      }
    }
    
    const updatedUser: User = {
      ...user,
      xp: newXp,
      level: newLevel,
      xpToNextLevel: newXpToNextLevel,
      title: newTitle,
      completedMissions: [...user.completedMissions, missionId],
    };

    let updatedMissions = [...missions];
    if (replacementMission) {
        const missionIndex = missions.findIndex(m => m.id === missionId);
        if (missionIndex !== -1) {
            updatedMissions[missionIndex] = replacementMission;
        }
    }
        
    setUser(updatedUser);
    setMissions(updatedMissions);
    localStorage.setItem('deen-daily-data', JSON.stringify({ user: updatedUser, missions: updatedMissions }));

    if (leveledUp) {
        toast({
            title: 'Naik Level!',
            description: `Selamat! Anda telah mencapai Level ${newLevel} dan meraih gelar "${newTitle}".`,
            variant: 'success',
        });
    }
  };
  
  const value = { user, missions, isAuthenticated, isLoading, completeMission, login, logout, register, updateUser };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};
