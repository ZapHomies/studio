'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Mic, ServerCrash } from "lucide-react";
import { Skeleton } from './ui/skeleton';

interface SurahInfo {
  id: number;
  name_simple: string;
  translated_name: {
    name: string;
  };
}

interface Ayah {
  id: number;
  verse_key: string;
  text_uthmani: string;
  translation: string;
}

interface SelectedSurahData {
    id: number;
    name_simple: string;
    translated_name: {
        name: string;
    };
    ayahs: Ayah[];
}


export default function QuranReader() {
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [selectedSurahId, setSelectedSurahId] = useState('1');
  const [selectedSurahData, setSelectedSurahData] = useState<SelectedSurahData | null>(null);
  const [isLoadingSurahs, setIsLoadingSurahs] = useState(true);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch list of all surahs on component mount
  useEffect(() => {
    const fetchSurahs = async () => {
      setIsLoadingSurahs(true);
      setError(null);
      try {
        const response = await fetch('https://api.quran.com/api/v4/chapters?language=id');
        if (!response.ok) {
          throw new Error('Gagal memuat daftar surat.');
        }
        const data = await response.json();
        setSurahs(data.chapters);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.');
      } finally {
        setIsLoadingSurahs(false);
      }
    };

    fetchSurahs();
  }, []);

  // Fetch verses of the selected surah when selection changes
  useEffect(() => {
    if (!selectedSurahId) return;

    const fetchSurahData = async () => {
      setIsLoadingAyahs(true);
      setError(null);
      setSelectedSurahData(null);
      try {
        // Fetch Arabic text and Indonesian translation in parallel
        const [versesRes, translationRes] = await Promise.all([
          fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${selectedSurahId}`),
          fetch(`https://api.quran.com/api/v4/quran/translations/134?chapter_number=${selectedSurahId}`) // 134 is the ID for Indonesian translation
        ]);

        if (!versesRes.ok || !translationRes.ok) {
          throw new Error('Gagal memuat ayat dan terjemahan.');
        }

        const versesData = await versesRes.json();
        const translationData = await translationRes.json();

        // Combine the verses and translations
        const combinedAyahs = versesData.verses.map((ayah: any, index: number) => ({
          id: ayah.id,
          verse_key: ayah.verse_key,
          text_uthmani: ayah.text_uthmani,
          translation: translationData.translations[index].text,
        }));
        
        const currentSurahInfo = surahs.find(s => s.id.toString() === selectedSurahId);
        if (currentSurahInfo) {
             setSelectedSurahData({
                ...currentSurahInfo,
                ayahs: combinedAyahs
             });
        }

      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.');
      } finally {
        setIsLoadingAyahs(false);
      }
    };

    if (surahs.length > 0) {
        fetchSurahData();
    }
  }, [selectedSurahId, surahs]);

  return (
    <div className="space-y-6">
      <Card>
          <CardHeader>
              <CardTitle>Pilih Surat</CardTitle>
              <Select value={selectedSurahId} onValueChange={setSelectedSurahId} disabled={isLoadingSurahs || isLoadingAyahs}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={isLoadingSurahs ? "Memuat surat..." : "Pilih surat..."} />
                </SelectTrigger>
                <SelectContent>
                    {surahs.map((surah) => (
                        <SelectItem key={surah.id} value={surah.id.toString()}>
                            {surah.id}. {surah.name_simple} ({surah.translated_name.name})
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
          </CardHeader>
      </Card>
      
      <Alert variant="default" className="bg-primary/5 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="font-bold text-primary">Cara Menggunakan</AlertTitle>
          <AlertDescription className="text-foreground/80">
              Pilih surat yang ingin Anda baca, lalu tekan ikon mikrofon <Mic className="inline h-4 w-4"/> di pojok kanan bawah untuk mulai merekam. Setelah selesai, AI akan memberikan umpan balik tentang bacaan Anda.
          </AlertDescription>
      </Alert>

      {error && (
         <Alert variant="destructive">
            <ServerCrash className="h-4 w-4" />
            <AlertTitle>Terjadi Kesalahan</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}
      
      <Card>
          <CardHeader className="text-center">
            {isLoadingAyahs || (!selectedSurahData && !error) ? (
                <>
                    <Skeleton className="h-8 w-1/2 mx-auto" />
                    <Skeleton className="h-5 w-1/3 mx-auto mt-2" />
                </>
            ) : selectedSurahData ? (
                <>
                    <CardTitle className="font-headline text-3xl">{selectedSurahData.name_simple}</CardTitle>
                    <CardDescription>{selectedSurahData.translated_name.name}</CardDescription>
                </>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-8">
              {isLoadingAyahs ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-4 border-b pb-6 last:border-b-0">
                        <div className="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
                            <Skeleton className="h-5 w-24" />
                            <div className="flex w-full justify-end">
                               <Skeleton className="h-8 w-full max-w-md" />
                            </div>
                        </div>
                        <Skeleton className="h-5 w-full" />
                    </div>
                  ))
              ) : selectedSurahData ? (
                  selectedSurahData.ayahs.map((ayah) => (
                    <div key={ayah.id} className="flex flex-col gap-4 border-b pb-6 last:border-b-0">
                        <div className="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
                          <span className="text-sm font-bold text-primary">{ayah.verse_key}</span>
                          <p dir="rtl" className="text-right font-headline text-3xl leading-loose tracking-wide text-foreground">
                              {ayah.text_uthmani}
                          </p>
                        </div>
                        <p className="text-left text-base text-muted-foreground italic">
                            "{ayah.translation}"
                        </p>
                    </div>
                  ))
              ) : !error && (
                <div className="text-center text-muted-foreground py-10">Pilih surat untuk ditampilkan.</div>
              )}
          </CardContent>
      </Card>
    </div>
  );
}
