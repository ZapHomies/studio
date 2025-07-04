'use client';

import { useContext, useMemo } from 'react';
import { UserDataContext } from '@/context/UserDataProvider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trophy } from 'lucide-react';
import { type User } from '@/lib/types';

function LeaderboardRow({ user, rank }: { user: User; rank: number }) {
  const getRankClasses = (rank: number) => {
    if (rank === 1) return 'bg-amber-400/20 text-amber-600 font-bold';
    if (rank === 2) return 'bg-slate-400/20 text-slate-600 font-bold';
    if (rank === 3) return 'bg-amber-600/20 text-amber-800 font-bold';
    return '';
  };
  
  const getRankIndicator = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-amber-500" />;
    if (rank === 2) return <Trophy className="h-6 w-6 text-slate-500" />;
    if (rank === 3) return <Trophy className="h-6 w-6 text-amber-700" />;
    return <span className="text-base font-medium text-muted-foreground sm:text-lg">{rank}</span>;
  }

  return (
    <TableRow className={`h-20 transition-colors hover:bg-primary/5 ${getRankClasses(rank)}`}>
      <TableCell className="w-16 text-center">{getRankIndicator(rank)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border-2 border-primary/50 sm:h-12 sm:w-12">
            <AvatarImage src={user.avatar_url} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-base font-bold sm:text-lg">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.title}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center font-medium text-base sm:text-lg">{user.level}</TableCell>
      <TableCell className="text-right font-bold text-primary text-base sm:text-lg">{user.xp.toLocaleString()} XP</TableCell>
    </TableRow>
  );
}

export default function LeaderboardPage() {
  const { allUsers } = useContext(UserDataContext);

  const sortedUsers = useMemo(() => {
    return [...allUsers].sort((a, b) => b.xp - a.xp || a.level - b.level);
  }, [allUsers]);

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
      <header className="flex flex-col items-center justify-center text-center">
        <Trophy className="h-16 w-16 text-amber-500" />
        <h1 className="mt-4 font-headline text-4xl font-bold text-primary sm:text-5xl">Papan Peringkat</h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Lihat peringkatmu di antara para pejuang iman lainnya. Terus kumpulkan XP!
        </p>
      </header>
      <Card className="shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-16 text-center">Peringkat</TableHead>
                <TableHead>Pengguna</TableHead>
                <TableHead className="text-center">Level</TableHead>
                <TableHead className="text-right">Total XP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.length > 0 ? (
                sortedUsers.map((user, index) => (
                  <LeaderboardRow key={user.id} user={user} rank={index + 1} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Belum ada pengguna di papan peringkat.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
