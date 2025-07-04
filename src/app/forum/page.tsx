'use client';

import { useState, useContext, useMemo } from 'react';
import { UserDataContext } from '@/context/UserDataProvider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, PlusCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import type { ForumPost, ForumComment, User } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

// NewPostDialog Component
function NewPostDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (isOpen: boolean) => void }) {
  const { createPost } = useContext(UserDataContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Form Tidak Lengkap',
        description: 'Judul dan isi postingan tidak boleh kosong.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    await createPost(title, content);
    setIsSubmitting(false);
    setTitle('');
    setContent('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Buat Postingan Baru</DialogTitle>
            <DialogDescription>
              Bagikan pertanyaan atau pemikiran Anda dengan komunitas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Judul
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="Apa topik Anda?"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="content" className="text-right pt-2">
                Isi
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="col-span-3"
                placeholder="Tuliskan isi postingan Anda di sini..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || !title.trim() || !content.trim()}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kirim
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


// Comment Component
function Comment({ comment, author }: { comment: ForumComment, author: User | undefined }) {
  if (!author) return null;

  return (
    <div className="flex items-start gap-3 py-3">
        <Avatar className="h-8 w-8 border">
            <AvatarImage src={author.avatar_url} alt={author.name} />
            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
            <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{author.name}</p>
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true, locale: id })}
                </p>
            </div>
            <p className="text-sm text-foreground/90">{comment.content}</p>
        </div>
    </div>
  )
}


// PostCard Component
function PostCard({ post, author }: { post: ForumPost, author: User | undefined }) {
  const { allUsers, addComment, currentUser } = useContext(UserDataContext);
  const [newComment, setNewComment] = useState('');

  if (!author) return null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(post.id, newComment);
    setNewComment('');
  }

  const sortedComments = [...post.comments].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <Card className="overflow-hidden scroll-mt-24" id={post.id}>
        <Accordion type="single" collapsible>
            <AccordionItem value={post.id}>
                <AccordionTrigger className="p-4 hover:no-underline hover:bg-muted/50">
                    <div className="flex items-start gap-4 text-left w-full">
                        <Avatar className="h-10 w-10 border">
                            <AvatarImage src={author.avatar_url} alt={author.name} />
                            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="font-semibold text-base">{post.title}</h3>
                            <p className="text-sm text-muted-foreground">
                                oleh {author.name} • {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true, locale: id })} • {post.comments.length} komentar
                            </p>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="p-4 border-t">
                      <p className="text-base whitespace-pre-wrap mb-6">{post.content}</p>

                      <div className="space-y-2">
                         <h4 className="font-semibold text-lg border-b pb-2 mb-2">Komentar</h4>
                         
                         {sortedComments.length > 0 ? (
                            <div className="divide-y max-h-96">
                               <ScrollArea className="h-72">
                                <div className="pr-4">
                                  {sortedComments.map(comment => (
                                      <Comment key={comment.id} comment={comment} author={allUsers.find(u => u.id === comment.author_id)} />
                                  ))}
                                </div>
                               </ScrollArea>
                            </div>
                         ) : (
                             <p className="text-sm text-muted-foreground text-center py-4">Belum ada komentar. Jadilah yang pertama!</p>
                         )}

                         {currentUser && (
                            <form onSubmit={handleCommentSubmit} className="flex items-start gap-2 pt-4">
                               <Avatar className="h-9 w-9 border">
                                    <AvatarImage src={currentUser.avatar_url} alt={currentUser.name} />
                                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Textarea 
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  placeholder="Tulis komentar..."
                                  rows={1}
                                  className="min-h-[40px] resize-none"
                                />
                                <Button type="submit" size="icon" disabled={!newComment.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                         )}
                      </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </Card>
  )
}

// Main ForumPage Component
export default function ForumPage() {
  const { posts, allUsers } = useContext(UserDataContext);
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false);

  const usersById = useMemo(() => {
    return allUsers.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {} as Record<string, User>);
  }, [allUsers]);

  const postsWithAuthors = useMemo(() => {
    return posts.map(post => ({
        ...post,
        author: usersById[post.author_id],
    }))
  }, [posts, usersById]);

  const sortedPosts = postsWithAuthors.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <MessageSquare className="h-10 w-10 text-primary" />
            <div>
                 <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">Forum Diskusi</h1>
                 <p className="mt-1 text-muted-foreground">Tempat berbagi dan belajar bersama.</p>
            </div>
        </div>
        <Button onClick={() => setIsNewPostDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Buat Postingan
        </Button>
      </header>

      <main className="space-y-4">
        {sortedPosts.length > 0 ? (
            sortedPosts.map(post => (
                <PostCard key={post.id} post={post} author={post.author} />
            ))
        ) : (
            <Card className="text-center p-10 border-dashed">
                <CardTitle>Forum Masih Sepi</CardTitle>
                <CardDescription className="mt-2">Jadilah yang pertama memulai diskusi!</CardDescription>
            </Card>
        )}
      </main>

      <NewPostDialog isOpen={isNewPostDialogOpen} onOpenChange={setIsNewPostDialogOpen} />
    </div>
  );
}
