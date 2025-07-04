'use client';

import { useContext, useMemo } from 'react';
import { UserDataContext } from '@/context/UserDataProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Gift, Award, Coins, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rewards } from '@/lib/data';

interface ProfileDisplayProps {
  onOpenRewards: () => void;
}

const getTotalXpForLevel = (level: number): number => {
    if (level <= 1) return 0;
    let totalXp = 0;
    for (let i = 2; i <= level; i++) {
        totalXp += (i - 1) * 150;
    }
    return totalXp;
};

export default function ProfileDisplay({ onOpenRewards }: ProfileDisplayProps) {
  const { currentUser } = useContext(UserDataContext);
  
  const activeBorder = useMemo(() => {
      if (!currentUser) return null;
      return rewards.find(r => r.type === 'border' && r.id === currentUser.active_border_id);
  }, [currentUser?.active_border_id]);
  
  const xpForCurrentLevelStart = useMemo(() => {
    if (!currentUser) return 0;
    return getTotalXpForLevel(currentUser.level);
  }, [currentUser?.level]);

  if (!currentUser) {
    return null; 
  }
  
  const xpForNextLevelStart = currentUser.xp_to_next_level;
  const totalXpForThisLevel = xpForNextLevelStart - xpForCurrentLevelStart;
  const xpEarnedThisLevel = currentUser.xp - xpForCurrentLevelStart;
  const progressPercentage = totalXpForThisLevel > 0 ? (xpEarnedThisLevel / totalXpForThisLevel) * 100 : 0;
  
  const AvatarContent = () => (
    <>
      <AvatarImage src={currentUser.avatar_url} alt={currentUser.name} />
      <AvatarFallback className="text-5xl">{currentUser.name.charAt(0)}</AvatarFallback>
    </>
  );

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-2 border-primary/20 shadow-lg">
        <div className="bg-gradient-to-br from-primary/10 to-card p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 text-center">
             {activeBorder?.style === 'gradient' ? (
                <div className={cn("rounded-full p-1 shadow-xl", activeBorder.value)}>
                    <Avatar className="h-28 w-28 sm:h-32 sm:w-32">
                      <AvatarContent />
                    </Avatar>
                </div>
             ) : (
                <Avatar className={cn("h-28 w-28 border-4 shadow-xl sm:h-32 sm:w-32", activeBorder ? activeBorder.value : 'border-accent')}>
                  <AvatarContent />
                </Avatar>
             )}

            <div className="flex-1">
              <CardTitle className="font-headline text-4xl text-primary sm:text-5xl">{currentUser.name}</CardTitle>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <Badge variant="default" className="px-4 py-1 text-base sm:text-lg">Level {currentUser.level}</Badge>
                  <Badge variant="secondary" className="gap-1.5 px-4 py-1 text-base sm:text-lg"><Award className="h-4 w-4"/>{currentUser.title}</Badge>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="space-y-6 p-4 sm:p-6">
           <div className="w-full">
              <div className="mb-2 flex justify-between text-sm font-medium text-muted-foreground">
                <span>Kemajuan Level</span>
                <span>
                  {xpEarnedThisLevel.toLocaleString()} / {totalXpForThisLevel.toLocaleString()} XP
                </span>
              </div>
              <Progress value={progressPercentage} className="h-4" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <Card className="bg-secondary/50">
                  <CardHeader className="p-4 pb-2">
                      <CardTitle className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground"><Coins className="h-4 w-4"/>Koin Anda</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-center">
                      <p className="font-headline text-3xl sm:text-4xl">{(currentUser.coins || 0).toLocaleString()}</p>
                  </CardContent>
               </Card>
               <Card className="bg-secondary/50">
                  <CardHeader className="p-4 pb-2">
                      <CardTitle className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground"><CheckCircle className="h-4 w-4"/>Misi Selesai</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-center">
                      <p className="font-headline text-3xl sm:text-4xl">{currentUser.completed_missions.length}</p>
                  </CardContent>
               </Card>
            </div>

            <Button onClick={onOpenRewards} className="h-12 w-full text-base sm:text-lg">
                <Gift className="mr-2 h-5 w-5" />
                Toko Hadiah
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
