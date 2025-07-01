
'use client';

import { useContext, useMemo } from 'react';
import { UserDataContext } from '@/context/UserDataProvider';
import { rewards, type Reward } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Gift, Check, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import { themes } from '@/lib/themes';

const RewardCard = ({ reward }: { reward: Reward }) => {
    const { currentUser, redeemReward } = useContext(UserDataContext);
    const { toast } = useToast();

    if (!currentUser) return null;

    const isUnlocked = currentUser.unlockedRewardIds.includes(reward.id);
    const canAfford = currentUser.xp >= reward.cost;

    const handleRedeem = () => {
        if (isUnlocked) return;
        if (!canAfford) {
            toast({
                variant: 'destructive',
                title: 'XP Tidak Cukup',
                description: `Anda memerlukan ${reward.cost.toLocaleString()} XP untuk menukarkan hadiah ini.`,
            });
            return;
        }
        redeemReward(reward.id);
    };
    
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
            return (
                <div className="flex h-20 w-full items-center justify-center">
                    <div className={cn("flex h-16 w-16 items-center justify-center rounded-full bg-muted", reward.value.replace('border-','border-4 '))}>
                       <Gem className="h-8 w-8 text-muted-foreground"/>
                    </div>
                </div>
            )
        }
        return null;
    }

  return (
    <Card className={cn("flex flex-col transition-all", isUnlocked && "bg-success/5 border-success/20")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl">
            {reward.name}
        </CardTitle>
        <CardDescription>{reward.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {getRewardPreview()}
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button onClick={handleRedeem} disabled={isUnlocked} className="w-full">
          {isUnlocked ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Telah Dimiliki
            </>
          ) : (
            <>
              Tukar ({reward.cost.toLocaleString()} XP)
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function RewardsPage() {
    const { currentUser } = useContext(UserDataContext);

    const { themeRewards, borderRewards } = useMemo(() => {
        return {
            themeRewards: rewards.filter(r => r.type === 'theme'),
            borderRewards: rewards.filter(r => r.type === 'border'),
        };
    }, []);

    return (
        <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
            <header className="flex flex-col items-center justify-center text-center">
                <Gift className="h-16 w-16 text-primary" />
                <h1 className="mt-4 font-headline text-4xl font-bold text-primary sm:text-5xl">Toko Hadiah</h1>
                <p className="mt-2 max-w-2xl text-base text-muted-foreground sm:text-lg">
                Gunakan XP yang telah Anda kumpulkan untuk menukarkan hadiah eksklusif!
                </p>
                {currentUser && (
                    <div className="mt-4 rounded-full bg-amber-400/20 px-4 py-2 font-bold text-amber-600">
                        XP Anda: {currentUser.xp.toLocaleString()}
                    </div>
                )}
            </header>

            <section className="space-y-4">
                <h2 className="font-headline text-3xl text-primary">Tema Aplikasi</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {themeRewards.map(reward => (
                        <RewardCard key={reward.id} reward={reward} />
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="font-headline text-3xl text-primary">Bingkai Profil</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                     {borderRewards.map(reward => (
                        <RewardCard key={reward.id} reward={reward} />
                    ))}
                </div>
            </section>
        </div>
    );
}
