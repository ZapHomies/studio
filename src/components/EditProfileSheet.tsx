'use client';

import { useState, useContext, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { UserDataContext } from '@/context/UserDataProvider';
import { avatarPool } from '@/lib/data';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface EditProfileSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function EditProfileSheet({ isOpen, onOpenChange }: EditProfileSheetProps) {
  const { user, updateUser } = useContext(UserDataContext);
  const [name, setName] = useState(user.name);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(user.avatarUrl);

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setSelectedAvatarUrl(user.avatarUrl);
    }
  }, [isOpen, user]);

  const handleSave = () => {
    updateUser({ name, avatarUrl: selectedAvatarUrl });
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline">Ubah Profil</SheetTitle>
          <SheetDescription>
            Perbarui nama dan pilih avatar baru untuk profil Anda. Klik simpan jika sudah selesai.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-grow space-y-6 overflow-y-auto py-4 pr-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label>Pilih Avatar</Label>
            <div className="grid grid-cols-3 gap-4 pt-2">
              {avatarPool.map((avatar) => (
                <div
                  key={avatar.url}
                  className="relative cursor-pointer aspect-square"
                  onClick={() => setSelectedAvatarUrl(avatar.url)}
                >
                  <Image
                    src={avatar.url}
                    alt={avatar.hint}
                    data-ai-hint={avatar.hint}
                    width={100}
                    height={100}
                    className={cn(
                      'rounded-full border-4 transition-all w-full h-full object-cover',
                      selectedAvatarUrl === avatar.url ? 'border-primary' : 'border-transparent hover:border-primary/50'
                    )}
                  />
                  {selectedAvatarUrl === avatar.url && (
                    <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground border-2 border-background">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Batal</Button>
          </SheetClose>
          <Button onClick={handleSave}>Simpan Perubahan</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
