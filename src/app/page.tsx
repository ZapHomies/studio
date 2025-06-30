import MissionList from "@/components/MissionList";
import { KaabaIcon } from "@/components/icons/KaabaIcon";

export default function Home() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8 flex items-center justify-center text-center">
        <KaabaIcon className="h-10 w-10 text-primary" />
        <h1 className="ml-4 font-headline text-4xl font-bold text-primary">
          DeenDaily
        </h1>
      </header>
      <p className="text-center text-lg text-muted-foreground mb-8">
        Your daily missions to grow in faith. Complete tasks, earn XP, and level up!
      </p>
      <MissionList />
    </div>
  );
}
