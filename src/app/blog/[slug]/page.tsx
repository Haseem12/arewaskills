
import type { Metadata } from 'next';
import { getPostBySlug } from '@/app/actions/registration-actions';
import { notFound } from 'next/navigation';
import { BlogPost } from '@/components/blog-post';

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

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const result = await getPostBySlug(slug);

  if (!result.success || !result.data) {
    return {
      title: 'Post Not Found',
      description: 'The post you are looking for does not exist.',
    };
  }

  const post = result.data as Post;
  return {
    title: `${post.title} | Northern Tech Exchange`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: post.image || 'https://placehold.co/1200x600.png',
          width: 1200,
          height: 600,
          alt: post.title,
        },
      ],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = params;
  const result = await getPostBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const post = result.data as Post;

  return <BlogPost post={post} />;
}
