import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { blogPosts } from '@/data/blogPosts';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Blog = () => {
  const featuredPost = blogPosts[0];
  const recentPosts = blogPosts.slice(1);
  const categories = [...new Set(blogPosts.map(post => post.category))];

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "LuxeMia Fashion Blog",
    "description": "Expert insights on Indian fashion, wedding trends, styling tips, and ethnic wear guides",
    "url": "https://luxemia.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "LuxeMia",
      "logo": {
        "@type": "ImageObject",
        "url": "https://luxemia.com/logo.png"
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
        "name": post.author
      },
      "url": `https://luxemia.com/blog/${post.slug}`
    }))
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Indian Fashion Blog | Wedding Trends & Styling Tips | LuxeMia"
        description="Explore expert articles on Indian ethnic wear, bridal fashion trends, saree draping styles, and styling tips. Your ultimate guide to traditional and contemporary Indian fashion."
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(blogSchema)}
        </script>
      </Helmet>
      <Header />
      
      <main className="pt-[104px] lg:pt-[120px]">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/5 to-background py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
                LuxeMia Fashion Journal
              </h1>
              <p className="text-lg text-muted-foreground">
                Expert insights on Indian fashion, wedding trends, styling tips, and the art of traditional craftsmanship
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                All Articles
              </Badge>
              {categories.map(category => (
                <Badge 
                  key={category} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-display font-semibold mb-8">Featured Article</h2>
            <Link to={`/blog/${featuredPost.slug}`} className="block group">
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="aspect-[16/10] lg:aspect-auto overflow-hidden">
                    <img 
                      src={featuredPost.image} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6 lg:p-10 flex flex-col justify-center">
                    <Badge className="w-fit mb-4">{featuredPost.category}</Badge>
                    <h3 className="text-2xl lg:text-3xl font-display font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {featuredPost.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(featuredPost.publishedAt).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredPost.readTime} min read
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                      Read Article <ArrowRight className="w-4 h-4" />
                    </span>
                  </CardContent>
                </div>
              </Card>
            </Link>
          </div>
        </section>

        {/* Recent Posts Grid */}
        <section className="py-12 lg:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-display font-semibold mb-8">Latest Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {recentPosts.map(post => (
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
                      <Badge variant="secondary" className="mb-3">{post.category}</Badge>
                      <h3 className="text-lg font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.publishedAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime} min
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
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
              Subscribe to our newsletter for the latest articles on Indian fashion, styling tips, and exclusive offers.
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
