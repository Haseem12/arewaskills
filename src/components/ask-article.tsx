
'use client';

import { useState, useTransition } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { answerQuestionAboutArticle } from '@/ai/flows/ask-article-flow';

const questionSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters.'),
});
type QuestionFormValues = z.infer<typeof questionSchema>;

interface AskArticleProps {
  postContent: string;
}

export function AskArticle({ postContent }: AskArticleProps) {
  const [isPending, startTransition] = useTransition();
  const [answer, setAnswer] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: '',
    },
  });

  const onSubmit: SubmitHandler<QuestionFormValues> = (values) => {
    setAnswer(null); // Clear previous answer
    startTransition(async () => {
      try {
        const result = await answerQuestionAboutArticle({
          articleContent: postContent,
          question: values.question,
        });
        if (result && result.answer) {
          setAnswer(result.answer);
        } else {
            throw new Error('The AI could not provide an answer.');
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Card className="my-12 bg-muted/30">
      <CardHeader>
        <CardTitle>Ask this Article a Question</CardTitle>
        <CardDescription>
          Use AI to get answers based on the content of this post.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="e.g., What are the key takeaways?" {...field} />
                    </FormControl>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Wand2 />
                      )}
                      Ask
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        {isPending && (
            <div className="mt-6 flex items-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin" />
                <span>Thinking...</span>
            </div>
        )}
        {answer && !isPending && (
          <div className="mt-6 rounded-lg border bg-background p-4 prose prose-invert max-w-none">
            <p>{answer}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
