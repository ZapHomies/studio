'use client';

import './globals.css';
import { Playfair_Display, PT_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { UserDataProvider, UserDataContext } from '@/context/UserDataProvider';
import BottomNav from '@/components/BottomNav';
import React, { useContext } from 'react';
import { ThemeProvider } from '@/context/ThemeProvider';

const fontHeadline = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
});

const fontBody = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

function AppBody({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useContext(UserDataContext);

  return (
    <div className="relative flex min-h-screen w-full flex-col">
       <main className={cn("flex-1", isAuthenticated && "pb-24")}>
         {children}
       </main>
       {isAuthenticated && !isLoading && <BottomNav />}
       <Toaster />
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
          <title>DeenDaily</title>
          <meta name="description" content="Teman harianmu untuk misi dan pertumbuhan Islami." />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased transition-colors duration-300',
          fontHeadline.variable,
          fontBody.variable
        )}
      >
        <ThemeProvider>
            <UserDataProvider>
              <AppBody>{children}</AppBody>
            </UserDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
