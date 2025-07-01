
'use client';

import { useContext, useState, useMemo } from 'react';
import { UserDataContext } from '@/context/UserDataProvider';
import { type Mission } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MissionCompletionDialog from './MissionCompletionDialog';
import { Badge } from './ui/badge';
import { CheckCircle, Zap, ChevronsRight, Calendar, Star, Moon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MissionCard = ({ mission, onAction, onOpenDialog, isCompleting }: { mission: Mission, onAction: (mission: Mission) => void, onOpenDialog: (mission: Mission) => void, isCompleting: boolean }) => {
    const { user } = useContext(UserDataContext);
    const isCompleted = user.completedMissions.includes(mission.id);

    const renderMissionButton = () => {
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
                <Button onClick={() => onOpenDialog(mission)} className="w-full">
                    <ChevronsRight />
                    Selesaikan Misi
                </Button>
                );
            case 'action':
                return (
                <Button onClick={() => onAction(mission)} className="w-full" disabled={isCompleting}>
                    {isCompleting ? <Loader2 className="animate-spin" /> : <CheckCircle />}
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
        <Card className="flex flex-col overflow-hidden shadow-md transition-shadow hover:shadow-lg">
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
                {renderMissionButton()}
            </CardFooter>
        </Card>
    );
}


export default function MissionList() {
  const { missions, isLoading } = useContext(UserDataContext);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [completingMissionId, setCompletingMissionId] = useState<string | null>(null);
  const { toast } = useToast();
  const { completeMission } = useContext(UserDataContext);

  const handleOpenDialog = (mission: Mission) => {
    setSelectedMission(mission);
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedMission(null);
  }

  const handleActionMission = async (mission: Mission) => {
    setCompletingMissionId(mission.id);
    await completeMission(mission.id);
    toast({
      title: 'Misi Selesai!',
      description: `Anda mendapatkan ${mission.xp} XP untuk menyelesaikan "${mission.title}".`,
      variant: 'success'
    });
    setCompletingMissionId(null);
  }

  const { dailyMissions, weeklyMissions, monthlyMissions } = useMemo(() => {
    return {
      dailyMissions: missions.filter(m => m.category === 'Harian'),
      weeklyMissions: missions.filter(m => m.category === 'Mingguan'),
      monthlyMissions: missions.filter(m => m.category === 'Bulanan'),
    }
  }, [missions]);

  const renderMissionSection = (title: string, icon: React.ReactNode, missionList: Mission[]) => {
    if (isLoading) {
        return (
            <div className="mb-12">
                 <h2 className="mb-4 flex items-center gap-3 font-headline text-3xl font-bold text-primary">
                    {icon}
                    {title}
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
                   <p className="text-muted-foreground">Membuat misi...</p>
                </div>
            </div>
        )
    }
    if (missionList.length === 0) return null;
    return (
      <div className="mb-12">
        <h2 className="mb-4 flex items-center gap-3 font-headline text-3xl font-bold text-primary">
          {icon}
          {title}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {missionList.map((mission) => (
            <MissionCard 
                key={mission.id} 
                mission={mission}
                onAction={handleActionMission}
                onOpenDialog={handleOpenDialog}
                isCompleting={completingMissionId === mission.id}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
        {renderMissionSection("Misi Harian", <Star className="h-8 w-8"/>, dailyMissions)}
        {renderMissionSection("Misi Mingguan", <Calendar className="h-8 w-8"/>, weeklyMissions)}
        {renderMissionSection("Misi Bulanan", <Moon className="h-8 w-8"/>, monthlyMissions)}
      
      <MissionCompletionDialog
        mission={selectedMission}
        isOpen={isDialogOpen}
        onOpenChange={handleDialogClose}
      />
    </div>
  );
}
