import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Shield, Clock, ChevronDown, Star, MapPin, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';

interface CountryConfig {
  country: string;
  countryCode: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  shippingTime: string;
  shippingCost: string;
  customsNote: string;
  testimonial: {
    name: string;
    location: string;
    rating: number;
    body: string;
  };
  faqs: { question: string; answer: string }[];
  benefits: { icon: typeof Truck; title: string; description: string }[];
}

const NRILandingPage = ({ config }: { config: CountryConfig }) => {
  const { products } = useShopifyProducts();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const featuredProducts = products.slice(0, 8);

  const occasions = [
    { name: 'Wedding', link: '/collections?occasion=wedding', description: 'Bridal lehengas, wedding sarees & reception outfits' },
    { name: 'Festive', link: '/collections?occasion=festive', description: 'Eid, Diwali, Navratri & celebration wear' },
    { name: 'Casual', link: '/collections?occasion=casual', description: 'Everyday kurtas, suits & contemporary styles' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={config.seoTitle}
        description={config.seoDescription}
        canonical={`https://luxemia.shop/${config.slug}`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: `Indian Ethnic Wear ${config.country}`, url: `/${config.slug}` },
        ]}
        faqs={config.faqs}
        hreflang={[
          { lang: 'en-US', href: 'https://luxemia.shop/indian-ethnic-wear-usa' },
          { lang: 'en-GB', href: 'https://luxemia.shop/indian-ethnic-wear-uk' },
          { lang: 'en-CA', href: 'https://luxemia.shop/indian-ethnic-wear-canada' },
          { lang: 'x-default', href: 'https://luxemia.shop/' },
        ]}
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        {/* Hero */}
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">
                {config.heroSubtitle}
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-6 max-w-3xl mx-auto">
                {config.heroTitle}
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Shop designer sarees, bridal lehengas, salwar suits, and men's ethnic wear from India's renowned textile regions.
                Delivered to your door in {config.country}.
              </p>
              <Button asChild size="lg" className="px-8">
                <Link to="/collections">Shop Now</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {config.benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <benefit.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-medium mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Shop by Occasion */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <h2 className="text-2xl font-serif text-center mb-10">Shop by Occasion</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {occasions.map((occasion) => (
                <Link
                  key={occasion.name}
                  to={occasion.link}
                  className="group p-6 border border-border rounded-lg hover:border-primary/50 transition-colors text-center"
                >
                  <h3 className="font-serif text-lg mb-2 group-hover:text-primary transition-colors">{occasion.name}</h3>
                  <p className="text-sm text-muted-foreground">{occasion.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Bestsellers Grid */}
        {featuredProducts.length > 0 && (
          <section className="py-16 bg-secondary/30">
            <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
              <h2 className="text-2xl font-serif text-center mb-10">Bestsellers in {config.country}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                {featuredProducts.map((product, index) => (
                  <ProductCard key={product.node.id} product={product} index={index} />
                ))}
              </div>
              <div className="text-center mt-10">
                <Button asChild variant="outline" size="lg">
                  <Link to="/collections">View All Collections</Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Testimonial */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-2xl text-center">
            <div className="flex justify-center gap-0.5 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${star <= config.testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`}
                />
              ))}
            </div>
            <blockquote className="text-lg font-serif italic mb-4 leading-relaxed">
              "{config.testimonial.body}"
            </blockquote>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{config.testimonial.name}</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {config.testimonial.location}
              </span>
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span className="text-xs">Verified Purchase</span>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="text-2xl font-serif text-center mb-10">
              Frequently Asked Questions — Shipping to {config.country}
            </h2>
            <div className="space-y-4">
              {config.faqs.map((faq, index) => (
                <div key={index} className="border border-border rounded-lg bg-card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex items-center justify-between w-full text-left p-5"
                  >
                    <span className="font-medium text-sm pr-4">{faq.question}</span>
                    <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === index && (
                    <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-2xl font-serif mb-4">Ready to Shop?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Explore our complete collection of handcrafted Indian ethnic wear, delivered directly to {config.country}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8">
                <Link to="/collections">Shop All Collections</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8">
                <Link to="/style-consultation">Book a Styling Session</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NRILandingPage;
