'use client';

import RecitationTool from '@/components/RecitationTool';
import QuranReader from '@/components/QuranReader';
import { BookOpen } from 'lucide-react';

export default function RecitationPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 flex flex-col items-center text-center">
        <BookOpen className="h-14 w-14 text-primary" />
        <h1 className="mt-4 font-headline text-4xl font-bold text-primary sm:text-5xl">
          Al-Quran & Latihan Mengaji
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Baca ayat suci Al-Quran dan rekam bacaan Anda untuk mendapatkan umpan balik instan dari ahli Tajwid AI kami.
        </p>
      </header>
      <QuranReader />
      <RecitationTool />
    </div>
  );
}
