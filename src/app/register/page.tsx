'use client';

import { useContext, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserDataContext } from '@/context/UserDataProvider';
import { KaabaIcon } from '@/components/icons/KaabaIcon';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const { register } = useContext(UserDataContext);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsRegistering(true);
      // Simulate network delay
      setTimeout(() => {
        register(name.trim());
        // No need to setIsRegistering(false) as context will redirect
      }, 500);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <header className="mb-8 flex flex-col items-center justify-center text-center">
          <KaabaIcon className="h-12 w-12 text-primary" />
          <h1 className="ml-4 mt-4 font-headline text-5xl font-bold text-primary">
            DeenDaily
          </h1>
           <p className="text-center text-lg text-muted-foreground mt-2">
            Mulailah perjalanan iman Anda.
          </p>
        </header>
        <Card>
          <form onSubmit={handleRegister}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Buat Akun Baru</CardTitle>
              <CardDescription>Pilih nama pengguna untuk memulai.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  placeholder="Contoh: Fatimah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isRegistering}>
                {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Daftar
              </Button>
               <p className="text-sm text-center text-muted-foreground">
                Sudah punya akun?{' '}
                <Link href="/" className="font-medium text-primary hover:underline">
                  Login di sini
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
