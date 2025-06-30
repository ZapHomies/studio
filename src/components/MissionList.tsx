'use client';

import { useContext, useState } from 'react';
import { UserDataContext } from '@/context/UserDataProvider';
import { type Mission } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MissionCompletionDialog from './MissionCompletionDialog';
import { Badge } from './ui/badge';
import { CheckCircle, Zap, ChevronsRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MissionList() {
  const { user, missions, completeMission } = useContext(UserDataContext);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleOpenDialog = (mission: Mission) => {
    setSelectedMission(mission);
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedMission(null);
  }

  const handleActionMission = (mission: Mission) => {
    completeMission(mission.id);
    toast({
      title: 'Misi Selesai!',
      description: `Anda mendapatkan ${mission.xp} XP untuk menyelesaikan "${mission.title}".`,
      variant: 'success'
    });
  }

  const renderMissionButton = (mission: Mission) => {
    const isCompleted = user.completedMissions.includes(mission.id);

    if (isCompleted) {
      return (
        <Button disabled className="w-full bg-success/80 hover:bg-success/80">
          <CheckCircle />
          Selesai
        </Button>
      );
    }

    switch (mission.type) {
      case 'photo':
        return (
          <Button onClick={() => handleOpenDialog(mission)} className="w-full">
            <ChevronsRight />
            Selesaikan Misi
          </Button>
        );
      case 'action':
        return (
          <Button onClick={() => handleActionMission(mission)} className="w-full">
            <CheckCircle />
            Tandai Selesai
          </Button>
        );
      case 'auto':
        return (
          <Button disabled className="w-full" variant="outline">
            Selesai Otomatis
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="grid gap-6">
        {missions.map((mission) => (
          <Card key={mission.id} className="flex flex-col overflow-hidden shadow-md transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl text-primary">{mission.title}</CardTitle>
              <CardDescription className="text-base">{mission.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
               <div className="flex items-center gap-2 flex-wrap">
                 <Badge variant="outline" className="border-accent text-accent">
                   {mission.xp} XP
                 </Badge>
                 {mission.bonusXp && (
                   <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white">
                     <Zap className="mr-1 h-3 w-3" /> +{mission.bonusXp} XP Bonus
                   </Badge>
                 )}
               </div>
            </CardContent>
            <CardFooter>
              {renderMissionButton(mission)}
            </CardFooter>
          </Card>
        ))}
      </div>
      <MissionCompletionDialog
        mission={selectedMission}
        isOpen={isDialogOpen}
        onOpenChange={handleDialogClose}
      />
    </div>
  );
}
