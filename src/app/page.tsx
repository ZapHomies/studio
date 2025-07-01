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

export default function LoginPage() {
  const [name, setName] = useState('');
  const { login, isLoading: isContextLoading } = useContext(UserDataContext);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsLoggingIn(true);
      await login(name.trim());
      // The context will handle redirecting and loading state changes.
      // We set this to false here, but the context's `isLoading` is the source of truth.
      setIsLoggingIn(false); 
    }
  };

  // Combine local loading state (during the login action) with context's global loading state
  const isLoading = isContextLoading || isLoggingIn;

  // Show a full-page loader if the context is busy (e.g., rehydrating session or processing login)
  if (isContextLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <KaabaIcon className="h-12 w-12 animate-pulse text-primary" />
          <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
          <p className="text-muted-foreground">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <header className="mb-8 flex flex-col items-center justify-center text-center">
          <KaabaIcon className="h-16 w-16 text-primary" />
          <h1 className="ml-4 mt-4 font-headline text-5xl font-bold text-primary">
            DeenDaily
          </h1>
           <p className="mt-2 text-center text-lg text-muted-foreground">
            Selamat datang kembali!
          </p>
        </header>
        <Card className="shadow-lg">
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Login</CardTitle>
              <CardDescription>Masukkan nama Anda untuk melanjutkan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  placeholder="Contoh: Abdullah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading || !name.trim()}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Masuk
              </Button>
               <p className="text-sm text-center text-muted-foreground">
                Belum punya akun?{' '}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  Daftar di sini
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
