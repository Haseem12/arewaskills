
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getPosts } from '@/app/actions/registration-actions';
import { Logo } from '@/components/logo';
import { MainNav } from '@/components/main-nav';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image: string;
  tags: string[];
  ai_hint: string;
};

export default function BlogListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      const result = await getPosts();
      if (result.success && result.data) {
        setPosts(result.data);
      }
      setLoading(false);
    }
    loadPosts();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
       <MainNav />
      <header className="py-8 bg-muted/30">
        <div className="container mx-auto text-center">
            <Link href="/" className="inline-block mb-4">
              <Logo className="h-20 w-20" />
            </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-primary">Latest Insights</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            News, articles, and updates from the Skill Arewa team.
          </p>
        </div>
      </header>
      <section className="container mx-auto py-12 px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-card">
                <CardHeader className="p-0">
                  <Skeleton className="h-48 w-full" />
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))
          ) : (
            posts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.slug} className="group block">
                <Card className="h-full bg-card hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full">
                      <Image
                        src={post.image || 'https://placehold.co/600x400.png'}
                        alt={post.title}
                        fill
                        data-ai-hint={post.ai_hint}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex gap-2 mb-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-muted-foreground leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <span>By {post.author}</span>
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
