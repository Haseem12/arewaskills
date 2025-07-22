'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/logo';
import { MainNav } from '@/components/main-nav';

type Book = {
  title: string;
  description: string;
  file: string;
  tags?: string[];
  author?: string;
  date?: string;
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      // Replace this with dynamic fetch if needed
      const data: Book[] = [
        {
          title: 'UI Flow',
          description: 'A Complete UI/UX Design Guide — Go-to Toolkit with 80 Prompts for Every Stage of Your Design Journey.',
          file: '/docs/UI Flow.pdf',
          tags: ['Design', 'UX'],
          author: 'Skill Arewa',
          date: '2025-07-21',
        },
      ];
      setBooks(data);
      setLoading(false);
    }

    fetchBooks();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <MainNav />
      <header className="py-8 bg-muted/30">
        <div className="container mx-auto text-center">
          <Link href="/" className="inline-block mb-4">
            <Logo className="h-20 w-20" />
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-primary">📚 Arewa Skill Library</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Explore free PDFs, guides & brochures curated for the Arewa tech journey.
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
            books.map((book, index) => (
              <Link
                href={book.file}
                target="_blank"
                rel="noopener noreferrer"
                key={index}
                className="group block"
              >
                <Card className="h-full bg-card hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                      📄 PDF Document
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex gap-2 mb-2">
                      {book.tags && book.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                      {book.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-muted-foreground leading-relaxed line-clamp-3">
                      {book.description}
                    </CardDescription>
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <span>{book.author || 'Skill Arewa'}</span>
                      <span>{book.date && new Date(book.date).toLocaleDateString()}</span>
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
