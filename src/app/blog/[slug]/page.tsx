
'use client';

import { useState, useEffect } from 'react';
import { getPostBySlug } from '@/app/actions/registration-actions';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AdSlot } from '@/components/ad-slot';
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
};

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
                {post.tags && post.tags.map(tag => (
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
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl p-8">
        <div className="prose prose-invert prose-lg max-w-none prose-headings:text-primary prose-a:text-accent prose-strong:text-foreground text-justify">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        <AdSlot className="my-12" />
        
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
