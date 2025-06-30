import RecitationTool from '@/components/RecitationTool';

export default function RecitationPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8 flex flex-col items-center text-center">
        <h1 className="font-headline text-4xl font-bold text-primary">
          Recitation Practice
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Record yourself reciting and get instant feedback from our AI Tajweed expert.
        </p>
      </header>
      <RecitationTool />
    </div>
  );
}
