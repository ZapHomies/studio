'use client';

import { useContext, useState, useMemo } from 'react';
import { UserDataContext } from '@/context/UserDataProvider';
import { type Mission } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MissionCompletionDialog from './MissionCompletionDialog';
import { Badge } from './ui/badge';
import { CheckCircle, Zap, ChevronsRight, Calendar, Star, Moon, Loader2, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MissionCard = ({ mission, onAction, onOpenDialog, isCompleting }: { mission: Mission, onAction: (mission: Mission) => void, onOpenDialog: (mission: Mission) => void, isCompleting: boolean }) => {
    const { currentUser } = useContext(UserDataContext);
    
    if (!currentUser) return null;

    const isCompleted = currentUser.completed_missions.includes(mission.id);

    const renderMissionButton = () => {
        if (isCompleted) {
            return (
                <Button disabled className="w-full bg-success/80 text-success-foreground hover:bg-success/80">
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
        <Card className="flex flex-col overflow-hidden border-2 border-transparent shadow-lg transition-all hover:border-primary/50 hover:shadow-xl">
            <CardHeader>
                <CardTitle className="font-headline text-xl text-primary">{mission.title}</CardTitle>
                <CardDescription className="text-base">{mission.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-accent text-accent-foreground bg-accent/20">
                      {mission.xp} XP
                    </Badge>
                     <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-400/20">
                      <Coins className="mr-1 h-3 w-3" />
                      {mission.coins || 0}
                    </Badge>
                    {mission.bonus_xp && (
                    <Badge variant="default" className="bg-amber-500 text-white hover:bg-amber-600">
                        <Zap className="mr-1 h-3 w-3" /> +{mission.bonus_xp} XP Bonus
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
  const { missions, isLoading, currentUser, completeMission } = useContext(UserDataContext);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [completingMissionId, setCompletingMissionId] = useState<string | null>(null);
  const { toast } = useToast();
  
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
      description: `Anda mendapatkan ${mission.xp} XP dan ${mission.coins || 0} Koin untuk menyelesaikan "${mission.title}".`,
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
    if (isLoading && missionList.length === 0) {
        return (
            <div className="mb-12">
                 <h2 className="mb-6 flex items-center gap-3 font-headline text-3xl font-bold text-primary md:text-4xl">
                    {icon}
                    {title}
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                   <div className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                     <p className="text-muted-foreground">Membuat misi baru...</p>
                   </div>
                </div>
            </div>
        )
    }
    
    if (!currentUser) return null;

    // Daily missions are removed from the list upon completion, so an empty list means they're all done.
    // For other categories, we check if all missions in the list have been completed.
    const allCompleted = missionList.length > 0 && missionList.every(m => currentUser.completed_missions.includes(m.id));
    const showCompletionCard = allCompleted || (title === 'Misi Harian' && missionList.length === 0);

    return (
      <div className="mb-12">
        <h2 className="mb-6 flex items-center gap-3 font-headline text-3xl font-bold text-primary md:text-4xl">
          {icon}
          {title}
        </h2>
        {showCompletionCard ? (
            <Card className="mb-6 border-dashed border-success bg-success/10 p-6 text-center text-success-foreground shadow-md">
                <CheckCircle className="mx-auto h-12 w-12 text-success" />
                <CardTitle className="mt-4 font-headline text-2xl">Luar Biasa!</CardTitle>
                <CardDescription className="mt-2 text-lg">
                    {title === 'Misi Harian'
                        ? "Anda telah menyelesaikan semua misi harian. Misi baru akan muncul besok!"
                        : `Anda telah menyelesaikan semua ${title.toLowerCase()}. Nantikan tantangan baru selanjutnya!`}
                </CardDescription>
            </Card>
        ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        )}
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
