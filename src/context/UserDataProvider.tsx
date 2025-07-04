'use client';

import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
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

// Converts a Supabase DB user object (snake_case) to an application User object (camelCase)
const fromSupabaseUser = (dbUser: any): User => {
    if (!dbUser) return dbUser;
    return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        avatarUrl: dbUser.avatar_url,
        level: dbUser.level,
        xp: dbUser.xp,
        xpToNextLevel: dbUser.xp_to_next_level,
        coins: dbUser.coins,
        completedMissions: dbUser.completed_missions || [],
        missions: dbUser.missions || [],
        title: dbUser.title,
        lastDailyReset: dbUser.last_daily_reset,
        lastWeeklyReset: dbUser.last_weekly_reset,
        lastMonthlyReset: dbUser.last_monthly_reset,
        hasSeenWelcome: dbUser.has_seen_welcome,
        unlockedRewardIds: dbUser.unlocked_reward_ids || [],
        activeBorderId: dbUser.active_border_id,
    };
};

// Converts a partial application User object (camelCase) to a Supabase DB object (snake_case)
const toSupabaseUser = (appUser: Partial<User>): any => {
    const dbUser: any = {};
    if (appUser.id !== undefined) dbUser.id = appUser.id;
    if (appUser.name !== undefined) dbUser.name = appUser.name;
    if (appUser.email !== undefined) dbUser.email = appUser.email;
    if (appUser.avatarUrl !== undefined) dbUser.avatar_url = appUser.avatarUrl;
    if (appUser.level !== undefined) dbUser.level = appUser.level;
    if (appUser.xp !== undefined) dbUser.xp = appUser.xp;
    if (appUser.xpToNextLevel !== undefined) dbUser.xp_to_next_level = appUser.xpToNextLevel;
    if (appUser.coins !== undefined) dbUser.coins = appUser.coins;
    if (appUser.completedMissions !== undefined) dbUser.completed_missions = appUser.completedMissions;
    if (appUser.missions !== undefined) dbUser.missions = appUser.missions;
    if (appUser.title !== undefined) dbUser.title = appUser.title;
    if (appUser.lastDailyReset !== undefined) dbUser.last_daily_reset = appUser.lastDailyReset;
    if (appUser.lastWeeklyReset !== undefined) dbUser.last_weekly_reset = appUser.lastWeeklyReset;
    if (appUser.lastMonthlyReset !== undefined) dbUser.last_monthly_reset = appUser.lastMonthlyReset;
    if (appUser.hasSeenWelcome !== undefined) dbUser.has_seen_welcome = appUser.hasSeenWelcome;
    if (appUser.unlockedRewardIds !== undefined) dbUser.unlocked_reward_ids = appUser.unlockedRewardIds;
    if (appUser.activeBorderId !== undefined) dbUser.active_border_id = appUser.activeBorderId;
    return dbUser;
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
    // Step 1: Fetch all posts and their authors
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*, author:users(*)')
      .order('timestamp', { ascending: false });

    if (postsError) {
      const errorDetails = JSON.stringify(postsError, null, 2);
      console.error('Error fetching posts:', errorDetails);
      toast({ 
        title: 'Gagal Memuat Postingan Forum', 
        variant: 'destructive', 
        description: `Error: ${postsError.message}`
      });
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
        description: `Error: ${commentsError.message}` 
      });
    }

    // Step 3: Combine posts and comments on the client
    const postsWithDetails: ForumPost[] = (postsData || []).map(post => {
      const postComments = (commentsData || [])
        .filter(comment => comment.post_id === post.id)
        .map(c => ({
            id: c.id,
            authorId: c.author_id,
            postId: c.post_id,
            content: c.content,
            timestamp: c.timestamp,
        }));
      
      const authorData = fromSupabaseUser(post.author);
      return {
        id: post.id,
        authorId: authorData.id,
        title: post.title,
        content: post.content,
        timestamp: post.timestamp,
        author: { name: authorData.name, avatarUrl: authorData.avatarUrl },
        comments: postComments,
      };
    });

    setPosts(postsWithDetails);
  }, [toast]);
  
  const fetchAllUsers = useCallback(async (): Promise<void> => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('xp', { ascending: false });

    if (error) {
        console.error('Error fetching all users:', error);
        setAllUsers([]);
    } else {
        const appUsers = (data || []).map(fromSupabaseUser);
        setAllUsers(appUsers);
    }
  }, []);

  const processUserSession = useCallback(async (user: User): Promise<{ updatedUser: User, needsDbUpdate: boolean }> => {
    let userToUpdate = { ...user };
    let needsDbUpdate = false;
    const now = new Date();
    
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
        userToUpdate.completedMissions = (userToUpdate.completedMissions || []).filter(id => currentMissionIds.has(id) || staticAutoMissionIds.has(id));
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
      
      const appUser = fromSupabaseUser(userProfile);
      
      const { updatedUser, needsDbUpdate } = await processUserSession(appUser);
      
      if (needsDbUpdate) {
        const { data: finalUser, error: updateError } = await supabase
            .from('users')
            .update(toSupabaseUser(updatedUser))
            .eq('id', updatedUser.id)
            .select()
            .single();
        
        if (updateError) {
            console.error("Error saving session updates to DB:", updateError);
            setCurrentUser(updatedUser);
        } else {
            setCurrentUser(fromSupabaseUser(finalUser));
        }
      } else {
        setCurrentUser(updatedUser);
      }
      
      await fetchAllUsers();
      await fetchForumData();
      
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
         if (authError.message.toLowerCase().includes('user already registered')) {
            toast({
              title: 'Email Sudah Terdaftar',
              description: 'Email ini sudah digunakan. Silakan coba login atau gunakan email lain.',
              variant: 'destructive',
            });
          } else {
            throw new Error(authError.message);
          }
          return;
      }
      if (!authData.user) {
        throw new Error('Pendaftaran berhasil tetapi tidak ada data pengguna yang dikembalikan.');
      }

      const minimalProfileData = { id: authData.user.id, name, email };
      const { error: insertError } = await supabase
        .from('users')
        .insert(minimalProfileData);

      if (insertError) {
        console.error("Supabase insert error object:", JSON.stringify(insertError, null, 2));
        const errorMessage = insertError.message || "Gagal membuat profil. Pastikan tabel 'users' ada dan kebijakan RLS mengizinkan penyisipan.";
        throw new Error(errorMessage);
      }
      
      const initialMissions = await generateNewUserMissions(1);
      const now = new Date();
      const fullProfileData = {
        avatar_url: avatarPool[Math.floor(Math.random() * avatarPool.length)].url,
        level: 1,
        xp: 0,
        xp_to_next_level: getTotalXpForLevel(2),
        coins: 100,
        title: getTitleForLevel(1),
        completed_missions: [],
        last_daily_reset: now.toISOString(),
        last_weekly_reset: now.toISOString(),
        last_monthly_reset: now.toISOString(),
        has_seen_welcome: false,
        unlocked_reward_ids: ['border-welcome'],
        active_border_id: 'border-welcome',
        missions: initialMissions,
      };
      
      const { error: updateError } = await supabase
        .from('users')
        .update(fullProfileData)
        .eq('id', authData.user.id);
      
      if (updateError) {
        console.error("Gagal memperbarui profil dengan data lengkap:", updateError.message);
        toast({ title: 'Pendaftaran Berhasil', description: 'Namun, terjadi sedikit masalah saat menyiapkan profil lengkap Anda.', variant: 'default' });
      } else {
        toast({ title: `Selamat Bergabung, ${name}!`, description: 'Akun Anda berhasil dibuat. Silakan cek email Anda untuk konfirmasi jika diperlukan.', variant: 'success' });
      }

    } catch (error: any) {
      console.error("Register failed:", error);
      toast({ title: 'Pendaftaran Gagal', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: 'Login Gagal', description: "Email atau password salah, atau akun belum dikonfirmasi.", variant: 'destructive' });
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

    const xpFromMission = overrideXp !== undefined ? overrideXp : mission.xp;
    const coinsFromMission = mission.coins || 0;
    const totalXpGained = xpFromMission + bonusXp;

    const newXp = currentUser.xp + totalXpGained;
    const newCoins = (currentUser.coins || 0) + coinsFromMission;
    const oldLevel = currentUser.level;
    const newLevel = getLevelForXp(newXp);
    const leveledUp = newLevel > oldLevel;

    const updatedCompletedMissions = [...currentUser.completedMissions, missionId];
    const newMissionsList = currentUser.missions.filter(m => m.id !== missionId);
    
    const optimisticUserUpdate: User = {
        ...currentUser,
        xp: newXp,
        coins: newCoins,
        level: newLevel,
        title: getTitleForLevel(newLevel),
        xpToNextLevel: getTotalXpForLevel(newLevel + 1),
        completedMissions: updatedCompletedMissions,
        missions: newMissionsList,
    };

    setCurrentUser(optimisticUserUpdate);
    setAllUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? optimisticUserUpdate : u));
    
    (async () => {
        let finalMissionsList = newMissionsList;
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
            }
        }

        const dbUpdatePayload = {
            xp: newXp,
            coins: newCoins,
            level: newLevel,
            title: getTitleForLevel(newLevel),
            xp_to_next_level: getTotalXpForLevel(newLevel + 1),
            completed_missions: updatedCompletedMissions,
            missions: finalMissionsList,
        };
        
        setCurrentUser(prev => prev ? { ...prev, missions: finalMissionsList } : null);

        const { error } = await supabase.from('users').update(dbUpdatePayload).eq('id', currentUser.id);

        if (error) {
            toast({ title: "Gagal Menyimpan Progres", description: "Progres Anda mungkin tidak tersimpan.", variant: 'destructive' });
            console.error(error);
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
    const originalUser = { ...currentUser };
    const optimisticUser = { ...currentUser, ...updatedData };
    setCurrentUser(optimisticUser);
    setAllUsers(prevUsers => prevUsers.map(u => u.id === optimisticUser.id ? optimisticUser : u));

    const dbUpdateData = toSupabaseUser(updatedData);

    const { error } = await supabase.from('users').update(dbUpdateData).eq('id', currentUser.id);
    if (error) {
        const errorDetails = JSON.stringify(error, null, 2);
        console.error("Error updating profile:", errorDetails);
        toast({ 
            title: 'Gagal Memperbarui Profil', 
            variant: 'destructive',
            description: `Terjadi kesalahan: ${error.message || 'Tidak ada pesan error'}. Ini mungkin karena masalah izin database (RLS).`
        });
        setCurrentUser(originalUser);
        setAllUsers(prevUsers => prevUsers.map(u => u.id === originalUser.id ? originalUser : u));
    } else {
        toast({ title: 'Profil Diperbarui!', variant: 'success' });
    }
  };

  const markWelcomeAsSeen = async () => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, hasSeenWelcome: true };
    setCurrentUser(updatedUser);
    const { error } = await supabase.from('users').update({ has_seen_welcome: true }).eq('id', currentUser.id);
     if (error) {
       console.error("Error marking welcome as seen:", JSON.stringify(error, null, 2));
    }
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

      const dbUpdatePayload = {
          coins: updatedUser.coins,
          unlocked_reward_ids: updatedUser.unlockedRewardIds,
      };

      const { error } = await supabase.from('users').update(dbUpdatePayload).eq('id', currentUser.id);

      if (error) {
        console.error("Error redeeming reward:", JSON.stringify(error, null, 2));
        toast({ title: 'Gagal Menyimpan', variant: 'destructive' });
        setCurrentUser(currentUser);
      } else {
        toast({ title: 'Hadiah Berhasil Ditukar!', description: `Anda membuka "${reward.name}".`, variant: 'success' });
      }
  };

  const setActiveBorder = async (borderId: string | null) => {
    if (!currentUser) return;
    const originalUser = { ...currentUser };
    const updatedUser = { ...currentUser, activeBorderId: borderId };
    setCurrentUser(updatedUser);
    const { error } = await supabase.from('users').update({ active_border_id: borderId }).eq('id', currentUser.id);
     if (error) {
        console.error("Error setting active border:", JSON.stringify(error, null, 2));
        toast({ title: 'Gagal Mengatur Bingkai', variant: 'destructive' });
        setCurrentUser(originalUser);
     }
  };

  const createPost = async (title: string, content: string) => {
    if (!currentUser) return;
    
    const newPostData = {
        author_id: currentUser.id,
        title,
        content,
    };
    
    const { data, error } = await supabase.from('posts').insert(newPostData).select().single();

    if (error) {
        console.error("Error creating post:", JSON.stringify(error, null, 2));
        toast({ 
            title: 'Gagal Membuat Postingan', 
            variant: 'destructive', 
            description: `Terjadi kesalahan: ${error.message}. Ini mungkin karena masalah izin database (RLS).` 
        });
        return;
    }
    
    const postWithAuthor: ForumPost = { 
        id: data.id,
        authorId: data.author_id,
        title: data.title,
        content: data.content,
        timestamp: data.timestamp,
        author: { name: currentUser.name, avatarUrl: currentUser.avatarUrl }, 
        comments: [] 
    };
    setPosts(prevPosts => [postWithAuthor, ...prevPosts]);
    toast({ title: 'Postingan Dibuat!', variant: 'success' });
  };
  
  const addComment = async (postId: string, content: string) => {
    if (!currentUser) return;

    const newCommentData = {
        author_id: currentUser.id,
        post_id: postId,
        content,
    };

    const { data, error } = await supabase.from('comments').insert(newCommentData).select().single();

    if (error) {
        console.error("Error adding comment:", JSON.stringify(error, null, 2));
        toast({ 
            title: 'Gagal Menambah Komentar', 
            variant: 'destructive',
            description: `Terjadi kesalahan: ${error.message}. Ini mungkin karena masalah izin database (RLS).`
        });
        return;
    }

    const newComment: ForumComment = {
        id: data.id,
        authorId: data.author_id,
        postId: data.post_id,
        content: data.content,
        timestamp: data.timestamp,
    };

    setPosts(prevPosts =>
        prevPosts.map(post => {
            if (post.id === postId) {
                // To display the new comment immediately, find the author details from allUsers
                const author = allUsers.find(u => u.id === newComment.authorId);
                const commentWithAuthor = { ...newComment, author: author ? { name: author.name, avatarUrl: author.avatarUrl } : undefined };
                return { ...post, comments: [...post.comments, commentWithAuthor] };
            }
            return post;
        })
    );
  };
  
  const value = { currentUser, missions, allUsers, posts, isAuthenticated, isLoading, completeMission, login, logout, register, updateUser, markWelcomeAsSeen, redeemReward, setActiveBorder, createPost, addComment };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
};
