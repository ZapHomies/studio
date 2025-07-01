'use client';

import { useContext } from 'react';
import { UserDataContext } from '@/context/UserDataProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from './ui/separator';
import { ShieldCheck, LogOut, Award, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { avatarPool } from '@/lib/data';

export default function ProfileDisplay() {
  const { user, missions, logout } = useContext(UserDataContext);
  const progressPercentage = (user.xp / user.xpToNextLevel) * 100;

  const completedMissions = missions.filter(m => user.completedMissions.includes(m.id));
  const avatarHint = avatarPool.find(a => a.url === user.avatarUrl)?.hint || 'muslim avatar';

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="flex flex-col items-center gap-6 bg-secondary/50 p-6 text-center md:flex-row md:text-left">
          <Avatar className="h-28 w-28 border-4 border-accent shadow-md">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={avatarHint} />
            <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <CardTitle className="font-headline text-4xl">{user.name}</CardTitle>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <Badge variant="default" className="text-lg">Level {user.level}</Badge>
                <Badge variant="secondary" className="gap-1.5 text-lg"><Award className="h-4 w-4"/>{user.title}</Badge>
            </div>
            <div className="mt-4 w-full">
              <div className="mb-1 flex justify-between text-sm font-medium text-muted-foreground">
                <span>Kemajuan Level</span>
                <span>
                  {user.xp} / {user.xpToNextLevel} XP
                </span>
              </div>
              <Progress value={progressPercentage} className="h-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
           <Button onClick={logout} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h2 className="mb-4 font-headline text-3xl font-bold">Misi Selesai</h2>
        {completedMissions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {completedMissions.map((mission) => (
              <Card key={mission.id} className="flex items-center p-4 bg-card/80 shadow-sm">
                <ShieldCheck className="h-8 w-8 flex-shrink-0 text-success mr-4" />
                <div className="flex-grow">
                  <p className="font-semibold">{mission.title}</p>
                  <p className="text-sm text-muted-foreground">+{mission.xp} XP</p>
                </div>
                <CheckCircle className="h-6 w-6 flex-shrink-0 text-success" />
              </Card>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-muted-foreground">
            Anda belum menyelesaikan misi apa pun. Buka tab misi untuk memulai!
          </p>
        )}
      </div>
    </div>
  );
}
