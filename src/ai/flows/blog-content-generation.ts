
'use server';

/**
 * @fileOverview AI-powered blog content generation.
 *
 * - generateBlogContent - A function that generates a blog excerpt, content, and tags from a title.
 * - BlogContentGenerationInput - The input type for the generateBlogContent function.
 * - BlogContentGenerationOutput - The return type for the generateBlogContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BlogContentGenerationInputSchema = z.object({
  title: z.string().describe('The title of the blog post.'),
});

export type BlogContentGenerationInput = z.infer<typeof BlogContentGenerationInputSchema>;

const BlogContentGenerationOutputSchema = z.object({
  excerpt: z.string().describe('A short, compelling summary of the blog post, between 20 and 50 words.'),
  content: z.string().describe('The full blog post content in HTML format. It should be at least 3 paragraphs long and include H2 tags for subheadings.'),
  tags: z.string().describe('A comma-separated string of relevant tags for the blog post (e.g., "AI, Web Dev, Community").'),
});

export type BlogContentGenerationOutput = z.infer<typeof BlogContentGenerationOutputSchema>;

export async function generateBlogContent(input: BlogContentGenerationInput): Promise<BlogContentGenerationOutput> {
  return blogContentGenerationFlow(input);
}

const blogContentGenerationPrompt = ai.definePrompt({
  name: 'blogContentGenerationPrompt',
  input: {schema: BlogContentGenerationInputSchema},
  output: {schema: BlogContentGenerationOutputSchema},
  prompt: `You are an expert blog post writer for a tech community focused on Development and AI. Your task is to generate content for a blog post based on the provided title.

The output must be a JSON object with three keys: "excerpt", "content", and "tags".

1.  **excerpt**: Write a compelling, concise summary of the article. It should be between 20 and 50 words.
2.  **content**: Write the full blog post in HTML format. It must be well-structured, starting with an <h1> tag for the main title, followed by at least three paragraphs of text (<p>). Use <h2> tags for subheadings to break up the content. The tone should be informative and engaging for a technical audience.
3.  **tags**: Provide a comma-separated string of 3-5 relevant keywords or tags for the post.

Blog Post Title: {{{title}}}

Generate the JSON output now.
`,
});

const blogContentGenerationFlow = ai.defineFlow(
  {
    name: 'blogContentGenerationFlow',
    inputSchema: BlogContentGenerationInputSchema,
    outputSchema: BlogContentGenerationOutputSchema,
  },
  async input => {
    const {output} = await blogContentGenerationPrompt(input);
    return output!;
  }
);
