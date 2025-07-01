'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { generateDailyWisdom, type DailyWisdomOutput } from '@/ai/flows/generate-daily-wisdom';
import { Quote, BookOpen } from 'lucide-react';
import { isToday } from 'date-fns';

const CACHE_KEY = 'muslim-mission-daily-wisdom';

export default function DailyWisdom() {
  const [wisdom, setWisdom] = useState<DailyWisdomOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWisdom = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Cek cache terlebih dahulu
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          // Jika data dari hari ini, gunakan cache
          if (isToday(new Date(timestamp))) {
            setWisdom(data);
            setIsLoading(false);
            return;
          }
        }
        
        // Jika tidak ada di cache atau sudah kedaluwarsa, fetch baru
        const result = await generateDailyWisdom();
        setWisdom(result);
        // Simpan ke cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: result, timestamp: new Date().toISOString() }));

      } catch (err) {
        console.error("Gagal memuat Hikmah Harian:", err);
        setError("Gagal memuat hikmah untuk hari ini. Silakan coba lagi nanti.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWisdom();
  }, []);

  if (isLoading) {
    return (
      <Card className="mb-8 w-full border-dashed border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl text-primary">
            <BookOpen />
            Hikmah Harian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/2" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-1/4" />
        </CardFooter>
      </Card>
    );
  }

  if (error) {
    return (
       <Card className="mb-8 w-full border-dashed border-destructive/20 bg-destructive/5 text-center">
         <CardContent className="p-4 text-destructive">
           {error}
         </CardContent>
       </Card>
    )
  }

  if (!wisdom) return null;

  return (
    <Card className="mb-8 w-full border-dashed border-primary/20 bg-primary/5 shadow-sm transition-all hover:shadow-md">
       <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl text-primary">
            <BookOpen />
            Hikmah Harian
          </CardTitle>
        </CardHeader>
      <CardContent>
        <blockquote className="relative border-l-4 border-primary pl-4">
          <Quote className="absolute -top-3 -left-1 h-8 w-8 text-primary/20" />
          <p className="text-lg italic text-foreground">
            "{wisdom.wisdom}"
          </p>
        </blockquote>
      </CardContent>
      <CardFooter>
        <p className="text-sm font-medium text-muted-foreground">{wisdom.source}</p>
      </CardFooter>
    </Card>
  );
}
