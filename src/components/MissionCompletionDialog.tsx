'use client';

import { useState, useContext, useRef, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { type Mission } from '@/lib/types';
import { UserDataContext } from '@/context/UserDataProvider';
import { verifyMissionPhoto } from '@/ai/flows/verify-mission-photo';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, CheckCircle, XCircle, Zap, Send } from 'lucide-react';

interface MissionCompletionDialogProps {
  mission: Mission | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'error';

export default function MissionCompletionDialog({
  mission,
  isOpen,
  onOpenChange,
}: MissionCompletionDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [isCompleting, setIsCompleting] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { completeMission } = useContext(UserDataProvider);

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setStatus('idle');
    setVerificationFeedback('');
    setIsCompleting(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setStatus('idle');
      setVerificationFeedback('');
    }
  };

  const handleCompleteWithoutProof = async () => {
    if (!mission) return;
    setIsCompleting(true);
    await completeMission(mission.id);
    toast({
        title: 'Misi Selesai!',
        description: `Anda mendapatkan ${mission.xp} XP.`,
        variant: 'success'
    });
    resetState();
  };

  const handleVerify = async () => {
    if (!file || !mission) return;

    setStatus('verifying');
    setVerificationFeedback('');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const photoDataUri = reader.result as string;
      try {
        const result = await verifyMissionPhoto({
          photoDataUri,
          missionDescription: mission.description,
        });

        setVerificationFeedback(result.reason);

        if (result.isRelevant) {
          setStatus('success');
          await completeMission(mission.id, mission.bonusXp);
          toast({
            title: 'Bonus Didapat!',
            description: `Bukti terverifikasi! Anda mendapatkan total ${mission.xp + (mission.bonusXp || 0)} XP.`,
            variant: 'success'
          });
          setTimeout(resetState, 2000); 
        } else {
          setStatus('error');
          toast({
            title: 'Pengajuan Bonus Ditolak',
            description: result.reason,
            variant: 'destructive',
          });
        }
      } catch (error) {
        setStatus('error');
        setVerificationFeedback('Terjadi kesalahan tak terduga saat verifikasi.');
        toast({
          title: 'Verifikasi Gagal',
          description: 'Tidak dapat memverifikasi gambar. Silakan coba lagi.',
          variant: 'destructive',
        });
      }
    };
    reader.onerror = () => {
      setStatus('error');
      setVerificationFeedback('Tidak dapat membaca file.');
      toast({
        title: 'Kesalahan File',
        description: 'Terjadi masalah saat membaca file Anda.',
        variant: 'destructive',
      });
    };
  };

  useEffect(() => {
    if (!isOpen) {
        // Give animations time to finish before resetting state
        setTimeout(() => {
            setStatus('idle');
            setFile(null);
            setPreview(null);
            setVerificationFeedback('');
            setIsCompleting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }, 300);
    }
  }, [isOpen]);

  const isBusy = status === 'verifying' || status === 'success' || isCompleting;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => {
          if (isBusy) {
            e.preventDefault();
          }
        }}>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{mission?.title}</DialogTitle>
          <DialogDescription>{mission?.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="mission-photo" className="text-sm font-medium">
              Unggah Bukti (Opsional untuk Bonus XP)
            </label>
            <Input
              id="mission-photo"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="cursor-pointer"
              disabled={isBusy}
            />
          </div>
          {preview && (
            <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-md border">
              <Image src={preview} alt="Pratinjau bukti misi" layout="fill" objectFit="cover" />
            </div>
          )}
          {status !== 'idle' && verificationFeedback && (
             <Alert variant={status === 'success' ? 'success' : 'destructive'} className="mt-4">
               {status === 'success' && <CheckCircle className="h-4 w-4" />}
               {status === 'error' && <XCircle className="h-4 w-4" />}
               <AlertTitle>{status === 'success' ? 'Disetujui!' : 'Perlu Tinjauan'}</AlertTitle>
               <AlertDescription>{verificationFeedback}</AlertDescription>
             </Alert>
          )}
        </div>
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button variant="secondary" onClick={handleCompleteWithoutProof} disabled={isBusy}>
            {isCompleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4"/>}
            Selesaikan ({mission?.xp} XP)
          </Button>
          <Button onClick={handleVerify} disabled={!file || isBusy}>
            {status === 'verifying' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4"/>}
            {status === 'verifying' ? 'Memverifikasi...' : `Klaim Bonus (+${mission?.bonusXp || 0} XP)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
