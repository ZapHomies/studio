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
import { CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { generateAvatar } from '@/ai/flows/generate-avatar';
import { useToast } from '@/hooks/use-toast';


interface EditProfileSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function EditProfileSheet({ isOpen, onOpenChange }: EditProfileSheetProps) {
  const { currentUser, updateUser } = useContext(UserDataContext);
  const { toast } = useToast();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(currentUser?.avatarUrl || '');
  
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name);
      setSelectedAvatarUrl(currentUser.avatarUrl);
      setGeneratedAvatarUrl(null);
      setGenerationPrompt('');
    }
  }, [isOpen, currentUser]);

  const handleSave = () => {
    if (!currentUser) return;
    updateUser({ name, avatarUrl: selectedAvatarUrl });
    onOpenChange(false);
  };

  const handleGenerateAvatar = async () => {
    if (!generationPrompt.trim()) return;
    setIsGenerating(true);
    setGeneratedAvatarUrl(null);
    try {
      const result = await generateAvatar({ prompt: generationPrompt });
      if (result.avatarDataUri) {
        setGeneratedAvatarUrl(result.avatarDataUri);
        setSelectedAvatarUrl(result.avatarDataUri);
      }
    } catch (error) {
      console.error("Pembuatan avatar gagal:", error);
      toast({
        variant: 'destructive',
        title: 'Pembuatan Avatar Gagal',
        description: 'Terjadi kesalahan saat membuat avatar Anda. Silakan coba lagi.'
      })
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline">Ubah Profil</SheetTitle>
          <SheetDescription>
            Perbarui nama Anda, pilih avatar, atau buat avatar baru menggunakan AI.
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

          <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
            <Label htmlFor="avatar-prompt" className="flex items-center gap-2 font-bold text-amber-700">
              <Sparkles className="h-5 w-5" />
              Buat Avatar dengan AI
            </Label>
            <p className="text-sm text-amber-900/80">
                Jelaskan avatar yang Anda inginkan, dan biarkan AI membuatnya untuk Anda.
            </p>
            <div className="flex gap-2 pt-2">
              <Input
                id="avatar-prompt"
                placeholder="Contoh: wanita berhijab biru tersenyum"
                value={generationPrompt}
                onChange={(e) => setGenerationPrompt(e.target.value)}
                disabled={isGenerating}
              />
              <Button onClick={handleGenerateAvatar} disabled={!generationPrompt.trim() || isGenerating} className="bg-amber-500 hover:bg-amber-600 text-white">
                {isGenerating ? <Loader2 className="animate-spin" /> : 'Buat'}
              </Button>
            </div>
          </div>


          <div className="space-y-2">
            <Label>Pilih Avatar</Label>
            <div className="grid grid-cols-3 gap-4 pt-2">
              {generatedAvatarUrl && (
                <div
                  className="relative cursor-pointer aspect-square"
                  onClick={() => setSelectedAvatarUrl(generatedAvatarUrl)}
                >
                  <Image
                    src={generatedAvatarUrl}
                    alt="Avatar buatan AI"
                    data-ai-hint="generated avatar"
                    width={100}
                    height={100}
                    className={cn(
                      'rounded-full border-4 transition-all w-full h-full object-cover',
                      selectedAvatarUrl === generatedAvatarUrl ? 'border-primary' : 'border-amber-400 hover:border-primary/50'
                    )}
                  />
                   <div className="absolute top-0 -left-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white border-2 border-background">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  {selectedAvatarUrl === generatedAvatarUrl && (
                    <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground border-2 border-background">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  )}
                </div>
              )}

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
