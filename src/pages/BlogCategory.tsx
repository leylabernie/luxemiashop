import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import type { BlogPost } from '@/data/blogPosts';
import { blogPosts } from '@/data/blogPosts';
import {
  BLOG_CATEGORY_GROUPS,
  getBlogCategoryBySlug,
  getPostSlugsByCategory,
} from '@/data/blogCategories';
import { Calendar, Clock, ArrowRight, BookOpen, ChevronRight, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();

const BlogCategory = () => {
  const { category } = useParams<{ category: string }>();
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import('@/data/blogPosts').then(m => {
      setAllPosts(m.blogPosts);
      setIsLoading(false);
    });
  }, []);

  const categoryGroup = category ? getBlogCategoryBySlug(category) : undefined;

  // Get the slugs that belong to this category, then match against loaded posts
  const categoryPostSlugs = useMemo(() => {
    if (!category) return new Set<string>();
    return new Set(getPostSlugsByCategory(category));
  }, [category]);

  const posts = useMemo(() => {
    return allPosts.filter(p => categoryPostSlugs.has(p.slug));
  }, [allPosts, categoryPostSlugs]);

  // Sort by publishedAt descending (newest first)
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, [posts]);

  if (!categoryGroup) {
    return <Navigate to="/blog" replace />;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": categoryGroup.metaTitle,
    "description": categoryGroup.metaDescription,
    "url": `https://luxemia.shop/blog/${categoryGroup.slug}`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "LuxeMia Blog",
      "url": "https://luxemia.shop/blog"
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": sortedPosts.length,
      "itemListElement": sortedPosts.slice(0, 20).map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://luxemia.shop/blog/${post.slug}`,
        "name": post.title,
      })),
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://luxemia.shop" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://luxemia.shop/blog" },
      { "@type": "ListItem", "position": 3, "name": categoryGroup.name, "item": `https://luxemia.shop/blog/${categoryGroup.slug}` },
    ],
  };

  return (
    <>
      <SEOHead
        title={categoryGroup.metaTitle}
        description={categoryGroup.metaDescription}
        canonical={`https://luxemia.shop/blog/${categoryGroup.slug}`}
        type="article"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      </Helmet>
      <Header />

      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground flex items-center gap-1">
              <Home className="w-3 h-3" /> Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/blog" className="hover:text-foreground">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{categoryGroup.name}</span>
          </nav>

          {/* Category Header */}
          <div className="mb-12">
            <Badge className="mb-4">{sortedPosts.length} articles</Badge>
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
              {categoryGroup.name}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {categoryGroup.longDescription}
            </p>
          </div>

          {/* Category Navigation (all 8 categories) */}
          <div className="mb-12 border-y border-border py-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Browse all categories</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {BLOG_CATEGORY_GROUPS.map(group => (
                <Link
                  key={group.slug}
                  to={`/blog/${group.slug}`}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    group.slug === categoryGroup.slug
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:border-primary hover:text-primary'
                  }`}
                >
                  {group.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-[16/9] bg-muted animate-pulse" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded animate-pulse mb-3" />
                    <div className="h-6 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedPosts.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-display font-semibold mb-2">No articles yet</h2>
              <p className="text-muted-foreground mb-6">
                We're working on articles for this category. Check back soon, or explore our other categories.
              </p>
              <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:underline">
                <ArrowRight className="w-4 h-4" /> Back to all articles
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedPosts.map(post => (
                <Link key={post.slug} to={`/blog/${post.slug}`} className="group">
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                    <div className="aspect-[16/9] overflow-hidden bg-muted">
                      <img
                        src={post.image}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <Badge variant="outline">{post.category}</Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime} min
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {stripHtml(post.excerpt)}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{post.author}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-16 text-center border-t border-border pt-12">
            <h2 className="text-2xl font-display font-semibold mb-4">Explore more categories</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Browse our complete encyclopedia of Indian ethnic fashion — from attire guides to designer profiles, textile techniques to NRI shopping tips.
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              View all articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BlogCategory;
