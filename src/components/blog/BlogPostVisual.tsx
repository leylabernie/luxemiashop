import { BookOpen } from 'lucide-react';
import type { BlogPost } from '@/data/blogPosts';

interface BlogPostVisualProps {
  post: BlogPost;
  variant?: 'card' | 'hero';
}

const BlogPostVisual = ({ post, variant = 'card' }: BlogPostVisualProps) => {
  const isHero = variant === 'hero';

  if (post.imagePresentation !== 'editorial') {
    return (
      <img
        src={post.image}
        alt={post.title}
        width={isHero ? 1200 : 640}
        height={isHero ? 675 : 360}
        loading={isHero ? 'eager' : 'lazy'}
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }

  return (
    <div
      className="flex h-full w-full items-center justify-center border border-primary/10 bg-gradient-to-br from-[#f7eee9] via-[#fffaf6] to-[#eadad3] px-6 text-center"
      aria-label={`${post.category}: source-reviewed editorial article`}
      role="img"
    >
      <div className="max-w-sm">
        <BookOpen className={`${isHero ? 'h-9 w-9' : 'h-7 w-7'} mx-auto mb-3 text-primary`} aria-hidden="true" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">LuxeMia Editorial</p>
        <p className={`${isHero ? 'mt-3 text-2xl' : 'mt-2 text-lg'} font-display font-semibold text-foreground`}>
          {post.category}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Source-reviewed article</p>
      </div>
    </div>
  );
};

export default BlogPostVisual;
