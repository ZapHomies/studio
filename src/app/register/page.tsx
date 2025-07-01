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

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, isLoading } = useContext(UserDataContext);
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast({
        title: 'Form Tidak Lengkap',
        description: 'Mohon isi semua field untuk mendaftar.',
        variant: 'destructive',
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: 'Password Terlalu Pendek',
        description: 'Password harus memiliki minimal 6 karakter.',
        variant: 'destructive',
      });
      return;
    }
    
    await register(name.trim(), email.trim(), password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <header className="mb-8 flex flex-col items-center justify-center text-center">
          <KaabaIcon className="h-12 w-12 text-primary" />
          <h1 className="ml-4 mt-4 font-headline text-4xl font-bold text-primary sm:text-5xl">
            Muslim Mission
          </h1>
           <p className="mt-2 text-center text-base text-muted-foreground sm:text-lg">
            Mulailah perjalanan iman Anda.
          </p>
        </header>
        <Card className="shadow-lg">
          <form onSubmit={handleRegister}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Buat Akun Baru</CardTitle>
              <CardDescription>Isi data berikut untuk memulai petualangan Anda.</CardDescription>
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
                  disabled={isLoading}
                />
              </div>
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
                  placeholder="Minimal 6 karakter"
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
              <Button type="submit" className="w-full" disabled={isLoading || !name.trim() || !email.trim() || !password.trim()}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
