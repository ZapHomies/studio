import MissionList from "@/components/MissionList";
import { KaabaIcon } from "@/components/icons/KaabaIcon";

export default function MissionsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <header className="mb-10 flex flex-col items-center justify-center text-center">
        <KaabaIcon className="h-14 w-14 text-primary" />
        <h1 className="mt-4 font-headline text-5xl font-bold text-primary">
          DeenDaily
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          Selesaikan misi, dapatkan XP, dan tingkatkan iman Anda setiap hari. Misi harian akan diganti saat selesai!
        </p>
      </header>
      <MissionList />
    </div>
  );
}
