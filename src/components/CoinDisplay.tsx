'use client';

import { useContext } from 'react';
import { UserDataContext } from '@/context/UserDataProvider';
import { Coins } from 'lucide-react';
import Link from 'next/link';

export default function CoinDisplay() {
  const { currentUser } = useContext(UserDataContext);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
       <Link href="/profile">
          <div className="flex cursor-pointer items-center gap-2 rounded-full bg-amber-400/20 px-4 py-2 font-bold text-amber-600 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl border border-amber-500/30">
            <Coins className="h-5 w-5" />
            <span>{(currentUser.coins || 0).toLocaleString()}</span>
          </div>
      </Link>
    </div>
  );
}
