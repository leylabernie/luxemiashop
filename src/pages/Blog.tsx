import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import type { BlogPost } from '@/data/blogPosts';
import { BLOG_CATEGORY_GROUPS, getCategoryPostCounts, getPostSlugsByCategory } from '@/data/blogCategories';
import { Calendar, Clock, User, ArrowRight, BookOpen, Sparkles, ChevronRight, Home, Layers, Compass, GraduationCap, Palette, Globe, Heart, Crown, Shirt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&');

// Map BLOG_CATEGORY_GROUPS to lucide icons (icon names are stored as strings in blogCategories.ts)
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shirt,
  Sparkles,
  Compass,
  Crown,
  Palette,
  Heart,
  GraduationCap,
  Globe,
  Layers,
};

// Build topicClusters from the canonical BLOG_CATEGORY_GROUPS (single source of truth)
const topicClusters = BLOG_CATEGORY_GROUPS.map(group => ({
  id: group.slug,
  icon: iconMap[group.icon] || BookOpen,
  title: group.name,
  description: group.shortDescription,
  // Use slug as the link target — /blog/{slug} is the category index page
  categoryLink: `/blog/${group.slug}`,
  shopLink: '/collections',
  shopLabel: 'Shop Collection',
}));

const popularTopics = [
  {
    label: 'Bridal Lehengas',
    link: '/lehengas',
    description: 'Shopping guides & styling tips',
  },
  {
    label: 'Wedding Sarees',
    link: '/sarees',
    description: 'Draping, fabrics & care',
  },
  {
    label: 'Salwar Suits & Anarkalis',
    link: '/suits',
    description: 'Latest styles & trends',
  },
  {
    label: 'Wedding Guest Outfits',
    link: '/blog',
    description: 'What to wear to every ceremony',
    category: 'Styling Tips',
  },
  {
    label: 'Fabric & Care Guides',
    link: '/blog',
    description: 'Maintain your ethnic wardrobe',
    category: 'Care Guide',
  },
  {
    label: 'NRI Shopping Tips',
    link: '/blog',
    description: 'Buying from USA, Canada & Australia',
    category: 'NRI Fashion',
  },
];

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCluster, setActiveCluster] = useState<string | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import('@/data/blogPosts').then(m => {
      setBlogPosts(m.blogPosts);
      setIsLoading(false);
    });
  }, []);

  const featuredPost = blogPosts[0];
  const categories = [...new Set(blogPosts.map(post => post.category))];

  // Determine which posts to show based on cluster or category filter
  // Uses the canonical BLOG_POST_CATEGORY_MAP for category → posts lookup.
  const filteredPosts = useMemo(() => {
    if (activeCluster) {
      // activeCluster is the category slug (e.g. 'attires', 'motifs-embroideries')
      const categorySlugs = new Set(getPostSlugsByCategory(activeCluster));
      return blogPosts.filter(post => categorySlugs.has(post.slug));
    }
    if (activeCategory) {
      return blogPosts.filter(post => post.category === activeCategory);
    }
    return blogPosts.slice(1);
  }, [activeCategory, activeCluster, blogPosts]);

  const displayFeatured = (activeCategory || activeCluster) ? null : featuredPost;

  // Count posts per cluster — uses the canonical BLOG_POST_CATEGORY_MAP.
  // This replaces the old fragile per-post.category matching that didn't align
  // with the 8-category Utsavpedia taxonomy.
  const clusterCounts = useMemo(() => {
    return getCategoryPostCounts();
  }, []);

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "LuxeMia Indian Wedding Dress Guide",
    "description": "Expert guides on Indian wedding dresses, bridal lehengas, saree styling, and ethnic fashion trends for NRIs in USA, Canada & Australia",
    "url": "https://luxemia.shop/blog",
    "inLanguage": "en-US",
    "genre": categories.join(", "),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://luxemia.shop/blog"
    },
    "publisher": {
      "@type": "Organization",
      "name": "LuxeMia",
      "logo": {
        "@type": "ImageObject",
        "url": "https://luxemia.shop/favicon.ico"
      }
    },
    "blogPost": blogPosts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.publishedAt,
      "dateModified": post.updatedAt,
      "author": {
        "@type": "Person",
        "name": post.author,
        "url": "https://luxemia.shop/about"
      },
      "url": `https://luxemia.shop/blog/${post.slug}`
    }))
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://luxemia.shop' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://luxemia.shop/blog' },
    ],
  };

  const clearFilters = () => {
    setActiveCategory(null);
    setActiveCluster(null);
  };

  const handleClusterClick = (clusterId: string) => {
    if (activeCluster === clusterId) {
      setActiveCluster(null);
    } else {
      setActiveCluster(clusterId);
      setActiveCategory(null);
    }
  };

  const handleCategoryClick = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null);
    } else {
      setActiveCategory(category);
      setActiveCluster(null);
    }
  };

  const activeLabel = activeCluster
    ? topicClusters.find(c => c.id === activeCluster)?.title
    : activeCategory;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Indian Ethnic Wear Blog — Bridal Lehengas, Saree Styles & Wedding Fashion | LuxeMia"
        description="Expert guides on Indian wedding dresses, bridal lehengas, saree styles & ethnic fashion for NRIs shopping from USA, Canada & Australia. Get insider tips from top stylists."
        canonical="https://luxemia.shop/blog"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
        ]}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(blogSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
        <>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="bg-muted/30 py-3 border-b border-border">
          <div className="container mx-auto px-4">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link to="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              </li>
              <li><ChevronRight className="w-3 h-3 text-muted-foreground" /></li>
              <li className="text-foreground font-medium">Blog</li>
            </ol>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/5 to-background py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="secondary" className="mb-4">
                <BookOpen className="w-3 h-3 mr-1" />
                {blogPosts.length} Articles
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
                Indian Ethnic Wear Blog — Bridal Lehengas, Saree Styles & Wedding Fashion
              </h1>
              <p className="text-lg text-muted-foreground">
                Expert guides for NRIs shopping from USA, Canada & Australia — bridal lehengas, wedding sarees, styling inspiration & care tips for your perfect look
              </p>
            </div>
          </div>
        </section>

        {/* AI-Readable Content Overview — helps AI search understand the page structure */}
        <section aria-label="Content overview" className="py-6 border-b border-border bg-muted/20">
          <div className="container mx-auto px-4">
            <p className="text-sm text-muted-foreground max-w-3xl mx-auto text-center">
              Explore our curated guides on Indian wedding fashion, bridal lehengas, saree draping styles, fabric encyclopedias, and ethnic wear care tips. Written specifically for NRIs shopping from the USA, Canada, and Australia. Content is organized into topic clusters covering bridal fashion, wedding planning, styling tips, NRI shopping guides, fabric care, and cultural deep dives.
            </p>
          </div>
        </section>

        {/* Topic Cluster Navigation — Pillar content organization for AI search */}
        <section className="py-8 border-b border-border bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-sm font-medium text-muted-foreground text-center mb-4 uppercase tracking-wider">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {topicClusters.map(cluster => {
                const Icon = cluster.icon;
                const isActive = activeCluster === cluster.id;
                return (
                  <Link
                    key={cluster.id}
                    to={cluster.categoryLink}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all text-center ${
                      isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-xs font-medium leading-tight">{cluster.title}</span>
                    <span className="text-[10px] text-muted-foreground">{clusterCounts[cluster.id] || 0} articles</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Categories with Filtering */}
        <section className="py-6 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2">
              <Badge
                variant={!activeCategory && !activeCluster ? "secondary" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={clearFilters}
              >
                All Articles
              </Badge>
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={activeCategory === category ? "secondary" : "outline"}
                  className={`cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors ${activeCategory === category ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
            {activeLabel && (
              <p className="text-center text-sm text-muted-foreground mt-3">
                Showing {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} in <span className="font-medium text-foreground">{activeLabel}</span>
                <button
                  onClick={clearFilters}
                  className="ml-2 text-primary hover:underline"
                >
                  Clear filter
                </button>
              </p>
            )}
          </div>
        </section>

        {/* Featured Post + Popular Topics Layout */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-[1fr_300px] gap-8 lg:gap-12">
              {/* Main Content */}
              <div>
                {displayFeatured ? (
                  <>
                    <h2 className="text-2xl font-display font-semibold mb-8">Featured Article</h2>
                    <Link to={`/blog/${displayFeatured.slug}`} className="block group">
                      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="grid lg:grid-cols-2 gap-0">
                          <div className="aspect-[16/10] lg:aspect-auto overflow-hidden">
                            <img
                              src={displayFeatured.image}
                              alt={displayFeatured.title}
                              fetchPriority="high"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <CardContent className="p-6 lg:p-10 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-4">
                              <Badge className="w-fit">{displayFeatured.category}</Badge>
                              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                <Clock className="w-3 h-3" />
                                {displayFeatured.readTime} min read
                              </Badge>
                            </div>
                            <h3 className="text-2xl lg:text-3xl font-display font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                              {stripHtml(displayFeatured.title)}
                            </h3>
                            <p className="text-muted-foreground mb-6 line-clamp-3">
                              {stripHtml(displayFeatured.excerpt)}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {displayFeatured.author}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(displayFeatured.publishedAt).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {displayFeatured.readTime} min read
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                              Read Article <ArrowRight className="w-4 h-4" />
                            </span>
                          </CardContent>
                        </div>
                      </Card>
                    </Link>
                  </>
                ) : (
                  <h2 className="text-2xl font-display font-semibold mb-8">
                    {activeLabel} Articles
                  </h2>
                )}

                {/* Posts Grid */}
                {displayFeatured && filteredPosts.length > 0 && (
                  <div className="mt-12">
                    <h2 className="text-2xl font-display font-semibold mb-8">Latest Articles</h2>
                  </div>
                )}
                {filteredPosts.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                    {filteredPosts.map(post => (
                      <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                        <Card className="h-full overflow-hidden border hover:shadow-lg transition-all">
                          <div className="aspect-[16/10] overflow-hidden">
                            <img
                              src={post.image}
                              alt={post.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                <Clock className="w-3 h-3" />
                                {post.readTime} min
                              </Badge>
                            </div>
                            <h3 className="text-lg font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                              {stripHtml(post.title)}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {stripHtml(post.excerpt)}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              <span className="flex items-center gap-1 font-medium text-primary">
                                Read <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-serif mb-2">No articles found</h3>
                    <p className="text-muted-foreground mb-6">
                      No articles match the current filter. Try selecting a different topic.
                    </p>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={clearFilters}
                    >
                      View All Articles
                    </Badge>
                  </div>
                )}
              </div>

              {/* Popular Topics Sidebar */}
              <aside className="hidden lg:block">
                <div className="sticky top-[150px] space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-display font-semibold text-foreground mb-1 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Popular Topics
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4">
                        Explore by category
                      </p>
                      <nav aria-label="Popular blog topics" className="space-y-1">
                        {popularTopics.map(topic => (
                          <Link
                            key={topic.label}
                            to={topic.link}
                            className="block rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <span className="block">{topic.label}</span>
                            <span className="block text-xs text-muted-foreground mt-0.5">{topic.description}</span>
                          </Link>
                        ))}
                      </nav>
                    </CardContent>
                  </Card>

                  {/* Quick Shop Links */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Shop by Category</h3>
                      <div className="space-y-2">
                        <Link to="/lehengas" className="flex items-center justify-between text-sm text-muted-foreground hover:text-primary transition-colors py-1">
                          <span>Lehengas</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        <Link to="/sarees" className="flex items-center justify-between text-sm text-muted-foreground hover:text-primary transition-colors py-1">
                          <span>Sarees</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        <Link to="/suits" className="flex items-center justify-between text-sm text-muted-foreground hover:text-primary transition-colors py-1">
                          <span>Salwar Suits</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        <Link to="/menswear" className="flex items-center justify-between text-sm text-muted-foreground hover:text-primary transition-colors py-1">
                          <span>Menswear</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Helpful Resources */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Helpful Resources</h3>
                      <div className="space-y-2">
                        <Link to="/size-guide" className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1">Size Guide</Link>
                        <Link to="/care-guide" className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1">Care Guide</Link>
                        <Link to="/shipping" className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1">Shipping Info</Link>
                        <Link to="/faq" className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1">FAQ</Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </aside>
            </div>

            {/* Mobile Popular Topics */}
            <div className="lg:hidden mt-12">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Popular Topics
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {popularTopics.map(topic => (
                      <Link
                        key={topic.label}
                        to={topic.link}
                        className="block rounded-md border border-border px-3 py-3 text-sm font-medium text-foreground hover:bg-primary/10 hover:border-primary/30 transition-colors"
                      >
                        <span className="block">{topic.label}</span>
                        <span className="block text-xs text-muted-foreground mt-0.5">{topic.description}</span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 lg:py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl lg:text-3xl font-display font-semibold text-foreground mb-4">
              Stay Updated with Fashion Trends
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Subscribe to our newsletter for the latest articles on Indian fashion, styling tips, and exclusive offers for NRIs in USA, Canada & Australia.
            </p>
            <Link
              to="/#newsletter"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              Subscribe Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
        </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
