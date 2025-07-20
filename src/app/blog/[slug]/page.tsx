
'use client';

import { useState, useEffect, useTransition } from 'react';
import { getPostBySlug, incrementViewCount, getComments, createComment } from '@/app/actions/registration-actions';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, User, Eye, MessageSquare, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AdSlot } from '@/components/ad-slot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { MainNav } from '@/components/main-nav';

type Post = {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  date: string;
  image: string;
  tags: string[];
  ai_hint: string;
  view_count: number;
};

type Comment = {
  id: string;
  author_name: string;
  comment: string;
  submittedAt: string;
};

function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function loadComments() {
      const result = await getComments(postId);
      if (result.success) {
        setComments(result.data);
      }
      setLoading(false);
    }
    loadComments();
  }, [postId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !commentText.trim()) {
      toast({ title: 'Error', description: 'Name and comment cannot be empty.', variant: 'destructive' });
      return;
    }

    startTransition(async () => {
      const result = await createComment({ postId, authorName, comment: commentText });
      if (result.success) {
        setComments(prev => [result.data, ...prev]);
        setAuthorName('');
        setCommentText('');
        toast({ title: 'Success', description: 'Your comment has been posted.' });
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  return (
    <Card className="mt-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare />
          Leave a Comment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            placeholder="Your Name" 
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            disabled={isPending}
          />
          <Textarea 
            placeholder="Write your thoughts here..." 
            rows={4}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Send />}
            Post Comment
          </Button>
        </form>
        <div className="mt-8 space-y-6">
          <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>
          {loading ? <Skeleton className="h-20 w-full" /> : 
            comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="flex gap-4">
                  <div className="flex-shrink-0 bg-muted rounded-full h-10 w-10 flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="w-full">
                    <div className="flex justify-between items-center">
                      <p className="font-bold">{comment.author_name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(comment.submittedAt).toLocaleString()}</p>
                    </div>
                    <p className="text-muted-foreground mt-1">{comment.comment}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">Be the first to comment!</p>
            )
          }
        </div>
      </CardContent>
    </Card>
  );
}


export default function BlogPostPage({ params }: { params: { slug:string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { slug } = params;

  useEffect(() => {
    if (slug) {
      async function loadPost() {
        setLoading(true);
        const result = await getPostBySlug(slug);
        if (result.success && result.data) {
          setPost(result.data);
          // Fire-and-forget view count increment
          incrementViewCount(result.data.id);
        } else {
          notFound();
        }
        setLoading(false);
      }
      loadPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <MainNav />
        <Skeleton className="h-10 w-3/4 mb-4 mt-8" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="aspect-video w-full mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
        </div>
      </div>
    );
  }

  if (!post) {
    return null; // or a not found component, though notFound() should handle it
  }

  return (
    <>
    <article className="bg-background text-foreground">
      <MainNav />
      <header className="relative h-96">
        <Image
          src={post.image || 'https://placehold.co/1200x600.png'}
          alt={post.title}
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container mx-auto max-w-4xl p-8 text-white">
            <div className="flex gap-2 mb-4">
                {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
              {post.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
                </div>
                 <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    <span>{post.view_count || 0} views</span>
                </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl p-8">
        <div className="prose prose-invert prose-lg max-w-none prose-headings:text-primary prose-a:text-accent prose-strong:text-foreground">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        <AdSlot className="my-12" />

        <CommentSection postId={post.id} />
        
        <div className="mt-12 border-t border-border pt-8 text-center">
            <Button asChild>
                <Link href="/blog">
                    &larr; Back to All Posts
                </Link>
            </Button>
        </div>
      </div>
    </article>
    <Toaster />
    </>
  );
}
