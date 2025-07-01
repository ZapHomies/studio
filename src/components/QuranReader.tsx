'use client';

import { useState } from 'react';
import { quranData } from '@/lib/quran-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Mic } from "lucide-react";

export default function QuranReader() {
  const [selectedSurahId, setSelectedSurahId] = useState(quranData[0].id.toString());

  const selectedSurah = quranData.find(s => s.id.toString() === selectedSurahId) || quranData[0];

  return (
    <div className="space-y-6">
      <Card>
          <CardHeader>
              <CardTitle>Pilih Surat</CardTitle>
              <Select value={selectedSurahId} onValueChange={setSelectedSurahId}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih surat..." />
                </SelectTrigger>
                <SelectContent>
                    {quranData.map((surah) => (
                        <SelectItem key={surah.id} value={surah.id.toString()}>
                            {surah.id}. {surah.name} ({surah.translation})
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
      
      <Card>
          <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl">{selectedSurah.name}</CardTitle>
              <CardDescription>{selectedSurah.translation}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
              {selectedSurah.ayahs.map((ayah) => (
                  <div key={ayah.id} className="flex flex-col gap-4 border-b pb-6 last:border-b-0">
                      <div className="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
                        <span className="text-sm font-bold text-primary">{selectedSurah.name}: {ayah.id}</span>
                        <p dir="rtl" className="text-right font-headline text-3xl leading-loose tracking-wide text-foreground">
                            {ayah.text}
                        </p>
                      </div>
                      <p className="text-left text-base text-muted-foreground italic">
                          "{ayah.translation}"
                      </p>
                  </div>
              ))}
          </CardContent>
      </Card>
    </div>
  );
}
