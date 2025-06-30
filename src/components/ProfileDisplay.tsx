'use client';

import { useContext } from 'react';
import { UserDataContext } from '@/context/UserDataProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from './ui/separator';
import { Check, ShieldCheck, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function ProfileDisplay() {
  const { user, missions, logout } = useContext(UserDataContext);
  const progressPercentage = (user.xp / user.xpToNextLevel) * 100;

  const completedMissions = missions.filter(m => user.completedMissions.includes(m.id));

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <Avatar className="h-24 w-24 border-4 border-accent">
            <AvatarImage src="https://placehold.co/100x100.png" alt={user.name} data-ai-hint="muslim avatar" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <CardTitle className="font-headline text-3xl">{user.name}</CardTitle>
            <div className="flex items-center justify-center gap-2 sm:justify-start">
                <CardDescription className="text-lg">Level {user.level}</CardDescription>
                <Badge variant="secondary">{user.title}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Kemajuan</span>
              <span>
                {user.xp} / {user.xpToNextLevel} XP
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-accent/20 [&>div]:bg-accent" />
          </div>
           <Button onClick={logout} variant="outline" className="w-full mt-6">
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h2 className="font-headline text-2xl font-bold mb-4">Misi Selesai</h2>
        {completedMissions.length > 0 ? (
          <div className="space-y-4">
            {completedMissions.map((mission) => (
              <Card key={mission.id} className="bg-card/80">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <ShieldCheck className="h-6 w-6 text-success mr-4" />
                    <div>
                      <p className="font-semibold">{mission.title}</p>
                      <p className="text-sm text-muted-foreground">+{mission.xp} XP</p>
                    </div>
                  </div>
                  <Check className="h-5 w-5 text-success" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Anda belum menyelesaikan misi apa pun. Buka tab misi untuk memulai!
          </p>
        )}
      </div>
    </div>
  );
}
