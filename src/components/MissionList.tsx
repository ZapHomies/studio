'use client';

import { useContext, useState } from 'react';
import { UserDataContext } from '@/context/UserDataProvider';
import { type Mission } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MissionCompletionDialog from './MissionCompletionDialog';
import { Badge } from './ui/badge';
import { CheckCircle } from 'lucide-react';

export default function MissionList() {
  const { missions, user } = useContext(UserDataContext);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCompleteClick = (mission: Mission) => {
    setSelectedMission(mission);
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedMission(null);
  }

  return (
    <div>
      <div className="grid gap-6">
        {missions.map((mission) => {
          const isCompleted = user.completedMissions.includes(mission.id);
          return (
            <Card key={mission.id} className="flex flex-col overflow-hidden shadow-md transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl text-primary">{mission.title}</CardTitle>
                <CardDescription className="text-base">{mission.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <Badge variant="outline" className="border-accent text-accent">
                  {mission.xp} XP
                </Badge>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleCompleteClick(mission)}
                  disabled={isCompleted}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Selesai
                    </>
                  ) : (
                    'Selesaikan Misi'
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <MissionCompletionDialog
        mission={selectedMission}
        isOpen={isDialogOpen}
        onOpenChange={handleDialogClose}
      />
    </div>
  );
}
