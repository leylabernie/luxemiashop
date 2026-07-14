import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';
import { sortProducts } from '@/lib/productFilters';
import type { ShopifyProduct } from '@/lib/shopify';

/**
 * Reusable programmatic SEO combo page.
 * Renders a filtered product grid + unique SEO content for pages like:
 *   /maroon-lehenga-for-wedding-guest
 *   /anarkali-suit-for-mother-of-bride
 *   /georgette-saree-for-reception
 */

export interface ComboPageConfig {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  heroSubtitle: string;
  breadcrumb: string;
  category: 'lehengas' | 'sarees' | 'suits' | 'menswear' | 'indowestern' | 'all';
  filters: {
    colors?: string[];
    fabrics?: string[];
    occasions?: string[];
    roles?: string[];
    styles?: string[];
    titleKeywords?: string[];
  };
  guideSections: Array<{
    heading: string;
    paragraphs: string[];
  }>;
  faqs: Array<{ question: string; answer: string }>;
  relatedLinks: Array<{ label: string; url: string }>;
}

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function filterForCombo(products: ShopifyProduct[], config: ComboPageConfig): ShopifyProduct[] {
  const { filters } = config;
  const hasFilters = filters.colors || filters.fabrics || filters.occasions || filters.roles || filters.styles || filters.titleKeywords;
  if (!hasFilters) return products;

  return products.filter(p => {
    const node = p.node;
    const tags = (node.tags ?? []).map(t => t.toLowerCase());
    const title = (node.title ?? '').toLowerCase();
    const productType = (node.productType ?? '').toLowerCase();
    const description = (node.description ?? '').toLowerCase();
    const text = `${title} ${productType} ${description}`;

    if (filters.colors && filters.colors.length > 0) {
      const colorMatch = filters.colors.some(color => {
        const c = color.toLowerCase();
        if (tags.includes(`color:${c}`)) return true;
        if (tags.includes(c)) return true;
        return new RegExp(`\\b${escapeRegex(c)}\\b`, 'i').test(text);
      });
      if (!colorMatch) return false;
    }

    if (filters.fabrics && filters.fabrics.length > 0) {
      const fabricMatch = filters.fabrics.some(fabric => {
        const f = fabric.toLowerCase();
        if (tags.includes(`fabric:${f}`)) return true;
        if (tags.includes(f)) return true;
        return new RegExp(`\\b${escapeRegex(f)}\\b`, 'i').test(text);
      });
      if (!fabricMatch) return false;
    }

    if (filters.occasions && filters.occasions.length > 0) {
      const occasionMatch = filters.occasions.some(occ => {
        const o = occ.toLowerCase();
        if (tags.includes(`occasion:${o}`)) return true;
        if (tags.includes(o)) return true;
        return new RegExp(`\\b${escapeRegex(o)}\\b`, 'i').test(text);
      });
      if (!occasionMatch) return false;
    }

    if (filters.roles && filters.roles.length > 0) {
      const roleMatch = filters.roles.some(role => {
        const r = role.toLowerCase();
        if (tags.includes(`role:${r}`)) return true;
        if (tags.includes(r)) return true;
        return new RegExp(`\\b${escapeRegex(r)}\\b`, 'i').test(text);
      });
      if (!roleMatch) return false;
    }

    if (filters.styles && filters.styles.length > 0) {
      const styleMatch = filters.styles.some(style => {
        const s = style.toLowerCase();
        if (tags.includes(`style:${s}`)) return true;
        if (tags.includes(s)) return true;
        return new RegExp(`\\b${escapeRegex(s)}\\b`, 'i').test(text);
      });
      if (!styleMatch) return false;
    }

    if (filters.titleKeywords && filters.titleKeywords.length > 0) {
      const keywordMatch = filters.titleKeywords.some(kw => {
        const k = kw.toLowerCase();
        return new RegExp(`\\b${escapeRegex(k)}\\b`, 'i').test(title);
      });
      if (!keywordMatch) return false;
    }

    return true;
  });
}

interface ComboPageProps {
  config: ComboPageConfig;
}

const ComboPage = ({ config }: ComboPageProps) => {
  const { products, isLoading } = useShopifyProducts(config.category);
  const [sortBy, setSortBy] = useState('featured');

  const filteredProducts = useMemo(() => {
    const filtered = filterForCombo(products, config);
    return sortProducts(filtered, sortBy);
  }, [products, config, sortBy]);

  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Featured';
  const productCount = filteredProducts.length;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={config.title}
        description={config.metaDescription}
        canonical={`https://luxemia.shop/${config.slug}`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: config.breadcrumb, url: `/${config.slug}` },
        ]}
        faqs={config.faqs}
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">

        {/* Hero */}
        <div className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Curated Collection</span>
            </div>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">{config.h1}</h1>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
              {config.heroSubtitle}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-border/30 bg-background sticky top-[90px] lg:top-[132px] z-30">
          <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading…' : `${productCount} ${productCount === 1 ? 'style' : 'styles'}`}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-sm font-light">
                  Sort: {currentSort} <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortOptions.map(opt => (
                  <DropdownMenuItem key={opt.value} onClick={() => setSortBy(opt.value)} className={sortBy === opt.value ? 'font-medium' : ''}>
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Product Grid */}
        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-muted rounded-sm mb-4" />
                  <div className="h-3 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : productCount > 0 ? (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            >
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.node.id} product={product} index={index} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-6">
                We're refreshing this collection. Browse our full catalog instead:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/lehengas"><Button variant="outline">Shop All Lehengas</Button></Link>
                <Link to="/sarees"><Button variant="outline">Shop All Sarees</Button></Link>
                <Link to="/suits"><Button variant="outline">Shop All Suits</Button></Link>
                <Link to="/collections"><Button variant="outline">Shop All Collections</Button></Link>
              </div>
            </div>
          )}
        </section>

        {/* Guide sections */}
        <section className="border-t border-border/30 bg-secondary/20 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            {config.guideSections.map((section, i) => (
              <div key={i} className={i > 0 ? 'border-t border-border/30 pt-6 mt-6' : ''}>
                <h2 className="font-serif text-2xl mb-4 text-center">{section.heading}</h2>
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  {section.paragraphs.map((p, j) => (
                    <p key={j} dangerouslySetInnerHTML={{ __html: p }} />
                  ))}
                </div>
              </div>
            ))}

            <div className="border-t border-border/30 pt-6 mt-8">
              <h3 className="font-medium text-foreground mb-3 text-center">Related Guides & Collections</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm max-w-2xl mx-auto">
                {config.relatedLinks.map((link, i) => (
                  <li key={i}>
                    <Link to={link.url} className="text-primary underline">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ section */}
        {config.faqs.length > 0 && (
          <section className="border-t border-border bg-card/30 py-14">
            <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
              <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {config.faqs.map((faq, i) => (
                  <div key={i} className="bg-background border border-border rounded-lg px-5 py-4">
                    <h3 className="text-sm font-medium text-foreground mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ComboPage;
