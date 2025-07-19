
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const posts = [
  {
    title: 'The Future of AI in Northern Nigeria',
    excerpt: 'Exploring the transformative potential of artificial intelligence and how it can drive innovation and growth in the region.',
    author: 'Admin',
    date: 'October 26, 2023',
    image: 'https://placehold.co/600x400.png',
    tags: ['AI', 'Innovation'],
    ai_hint: 'artificial intelligence',
    href: '/blog/future-of-ai'
  },
  {
    title: 'Getting Started with Next.js and Genkit',
    excerpt: 'A comprehensive guide to building modern, full-stack AI applications with the latest features in Next.js and Google\'s Genkit.',
    author: 'Admin',
    date: 'October 24, 2023',
    image: 'https://placehold.co/600x400.png',
    tags: ['Web Dev', 'Genkit'],
    ai_hint: 'web development code',
    href: '/blog/getting-started-nextjs'
  },
  {
    title: 'Building a Tech Community: Lessons from the North',
    excerpt: 'Discover the key ingredients for fostering a vibrant and supportive tech community, drawing from experiences right here at home.',
    author: 'Admin',
    date: 'October 22, 2023',
    image: 'https://placehold.co/600x400.png',
    tags: ['Community', 'Networking'],
    ai_hint: 'community event',
    href: '/blog/building-community'
  },
];

export function BlogSection() {
  return (
    <section className="py-16 md:py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Latest Insights
          </h2>
          <p className="mt-2 text-lg text-gray-400">
            News, articles, and updates from the Northern Tech Exchange team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link href={post.href} key={post.title} className="group block">
              <Card className="h-full bg-gray-900/50 border-primary/20 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={post.image}
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
                  <CardDescription className="mt-2 text-gray-400 leading-relaxed">
                    {post.excerpt}
                  </CardDescription>
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>By {post.author}</span>
                    <span>{post.date}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
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
