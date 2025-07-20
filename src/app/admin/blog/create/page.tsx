
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { createPost } from '@/app/actions/registration-actions';
import { generateBlogContent } from '@/ai/flows/blog-content-generation';


const postSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  author: z.string().min(2, 'Author name is required.'),
  excerpt: z.string().min(20, 'Excerpt must be at least 20 characters.').max(200, 'Excerpt is too long.'),
  content: z.string().min(100, 'Content must be at least 100 characters.'),
  image: z.string().url('Please enter a valid image URL.').optional().or(z.literal('')),
  ai_hint: z.string().optional(),
  tags: z.string().min(2, 'Please add at least one tag.'),
});

type PostFormValues = z.infer<typeof postSchema>;

export default function CreatePostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      author: 'Admin',
      excerpt: '',
      content: '',
      image: '',
      ai_hint: '',
      tags: '',
    },
  });

  const titleValue = form.watch('title');

  const handleGenerateContent = async () => {
    if (!titleValue || titleValue.length < 5) {
        toast({ title: 'Title too short', description: 'Please enter a title of at least 5 characters to generate content.', variant: 'destructive'});
        return;
    }
    setIsGenerating(true);
    try {
        const result = await generateBlogContent({ title: titleValue });
        if (result) {
            form.setValue('excerpt', result.excerpt, { shouldValidate: true });
            form.setValue('content', result.content, { shouldValidate: true });
            form.setValue('tags', result.tags, { shouldValidate: true });
            form.setValue('title', titleValue, { shouldValidate: true }); // AI might slightly change title, so we set it back
            toast({ title: 'Content Generated!', description: 'The AI has populated the fields below.' });
        }
    } catch (error: any) {
         toast({ title: 'Error Generating Content', description: error.message || 'An unknown error occurred.', variant: 'destructive'});
    } finally {
        setIsGenerating(false);
    }
  }

  const onSubmit: SubmitHandler<PostFormValues> = (values) => {
    startTransition(async () => {
      // Ensure the generated content includes the h1 tag if it doesn't exist
      let finalContent = values.content;
      if (!/<h1.*>.*<\/h1>/.test(finalContent)) {
          finalContent = `<h1>${values.title}</h1>${finalContent}`;
      }

      const result = await createPost({...values, content: finalContent});
      if (result.success) {
        toast({ title: 'Post Created!', description: 'Your new blog post has been saved.' });
        form.reset();
        // No redirect, user can create another post or navigate away manually.
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  return (
    <main className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Create New Blog Post</CardTitle>
          <CardDescription>Fill in the details below to publish a new article. You can use AI to help draft your content.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Title</FormLabel>
                    <div className="flex gap-2">
                        <FormControl><Input placeholder="Your amazing blog post title" {...field} /></FormControl>
                        <Button type="button" onClick={handleGenerateContent} disabled={isGenerating}>
                            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                            Generate
                        </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl><Textarea placeholder="A short, compelling summary of your post." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Content (HTML allowed)</FormLabel>
                    <FormControl><Textarea placeholder="<h1>Title</h1><p>Your full blog content here...</p>" rows={15} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma-separated)</FormLabel>
                    <FormControl><Input placeholder="e.g., AI, Web Dev, Community" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl><Input placeholder="https://placehold.co/1200x600.png" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="ai_hint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Image Hint (Optional)</FormLabel>
                      <FormControl><Input placeholder="e.g., technology abstract" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Publish Post
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster />
    </main>
  );
}
