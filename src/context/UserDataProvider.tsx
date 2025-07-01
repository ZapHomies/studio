'use client';

import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { type User, type Mission } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { avatarPool, staticMissions } from '@/lib/data';
import { useRouter, usePathname } from 'next/navigation';
import { isToday, isThisWeek, isThisMonth } from 'date-fns';
import { generateMissions } from '@/ai/flows/generate-missions';

const USERS_DB_KEY = 'muslim-mission-users-db';
const SESSION_KEY = 'muslim-mission-session-id';

interface UserDataContextType {
  currentUser: User | null;
  missions: Mission[];
  allUsers: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  completeMission: (missionId: string, bonusXp?: number, overrideXp?: number) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (updatedData: Partial<Pick<User, 'name' | 'avatarUrl'>>) => void;
}

const NUM_DAILY = 4;
const NUM_WEEKLY = 2;
const NUM_MONTHLY = 2;

export const UserDataContext = createContext<UserDataContextType>({
  currentUser: null,
  missions: [],
  allUsers: [],
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const loadDataFromStorage = useCallback((): { users: User[], missions: Mission[] } => {
    try {
      if (typeof window === 'undefined') return { users: [], missions: [] };
      const storedData = localStorage.getItem(USERS_DB_KEY);
      return storedData ? JSON.parse(storedData) : { users: [], missions: [] };
    } catch (e) {
      console.error("Gagal mem-parse data dari localStorage", e);
      return { users: [], missions: [] };
    }
  }, []);

  const saveDataToStorage = useCallback((users: User[], missions: Mission[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_DB_KEY, JSON.stringify({ users, missions }));
  }, []);

  const generateNewUserMissions = async (level: number): Promise<Mission[]> => {
      const existingIds = staticMissions.map(m => m.id);
      const dailyPromise = generateMissions({ level, existingMissionIds: existingIds, count: NUM_DAILY, category: 'Harian' });
      const weeklyPromise = generateMissions({ level, existingMissionIds: existingIds, count: NUM_WEEKLY, category: 'Mingguan' });
      const monthlyPromise = generateMissions({ level, existingMissionIds: existingIds, count: NUM_MONTHLY - staticMissions.length, category: 'Bulanan' });
      const [dailyResult, weeklyResult, monthlyResult] = await Promise.all([dailyPromise, weeklyPromise, monthlyPromise]);
      return [...staticMissions, ...dailyResult.missions, ...weeklyResult.missions, ...monthlyResult.missions];
  };

  const processUserSession = useCallback(async (user: User, currentMissions: Mission[], allUsers: User[]): Promise<{ updatedUser: User, updatedMissions: Mission[] }> => {
    const now = new Date();
    let userToUpdate = { ...user };
    let missionsToUpdate = [...currentMissions];

    let missionsHaveChanged = false;

    if (!isToday(new Date(userToUpdate.lastDailyReset))) {
      missionsToUpdate = missionsToUpdate.filter(m => m.category !== 'Harian');
      const { missions: newDaily } = await generateMissions({ level: userToUpdate.level, existingMissionIds: missionsToUpdate.map(m => m.id), count: NUM_DAILY, category: 'Harian' });
      missionsToUpdate.push(...newDaily);
      userToUpdate.lastDailyReset = now.toISOString();
      missionsHaveChanged = true;
    }

    if (!isThisWeek(new Date(userToUpdate.lastWeeklyReset), { weekStartsOn: 1 })) {
      missionsToUpdate = missionsToUpdate.filter(m => m.category !== 'Mingguan');
      const { missions: newWeekly } = await generateMissions({ level: userToUpdate.level, existingMissionIds: missionsToUpdate.map(m => m.id), count: NUM_WEEKLY, category: 'Mingguan' });
      missionsToUpdate.push(...newWeekly);
      userToUpdate.lastWeeklyReset = now.toISOString();
      missionsHaveChanged = true;
    }

    if (!isThisMonth(new Date(userToUpdate.lastMonthlyReset))) {
      missionsToUpdate = missionsToUpdate.filter(m => m.category !== 'Bulanan' || m.type === 'auto');
      const { missions: newMonthly } = await generateMissions({ level: userToUpdate.level, existingMissionIds: missionsToUpdate.map(m => m.id), count: NUM_MONTHLY - staticMissions.length, category: 'Bulanan' });
      missionsToUpdate.push(...newMonthly);
      userToUpdate.lastMonthlyReset = now.toISOString();
      missionsHaveChanged = true;
    }
    
    if (missionsHaveChanged) {
        const currentMissionIds = new Set(missionsToUpdate.map(m => m.id));
        const staticAutoMissionIds = new Set(staticMissions.filter(m => m.type === 'auto').map(m => m.id));
        userToUpdate.completedMissions = userToUpdate.completedMissions.filter(id => currentMissionIds.has(id) || staticAutoMissionIds.has(id));
    }
    
    const updatedUsers = allUsers.map(u => u.id === userToUpdate.id ? userToUpdate : u);
    setAllUsers(updatedUsers);
    setCurrentUser(userToUpdate);
    setMissions(missionsToUpdate);
    saveDataToStorage(updatedUsers, missionsToUpdate);
    
    return { updatedUser: userToUpdate, updatedMissions: missionsToUpdate };
  }, [saveDataToStorage]);

  const rehydrateSession = useCallback(async () => {
    setIsLoading(true);
    const { users, missions: storedMissions } = loadDataFromStorage();
    const sessionId = typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_KEY) : null;

    if (sessionId && users.length > 0) {
      const userFromSession = users.find(u => u.id === sessionId);
      if (userFromSession) {
        await processUserSession(userFromSession, storedMissions, users);
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
    setAllUsers(users);
    setMissions(storedMissions.length > 0 ? storedMissions : staticMissions);
    setIsLoading(false);
  }, [loadDataFromStorage, processUserSession]);

  useEffect(() => {
    rehydrateSession();
  }, [rehydrateSession]);
  
  const isAuthenticated = !!currentUser;

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && (pathname === '/' || pathname === '/register')) {
        router.push('/missions');
      } else if (!isAuthenticated && pathname !== '/' && pathname !== '/register') {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    const { users, missions: storedMissions } = loadDataFromStorage();
    
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        toast({ title: 'Pendaftaran Gagal', description: 'Email ini sudah terdaftar.', variant: 'destructive' });
        setIsLoading(false);
        return;
    }

    try {
        const now = new Date();
        const newUser: User = { 
            id: email.toLowerCase(),
            name,
            email: email.toLowerCase(),
            password, // Di aplikasi nyata, HASH PASSWORD INI!
            avatarUrl: avatarPool[Math.floor(Math.random() * avatarPool.length)].url,
            level: 1,
            xp: 0,
            xpToNextLevel: 150,
            title: getTitleForLevel(1),
            completedMissions: [],
            lastDailyReset: now.toISOString(),
            lastWeeklyReset: now.toISOString(),
            lastMonthlyReset: now.toISOString(),
        };

        const newMissions = storedMissions.length > 0 ? storedMissions : await generateNewUserMissions(1);
        const newUsers = [...users, newUser];

        setCurrentUser(newUser);
        setMissions(newMissions);
        setAllUsers(newUsers);
        saveDataToStorage(newUsers, newMissions);
        if (typeof window !== 'undefined') sessionStorage.setItem(SESSION_KEY, newUser.id);
        
        toast({ title: `Selamat Bergabung, ${name}!`, description: 'Akun Anda berhasil dibuat.', variant: 'success' });
    } catch(error) {
       console.error("Register failed:", error);
       toast({ title: 'Pendaftaran Gagal', description: 'Terjadi kesalahan saat membuat akun.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { users, missions: storedMissions } = loadDataFromStorage();
    const userToLogin = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (userToLogin && userToLogin.password === password) {
      await processUserSession(userToLogin, storedMissions, users);
      if (typeof window !== 'undefined') sessionStorage.setItem(SESSION_KEY, userToLogin.id);
      toast({ title: `Selamat Datang Kembali, ${userToLogin.name}!`, variant: 'success' });
    } else {
      toast({ title: 'Login Gagal', description: 'Email atau password salah.', variant: 'destructive' });
    }
    setIsLoading(false);
  };
  
  const logout = () => {
    if (typeof window !== 'undefined') sessionStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    router.push('/');
  };

  const updateUser = (updatedData: Partial<Pick<User, 'name' | 'avatarUrl'>>) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...updatedData };
    const updatedUsers = allUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
    
    setCurrentUser(updatedUser);
    setAllUsers(updatedUsers);
    saveDataToStorage(updatedUsers, missions);

    toast({ title: 'Profil Diperbarui!', variant: 'success' });
  };

  const completeMission = async (missionId: string, bonusXp: number = 0, overrideXp?: number) => {
    if (!currentUser) return;
    
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || currentUser.completedMissions.includes(missionId)) return;

    const xpFromMission = overrideXp !== undefined ? overrideXp : mission.xp;
    const totalXpGained = xpFromMission + bonusXp;
    let leveledUp = false;
    let newXp = currentUser.xp + totalXpGained;
    let newLevel = currentUser.level;
    let newXpToNextLevel = currentUser.xpToNextLevel;

    while (newXp >= newXpToNextLevel) {
      leveledUp = true;
      newXp -= newXpToNextLevel;
      newLevel += 1;
      newXpToNextLevel = newLevel * 150;
    }
    
    const updatedUser: User = {
      ...currentUser,
      xp: newXp,
      level: newLevel,
      xpToNextLevel: newXpToNextLevel,
      title: getTitleForLevel(newLevel),
      completedMissions: [...currentUser.completedMissions, missionId],
    };

    let updatedMissions = [...missions];
    if (mission.category === 'Harian') {
      try {
        const { missions: newMissions } = await generateMissions({
            level: newLevel,
            existingMissionIds: missions.map(m => m.id),
            count: 1,
            category: 'Harian'
        });
        if (newMissions && newMissions.length > 0) {
           const missionIndex = updatedMissions.findIndex(m => m.id === missionId);
           if (missionIndex !== -1) {
               updatedMissions[missionIndex] = newMissions[0];
           }
        }
      } catch (error) { console.error("Gagal membuat misi pengganti:", error); }
    }
    
    const updatedUsers = allUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
    
    setCurrentUser(updatedUser);
    setMissions(updatedMissions);
    setAllUsers(updatedUsers);
    saveDataToStorage(updatedUsers, updatedMissions);

    if (leveledUp) {
        toast({
            title: 'Naik Level!',
            description: `Selamat! Anda telah mencapai Level ${newLevel} dan meraih gelar "${getTitleForLevel(newLevel)}".`,
            variant: 'success',
        });
    }
  };
  
  const value = { currentUser, missions, allUsers, isAuthenticated, isLoading, completeMission, login, logout, register, updateUser };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
};
