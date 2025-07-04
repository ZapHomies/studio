'use client';

import { useContext } from 'react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserDataContext } from '@/context/UserDataProvider';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { MessageSquare, Calendar } from 'lucide-react';

interface MyPostsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function MyPostsSheet({ isOpen, onOpenChange }: MyPostsSheetProps) {
  const { currentUser, posts } = useContext(UserDataContext);

  const myPosts = posts.filter(p => p.author_id === currentUser?.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-lg">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="font-headline text-2xl">Postingan Saya</SheetTitle>
          <SheetDescription>
            Berikut adalah semua postingan yang telah Anda buat di forum.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow px-6">
          <div className="space-y-4 py-4">
            {myPosts.length > 0 ? (
              myPosts.map(post => (
                <Link href={`/forum#${post.id}`} key={post.id} onClick={() => onOpenChange(false)}>
                  <Card className="transition-all hover:border-primary hover:bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 pt-1 text-xs">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true, locale: id })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="h-3 w-3" />
                          {post.comments.length} Komentar
                        </span>
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8 text-center">
                <p className="font-semibold">Anda Belum Membuat Postingan</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Buat postingan pertama Anda di halaman Forum!
                </p>
                <Button asChild variant="outline" className="mt-4" onClick={() => onOpenChange(false)}>
                  <Link href="/forum">Ke Forum</Link>
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="p-6 pt-4 border-t bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Tutup
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
