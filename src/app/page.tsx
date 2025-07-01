'use client';

import { useContext, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserDataContext } from '@/context/UserDataProvider';
import { KaabaIcon } from '@/components/icons/KaabaIcon';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useContext(UserDataContext);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      await login(email.trim(), password);
    } else {
      toast({
        title: 'Form Tidak Lengkap',
        description: 'Mohon masukkan email dan password.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
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
          <h1 className="ml-4 mt-4 font-headline text-4xl font-bold text-primary sm:text-5xl">
            Muslim Mission
          </h1>
           <p className="mt-2 text-center text-base text-muted-foreground sm:text-lg">
            Selamat datang kembali!
          </p>
        </header>
        <Card className="shadow-lg">
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Login</CardTitle>
              <CardDescription>Masukkan email dan password untuk melanjutkan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="relative space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-7 h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading || !email.trim() || !password.trim()}>
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
