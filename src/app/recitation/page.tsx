import RecitationTool from '@/components/RecitationTool';

export default function RecitationPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8 flex flex-col items-center text-center">
        <h1 className="font-headline text-4xl font-bold text-primary">
          Latihan Mengaji
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Rekam bacaan Anda dan dapatkan umpan balik instan dari ahli Tajwid AI kami.
        </p>
      </header>
      <RecitationTool />
    </div>
  );
}
