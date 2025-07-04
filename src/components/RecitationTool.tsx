'use client';

import { useState, useRef, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { provideRecitationFeedback } from '@/ai/flows/provide-recitation-feedback';
import { Mic, Square, Loader2, BookOpen, Sparkles } from 'lucide-react';
import { UserDataContext } from '@/context/UserDataProvider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

type RecordingStatus = 'idle' | 'recording' | 'processing';

export default function RecitationTool() {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [feedback, setFeedback] = useState<string>('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();
  const { currentUser, missions, completeMission } = useContext(UserDataContext);

  const startRecording = async () => {
    setStatus('recording');
    setFeedback('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
            chunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = handleStop;
      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Microphone access error:", err);
      toast({
        title: 'Izin Ditolak',
        description: 'Akses mikrofon diperlukan untuk merekam bacaan.',
        variant: 'destructive',
      });
      setStatus('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      setStatus('processing');
    }
  };

  const handleStop = async () => {
    if (chunksRef.current.length === 0) {
        console.error("No audio data recorded.");
        toast({ title: "Rekaman Gagal", description: "Tidak ada data audio yang terekam. Mohon coba lagi.", variant: 'destructive' });
        setStatus('idle');
        return;
    }

    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
    chunksRef.current = [];

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const audioDataUri = reader.result as string;
      try {
        const result = await provideRecitationFeedback({ audio_data_uri: audioDataUri });
        setFeedback(result.feedback);
        setIsSheetOpen(true);
        
        // Auto-complete mission logic
        if (currentUser) {
            const quranMission = missions.find(m => m.id === 'monthly-quran-recite');
            if (quranMission && !currentUser.completed_missions.includes(quranMission.id)) {
                // Simplified XP calculation
                const xpGained = Math.min(200, 50); 
                await completeMission(quranMission.id, 0, xpGained);
                toast({
                    title: "Misi Otomatis Selesai!",
                    description: `Anda menyelesaikan "${quranMission.title}" dan mendapatkan ${xpGained} XP.`,
                    variant: 'success'
                });
            }
        }
      } catch (error) {
        toast({
          title: 'Analisis Gagal',
          description: 'Tidak dapat menganalisis rekaman. Silakan coba lagi.',
          variant: 'destructive',
        });
        setFeedback('Terjadi kesalahan. Silakan coba lagi.');
      } finally {
        setStatus('idle');
      }
    };
     reader.onerror = (error) => {
        console.error("File reader error:", error);
        toast({ title: 'Gagal Membaca Rekaman', variant: 'destructive' });
        setStatus('idle');
    };
  };

  const handleButtonClick = () => {
    if (status === 'idle') {
      startRecording();
    } else if (status === 'recording') {
      stopRecording();
    }
  };

  return (
    <>
        <div className="fixed bottom-20 right-4 z-50 md:bottom-8 md:right-8">
            <Button 
                onClick={handleButtonClick} 
                disabled={status === 'processing'}
                size="icon" 
                className="h-16 w-16 rounded-full shadow-lg"
                aria-label={status === 'recording' ? 'Hentikan Rekaman' : 'Mulai Merekam'}
                variant={status === 'recording' ? 'destructive' : 'default'}
            >
            {status === 'idle' && <Mic className="h-8 w-8" />}
            {status === 'recording' && <Square className="h-8 w-8" />}
            {status === 'processing' && <Loader2 className="h-8 w-8 animate-spin" />}
            </Button>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent>
                <SheetHeader>
                <SheetTitle className="flex items-center gap-2 font-headline text-2xl">
                    <Sparkles className="text-primary"/>
                    Umpan Balik AI
                </SheetTitle>
                <SheetDescription>
                    Berikut adalah hasil analisis dari ahli Tajwid AI kami mengenai bacaan Anda.
                </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                    <div className="w-full space-y-2 rounded-lg border bg-background/50 p-4">
                        <h3 className="flex items-center gap-2 font-headline text-lg font-semibold">
                            <BookOpen className="h-5 w-5"/>
                            Umpan Balik Bacaan
                        </h3>
                        <p className="whitespace-pre-wrap text-foreground">{feedback}</p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    </>
  );
}
