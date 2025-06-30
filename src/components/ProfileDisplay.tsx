'use client';

import { useContext } from 'react';
import { UserDataContext } from '@/context/UserDataProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from './ui/separator';
import { Check, ShieldCheck } from 'lucide-react';

export default function ProfileDisplay() {
  const { user, missions } = useContext(UserDataContext);
  const progressPercentage = (user.xp / user.xpToNextLevel) * 100;

  const completedMissions = missions.filter(m => user.completedMissions.includes(m.id));

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-accent">
            <AvatarImage src="https://placehold.co/100x100.png" alt={user.name} data-ai-hint="muslim avatar" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-3xl">{user.name}</CardTitle>
            <CardDescription className="text-lg">Level {user.level}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>
                {user.xp} / {user.xpToNextLevel} XP
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-accent/20 [&>div]:bg-accent" />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h2 className="font-headline text-2xl font-bold mb-4">Completed Missions</h2>
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
            You haven&apos;t completed any missions yet. Go to the missions tab to get started!
          </p>
        )}
      </div>
    </div>
  );
}
