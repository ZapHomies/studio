'use client';
import { useContext, useEffect, useState } from 'react';
import MissionList from "@/components/MissionList";
import { KaabaIcon } from "@/components/icons/KaabaIcon";
import { UserDataContext } from '@/context/UserDataProvider';
import WelcomeDialog from '@/components/WelcomeDialog';
import DailyWisdom from '@/components/DailyWisdom';

export default function MissionsPage() {
  const { currentUser, markWelcomeAsSeen } = useContext(UserDataContext);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

  useEffect(() => {
    // Sedikit penundaan untuk memastikan transisi halaman selesai
    const timer = setTimeout(() => {
      if (currentUser && !currentUser.has_seen_welcome) {
        setIsWelcomeOpen(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [currentUser]);

  const handleWelcomeClose = () => {
    setIsWelcomeOpen(false);
    markWelcomeAsSeen();
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <DailyWisdom />
      
      <header className="mb-10 flex flex-col items-center justify-center text-center">
        <KaabaIcon className="h-14 w-14 text-primary" />
        <h1 className="mt-4 font-headline text-4xl font-bold text-primary sm:text-5xl">
          Muslim Mission
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Selesaikan misi, dapatkan XP, dan tingkatkan iman Anda setiap hari. Misi harian akan diganti saat selesai!
        </p>
      </header>
      
      <MissionList />

      <WelcomeDialog isOpen={isWelcomeOpen} onOpenChange={handleWelcomeClose} />
    </div>
  );
}
