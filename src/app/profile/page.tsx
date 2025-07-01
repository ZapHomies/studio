'use client';

import { useState } from 'react';
import ProfileDisplay from '@/components/ProfileDisplay';
import EditProfileSheet from '@/components/EditProfileSheet';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

export default function ProfilePage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
       <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">
          Profil Anda
        </h1>
        <Button variant="outline" onClick={() => setIsSheetOpen(true)} className="shadow-sm">
            <Edit className="mr-2 h-4 w-4" />
            Ubah Profil
        </Button>
      </header>
      <ProfileDisplay />
      <EditProfileSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </div>
  );
}
