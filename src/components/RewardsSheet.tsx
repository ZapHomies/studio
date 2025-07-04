'use client';

import { useContext, useMemo } from 'react';
import { UserDataContext } from '@/context/UserDataProvider';
import { rewards, type Reward } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Gift, Check, Gem, CalendarClock, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { themes } from '@/lib/themes';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RewardsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const RewardCard = ({ reward, isRamadan }: { reward: Reward; isRamadan: boolean }) => {
    const { currentUser, redeemReward } = useContext(UserDataContext);
    const { toast } = useToast();

    if (!currentUser) return null;

    const isUnlocked = currentUser.unlocked_reward_ids.includes(reward.id);
    const canAfford = (currentUser.coins || 0) >= reward.cost;
    const isSeasonal = reward.season === 'Ramadan';
    const isEventActive = isRamadan;

    const handleRedeem = () => {
        if (isUnlocked) return;
        
        if (isSeasonal && !isEventActive) {
            toast({
                variant: 'destructive',
                title: 'Belum Tersedia',
                description: `Hadiah ini hanya dapat ditukar selama ${reward.season}.`,
            });
            return;
        }

        if (!canAfford) {
            toast({
                variant: 'destructive',
                title: 'Koin Tidak Cukup',
                description: `Anda memerlukan ${reward.cost.toLocaleString()} Koin untuk menukarkan hadiah ini.`,
            });
            return;
        }
        redeemReward(reward.id);
    };

    const isButtonDisabled = isUnlocked || (isSeasonal && !isEventActive);
    
    const getRewardPreview = () => {
        if (reward.type === 'theme') {
            const themeData = themes.find(t => t.name === reward.value);
            if (!themeData) return null;
            return (
                 <div className="flex h-20 w-full items-center justify-center gap-1 overflow-hidden rounded-md border">
                    <div
                        className="h-full w-full rounded-md"
                        style={{ backgroundColor: `hsl(${themeData.colors['--background']})` }}
                    >
                        <div className="flex h-full w-full items-end justify-end p-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `hsl(${themeData.colors['--primary']})`}}>
                                 <div className="h-3 w-3 rounded-full" style={{ backgroundColor: `hsl(${themeData.colors['--accent']})`}}/>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        if (reward.type === 'border') {
            if (reward.style === 'gradient') {
                 return (
                    <div className="flex h-20 w-full items-center justify-center">
                        <div className={cn("flex h-16 w-16 items-center justify-center rounded-full p-1", reward.value)}>
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                                <Gem className="h-8 w-8 text-muted-foreground"/>
                            </div>
                        </div>
                    </div>
                )
            }
            // Fallback for solid borders
            return (
                <div className="flex h-20 w-full items-center justify-center">
                    <div className={cn("flex h-16 w-16 items-center justify-center rounded-full bg-muted border-4", reward.value)}>
                       <Gem className="h-8 w-8 text-muted-foreground"/>
                    </div>
                </div>
            )
        }
        return null;
    }

  return (
    <Card className={cn(
        "flex flex-col transition-all", 
        isUnlocked && "bg-success/5 border-success/20",
        isSeasonal && !isEventActive && "opacity-70 bg-muted/30"
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl">
            {reward.name}
             {reward.season === 'Ramadan' && <CalendarClock className="h-4 w-4 text-amber-600" />}
        </CardTitle>
        <CardDescription>
            {reward.description}
            {isSeasonal && !isEventActive && (
                <span className="mt-1 block text-xs font-bold text-amber-700">Tersedia saat Ramadan.</span>
            )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {getRewardPreview()}
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button onClick={handleRedeem} disabled={isButtonDisabled} className="w-full">
            {isUnlocked ? (
                <>
                <Check className="mr-2 h-4 w-4" />
                Telah Dimiliki
                </>
            ) : isSeasonal && !isEventActive ? (
                <>
                    <CalendarClock className="mr-2 h-4 w-4" />
                    Tersedia saat Ramadan
                </>
            ) : reward.cost > 0 ? (
                <>
                Tukar ({reward.cost.toLocaleString()} Koin)
                </>
            ) : (
                <>
                    Klaim Gratis
                </>
            )}
        </Button>
      </CardFooter>
    </Card>
  );
};


export default function RewardsSheet({ isOpen, onOpenChange }: RewardsSheetProps) {
    const { currentUser } = useContext(UserDataContext);

    const { themeRewards, borderRewards, isRamadan } = useMemo(() => {
        const now = new Date();
        const ramadanIsActive = now.getMonth() + 1 === 3;

        return {
            themeRewards: rewards.filter(r => r.type === 'theme'),
            borderRewards: rewards.filter(r => r.type === 'border'),
            isRamadan: ramadanIsActive,
        };
    }, []);

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="flex w-full flex-col p-0 sm:max-w-lg">
                <SheetHeader className="p-6 pb-4">
                    <SheetTitle className="flex items-center justify-center sm:justify-start gap-3 font-headline text-2xl">
                        <Gift className="h-7 w-7 text-primary"/>
                        Toko Hadiah
                    </SheetTitle>
                    <div className="text-center sm:text-left">
                        <SheetDescription>
                            Gunakan Koin yang telah Anda kumpulkan untuk menukarkan hadiah eksklusif!
                        </SheetDescription>
                        {currentUser && (
                            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-4 py-2 text-sm font-bold text-amber-600">
                                <Coins className="h-5 w-5" />
                                Koin Anda: {(currentUser.coins || 0).toLocaleString()}
                            </div>
                        )}
                    </div>
                </SheetHeader>
                <ScrollArea className="flex-grow px-6">
                   <div className="space-y-8 py-4">
                        <section className="space-y-4">
                            <h2 className="font-headline text-3xl text-primary">Tema Aplikasi</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {themeRewards.map(reward => (
                                    <RewardCard key={reward.id} reward={reward} isRamadan={isRamadan} />
                                ))}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-headline text-3xl text-primary">Bingkai Profil</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {borderRewards.map(reward => (
                                    <RewardCard key={reward.id} reward={reward} isRamadan={isRamadan} />
                                ))}
                            </div>
                        </section>
                   </div>
                </ScrollArea>
                 <SheetFooter className="p-6 pt-4 border-t bg-background">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">Tutup</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
