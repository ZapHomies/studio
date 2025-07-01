
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
  completeMission: async () => {},
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

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(initialUser);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Effect to persist state to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      localStorage.setItem('deen-daily-data', JSON.stringify({ user, missions }));
    }
  }, [user, missions, isLoading, isAuthenticated]);
  
  const saveData = useCallback((userToSave: User, missionsToSave: Mission[]) => {
      setUser(userToSave);
      setMissions(missionsToSave);
  }, []);

  useEffect(() => {
    const loadAndResetData = async () => {
        setIsLoading(true);
        const storedDataRaw = localStorage.getItem('deen-daily-data');
        let loadedUser: User | null = null;
        let loadedMissions: Mission[] = [];

        if (storedDataRaw) {
            try {
                const storedData = JSON.parse(storedDataRaw);
                if (storedData.user && storedData.missions) {
                    loadedUser = storedData.user;
                    loadedMissions = storedData.missions;
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error("Gagal mem-parsing data pengguna dari localStorage", error);
                localStorage.removeItem('deen-daily-data');
            }
        }
        
        if (loadedUser) {
            const now = new Date();
            let userToUpdate = { ...loadedUser };
            let missionsToUpdate = [...loadedMissions];
            
            const existingMissionIds = missionsToUpdate.map(m => m.id);

            // Daily Reset
            if (!isToday(new Date(userToUpdate.lastDailyReset))) {
                const oldDailyIds = missionsToUpdate.filter(m => m.category === 'Harian').map(m => m.id);
                userToUpdate.completedMissions = userToUpdate.completedMissions.filter(id => !oldDailyIds.includes(id));
                missionsToUpdate = missionsToUpdate.filter(m => m.category !== 'Harian');
                const { missions: newDaily } = await generateMissions({ level: userToUpdate.level, existingMissionIds, count: NUM_DAILY, category: 'Harian'});
                missionsToUpdate.push(...newDaily);
                userToUpdate.lastDailyReset = now.toISOString();
            }

            // Weekly Reset
            if (!isThisWeek(new Date(userToUpdate.lastWeeklyReset), { weekStartsOn: 1 })) {
                const oldWeeklyIds = missionsToUpdate.filter(m => m.category === 'Mingguan').map(m => m.id);
                userToUpdate.completedMissions = userToUpdate.completedMissions.filter(id => !oldWeeklyIds.includes(id));
                missionsToUpdate = missionsToUpdate.filter(m => m.category !== 'Mingguan');
                const { missions: newWeekly } = await generateMissions({ level: userToUpdate.level, existingMissionIds, count: NUM_WEEKLY, category: 'Mingguan'});
                missionsToUpdate.push(...newWeekly);
                userToUpdate.lastWeeklyReset = now.toISOString();
            }

            // Monthly Reset
            if (!isThisMonth(new Date(userToUpdate.lastMonthlyReset))) {
                const oldMonthlyIds = missionsToUpdate.filter(m => m.category === 'Bulanan' && m.type !== 'auto').map(m => m.id);
                userToUpdate.completedMissions = userToUpdate.completedMissions.filter(id => !oldMonthlyIds.includes(id));
                missionsToUpdate = missionsToUpdate.filter(m => m.category !== 'Bulanan' || m.type === 'auto');
                const { missions: newMonthly } = await generateMissions({ level: userToUpdate.level, existingMissionIds, count: NUM_MONTHLY - staticMissions.length, category: 'Bulanan'});
                missionsToUpdate.push(...newMonthly);
                userToUpdate.lastMonthlyReset = now.toISOString();
            }
            
            setUser(userToUpdate);
            setMissions(missionsToUpdate);
        }
        setIsLoading(false);
    };
    
    // Only run the complex data loading/reset logic if not on login/register pages
    // and not already authenticated in the current session.
    if (!isAuthenticated && pathname !== '/' && pathname !== '/register') {
      loadAndResetData();
    } else {
      setIsLoading(false);
    }
  }, [saveData, pathname, isAuthenticated]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/register' && pathname !== '/') {
      router.push('/');
    }
    if (!isLoading && isAuthenticated && (pathname === '/' || pathname === '/register')) {
      router.push('/missions');
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

  const login = (name: string) => {
    const storedDataRaw = localStorage.getItem('deen-daily-data');
    if (storedDataRaw) {
        try {
            const storedData = JSON.parse(storedDataRaw);
            if (storedData.user && storedData.user.name.toLowerCase() === name.toLowerCase()) {
                // Load data into state and set authenticated
                setUser(storedData.user);
                setMissions(storedData.missions || []);
                setIsAuthenticated(true);
                // The routing useEffect will handle the redirect. No reload needed.
                return;
            }
        } catch (error) {
            console.error("Gagal login, data rusak", error);
        }
    }
    toast({
        title: 'Login Gagal',
        description: 'Pengguna tidak ditemukan. Silakan daftar atau periksa kembali nama Anda.',
        variant: 'destructive',
    });
  };

  const register = async (name: string) => {
    setIsLoading(true);
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
    saveData(newUser, newMissions);
    setIsAuthenticated(true);
    setIsLoading(false);
    // Routing useEffect will handle the redirect.
  };
  
  const logout = () => {
    localStorage.removeItem('deen-daily-data');
    setUser(initialUser);
    setMissions([]);
    setIsAuthenticated(false);
    router.push('/');
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser(currentUser => ({ ...currentUser, ...updatedData }));
    toast({
        title: 'Profil Diperbarui!',
        description: 'Informasi profil Anda telah berhasil disimpan.',
        variant: 'success'
    });
  };

  const completeMission = async (missionId: string, bonusXp: number = 0, overrideXp?: number) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || user.completedMissions.includes(missionId)) return;

    // --- Part 1: Calculate new state ahead of time ---
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
    
    const updatedUser: User = {
      ...user,
      xp: newXp,
      level: newLevel,
      xpToNextLevel: newXpToNextLevel,
      title: newTitle,
      completedMissions: [...user.completedMissions, missionId],
    };

    let updatedMissions = [...missions];

    // --- Part 2: Fetch replacement mission if needed ---
    if (mission.category === 'Harian') {
      const currentMissionIds = missions.map(m => m.id).filter(id => id !== missionId);
      try {
        const { missions: newMissions } = await generateMissions({
            level: updatedUser.level,
            existingMissionIds: currentMissionIds,
            count: 1,
            category: 'Harian'
        });
        
        if (newMissions && newMissions.length > 0) {
            const missionIndex = updatedMissions.findIndex(m => m.id === missionId);
            if (missionIndex !== -1) {
                updatedMissions[missionIndex] = newMissions[0];
            } else {
                // Failsafe: if the mission somehow wasn't found, add the new one anyway
                updatedMissions.push(newMissions[0]);
            }
        }
      } catch (error) {
        console.error("Gagal membuat misi pengganti:", error);
      }
    }
    
    // --- Part 3: Set all state together ---
    saveData(updatedUser, updatedMissions);

    // --- Part 4: Show level up toast if needed ---
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
