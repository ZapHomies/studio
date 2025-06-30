'use client';

import { useState, useContext, useRef, ChangeEvent } from 'react';
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
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

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
  const [verificationFeedback, setVerificationFeedback] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { completeMission } = useContext(UserDataContext);

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

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setStatus('idle');
    setVerificationFeedback('');
    onOpenChange(false);
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
          completeMission(mission.id);
          toast({
            title: 'Mission Complete!',
            description: `You've earned ${mission.xp} XP. Well done!`,
          });
          setTimeout(resetState, 2000); // Close dialog after a short delay on success
        } else {
          setStatus('error');
          toast({
            title: 'Submission Not Approved',
            description: result.reason,
            variant: 'destructive',
          });
        }
      } catch (error) {
        setStatus('error');
        setVerificationFeedback('An unexpected error occurred during verification.');
        toast({
          title: 'Verification Failed',
          description: 'Could not verify the image. Please try again.',
          variant: 'destructive',
        });
      }
    };
    reader.onerror = () => {
      setStatus('error');
      setVerificationFeedback('Could not read the file.');
      toast({
        title: 'File Error',
        description: 'There was an issue reading your file.',
        variant: 'destructive',
      });
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-headline">{mission?.title}</DialogTitle>
          <DialogDescription>{mission?.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="mission-photo" className="text-sm font-medium">
              Proof of Completion
            </label>
            <Input
              id="mission-photo"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>
          {preview && (
            <div className="relative mt-2 h-48 w-full overflow-hidden rounded-md border">
              <Image src={preview} alt="Mission proof preview" layout="fill" objectFit="cover" />
            </div>
          )}
          {status !== 'idle' && verificationFeedback && (
             <Alert variant={status === 'success' ? 'success' : 'destructive'} className="mt-4">
               {status === 'success' && <CheckCircle className="h-4 w-4" />}
               {status === 'error' && <XCircle className="h-4 w-4" />}
               <AlertTitle>{status === 'success' ? 'Approved!' : 'Needs Review'}</AlertTitle>
               <AlertDescription>{verificationFeedback}</AlertDescription>
             </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={resetState} disabled={status === 'verifying'}>
            Cancel
          </Button>
          <Button onClick={handleVerify} disabled={!file || status === 'verifying' || status === 'success'}>
            {status === 'verifying' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {status === 'verifying' ? 'Verifying...' : 'Submit for Verification'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
