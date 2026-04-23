import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { getPostBySlug, getRelatedPosts } from '@/data/blogPosts';
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, Facebook, Twitter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = getRelatedPosts(post);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": `https://luxemia.shop${post.image}`,
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "LuxeMia",
      "logo": {
        "@type": "ImageObject",
        "url": "https://luxemia.shop/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://luxemia.shop/blog/${post.slug}`
    },
    "keywords": post.tags.join(", ")
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
              <Badge className="mb-4">{post.category}</Badge>
              
              {/* Title */}
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Author & Date */}
              <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm text-muted-foreground mb-8">
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

              {/* Featured Image */}
              <div className="aspect-[16/9] rounded-lg overflow-hidden mb-10">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div 
                className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-semibold prose-h2:text-2xl prose-h3:text-xl prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary prose-strong:text-foreground"
                dangerouslySetInnerHTML={{ __html: post.content }}
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
              Discover handcrafted pieces inspired by these fashion trends
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
