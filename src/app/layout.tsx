import type { Metadata } from 'next';
import './globals.css';
import { Playfair_Display, PT_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { UserDataProvider } from '@/context/UserDataProvider';
import BottomNav from '@/components/BottomNav';

const fontHeadline = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
});

const fontBody = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'DeenDaily',
  description: 'Your daily companion for Islamic missions and growth.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          fontHeadline.variable,
          fontBody.variable
        )}
      >
        <UserDataProvider>
          <div className="relative flex min-h-screen w-full flex-col">
            <main className="flex-1 pb-24">{children}</main>
            <BottomNav />
          </div>
          <Toaster />
        </UserDataProvider>
      </body>
    </html>
  );
}
