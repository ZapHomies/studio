'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Mic, User, Trophy, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/missions', icon: Home, label: 'Misi' },
  { href: '/leaderboard', icon: Trophy, label: 'Peringkat' },
  { href: '/forum', icon: MessageSquare, label: 'Forum'},
  { href: '/recitation', icon: Mic, label: 'Mengaji' },
  { href: '/profile', icon: User, label: 'Profil' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/90 backdrop-blur-sm">
      <div className="mx-auto grid h-16 max-w-2xl grid-cols-5 items-center justify-around px-2 sm:px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'scale-110 text-primary'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
