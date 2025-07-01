'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Home, Trophy, Mic, User, Zap, Palette, CheckCircle, Star } from 'lucide-react';

interface WelcomeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const FeatureItem = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
        </div>
        <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
);


export default function WelcomeDialog({
  isOpen,
  onOpenChange,
}: WelcomeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center font-headline text-2xl">
            <Star className="text-amber-500" />
            Selamat Datang di Muslim Mission!
          </DialogTitle>
          <DialogDescription className="text-center">
            Ini adalah panduan singkat untuk memulai perjalanan iman Anda bersama kami.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <FeatureItem 
                icon={Home}
                title="Selesaikan Misi Harian"
                description="Kunjungi halaman 'Misi' untuk melihat tugas-tugas yang menambah XP dan memperkuat iman."
            />
            <FeatureItem 
                icon={Zap}
                title="Dapatkan XP & Naik Level"
                description="Setiap misi yang selesai akan memberimu XP. Naikkan levelmu untuk membuka gelar baru."
            />
             <FeatureItem 
                icon={Trophy}
                title="Lihat Papan Peringkat"
                description="Bersaing secara sehat dengan pengguna lain dan lihat posisimu di halaman 'Peringkat'."
            />
            <FeatureItem 
                icon={Mic}
                title="Latihan Mengaji"
                description="Gunakan fitur 'Mengaji' untuk merekam bacaanmu dan dapatkan umpan balik dari AI."
            />
             <FeatureItem 
                icon={Palette}
                title="Personalisasi Profil & Tema"
                description="Ubah avatarmu dan pilih tema warna favoritmu di halaman 'Profil'."
            />
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            <CheckCircle className="mr-2 h-4 w-4" />
            Saya Mengerti, Mulai Petualangan!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
