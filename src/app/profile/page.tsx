'use client';

import { useState, useContext } from 'react';
import ProfileDisplay from '@/components/ProfileDisplay';
import EditProfileSheet from '@/components/EditProfileSheet';
import { Button } from '@/components/ui/button';
import { Edit, Palette, LogOut, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { UserDataContext } from '@/context/UserDataProvider';
import RewardsSheet from '@/components/RewardsSheet';
import MyPostsSheet from '@/components/MyPostsSheet';

export default function ProfilePage() {
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isRewardsSheetOpen, setIsRewardsSheetOpen] = useState(false);
  const [isMyPostsSheetOpen, setIsMyPostsSheetOpen] = useState(false);
  const { logout } = useContext(UserDataContext);

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">
          Profil Anda
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setIsMyPostsSheetOpen(true)}
            className="shadow-sm"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Postingan Saya
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditSheetOpen(true)}
            className="shadow-sm"
          >
            <Edit className="mr-2 h-4 w-4" />
            Ubah Profil
          </Button>
        </div>
      </header>

      <ProfileDisplay onOpenRewards={() => setIsRewardsSheetOpen(true)} />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-headline text-2xl sm:text-3xl">
            <Palette />
            Ganti Tema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeSwitcher />
        </CardContent>
      </Card>

      <EditProfileSheet
        isOpen={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
      />
      <RewardsSheet
        isOpen={isRewardsSheetOpen}
        onOpenChange={setIsRewardsSheetOpen}
      />
      <MyPostsSheet
        isOpen={isMyPostsSheetOpen}
        onOpenChange={setIsMyPostsSheetOpen}
      />

      <Button
        onClick={logout}
        variant="outline"
        className="h-12 w-full text-base sm:text-lg"
      >
        <LogOut className="mr-2 h-5 w-5" />
        Keluar
      </Button>
    </div>
  );
}
