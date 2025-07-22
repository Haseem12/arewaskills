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

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBooks() {
      const data: Book[] = [
        {
          title: 'UI Flow',
          description: 'A Complete UI/UX Design Guide — Go-to Toolkit with 200 Prompts for Every Stage of Your Design Journey.',
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

  function handleDownloadClick(book: Book) {
    setSelectedBook(book);
    setShowForm(true);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      setError('Please enter your name and email.');
      return;
    }

    try {
      const response = await fetch('https://sajfoods.net/api/event/article.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          book: selectedBook?.title || 'Unknown',
        }),
      });

      const result = await response.json();

      if (result.status !== 'success') {
        setError('Failed to save your data. Please try again.');
        return;
      }

      // Proceed to download
      if (selectedBook) {
        window.open(selectedBook.file, '_blank');
      }

      setFormData({ name: '', email: '' });
      setShowForm(false);
      setSelectedBook(null);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    }
  }

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
              <div
                key={index}
                className="group block cursor-pointer"
                onClick={() => handleDownloadClick(book)}
              >
                <Card className="h-full bg-card hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                      📄 PDF Document
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex gap-2 mb-2">
                      {book.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
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
              </div>
            ))
          )}
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg space-y-4">
            <h2 className="text-xl font-semibold text-center">Access this Book</h2>
            <p className="text-sm text-muted-foreground text-center">
              Please enter your details to proceed with the download.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
                >
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
