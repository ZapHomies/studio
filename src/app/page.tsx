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
      // The loading state will be handled by the context redirecting or showing a toast
      // We can set it to false, but the context's isLoading is more accurate
      setIsLoggingIn(false); 
    }
  };

  const isLoading = isContextLoading || isLoggingIn;

  if (isContextLoading && !isLoggingIn) { // Show a general loader if context is loading and we aren't in the middle of a login action
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <header className="mb-8 flex flex-col items-center justify-center text-center">
          <KaabaIcon className="h-12 w-12 text-primary" />
          <h1 className="ml-4 mt-4 font-headline text-5xl font-bold text-primary">
            DeenDaily
          </h1>
           <p className="text-center text-lg text-muted-foreground mt-2">
            Selamat datang kembali!
          </p>
        </header>
        <Card>
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
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
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
