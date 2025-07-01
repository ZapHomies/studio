import RecitationTool from '@/components/RecitationTool';

export default function RecitationPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8 flex flex-col items-center text-center">
        <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">
          Latihan Mengaji
        </h1>
        <p className="mt-2 text-base text-muted-foreground sm:text-lg">
          Rekam bacaan Anda dan dapatkan umpan balik instan dari ahli Tajwid AI kami.
        </p>
      </header>
      <RecitationTool />
    </div>
  );
}
