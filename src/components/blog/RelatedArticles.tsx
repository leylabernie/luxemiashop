import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '@/data/blogPosts';
import { blogPosts } from '@/data/blogPosts';
import { getBlogCategoryGroup, getPostSlugsByCategory } from '@/data/blogCategories';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();

interface RelatedArticlesProps {
  currentSlug: string;
  /** Max number of related articles to show. Default: 3 */
  limit?: number;
}

/**
 * RelatedArticles — shows 3 articles from the same Utsavpedia-style category
 * as the current blog post. Falls back to recent articles if no category or
 * no other posts in the category.
 *
 * Used at the bottom of every BlogPost page to:
 * 1. Keep users on the site longer (engagement signal)
 * 2. Distribute PageRank within the same category (topical authority)
 * 3. Help Google discover related content (crawl efficiency)
 */
const RelatedArticles = ({ currentSlug, limit = 3 }: RelatedArticlesProps) => {
  const relatedPosts = useMemo<BlogPost[]>(() => {
    const categoryGroup = getBlogCategoryGroup(currentSlug);
    if (!categoryGroup) {
      // Fallback: return most recent posts (excluding current)
      return blogPosts
        .filter(p => p.slug !== currentSlug)
        .slice(0, limit);
    }

    const categorySlugs = new Set(getPostSlugsByCategory(categoryGroup.slug));
    const sameCategoryPosts = blogPosts
      .filter(p => categorySlugs.has(p.slug) && p.slug !== currentSlug)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    if (sameCategoryPosts.length >= limit) {
      return sameCategoryPosts.slice(0, limit);
    }

    // If not enough posts in same category, fill with recent posts from other categories
    const fillers = blogPosts
      .filter(p => !categorySlugs.has(p.slug) && p.slug !== currentSlug)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit - sameCategoryPosts.length);

    return [...sameCategoryPosts, ...fillers];
  }, [currentSlug, limit]);

  if (relatedPosts.length === 0) return null;

  const categoryGroup = getBlogCategoryGroup(currentSlug);

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-semibold">
          {categoryGroup
            ? <>More from <span className="text-primary">{categoryGroup.name}</span></>
            : 'Related Articles'}
        </h2>
        {categoryGroup && (
          <Link
            to={`/blog/${categoryGroup.slug}`}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View all in {categoryGroup.name} <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map(post => {
          const postCategory = getBlogCategoryGroup(post.slug);
          return (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="group">
              <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                <div className="aspect-[16/9] overflow-hidden bg-muted">
                  <img
                    src={post.image}
                    alt={post.title}
                    width={400}
                    height={300}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  {postCategory && (
                    <span className="text-xs text-primary mb-2 inline-block">{postCategory.name}</span>
                  )}
                  <h3 className="font-display font-semibold leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {stripHtml(post.excerpt)}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime} min
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedArticles;
