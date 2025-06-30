'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Mic, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Missions' },
  { href: '/recitation', icon: Mic, label: 'Recite' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'text-primary'
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
