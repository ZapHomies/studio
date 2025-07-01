'use client';

import { useContext } from 'react';
import { UserDataContext } from '@/context/UserDataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LogOut, Award, CheckCircle, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rewards } from '@/lib/data';

export default function ProfileDisplay() {
  const { currentUser, missions, logout } = useContext(UserDataContext);
  
  if (!currentUser) {
    return null; // Atau skeleton loader
  }

  const progressPercentage = (currentUser.xp / currentUser.xpToNextLevel) * 100;
  const completedMissions = missions.filter(m => currentUser.completedMissions.includes(m.id));

  const activeBorder = rewards.find(r => r.type === 'border' && r.id === currentUser.activeBorderId);
  
  const AvatarContent = () => (
    <>
      <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
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
        <CardContent className="space-y-6">
           <div className="w-full">
              <div className="mb-2 flex justify-between text-md font-medium text-muted-foreground">
                <span>Kemajuan Level</span>
                <span>
                  {currentUser.xp.toLocaleString()} / {currentUser.xpToNextLevel.toLocaleString()} XP
                </span>
              </div>
              <Progress value={progressPercentage} className="h-4" />
            </div>

            <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-2">
                <Card className="bg-secondary/50 p-4">
                    <CardHeader className="p-0">
                        <CardTitle className="flex items-center justify-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5"/>Misi Selesai</CardTitle>
                    </CardHeader>
                    <p className="mt-2 font-headline text-3xl sm:text-4xl">{completedMissions.length}</p>
                </Card>
                 <Card className="bg-secondary/50 p-4">
                    <CardHeader className="p-0">
                        <CardTitle className="flex items-center justify-center gap-2 text-muted-foreground"><BarChart2 className="h-5 w-5"/>Total Misi</CardTitle>
                    </CardHeader>
                    <p className="mt-2 font-headline text-3xl sm:text-4xl">{missions.length}</p>
                </Card>
            </div>

           <Button onClick={logout} variant="outline" className="h-12 w-full text-base sm:text-lg">
            <LogOut className="mr-2 h-5 w-5" />
            Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
