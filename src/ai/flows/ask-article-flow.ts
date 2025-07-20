
'use server';

/**
 * @fileOverview An AI flow to answer questions about a specific blog post.
 *
 * - answerQuestionAboutArticle - A function that answers a user's question based on the provided article content.
 * - AskArticleInput - The input type for the answerQuestionAboutArticle function.
 * - AskArticleOutput - The return type for the answerQuestionAboutArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskArticleInputSchema = z.object({
  articleContent: z.string().describe('The full HTML content of the blog post.'),
  question: z.string().describe('The user\'s question about the article.'),
});

export type AskArticleInput = z.infer<typeof AskArticleInputSchema>;

const AskArticleOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s question, based strictly on the article content.'),
});

export type AskArticleOutput = z.infer<typeof AskArticleOutputSchema>;

export async function answerQuestionAboutArticle(input: AskArticleInput): Promise<AskArticleOutput> {
  return askArticleFlow(input);
}

const askArticlePrompt = ai.definePrompt({
  name: 'askArticlePrompt',
  input: {schema: AskArticleInputSchema},
  output: {schema: AskArticleOutputSchema},
  prompt: `You are a helpful AI assistant for a tech blog. Your task is to answer a user's question based *only* on the content of the provided article.

Do not use any external knowledge. If the answer cannot be found within the article text, you must state that the information is not available in the article.

Here is the article content:
---
{{{articleContent}}}
---

Here is the user's question:
"{{{question}}}"

Provide a concise answer based on the text above.
`,
});

const askArticleFlow = ai.defineFlow(
  {
    name: 'askArticleFlow',
    inputSchema: AskArticleInputSchema,
    outputSchema: AskArticleOutputSchema,
  },
  async input => {
    const {output} = await askArticlePrompt(input);
    return output!;
  }
);
