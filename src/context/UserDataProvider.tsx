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

const generateNewUserMissions = async (level: number): Promise<Mission[]> => {
    try {
      const existingIds = staticMissions.map(m => m.id);
      
      const dailyPromise = generateMissions({ level, existingMissionIds: existingIds, count: NUM_DAILY, category: 'Harian' });
      const weeklyPromise = generateMissions({ level, existingMissionIds: existingIds, count: NUM_WEEKLY, category: 'Mingguan' });
      const monthlyPromise = generateMissions({ level, existingMissionIds: existingIds, count: NUM_MONTHLY - staticMissions.length, category: 'Bulanan' });
      
      const [dailyResult, weeklyResult, monthlyResult] = await Promise.all([dailyPromise, weeklyPromise, monthlyPromise]);
      
      const combinedMissions = [...staticMissions, ...dailyResult.missions, ...weeklyResult.missions, ...monthlyResult.missions];
      
      return combinedMissions;
    } catch (error) {
      console.error("Failed to generate initial missions, returning only static ones.", error);
      return staticMissions; // Fallback
    }
};

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
    // Step 1: Fetch all posts and join with author info
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*, author:authorId(name, avatarUrl)')
      .order('timestamp', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      toast({ 
        title: 'Gagal Memuat Postingan Forum', 
        variant: 'destructive', 
        description: postsError.message 
      });
      return;
    }

    if (!postsData) {
      setPosts([]);
      return;
    }

    // Step 2: Fetch all comments
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .order('timestamp', { ascending: true });
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      toast({ 
        title: 'Gagal Memuat Komentar Forum', 
        variant: 'destructive', 
        description: commentsError.message 
      });
      // Still show posts even if comments fail to load
      const postsWithoutComments = postsData.map(post => ({ ...post, comments: [] }));
      setPosts(postsWithoutComments as any[] || []);
      return;
    }

    // Step 3: Combine posts and comments in the client
    const postsWithComments = postsData.map(post => {
      const postComments = (commentsData || []).filter(comment => comment.postId === post.id);
      return {
        ...post,
        comments: postComments,
      };
    });

    setPosts(postsWithComments as any[] || []);
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
    let needsDbUpdate = false;
    const now = new Date();

    // Sanitize nullable arrays to prevent downstream errors.
    if (!userToUpdate.missions) userToUpdate.missions = [];
    if (!userToUpdate.completedMissions) userToUpdate.completedMissions = [];
    if (!userToUpdate.unlockedRewardIds) userToUpdate.unlockedRewardIds = [];
    
    let missionsToUpdate = [...userToUpdate.missions];

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
        if (pathname !== '/' && pathname !== '/register') {
            router.push('/');
        }
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
        if (event !== 'SIGNED_IN' && event !== 'INITIAL_SESSION') {
            await supabase.auth.signOut();
        }
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
      
      await Promise.all([fetchAllUsers(), fetchForumData()]);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router, fetchForumData, fetchAllUsers, processUserSession, pathname]);
  
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
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }
      if (!authData.user) {
        throw new Error('Pendaftaran berhasil tetapi tidak ada data pengguna yang dikembalikan.');
      }

      // Langkah 1: Buat profil minimal untuk membuat koneksi.
      const minimalProfileData = { id: authData.user.id, name, email };
      const { error: insertError } = await supabase
        .from('users')
        .insert(minimalProfileData);

      if (insertError) {
        console.error("Supabase insert error object:", insertError);
        const errorMessage = insertError.message || "Gagal membuat profil. Pastikan tabel 'users' ada di database Supabase Anda dan kebijakan RLS (jika aktif) mengizinkan penyisipan oleh pengguna baru.";
        throw new Error(errorMessage);
      }
      
      // Langkah 2: Perbarui profil dengan semua data lengkap.
      const initialMissions = await generateNewUserMissions(1);
      const now = new Date();
      const fullProfileData = {
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
        missions: initialMissions,
      };
      
      const { error: updateError } = await supabase
        .from('users')
        .update(fullProfileData)
        .eq('id', authData.user.id);
      
      if (updateError) {
        // Ini tidak kritis, pengguna sudah dibuat. Kita bisa catat errornya.
        console.error("Gagal memperbarui profil dengan data lengkap:", updateError.message);
        toast({ title: 'Pendaftaran Berhasil', description: 'Namun, terjadi sedikit masalah saat menyiapkan profil lengkap Anda.', variant: 'default' });
      } else {
        toast({ title: `Selamat Bergabung, ${name}!`, description: 'Akun Anda berhasil dibuat. Silakan periksa email Anda untuk verifikasi jika diperlukan.', variant: 'success' });
      }

    } catch (error: any) {
      console.error("Register failed:", error);
      if (error.message && error.message.toLowerCase().includes('user already registered')) {
        toast({
          title: 'Email Sudah Terdaftar',
          description: 'Email ini sudah digunakan. Silakan coba login atau gunakan email lain.',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Pendaftaran Gagal', description: error.message, variant: 'destructive' });
      }
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
    setIsLoading(false);
  };
  
  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setCurrentUser(null);
    setPosts([]);
    setAllUsers([]);
    router.push('/');
    setIsLoading(false);
  };

  const completeMission = async (missionId: string, bonusXp = 0, overrideXp?: number) => {
    if (!currentUser) return;

    const mission = currentUser.missions.find((m) => m.id === missionId);
    if (!mission || currentUser.completedMissions.includes(missionId)) return;

    // --- Instantly update UI for responsiveness ---
    const xpFromMission = overrideXp !== undefined ? overrideXp : mission.xp;
    const coinsFromMission = mission.coins || 0;
    const totalXpGained = xpFromMission + bonusXp;

    const newXp = currentUser.xp + totalXpGained;
    const newCoins = (currentUser.coins || 0) + coinsFromMission;
    const oldLevel = currentUser.level;
    const newLevel = getLevelForXp(newXp);
    const leveledUp = newLevel > oldLevel;

    // Create a new array for completed missions and filter out the completed mission from the user's mission list.
    const updatedCompletedMissions = [...currentUser.completedMissions, missionId];
    const newMissionsList = currentUser.missions.filter(m => m.id !== missionId);
    
    // Create an optimistic user object for immediate state update.
    const optimisticUserUpdate = {
        ...currentUser,
        xp: newXp,
        coins: newCoins,
        level: newLevel,
        title: getTitleForLevel(newLevel),
        xpToNextLevel: getTotalXpForLevel(newLevel + 1),
        completedMissions: updatedCompletedMissions,
        missions: newMissionsList,
    };

    // Apply the optimistic update to the current user state.
    setCurrentUser(optimisticUserUpdate);
    // Also update the user in the allUsers list for leaderboards etc.
    setAllUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? optimisticUserUpdate : u));
    
    // --- Asynchronously handle DB updates and new mission generation ---
    (async () => {
        let finalMissionsList = newMissionsList;
        // If it's a daily mission, generate a replacement.
        if (mission.category === 'Harian') {
            try {
                const { missions: newMissions } = await generateMissions({
                    level: newLevel,
                    existingMissionIds: newMissionsList.map(m => m.id),
                    count: 1,
                    category: 'Harian'
                });
                if (newMissions && newMissions.length > 0) {
                    finalMissionsList = [...newMissionsList, ...newMissions];
                }
            } catch (error) {
                console.error("Gagal membuat misi pengganti:", error);
                // The mission is already removed from the UI, so we just log the error.
            }
        }

        // Prepare the final payload for the database.
        const dbUpdatePayload = {
            xp: newXp,
            coins: newCoins,
            level: newLevel,
            title: getTitleForLevel(newLevel),
            xpToNextLevel: getTotalXpForLevel(newLevel + 1),
            completedMissions: updatedCompletedMissions,
            missions: finalMissionsList,
        };
        
        // Update the user state again with the potentially new mission list
        setCurrentUser(prev => prev ? { ...prev, ...dbUpdatePayload } : null);

        // Update the database.
        const { error } = await supabase.from('users').update(dbUpdatePayload).eq('id', currentUser.id);

        if (error) {
            toast({ title: "Gagal Menyimpan Progres", description: "Progres Anda mungkin tidak tersimpan.", variant: 'destructive' });
            console.error(error);
            // Consider reverting the state or notifying the user more strongly.
        }
    })();


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
        setCurrentUser(currentUser);
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
        setCurrentUser(currentUser);
     }
  };

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
  
  const value = { currentUser, missions, allUsers, posts, isAuthenticated, isLoading, completeMission, login, logout, register, updateUser, markWelcomeAsSeen, redeemReward, setActiveBorder, createPost, addComment };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
};
