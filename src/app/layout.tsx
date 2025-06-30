'use client'; // This needs to be a client component to use context

import './globals.css';
import { Playfair_Display, PT_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { UserDataProvider, UserDataContext } from '@/context/UserDataProvider';
import BottomNav from '@/components/BottomNav';
import React, { useContext } from 'react';

const fontHeadline = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
});

const fontBody = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

// Metadata can't be dynamic in a client component root layout easily.
// I will remove the dynamic metadata and keep it static.
// The user can add it back if they want.
// export const metadata: Metadata = {
//   title: 'DeenDaily',
//   description: 'Teman harianmu untuk misi dan pertumbuhan Islami.',
// };

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useContext(UserDataContext);

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
          <title>DeenDaily</title>
          <meta name="description" content="Teman harianmu untuk misi dan pertumbuhan Islami." />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          fontHeadline.variable,
          fontBody.variable
        )}
      >
        <div className="relative flex min-h-screen w-full flex-col">
           <main className={cn("flex-1", isAuthenticated && "pb-24")}>
             {children}
           </main>
           {isAuthenticated && !isLoading && <BottomNav />}
        </div>
        <Toaster />
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserDataProvider>
      <AppLayout>{children}</AppLayout>
    </UserDataProvider>
  );
}
