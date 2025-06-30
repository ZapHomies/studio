import ProfileDisplay from '@/components/ProfileDisplay';

export default function ProfilePage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
       <header className="mb-8 flex items-center">
        <h1 className="font-headline text-4xl font-bold text-primary">
          Profil Anda
        </h1>
      </header>
      <ProfileDisplay />
    </div>
  );
}
