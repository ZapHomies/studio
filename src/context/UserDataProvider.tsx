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


// --- CONTEXT DEFINITION ---

interface UserDataContextType {
  currentUser: User | null;
  missions: Mission[];
  allUsers: User[];
  posts: ForumPost[];
  isAuthenticated: boolean;
  isLoading: boolean;
  completeMission: (missionId: string, bonus_xp?: number, overrideXp?: number) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (updatedData: Partial<Pick<User, 'name' | 'avatar_url'>>) => Promise<void>;
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
      
      const dailyPromise = generateMissions({ level, existing_mission_ids: existingIds, count: NUM_DAILY, category: 'Harian' });
      const weeklyPromise = generateMissions({ level, existing_mission_ids: existingIds, count: NUM_WEEKLY, category: 'Mingguan' });
      const monthlyPromise = generateMissions({ level, existing_mission_ids: existingIds, count: NUM_MONTHLY - staticMissions.length, category: 'Bulanan' });
      
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

  const createNewUserProfile = async (userId: string, name: string, email: string) => {
    const initialMissions = await generateNewUserMissions(1);
    const now = new Date();

    const newUserPayload = {
      id: userId,
      name,
      email,
      avatar_url: avatarPool[Math.floor(Math.random() * avatarPool.length)].url,
      level: 1,
      xp: 0,
      xp_to_next_level: getTotalXpForLevel(2),
      coins: 100,
      completed_missions: [],
      missions: initialMissions,
      title: getTitleForLevel(1),
      last_daily_reset: now.toISOString(),
      last_weekly_reset: now.toISOString(),
      last_monthly_reset: now.toISOString(),
      has_seen_welcome: false,
      unlocked_reward_ids: ['border-welcome'],
      active_border_id: 'border-welcome',
    };

    return supabase.from('users').insert(newUserPayload).select().single();
  };

  // --- DATA FETCHING & SYNC ---

  const fetchAllUsers = useCallback(async (): Promise<void> => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('xp', { ascending: false });

    if (error) {
        console.error('Error fetching all users:', error);
        setAllUsers([]);
    } else {
        setAllUsers((data || []) as User[]);
    }
  }, []);

  const fetchForumData = useCallback(async () => {
    // Step 1: Fetch all posts
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('timestamp', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
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
    const postsWithComments: ForumPost[] = (postsData || []).map(post => ({
      ...post,
      comments: (commentsData || []).filter(comment => comment.post_id === post.id) as ForumComment[],
    }));

    setPosts(postsWithComments);
  }, [toast]);
  
  const processUserSession = useCallback(async (user: User): Promise<{ updatedUser: User, needsDbUpdate: boolean }> => {
    let userToUpdate = { ...user };
    let needsDbUpdate = false;
    const now = new Date();
    
    let missionsToUpdate = [...userToUpdate.missions];

    if (!userToUpdate.last_daily_reset || !isToday(new Date(userToUpdate.last_daily_reset))) {
        missionsToUpdate = missionsToUpdate.filter(m => m.category !== 'Harian');
        const { missions: newDaily } = await generateMissions({ level: userToUpdate.level, existing_mission_ids: missionsToUpdate.map(m => m.id), count: NUM_DAILY, category: 'Harian' });
        missionsToUpdate.push(...newDaily);
        userToUpdate.last_daily_reset = now.toISOString();
        needsDbUpdate = true;
    }
    if (!userToUpdate.last_weekly_reset || !isThisWeek(new Date(userToUpdate.last_weekly_reset), { weekStartsOn: 1 })) {
        missionsToUpdate = missionsToUpdate.filter(m => m.category !== 'Mingguan');
        const { missions: newWeekly } = await generateMissions({ level: userToUpdate.level, existing_mission_ids: missionsToUpdate.map(m => m.id), count: NUM_WEEKLY, category: 'Mingguan' });
        missionsToUpdate.push(...newWeekly);
        userToUpdate.last_weekly_reset = now.toISOString();
        needsDbUpdate = true;
    }
    if (!userToUpdate.last_monthly_reset || !isThisMonth(new Date(userToUpdate.last_monthly_reset))) {
        missionsToUpdate = missionsToUpdate.filter(m => m.category !== 'Bulanan' || m.type === 'auto');
        const staticAutoMissionIds = new Set(staticMissions.filter(m => m.type === 'auto').map(m => m.id));
        const currentMissionIds = new Set(missionsToUpdate.map(m => m.id));
        userToUpdate.completed_missions = (userToUpdate.completed_missions || []).filter(id => currentMissionIds.has(id) || staticAutoMissionIds.has(id));
        const { missions: newMonthly } = await generateMissions({ level: userToUpdate.level, existing_mission_ids: missionsToUpdate.map(m => m.id), count: NUM_MONTHLY - staticMissions.length, category: 'Bulanan' });
        missionsToUpdate.push(...newMonthly);
        userToUpdate.last_monthly_reset = now.toISOString();
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

      let { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      // Self-healing logic for users who exist in auth but not in public.users
      if (!userProfile && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          console.log("User profile not found, attempting to create one (self-healing).");
          const userName = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Pengguna Baru';
          
          const { data: newUser, error: creationError } = await createNewUserProfile(session.user.id, userName, session.user.email!);

          if (creationError) {
              console.error('Self-healing failed. Could not create user profile:', creationError);
              toast({ title: 'Gagal Memulihkan Akun', description: `Gagal membuat profil Anda: ${creationError.message}. Silakan coba login kembali.`, variant: 'destructive'});
              await supabase.auth.signOut();
              setIsLoading(false);
              return;
          }

          userProfile = newUser;
          error = null;
      }

      if (error || !userProfile) {
        console.error('Error fetching user profile or profile not found:', error);
        if (event !== 'SIGNED_IN' && event !== 'INITIAL_SESSION') {
            await supabase.auth.signOut();
        }
        setIsLoading(false);
        return;
      }
      
      const appUser: User = {
          ...(userProfile as User),
          missions: userProfile.missions || [],
          completed_missions: userProfile.completed_missions || [],
          unlocked_reward_ids: userProfile.unlocked_reward_ids || [],
      };

      const { updatedUser, needsDbUpdate } = await processUserSession(appUser);
      
      if (needsDbUpdate) {
        const { data: finalUser, error: updateError } = await supabase
            .from('users')
            .update({
              missions: updatedUser.missions,
              last_daily_reset: updatedUser.last_daily_reset,
              last_weekly_reset: updatedUser.last_weekly_reset,
              last_monthly_reset: updatedUser.last_monthly_reset,
              completed_missions: updatedUser.completed_missions
            })
            .eq('id', updatedUser.id)
            .select()
            .single();
        
        if (updateError) {
            console.error("Error saving session updates to DB:", updateError);
            setCurrentUser(updatedUser);
        } else {
            setCurrentUser(finalUser as User);
        }
      } else {
        setCurrentUser(updatedUser);
      }
      
      await fetchAllUsers();
      await fetchForumData();
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router, fetchForumData, fetchAllUsers, processUserSession, pathname, toast]);
  
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
        options: {
          data: {
            name: name, // Store the name in metadata for self-healing
          },
        },
      });

      if (authError) {
          if (authError.message.toLowerCase().includes('user already registered')) {
              toast({
                  title: 'Email Sudah Terdaftar',
                  description: 'Email ini sudah digunakan untuk akun lain. Silakan login atau gunakan email yang berbeda.',
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
      
      const { error: creationError } = await createNewUserProfile(authData.user.id, name, email);

      if (creationError) {
          console.error("Gagal membuat profil lengkap:", creationError);
          toast({
            title: 'Gagal Menyimpan Profil',
            description: `Akun Anda berhasil dibuat, tetapi gagal menyimpan detail profil. Saat Anda login, sistem akan mencoba memperbaikinya. Error: ${creationError.message}.`,
            variant: 'destructive',
            duration: 15000,
          });
          return;
      }
      
      toast({ 
          title: `Selamat Datang, ${name}!`, 
          description: 'Akun Anda telah berhasil dibuat. Anda akan diarahkan sebentar lagi.',
          variant: 'success'
      });

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
      toast({ title: 'Login Gagal', description: "Email atau password salah. Pastikan akun sudah dikonfirmasi jika diperlukan.", variant: 'destructive' });
    }
    // Set isLoading to false only on error; on success, onAuthStateChange will handle it.
    if(error) setIsLoading(false);
  };
  
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Logout Gagal",
        description: "Gagal keluar dari sesi. Silakan coba lagi.",
        variant: "destructive"
      });
    }
    // The onAuthStateChange listener will handle state clearing and redirection.
  };

  const completeMission = async (missionId: string, bonus_xp = 0, overrideXp?: number) => {
    if (!currentUser) return;

    const mission = currentUser.missions.find((m) => m.id === missionId);
    if (!mission || currentUser.completed_missions.includes(missionId)) return;

    const xpFromMission = overrideXp !== undefined ? overrideXp : mission.xp;
    const coinsFromMission = mission.coins || 0;
    const totalXpGained = xpFromMission + bonus_xp;

    const newXp = currentUser.xp + totalXpGained;
    const newCoins = (currentUser.coins || 0) + coinsFromMission;
    const oldLevel = currentUser.level;
    const newLevel = getLevelForXp(newXp);
    const leveledUp = newLevel > oldLevel;

    const updatedUser: User = {
        ...currentUser,
        xp: newXp,
        coins: newCoins,
        level: newLevel,
        title: getTitleForLevel(newLevel),
        xp_to_next_level: getTotalXpForLevel(newLevel + 1),
        completed_missions: [...currentUser.completed_missions, missionId],
        missions: currentUser.missions.filter(m => m.category === 'Harian' ? m.id !== missionId : true),
    };
    
    if (mission.category !== 'Harian') {
       updatedUser.missions = currentUser.missions;
    }

    setCurrentUser(updatedUser);
    setAllUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? updatedUser : u));
    
    (async () => {
        let finalMissionsList = updatedUser.missions;
        if (mission.category === 'Harian') {
            try {
                const { missions: newMissions } = await generateMissions({
                    level: newLevel,
                    existing_mission_ids: finalMissionsList.map(m => m.id),
                    count: 1,
                    category: 'Harian'
                });
                if (newMissions && newMissions.length > 0) {
                    finalMissionsList = [...finalMissionsList, ...newMissions];
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
            completed_missions: updatedUser.completed_missions,
            missions: finalMissionsList,
        };
        
        setCurrentUser(prev => prev ? { ...prev, missions: finalMissionsList } : null);

        const { error } = await supabase.from('users').update(dbUpdatePayload).eq('id', currentUser.id);

        if (error) {
            toast({ title: "Gagal Menyimpan Progres", description: `Terjadi kesalahan: ${error.message}`, variant: 'destructive' });
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

  const updateUser = async (updatedData: Partial<Pick<User, 'name' | 'avatar_url'>>) => {
    if (!currentUser) return;
    const originalUser = { ...currentUser };
    
    const optimisticUser: User = { ...currentUser, ...updatedData };
    setCurrentUser(optimisticUser);
    setAllUsers(prevUsers => prevUsers.map(u => u.id === optimisticUser.id ? optimisticUser : u));

    if (Object.keys(updatedData).length === 0) return;

    const { error } = await supabase.from('users').update(updatedData).eq('id', currentUser.id);
    if (error) {
        toast({ 
            title: 'Gagal Memperbarui Profil', 
            variant: 'destructive',
            description: `Terjadi kesalahan: ${error.message}.`
        });
        console.error("Error updating profile:", error.message, error);
        // Revert optimistic update
        setCurrentUser(originalUser);
        setAllUsers(prevUsers => prevUsers.map(u => u.id === originalUser.id ? originalUser : u));
    } else {
        toast({ title: 'Profil Diperbarui!', variant: 'success' });
    }
  };

  const markWelcomeAsSeen = async () => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, has_seen_welcome: true };
    setCurrentUser(updatedUser);
    const { error } = await supabase.from('users').update({ has_seen_welcome: true }).eq('id', currentUser.id);
     if (error) {
       console.error("Error marking welcome as seen:", error);
    }
  };
  
  const redeemReward = async (rewardId: string) => {
      if (!currentUser) return;
      const reward = allRewards.find(r => r.id === rewardId);
      if (!reward || (currentUser.coins || 0) < reward.cost || currentUser.unlocked_reward_ids.includes(rewardId)) {
        toast({ title: 'Penukaran Gagal', description: 'Koin tidak cukup atau hadiah sudah dimiliki.', variant: 'destructive' });
        return;
      }
      
      const newCoins = (currentUser.coins || 0) - reward.cost;
      const newUnlockedRewardIds = [...currentUser.unlocked_reward_ids, rewardId];
      
      const optimisticUser = { ...currentUser, coins: newCoins, unlocked_reward_ids: newUnlockedRewardIds };
      setCurrentUser(optimisticUser);

      const dbUpdatePayload = {
          coins: newCoins,
          unlocked_reward_ids: newUnlockedRewardIds,
      };

      const { error } = await supabase.from('users').update(dbUpdatePayload).eq('id', currentUser.id);

      if (error) {
        console.error("Error redeeming reward:", error.message, error);
        toast({ title: 'Gagal Menyimpan', description: `Terjadi kesalahan: ${error.message}`, variant: 'destructive' });
        setCurrentUser(currentUser);
      } else {
        toast({ title: 'Hadiah Berhasil Ditukar!', description: `Anda membuka "${reward.name}".`, variant: 'success' });
      }
  };

  const setActiveBorder = async (borderId: string | null) => {
    if (!currentUser) return;
    const originalUser = { ...currentUser };
    const updatedUser = { ...currentUser, active_border_id: borderId };
    setCurrentUser(updatedUser);
    const { error } = await supabase.from('users').update({ active_border_id: borderId }).eq('id', currentUser.id);
     if (error) {
        console.error("Error setting active border:", error.message, error);
        toast({ title: 'Gagal Mengatur Bingkai', description: `Terjadi kesalahan: ${error.message}`, variant: 'destructive' });
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
    
    const { error } = await supabase.from('posts').insert(newPostData);

    if (error) {
        console.error("Error creating post:", error.message, error);
        toast({ title: 'Gagal Membuat Postingan', variant: 'destructive', description: `Terjadi kesalahan: ${error.message}.` });
        return;
    }
    
    // Refetch forum data to show the new post
    await fetchForumData();
    toast({ title: 'Postingan Dibuat!', variant: 'success' });
  };
  
  const addComment = async (postId: string, content: string) => {
    if (!currentUser) return;

    const newCommentData = {
        author_id: currentUser.id,
        post_id: postId,
        content,
    };

    const { error } = await supabase.from('comments').insert(newCommentData);

    if (error) {
        console.error("Error adding comment:", error.message, error);
        toast({ title: 'Gagal Menambah Komentar', variant: 'destructive', description: `Terjadi kesalahan: ${error.message}.`});
        return;
    }

    // Refetch forum data to show the new comment
    await fetchForumData();
  };
  
  const value = { currentUser, missions, allUsers, posts, isAuthenticated, isLoading, completeMission, login, logout, register, updateUser, markWelcomeAsSeen, redeemReward, setActiveBorder, createPost, addComment };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
};
