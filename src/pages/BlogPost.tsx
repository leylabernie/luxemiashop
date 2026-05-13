import { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import type { BlogPost as BlogPostType } from '@/data/blogPosts';
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, Facebook, Twitter, BookOpen, List, ChevronRight, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

interface TocItem {
  id: string;
  text: string;
}

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();

const categoryToShopLink: Record<string, { label: string; href: string }[]> = {
  'Bridal Guide': [
    { label: 'Lehengas', href: '/lehengas' },
    { label: 'Sarees', href: '/sarees' },
    { label: 'Suits', href: '/suits' },
  ],
  'Shopping Guide': [
    { label: 'Lehengas', href: '/lehengas' },
    { label: 'Sarees', href: '/sarees' },
    { label: 'Suits', href: '/suits' },
  ],
  'Styling Tips': [
    { label: 'Lehengas', href: '/lehengas' },
    { label: 'Sarees', href: '/sarees' },
    { label: 'Suits', href: '/suits' },
  ],
  'Wedding Guide': [
    { label: 'Lehengas', href: '/lehengas' },
    { label: 'Sarees', href: '/sarees' },
    { label: 'Suits', href: '/suits' },
  ],
  'Wedding Trends': [
    { label: 'Lehengas', href: '/lehengas' },
    { label: 'Sarees', href: '/sarees' },
    { label: 'Suits', href: '/suits' },
  ],
  'Care Guide': [
    { label: 'Sarees', href: '/sarees' },
    { label: 'Suits', href: '/suits' },
  ],
  'NRI Fashion': [
    { label: 'Lehengas', href: '/lehengas' },
    { label: 'Sarees', href: '/sarees' },
    { label: 'Suits', href: '/suits' },
  ],
  'Style Tips': [
    { label: 'Lehengas', href: '/lehengas' },
    { label: 'Sarees', href: '/sarees' },
    { label: 'Suits', href: '/suits' },
  ],
  'Wedding Style': [
    { label: 'Lehengas', href: '/lehengas' },
    { label: 'Sarees', href: '/sarees' },
    { label: 'Suits', href: '/suits' },
  ],
  'Care & Styling': [
    { label: 'Sarees', href: '/sarees' },
    { label: 'Suits', href: '/suits' },
  ],
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | undefined>(undefined);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(true);

  useEffect(() => {
    import('@/data/blogPosts').then(m => {
      if (slug) {
        const found = m.getPostBySlug(slug);
        setPost(found);
        if (found) {
          setRelatedPosts(m.getRelatedPosts(found));
        }
      }
      setIsDataLoading(false);
    });
  }, [slug]);

  const handleScroll = useCallback(() => {
    const articleEl = document.getElementById('article-content');
    if (!articleEl) return;
    const rect = articleEl.getBoundingClientRect();
    const articleHeight = rect.height;
    const scrolledPast = -rect.top;
    const progress = Math.min(Math.max((scrolledPast / (articleHeight - window.innerHeight)) * 100, 0), 100);
    setReadingProgress(Math.round(progress));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Sanitize blog HTML content to prevent XSS attacks.
  // Even though our blog content is authored internally, this protects against
  // supply-chain attacks if the content source is ever compromised.
  const sanitizedContent = useMemo(
    () => DOMPurify.sanitize(post.content, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
        'ul', 'ol', 'li', 'a', 'strong', 'em', 'b', 'i', 'u',
        'blockquote', 'pre', 'code', 'img', 'figure', 'figcaption',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'span', 'div', 'sub', 'sup',
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel', 'src', 'alt', 'title', 'class',
        'id', 'width', 'height', 'loading', 'decoding',
      ],
      ADD_ATTR: ['target'], // Allow target="_blank" for external links
    }),
    [post.content]
  );

  // Extract h2 headings for TOC
  const tocItems: TocItem[] = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitizedContent, 'text/html');
    const headings = doc.querySelectorAll('h2');
    const items: TocItem[] = [];
    headings.forEach((heading, index) => {
      const id = heading.id || `section-${index}`;
      if (!heading.id) {
        heading.id = id;
      }
      items.push({ id, text: heading.textContent || '' });
    });
    return items;
  }, [sanitizedContent]);

  // Inject IDs into h2 elements of sanitized content
  const contentWithIds = useMemo(() => {
    if (tocItems.length === 0) return sanitizedContent;
    let html = sanitizedContent;
    let h2Index = 0;
    html = html.replace(/<h2([^>]*)>/g, (_match, attrs) => {
      const existingIdMatch = attrs.match(/id="([^"]+)"/);
      if (existingIdMatch) return `<h2${attrs}>`;
      const id = `section-${h2Index}`;
      h2Index++;
      return `<h2 id="${id}"${attrs}>`;
    });
    return html;
  }, [sanitizedContent, tocItems]);

  // Estimate word count from stripped content
  const plainTextContent = stripHtml(post.content);
  const wordCount = plainTextContent.split(/\s+/).filter(Boolean).length;
  const articleBody = plainTextContent.slice(0, 300);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": {
      "@type": "ImageObject",
      "url": `https://luxemia.shop${post.image}`,
      "width": 1200,
      "height": 630
    },
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt,
    "author": {
      "@type": "Person",
      "name": post.author,
      "url": "https://luxemia.shop/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "LuxeMia",
      "logo": {
        "@type": "ImageObject",
        "url": "https://luxemia.shop/favicon.ico"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://luxemia.shop/blog/${post.slug}`
    },
    "keywords": post.tags.join(", "),
    "inLanguage": "en-US",
    "genre": post.category,
    "wordCount": wordCount,
    "articleBody": articleBody
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://luxemia.shop"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://luxemia.shop/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://luxemia.shop/blog/${post.slug}`
      }
    ]
  };

  const shareUrl = `https://luxemia.shop/blog/${post.slug}`;

  // Related category links based on post category and tags
  const relatedCategories = useMemo(() => {
    const links = categoryToShopLink[post.category] || [
      { label: 'Lehengas', href: '/lehengas' },
      { label: 'Sarees', href: '/sarees' },
      { label: 'Suits', href: '/suits' },
    ];
    // Deduplicate
    const seen = new Set<string>();
    return links.filter(l => {
      if (seen.has(l.href)) return false;
      seen.add(l.href);
      return true;
    });
  }, [post.category]);

  // Check if updated date differs from published date
  const showUpdatedDate = post.updatedAt && post.updatedAt !== post.publishedAt;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${post.title} | LuxeMia Blog`}
        description={post.excerpt}
        image={post.image}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:modified_time" content={post.updatedAt} />
        <meta property="article:author" content={post.author} />
        <meta property="article:section" content={post.category} />
        {post.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
      </Helmet>
      <Header />
      
      <main className="pt-[88px] lg:pt-[130px]">
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted/50">
          <div 
            className="h-full bg-primary transition-[width] duration-150 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        {/* Breadcrumb */}
        <nav className="bg-muted/30 py-4 border-b border-border">
          <div className="container mx-auto px-4">
            <ol className="flex items-center gap-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary">Home</Link></li>
              <li className="text-muted-foreground">/</li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary">Blog</Link></li>
              <li className="text-muted-foreground">/</li>
              <li className="text-foreground truncate max-w-[200px]">{post.title}</li>
            </ol>
          </div>
        </nav>

        {/* Article Header */}
        <article className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Back Button */}
              <Link 
                to="/blog" 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>

              {/* Category & Meta */}
              <div className="flex items-center gap-2 mb-4">
                <Badge className="">{post.category}</Badge>
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <BookOpen className="w-3 h-3" />
                  {post.readTime} min read
                </Badge>
              </div>
              
              {/* Title */}
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Author & Date */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-2">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {post.author}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.publishedAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.readTime} min read
                </span>
              </div>
              {/* Last Updated Date */}
              {showUpdatedDate && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Last updated: {new Date(post.updatedAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              )}

              {/* Featured Image */}
              <div className="aspect-[16/9] rounded-lg overflow-hidden mb-6">
                <img
                  src={post.image}
                  alt={post.title}
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Article Summary Box */}
              <div className="mb-10 border-l-4 border-primary bg-primary/5 rounded-r-lg px-5 py-4">
                <p className="text-sm font-semibold text-foreground mb-1">Article Summary</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              {/* Table of Contents */}
              {tocItems.length > 0 && (
                <div className="mb-10">
                  <Collapsible open={tocOpen} onOpenChange={setTocOpen}>
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors w-full text-left mb-3">
                        <List className="w-4 h-4" />
                        Table of Contents
                        <ChevronRight className={`w-4 h-4 transition-transform ${tocOpen ? 'rotate-90' : ''}`} />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <nav aria-label="Table of contents" className="rounded-lg border border-border bg-muted/30 p-4">
                        <ol className="space-y-2">
                          {tocItems.map((item, index) => (
                            <li key={item.id}>
                              <button
                                onClick={() => scrollToHeading(item.id)}
                                className="text-sm text-muted-foreground hover:text-primary transition-colors text-left flex items-start gap-2"
                              >
                                <span className="text-xs text-muted-foreground/60 mt-0.5 shrink-0">{index + 1}.</span>
                                <span>{item.text}</span>
                              </button>
                            </li>
                          ))}
                        </ol>
                      </nav>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}

              {/* Content */}
              <div 
                id="article-content"
                className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-semibold prose-h2:text-2xl prose-h3:text-xl prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary prose-strong:text-foreground"
                dangerouslySetInnerHTML={{ __html: contentWithIds }}
              />

              {/* Tags */}
              <div className="mt-10 pt-8 border-t border-border">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Tags:</span>
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Related Categories */}
              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-3">Shop Related Categories</h3>
                <div className="flex flex-wrap gap-3">
                  {relatedCategories.map(cat => (
                    <Link
                      key={cat.href}
                      to={cat.href}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors"
                    >
                      {cat.label}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Share */}
              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share this article:
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Facebook className="w-4 h-4" />
                        Facebook
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a 
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Twitter className="w-4 h-4" />
                        Twitter
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-12 lg:py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-display font-semibold text-center mb-8">
                Related Articles
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
                {relatedPosts.map(relatedPost => (
                  <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`} className="group">
                    <Card className="h-full overflow-hidden border hover:shadow-lg transition-all">
                      <div className="aspect-[16/10] overflow-hidden">
                        <img 
                          src={relatedPost.image} 
                          alt={relatedPost.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <CardContent className="p-5">
                        <Badge variant="secondary" className="mb-3">{relatedPost.category}</Badge>
                        <h3 className="text-lg font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {relatedPost.readTime} min
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-12 lg:py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
              Explore Our Collections
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Discover beautiful pieces inspired by these fashion trends
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link to="/lehengas">Shop Lehengas</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/sarees">Shop Sarees</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPost;
