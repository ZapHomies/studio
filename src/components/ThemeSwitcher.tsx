'use client';

import { useContext, useMemo } from 'react';
import { useTheme } from '@/context/ThemeProvider';
import { themes, type Theme } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { UserDataContext } from '@/context/UserDataProvider';
import { rewards as allRewards } from '@/lib/data';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { currentUser } = useContext(UserDataContext);

  const availableThemes = useMemo(() => {
    if (!currentUser) {
      return themes.filter(t => ['Default', 'Midnight', 'Oasis', 'Rosewater', 'Emerald'].includes(t.name));
    }
    
    const unlockedThemeRewards = allRewards.filter(r => r.type === 'theme' && currentUser.unlocked_reward_ids.includes(r.id));
    const unlockedThemeNames = unlockedThemeRewards.map(r => r.value);
    
    const defaultThemes = ['Default', 'Midnight', 'Oasis', 'Rosewater', 'Emerald'];
    const allAvailableNames = new Set([...defaultThemes, ...unlockedThemeNames]);

    return themes.filter(t => allAvailableNames.has(t.name));
  }, [currentUser]);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {availableThemes.map((t) => (
        <div key={t.name}>
          <button
            onClick={() => setTheme(t.name)}
            className={cn(
              'flex w-full flex-col items-center justify-center rounded-lg border-2 p-3 transition-all',
              theme.name === t.name
                ? 'border-primary'
                : 'border-muted hover:border-primary/50'
            )}
          >
            <div className="relative flex h-12 w-full items-center justify-center gap-1 overflow-hidden rounded-md">
                <div
                    className="h-full w-full rounded-md"
                    style={{ backgroundColor: `hsl(${t.colors['--background']})` }}
                >
                    <div className="flex h-full w-full items-end justify-end p-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: `hsl(${t.colors['--primary']})`}}>
                             <div className="h-2 w-2 rounded-full" style={{ backgroundColor: `hsl(${t.colors['--accent']})`}}/>
                        </div>
                    </div>
                </div>

              {theme.name === t.name && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Check className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <span className="mt-2 text-sm font-medium text-foreground">
              {t.name}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}
