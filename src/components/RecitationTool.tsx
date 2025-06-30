'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { provideRecitationFeedback } from '@/ai/flows/provide-recitation-feedback';
import { Mic, Square, Loader2, BookOpen } from 'lucide-react';

type RecordingStatus = 'idle' | 'recording' | 'processing' | 'finished';

export default function RecitationTool() {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [feedback, setFeedback] = useState<string>('');
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

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
      <CardContent className="p-6 flex flex-col items-center gap-6">
        {getButton()}
        {feedback && (
          <Card className="w-full bg-background/50">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <BookOpen />
                Umpan Balik Bacaan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap">{feedback}</p>
            </CardContent>
          </Card>
        )}
        {status === 'idle' && !feedback && (
            <div className="text-center text-muted-foreground p-8">
                <p>Tekan "Mulai Merekam" untuk memulai bacaan Anda.</p>
                <p className="text-sm mt-2">Bacalah sebuah ayat dari Al-Quran dan dapatkan umpan balik tentang Tajwid Anda.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
