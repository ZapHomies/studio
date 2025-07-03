'use client';

import React, { createContext, useState, ReactNode, useEffect, useCallback, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isToday, isThisWeek, isThisMonth } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase, type User, type Mission, type ForumPost, type ForumComment } from '@/lib/supabaseClient';
import { avatarPool, staticMissions, rewards as allRewards } from '@/lib/data';
import { generateMissions } from '@/ai/flows/generate-missions';

// --- HELPER FUNCTIONS ---

const getTotalXpForLevel = (level: number): number => {
    if (level <= 1) return 0;
    let totalXp = 0;
    for (let i = 2; i <= level; i++) {
        totalXp += (i - 1) * 150;
    }
    return totalXp;
};

const getLevelForXp = (xp: number): number => {
    let level = 1;
    while (true) {
        if (xp < getTotalXpForLevel(level + 1)) {
            return level;
        }
        level++;
        if (level > 1000) return 1000; // Safety cap
    }
};

const getTitleForLevel = (level: number): string => {
  if (level >= 50) return 'Waliyullah Muta\'allim';
  if (level >= 45) return 'Ahli Zikir';
  if (level >= 40) return 'Duta Kebaikan';
  if (level >= 35) return 'Ksatria Subuh';
  if (level >= 30) return 'Penjaga Fajar';
  if (level >= 25) return 'Mutiara Hikmah';
  if (level >= 20) return 'Bintang Hidayah';
  if (level >= 15) return 'Sahabat Al-Quran';
  if (level >= 10) return 'Pencari Ilmu';
  if (level >= 5) return 'Pejuang Iman';
  return 'Muslim Baru';
};


// --- CONTEXT DEFINITION ---

interface UserDataContextType {
  currentUser: User | null;
  missions: Mission[];
  allUsers: User[];
  posts: ForumPost[];
  isAuthenticated: boolean;
  isLoading: boolean;
  completeMission: (missionId: string, bonusXp?: number, overrideXp?: number) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (updatedData: Partial<Pick<User, 'name' | 'avatarUrl'>>) => Promise<void>;
  markWelcomeAsSeen: () => Promise<void>;
  redeemReward: (rewardId: string) => Promise<void>;
  setActiveBorder: (borderId: string | null) => Promise<void>;
  createPost: (title: string, content: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
}

export const UserDataContext = createContext<UserDataContextType>({
  currentUser: null,
  missions: [],
  allUsers: [],
  posts: [],
  isAuthenticated: false,
  isLoading: true,
  completeMission: async () => {},
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  updateUser: async () => {},
  markWelcomeAsSeen: async () => {},
  redeemReward: async () => {},
  setActiveBorder: async () => {},
  createPost: async () => {},
  addComment: async () => {},
});


// --- PROVIDER COMPONENT ---

const NUM_DAILY = 4;
const NUM_WEEKLY = 2;
const NUM_MONTHLY = 2;

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const missions = currentUser?.missions || [];
  const isAuthenticated = !!currentUser;

  // --- DATA FETCHING & SYNC ---

  const fetchForumData = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:authorId(name, avatarUrl), comments(*, author:authorId(name, avatarUrl))')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      toast({ title: 'Gagal Memuat Forum', variant: 'destructive' });
      return;
    }
    setPosts(data as any[] || []);
  }, [toast]);
  
  const fetchAllUsers = useCallback(async () => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('xp', { ascending: false });

    if (error) {
        console.error('Error fetching all users:', error);
    } else {
        setAllUsers(data || []);
    }
  }, []);

  const processUserSession = useCallback(async (user: User): Promise<{ updatedUser: User, needsDbUpdate: boolean }> => {
    let userToUpdate = { ...user };
    let missionsToUpdate = [...(user.missions || [])];
    let needsDbUpdate = false;
    const now = new Date();

    if (!isToday(new Date(userToUpdate.lastDailyReset))) {
        missionsToUpdate = missionsToUpdate.filter(m => m.category !== 'Harian');
        const { missions: newDaily } = await generateMissions({ level: userToUpdate.level, existingMissionIds: missionsToUpdate.map(m => m.id), count: NUM_DAILY, category: 'Harian' });
        missionsToUpdate.push(...newDaily);
        userToUpdate.lastDailyReset = now.toISOString();
        needsDbUpdate = true;
    }
    if (!isThisWeek(new Date(userToUpdate.lastWeeklyReset), { weekStartsOn: 1 })) {
        missionsToUpdate = missionsToUpdate.filter(m => m.category !== 'Mingguan');
        const { missions: newWeekly } = await generateMissions({ level: userToUpdate.level, existingMissionIds: missionsToUpdate.map(m => m.id), count: NUM_WEEKLY, category: 'Mingguan' });
        missionsToUpdate.push(...newWeekly);
        userToUpdate.lastWeeklyReset = now.toISOString();
        needsDbUpdate = true;
    }
    if (!isThisMonth(new Date(userToUpdate.lastMonthlyReset))) {
        missionsToUpdate = missionsToUpdate.filter(m => m.category !== 'Bulanan' || m.type === 'auto');
        const staticAutoMissionIds = new Set(staticMissions.filter(m => m.type === 'auto').map(m => m.id));
        const currentMissionIds = new Set(missionsToUpdate.map(m => m.id));
        userToUpdate.completedMissions = userToUpdate.completedMissions.filter(id => currentMissionIds.has(id) || staticAutoMissionIds.has(id));
        const { missions: newMonthly } = await generateMissions({ level: userToUpdate.level, existingMissionIds: missionsToUpdate.map(m => m.id), count: NUM_MONTHLY - staticMissions.length, category: 'Bulanan' });
        missionsToUpdate.push(...newMonthly);
        userToUpdate.lastMonthlyReset = now.toISOString();
        needsDbUpdate = true;
    }
    
    userToUpdate.missions = missionsToUpdate;
    return { updatedUser: userToUpdate, needsDbUpdate };
  }, []);
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoading(true);
      if (!session) {
        setCurrentUser(null);
        setAllUsers([]);
        setPosts([]);
        router.push('/');
        setIsLoading(false);
        return;
      }

      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error || !userProfile) {
        console.error('Error fetching user profile or profile not found:', error);
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }
      
      const { updatedUser, needsDbUpdate } = await processUserSession(userProfile);
      
      if (needsDbUpdate) {
        const { data: finalUser, error: updateError } = await supabase
            .from('users')
            .update({
                missions: updatedUser.missions,
                lastDailyReset: updatedUser.lastDailyReset,
                lastWeeklyReset: updatedUser.lastWeeklyReset,
                lastMonthlyReset: updatedUser.lastMonthlyReset,
                completedMissions: updatedUser.completedMissions
            })
            .eq('id', updatedUser.id)
            .select()
            .single();
        
        if (updateError) {
            console.error("Error saving session updates to DB:", updateError);
            setCurrentUser(updatedUser); // use optimistically
        } else {
            setCurrentUser(finalUser);
        }
      } else {
        setCurrentUser(updatedUser);
      }
      
      // Fetch global data in parallel
      await Promise.all([fetchForumData(), fetchAllUsers()]);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router, fetchForumData, fetchAllUsers, processUserSession]);
  
  // --- AUTHENTICATION & ROUTING ---

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
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
        toast({ title: 'Pendaftaran Gagal', description: authError.message, variant: 'destructive' });
        setIsLoading(false);
        return;
    }

    if (!authData.user) {
        toast({ title: 'Pendaftaran Gagal', description: 'Gagal membuat pengguna.', variant: 'destructive' });
        setIsLoading(false);
        return;
    }

    try {
      const now = new Date();
      const initialMissions = await generateMissions({ level: 1, existingMissionIds: [], count: NUM_DAILY + NUM_WEEKLY + NUM_MONTHLY, category: 'Harian' }); // simplified for now
      
      const newUserProfile: Omit<User, 'email'> & { id: string, email: string } = {
        id: authData.user.id,
        name,
        email: authData.user.email!,
        avatarUrl: avatarPool[Math.floor(Math.random() * avatarPool.length)].url,
        level: 1,
        xp: 0,
        xpToNextLevel: getTotalXpForLevel(2),
        coins: 100,
        title: getTitleForLevel(1),
        completedMissions: [],
        lastDailyReset: now.toISOString(),
        lastWeeklyReset: now.toISOString(),
        lastMonthlyReset: now.toISOString(),
        hasSeenWelcome: false,
        unlockedRewardIds: ['border-welcome'],
        activeBorderId: 'border-welcome',
        missions: [...staticMissions, ...initialMissions.missions],
      };

      const { error: insertError } = await supabase.from('users').insert(newUserProfile);

      if (insertError) {
        throw insertError;
      }
      
      // setCurrentUser will be handled by onAuthStateChange
      toast({ title: `Selamat Bergabung, ${name}!`, description: 'Akun Anda berhasil dibuat. Hadiah gratis telah ditambahkan!', variant: 'success' });
    
    } catch (error: any) {
        console.error("Register failed:", error);
        toast({ title: 'Pendaftaran Gagal', description: 'Gagal menyimpan profil Anda. ' + error.message, variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: 'Login Gagal', description: error.message, variant: 'destructive' });
    }
    // No need to set user, onAuthStateChange will handle it.
    setIsLoading(false);
  };
  
  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setCurrentUser(null);
    setPosts([]);
    setAllUsers([]);
    setIsLoading(false);
  };

  // --- USER ACTIONS ---

  const completeMission = async (missionId: string, bonusXp = 0, overrideXp?: number) => {
    if (!currentUser) return;

    const mission = missions.find((m) => m.id === missionId);
    if (!mission || currentUser.completedMissions.includes(missionId)) return;

    const xpFromMission = overrideXp !== undefined ? overrideXp : mission.xp;
    const coinsFromMission = mission.coins || 0;
    const totalXpGained = xpFromMission + bonusXp;

    const newXp = currentUser.xp + totalXpGained;
    const newCoins = (currentUser.coins || 0) + coinsFromMission;
    const oldLevel = currentUser.level;
    const newLevel = getLevelForXp(newXp);
    const leveledUp = newLevel > oldLevel;

    const updatedCompletedMissions = [...currentUser.completedMissions, missionId];
    let updatedMissions = [...currentUser.missions];

    if (mission.category === 'Harian') {
        updatedMissions = updatedMissions.filter(m => m.id !== missionId);
        // Regenerate one mission to replace
        try {
            const { missions: newMissions } = await generateMissions({
                level: newLevel,
                existingMissionIds: updatedMissions.map(m => m.id),
                count: 1,
                category: 'Harian'
            });
            if (newMissions && newMissions.length > 0) {
                updatedMissions.push(...newMissions);
            }
        } catch (error) {
            console.error("Gagal membuat misi pengganti:", error);
        }
    }

    const updatedUser = {
      ...currentUser,
      xp: newXp,
      level: newLevel,
      xpToNextLevel: getTotalXpForLevel(newLevel + 1),
      coins: newCoins,
      title: getTitleForLevel(newLevel),
      completedMissions: updatedCompletedMissions,
      missions: updatedMissions,
    };

    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

    const { error } = await supabase.from('users').update({
        xp: updatedUser.xp,
        level: updatedUser.level,
        xpToNextLevel: updatedUser.xpToNextLevel,
        coins: updatedUser.coins,
        title: updatedUser.title,
        completedMissions: updatedUser.completedMissions,
        missions: updatedUser.missions,
    }).eq('id', currentUser.id);

    if (error) {
        toast({ title: "Gagal Menyimpan Progres", description: "Progres Anda mungkin tidak tersimpan.", variant: 'destructive' });
        console.error(error);
        // Optionally revert state
    }

    if (leveledUp) {
        toast({
            title: 'Naik Level!',
            description: `Selamat! Anda telah mencapai Level ${newLevel} dan meraih gelar "${getTitleForLevel(newLevel)}".`,
            variant: 'success',
        });
    }
  };

  const updateUser = async (updatedData: Partial<Pick<User, 'name' | 'avatarUrl'>>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    setAllUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));

    const { error } = await supabase.from('users').update(updatedData).eq('id', currentUser.id);
    if (error) {
        toast({ title: 'Gagal Memperbarui Profil', variant: 'destructive' });
        // Revert state
        setCurrentUser(currentUser);
        setAllUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? currentUser : u));
    } else {
        toast({ title: 'Profil Diperbarui!', variant: 'success' });
    }
  };

  const markWelcomeAsSeen = async () => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, hasSeenWelcome: true };
    setCurrentUser(updatedUser);
    await supabase.from('users').update({ hasSeenWelcome: true }).eq('id', currentUser.id);
  };
  
  const redeemReward = async (rewardId: string) => {
      if (!currentUser) return;
      const reward = allRewards.find(r => r.id === rewardId);
      if (!reward || (currentUser.coins || 0) < reward.cost || currentUser.unlockedRewardIds.includes(rewardId)) {
        toast({ title: 'Penukaran Gagal', description: 'Koin tidak cukup atau hadiah sudah dimiliki.', variant: 'destructive' });
        return;
      }
      
      const updatedUser = {
          ...currentUser,
          coins: (currentUser.coins || 0) - reward.cost,
          unlockedRewardIds: [...currentUser.unlockedRewardIds, rewardId],
      };
      
      setCurrentUser(updatedUser);
      const { error } = await supabase.from('users').update({ coins: updatedUser.coins, unlockedRewardIds: updatedUser.unlockedRewardIds }).eq('id', currentUser.id);

      if (error) {
        toast({ title: 'Gagal Menyimpan', variant: 'destructive' });
        setCurrentUser(currentUser); // Revert
      } else {
        toast({ title: 'Hadiah Berhasil Ditukar!', description: `Anda membuka "${reward.name}".`, variant: 'success' });
      }
  };

  const setActiveBorder = async (borderId: string | null) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, activeBorderId: borderId };
    setCurrentUser(updatedUser);
    const { error } = await supabase.from('users').update({ activeBorderId: borderId }).eq('id', currentUser.id);
     if (error) {
        toast({ title: 'Gagal Mengatur Bingkai', variant: 'destructive' });
        setCurrentUser(currentUser); // Revert
     }
  };

  // --- FORUM ACTIONS ---

  const createPost = async (title: string, content: string) => {
    if (!currentUser) return;
    
    const newPostData = {
        authorId: currentUser.id,
        title,
        content,
    };
    
    const { data, error } = await supabase.from('posts').insert(newPostData).select().single();

    if (error) {
        toast({ title: 'Gagal Membuat Postingan', variant: 'destructive' });
        console.error(error);
        return;
    }
    
    const postWithAuthor = { ...data, author: { name: currentUser.name, avatarUrl: currentUser.avatarUrl }, comments: [] };
    setPosts(prevPosts => [postWithAuthor, ...prevPosts] as any);
    toast({ title: 'Postingan Dibuat!', variant: 'success' });
  };
  
  const addComment = async (postId: string, content: string) => {
    if (!currentUser) return;

    const newCommentData = {
        authorId: currentUser.id,
        postId,
        content,
    };

    const { data, error } = await supabase.from('comments').insert(newCommentData).select().single();

    if (error) {
        toast({ title: 'Gagal Menambah Komentar', variant: 'destructive' });
        console.error(error);
        return;
    }

    const commentWithAuthor = { ...data, author: { name: currentUser.name, avatarUrl: currentUser.avatarUrl } };

    setPosts(prevPosts =>
        prevPosts.map(post =>
            post.id === postId
                ? { ...post, comments: [...post.comments, commentWithAuthor] }
                : post
        ) as any
    );
  };
  
  // --- CONTEXT VALUE ---
  
  const value = { currentUser, missions, allUsers, posts, isAuthenticated, isLoading, completeMission, login, logout, register, updateUser, markWelcomeAsSeen, redeemReward, setActiveBorder, createPost, addComment };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
};
