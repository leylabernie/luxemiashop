import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { blogPosts } from '@/data/blogPosts';
import { Calendar, Clock, User, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&');

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
  },
  {
    label: 'Fabric & Care Guides',
    link: '/blog',
    description: 'Maintain your ethnic wardrobe',
  },
  {
    label: 'NRI Shopping Tips',
    link: '/blog',
    description: 'Buying from USA, Canada & Australia',
  },
];

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const featuredPost = blogPosts[0];
  const categories = [...new Set(blogPosts.map(post => post.category))];

  const filteredPosts = useMemo(() => {
    if (!activeCategory) return blogPosts.slice(1);
    return blogPosts.filter(post => post.category === activeCategory);
  }, [activeCategory]);

  const displayFeatured = activeCategory ? null : featuredPost;

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "LuxeMia Indian Wedding Dress Guide",
    "description": "Expert guides on Indian wedding dresses, bridal lehengas, saree styling, and ethnic fashion trends",
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
        "url": "https://luxemia.shop/logo.png"
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

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Indian Ethnic Wear Blog — Bridal Lehengas, Saree Styles & Wedding Fashion | LuxeMia"
        description="Expert guides on Indian wedding dresses, bridal lehengas, saree styles & ethnic fashion for NRIs shopping from USA, Canada & Australia. Get insider tips from top stylists."
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(blogSchema)}
        </script>
      </Helmet>
      <Header />
      
      <main className="pt-[88px] lg:pt-[130px]">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/5 to-background py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
                Indian Ethnic Wear Blog — Bridal Lehengas, Saree Styles & Wedding Fashion
              </h1>
              <p className="text-lg text-muted-foreground">
                Expert guides for NRIs shopping from USA, Canada & Australia — bridal lehengas, wedding sarees, styling inspiration & care tips for your perfect look
              </p>
            </div>
          </div>
        </section>

        {/* AI-Readable Content Overview */}
        <section aria-label="Content overview" className="py-6 border-b border-border bg-muted/20">
          <div className="container mx-auto px-4">
            <p className="text-sm text-muted-foreground max-w-3xl mx-auto text-center">
              Explore our curated guides on Indian wedding fashion, bridal lehengas, saree draping styles, and ethnic wear care tips. Written for NRIs shopping from the USA, Canada, and Australia.
            </p>
          </div>
        </section>

        {/* Categories with Filtering */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              <Badge 
                variant={!activeCategory ? "secondary" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setActiveCategory(null)}
              >
                All Articles
              </Badge>
              {categories.map(category => (
                <Badge 
                  key={category} 
                  variant={activeCategory === category ? "secondary" : "outline"}
                  className={`cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors ${activeCategory === category ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
            {activeCategory && (
              <p className="text-center text-sm text-muted-foreground mt-3">
                Showing {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} in <span className="font-medium text-foreground">{activeCategory}</span>
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
                    {activeCategory} Articles
                  </h2>
                )}

                {/* Posts Grid (shown below featured or as main grid when filtered) */}
                {displayFeatured && filteredPosts.length > 0 && (
                  <div className="mt-12">
                    <h2 className="text-2xl font-display font-semibold mb-8">Latest Articles</h2>
                  </div>
                )}
                {filteredPosts.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                    {filteredPosts.map(post => (
                      <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                        <Card className="h-full overflow-hidden border hover:shadow-lg transition-all">
                          <div className="aspect-[16/10] overflow-hidden">
                            <img 
                              src={post.image} 
                              alt={post.title}
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
                )}
              </div>

              {/* Popular Topics Sidebar */}
              <aside className="hidden lg:block">
                <Card className="sticky top-[150px]">
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
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;
