'use client';

import { useState, useRef, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { provideRecitationFeedback } from '@/ai/flows/provide-recitation-feedback';
import { Mic, Square, Loader2, BookOpen } from 'lucide-react';
import { UserDataContext } from '@/context/UserDataProvider';

type RecordingStatus = 'idle' | 'recording' | 'processing' | 'finished';

export default function RecitationTool() {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [feedback, setFeedback] = useState<string>('');
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();
  const { currentUser, missions, completeMission } = useContext(UserDataContext);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    setStatus('recording');
    setFeedback('');
    setTimer(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = handleStop;
      mediaRecorderRef.current.start();
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } catch (err) {
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
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setStatus('processing');
    }
  };

  const handleStop = async () => {
    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
    chunksRef.current = [];

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const audioDataUri = reader.result as string;
      try {
        const result = await provideRecitationFeedback({ audioDataUri });
        setFeedback(result.feedback);
        
        if (currentUser) {
            const quranMission = missions.find(m => m.id === 'monthly-quran-recite');
            if (quranMission && !currentUser.completedMissions.includes(quranMission.id)) {
                const xpGained = Math.min(200, 10 + (timer * 2));
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
        setStatus('finished');
      }
    };
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getButton = () => {
    switch (status) {
      case 'recording':
        return (
          <Button onClick={stopRecording} size="lg" variant="destructive" className="w-full">
            <Square className="mr-2 h-5 w-5" />
            Hentikan Rekaman ({formatTime(timer)})
          </Button>
        );
      case 'processing':
        return (
          <Button disabled size="lg" className="w-full">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Memproses...
          </Button>
        );
      default:
        return (
          <Button onClick={startRecording} size="lg" className="w-full">
            <Mic className="mr-2 h-5 w-5" />
            Mulai Merekam
          </Button>
        );
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="flex flex-col items-center gap-6 p-6">
        {getButton()}
        
        {feedback && (
          <div className="w-full space-y-2 rounded-lg border bg-background/50 p-4">
            <h3 className="flex items-center gap-2 font-headline text-lg font-semibold">
              <BookOpen className="h-5 w-5"/>
              Umpan Balik Bacaan
            </h3>
            <p className="whitespace-pre-wrap text-foreground">{feedback}</p>
          </div>
        )}

        {status === 'idle' && !feedback && (
            <div className="p-8 text-center text-muted-foreground">
                <p>Tekan "Mulai Merekam" untuk memulai bacaan Anda.</p>
                <p className="mt-2 text-sm">Bacalah sebuah ayat dari Al-Quran dan dapatkan umpan balik tentang Tajwid Anda.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
