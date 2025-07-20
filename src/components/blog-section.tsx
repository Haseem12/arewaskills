
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { getPosts } from '@/app/actions/registration-actions';
import { Skeleton } from './ui/skeleton';

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

export function BlogSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      const result = await getPosts();
      if (result.success && result.data) {
        setPosts(result.data.slice(0, 3)); // Only show the 3 most recent posts
      }
      setLoading(false);
    }
    loadPosts();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Latest Insights
          </h2>
          <p className="mt-2 text-lg text-gray-400">
            News, articles, and updates from the Skill Arewa team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="h-full bg-gray-900/50 border-primary/20">
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
                <Card className="h-full bg-gray-900/50 border-primary/20 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
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
                    <CardTitle className="text-xl font-bold text-gray-100 group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-gray-400 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <span>By {post.author}</span>
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
        
        <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="border-primary/50 text-gray-300 hover:bg-primary/10 hover:border-primary hover:text-white">
                <Link href="/blog">
                    View All Posts <ArrowRight className="ml-2" />
                </Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
