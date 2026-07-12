import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import type { BlogPost } from '@/data/blogPosts';
import { blogPosts } from '@/data/blogPosts';
import { BLOG_AUTHORS, getAuthorBySlug } from '@/data/blogAuthors';
import { getBlogCategoryGroup } from '@/data/blogCategories';
import { Calendar, Clock, MapPin, Award, BookOpen, ChevronRight, Home, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();

const AuthorBio = () => {
  const { slug } = useParams<{ slug: string }>();
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import('@/data/blogPosts').then(m => {
      setAllPosts(m.blogPosts);
      setIsLoading(false);
    });
  }, []);

  const author = slug ? getAuthorBySlug(slug) : undefined;

  // Get all posts by this author (match by name contained in the post.author field)
  const authorPosts = useMemo(() => {
    if (!author) return [];
    return allPosts
      .filter(p => p.author.toLowerCase().includes(author.name.toLowerCase()))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [allPosts, author]);

  if (!author) {
    return <Navigate to="/blog" replace />;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": author.name,
      "jobTitle": author.role,
      "description": author.credentials + '. ' + author.bio.slice(0, 300),
      "url": `https://luxemia.shop/authors/${author.slug}`,
      "worksFor": {
        "@type": "Organization",
        "name": "LuxeMia"
      },
      "knowsAbout": author.expertise,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": author.location
      }
    }
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://luxemia.shop" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://luxemia.shop/blog" },
      { "@type": "ListItem", "position": 3, "name": author.name, "item": `https://luxemia.shop/authors/${author.slug}` },
    ],
  };

  const metaTitle = `${author.name} — ${author.role} | LuxeMia Blog`;
  const metaDescription = `${author.credentials}. ${author.bio.slice(0, 140).trim()}... Read ${author.name}'s articles on Indian ethnic wear at LuxeMia.`;

  return (
    <>
      <SEOHead
        title={metaTitle}
        description={metaDescription}
        canonical={`https://luxemia.shop/authors/${author.slug}`}
        type="article"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      </Helmet>
      <Header />

      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground flex items-center gap-1">
              <Home className="w-3 h-3" /> Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/blog" className="hover:text-foreground">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{author.name}</span>
          </nav>

          {/* Author Header */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-4 border-background shadow-lg">
                  <span className="text-4xl font-display font-bold text-primary">
                    {author.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-3 leading-tight">
                  {author.name}
                </h1>
                <p className="text-xl text-primary font-medium mb-3">{author.role}</p>
                <p className="text-muted-foreground mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  {author.credentials}
                </p>
                <p className="text-muted-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {author.location}
                </p>
                <div className="flex flex-wrap gap-2">
                  {author.expertise.map(skill => (
                    <Badge key={skill} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Author Bio */}
          <div className="mb-16 prose prose-lg max-w-none">
            <h2 className="text-2xl font-display font-semibold mb-4">About {author.name.split(' ')[0]}</h2>
            {author.bio.split('\n\n').map((para, i) => (
              <p key={i} className="text-foreground leading-relaxed mb-4">{para}</p>
            ))}
          </div>

          {/* Author's Articles */}
          <div className="border-t border-border pt-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-semibold">
                Articles by {author.name.split(' ')[0]}
                {authorPosts.length > 0 && (
                  <span className="text-muted-foreground text-lg ml-2">({authorPosts.length})</span>
                )}
              </h2>
              <Link to="/blog" className="text-sm text-primary hover:underline flex items-center gap-1">
                All articles <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-[16/9] bg-muted animate-pulse" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                      <div className="h-6 bg-muted rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : authorPosts.length === 0 ? (
              <div className="text-center py-12 border border-border rounded-lg">
                <BookOpen className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No articles published yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {authorPosts.map(post => {
                  const categoryGroup = getBlogCategoryGroup(post.slug);
                  return (
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
                        <CardContent className="p-4">
                          {categoryGroup && (
                            <Link
                              to={`/blog/${categoryGroup.slug}`}
                              className="text-xs text-primary hover:underline mb-2 inline-block"
                              onClick={e => e.stopPropagation()}
                            >
                              {categoryGroup.name}
                            </Link>
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
            )}
          </div>

          {/* Other Authors */}
          <div className="mt-16 border-t border-border pt-12">
            <h2 className="text-2xl font-display font-semibold mb-6">Meet all LuxeMia experts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {BLOG_AUTHORS.filter(a => a.slug !== author.slug).map(otherAuthor => (
                <Link
                  key={otherAuthor.slug}
                  to={`/authors/${otherAuthor.slug}`}
                  className="group p-4 border border-border rounded-lg hover:border-primary hover:shadow-sm transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3">
                    <span className="text-sm font-display font-bold text-primary">
                      {otherAuthor.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors">{otherAuthor.name}</p>
                  <p className="text-xs text-muted-foreground">{otherAuthor.role}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AuthorBio;
