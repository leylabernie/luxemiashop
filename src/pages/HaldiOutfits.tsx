import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RelatedOccasions from '@/components/seo/RelatedOccasions';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';
import { sortProducts } from '@/lib/productFilters';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const haldiOutfitFaqs = [
  {
    question: 'What color should I wear to a haldi ceremony?',
    answer: 'Yellow is the traditional and most popular color for haldi ceremonies, symbolising turmeric, auspiciousness, and new beginnings. The bride typically wears yellow — a yellow lehenga, yellow salwar kameez, or yellow saree. Guests are also encouraged to wear yellow, gold, mustard, pastel yellow, or warm gold tones. However, modern haldi ceremonies also see guests in peach, coral, mint green, and pastel pink. Avoid white (inauspicious), black (mourning), and red (reserved for the wedding day) for the haldi function.',
  },
  {
    question: 'What should guests wear to a haldi ceremony?',
    answer: 'Guests should wear bright, cheerful ethnic wear in yellow, gold, mustard, or pastel shades. Popular choices include anarkali suits in yellow, salwar kameez sets in gold or mustard, lightweight lehengas in pastel yellow, and simple chiffon or georgette sarees. The haldi is a daytime, pre-wedding ceremony that is more casual than the main wedding — so opt for lighter fabrics (georgette, chiffon, cotton, crepe) and lighter embroidery rather than heavy zardozi or stonework. Comfortable footwear like mojari flats or kolhapuri sandals complete the look.',
  },
  {
    question: 'What does the bride wear for her haldi ceremony?',
    answer: 'The bride traditionally wears a yellow outfit for her haldi ceremony — this is one of the most iconic and photographed looks of an Indian wedding. Popular choices include a yellow lehenga with floral embroidery, a yellow anarkali suit with gota patti work, or a yellow saree (often chiffon or georgette for comfort during the ceremony). The bride is usually draped in a paste of turmeric (haldi) during the ritual, so many brides choose an outfit they don\'t mind getting slightly stained, or wear a simple draping cloth over their outfit during the haldi application.',
  },
  {
    question: 'Can I wear a non-yellow color to a haldi ceremony?',
    answer: 'Yes, while yellow is the most traditional choice, modern haldi ceremonies are more flexible. Popular non-yellow alternatives include peach, coral, mint green, lavender, and pastel pink. These colors photograph beautifully against the yellow turmeric and marigold decorations. However, avoid black, white, and dark navy. If you\'re unsure, wearing a pastel shade with yellow accessories (dupatta, bangles, or potli bag) is a great compromise that respects tradition while adding your personal style.',
  },
  {
    question: 'Do you ship haldi ceremony outfits to the USA and Canada?',
    answer: 'Yes, LuxeMia ships haldi ceremony outfits worldwide, including the USA, Canada, and Australia. Free shipping on orders over $350 USD, flat rate $25 for orders under $350. All orders are fully tracked with estimated delivery of 7-10 business days after dispatch. For wedding functions, we recommend ordering at least 4-6 weeks in advance to ensure timely delivery. If you need an outfit quickly, check our ready-to-ship collection for items that dispatch in 3-5 business days.',
  },
];

// Keywords to match in product title, tags, or productType for haldi-appropriate items
const HALDI_COLOR_KEYWORDS = /\b(yellow|gold|mustard|pastel|turmeric|marigold|canary|sunflower|amber|saffron)\b/i;
const HALDI_TAG_KEYWORDS = ['haldi', 'occasion:haldi', 'mehendi haldi', 'mehendi-haldi'];

const HaldiOutfits = () => {
  const { products, isLoading } = useShopifyProducts();
  const [sortBy, setSortBy] = useState('featured');

  // Filter products with haldi-related tags OR yellow/gold/pastel colors
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const tags = (p.node.tags ?? []).map((t: string) => t.toLowerCase());
      const title = (p.node.title ?? '').toLowerCase();
      const productType = (p.node.productType ?? '').toLowerCase();

      // Match haldi-specific tags
      if (tags.some((t: string) => HALDI_TAG_KEYWORDS.some(ht => t.includes(ht)))) return true;

      // Match yellow/gold/pastel color keywords in tags
      if (tags.some((t: string) => HALDI_COLOR_KEYWORDS.test(t))) return true;

      // Match yellow/gold/pastel color keywords in title
      if (HALDI_COLOR_KEYWORDS.test(title)) return true;

      return false;
    });
  }, [products]);

  const sortedProducts = useMemo(() => sortProducts(filteredProducts, sortBy), [filteredProducts, sortBy]);
  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Featured';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Haldi Ceremony Outfits | Yellow Lehengas & Suits | LuxeMia"
        description="Shop haldi ceremony outfits at LuxeMia. Yellow & gold lehengas, pastel suits, and mustard sarees for the bride and guests. Free shipping over $350 to USA."
        canonical="https://luxemia.shop/collections/haldi-outfits"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Occasions', url: '/collections' },
          { name: 'Haldi Outfits', url: '/collections/haldi-outfits' },
        ]}
        faqs={haldiOutfitFaqs}
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">

        {/* Hero */}
        <div className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Pre-Wedding Celebrations</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Haldi Ceremony Outfits — Yellow & Gold Lehengas, Sarees & Suits</h1>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
              The haldi ceremony is one of the most radiant and joyful pre-wedding rituals in Indian culture — a celebration of turmeric, blessings, and new beginnings. Our <strong>haldi ceremony outfits</strong> collection features stunning yellow lehengas, gold anarkali suits, mustard sarees, and pastel salwar kameez sets perfect for the bride, bridesmaids, family, and guests. Sourced from India's finest artisans and shipped worldwide with free delivery on orders over $350.
            </p>
          </div>
        </div>

        {/* Keyword intro */}
        <div className="bg-background border-b border-border/20 py-5">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Shop <strong>haldi ceremony outfits</strong>, <strong>yellow lehenga for haldi</strong>, <strong>haldi dress for bride</strong>, <strong>gold anarkali suits</strong>, <strong>mustard sarees for haldi</strong>, and <strong>pastel yellow salwar kameez</strong>. Traditional and modern <strong>haldi outfit ideas</strong> for the bride and guests. Free shipping to <strong>USA</strong>, <strong>Canada</strong>, and <strong>Australia</strong>.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-border/30 bg-background sticky top-[90px] lg:top-[132px] z-30">
          <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading…' : `${sortedProducts.length} styles`}
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
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-muted rounded-sm mb-4" />
                  <div className="h-3 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            >
              {sortedProducts.map((product, index) => (
                <ProductCard key={product.node.id} product={product} index={index} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-sm mb-4">No haldi-specific items available right now. Browse our full collections for yellow and gold outfits.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/lehengas"><Button variant="outline" size="sm">Shop Lehengas</Button></Link>
                <Link to="/sarees"><Button variant="outline" size="sm">Shop Sarees</Button></Link>
                <Link to="/suits"><Button variant="outline" size="sm">Shop Suits</Button></Link>
              </div>
            </div>
          )}
        </section>

        {/* About section — editorial content targeting keywords */}
        <section className="border-t border-border/30 bg-secondary/20 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="font-serif text-2xl mb-6 text-center">Haldi Ceremony Outfit Guide</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>The haldi ceremony is one of the most beautiful and intimate pre-wedding rituals in Indian culture. A paste of turmeric (haldi), sandalwood, and rose water is applied to the bride and groom by family members — a tradition believed to purify the couple before marriage, bless them with glowing skin, and ward off evil spirits. The ceremony is filled with music, laughter, and yellow — everywhere you look, from the marigold decorations to the outfits of everyone attending.</p>
              <p><strong>Yellow is the defining color of the haldi ceremony.</strong> It represents turmeric (haldi), which is considered sacred and auspicious in Hindu tradition. The color symbolises prosperity, new beginnings, and the warmth of family blessings. When choosing your <strong>haldi ceremony outfit</strong>, yellow, gold, mustard, and pastel yellow are the most traditional and photograph-perfect choices.</p>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Haldi Outfit Ideas for the Bride</h3>
                <p>The bride is the centre of attention at her haldi ceremony, and her outfit sets the tone for the entire event. The most popular <strong>haldi dress for bride</strong> options include:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Yellow lehenga</strong> — The most iconic bride haldi look. Choose a lightweight georgette or chiffon lehenga with floral embroidery, gota patti, or mirror work. A yellow lehenga for haldi photographs beautifully against marigold decorations.</li>
                  <li><strong>Yellow anarkali suit</strong> — Elegant and comfortable, especially if the haldi ceremony involves sitting for extended periods. Flowing silhouettes with delicate embroidery are perfect.</li>
                  <li><strong>Yellow saree</strong> — A chiffon, georgette, or organza saree in mustard or turmeric yellow. Pre-draped ready-to-wear sarees are a practical choice for the haldi since the bride will be covered in turmeric paste.</li>
                </ul>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">What Guests Should Wear to a Haldi</h3>
                <p>As a guest at a haldi ceremony, you want to look festive while respecting the yellow color theme. <strong>Haldi ceremony outfits for guests</strong> include anarkali suits in yellow or gold, salwar kameez in mustard or pastel shades, lightweight lehengas, and simple sarees. Avoid heavy formal wear — the haldi is a relaxed, daytime celebration. Light fabrics like georgette, chiffon, and cotton are ideal. Pair your outfit with gold jhumka earrings, bangles, and comfortable mojari flats.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Haldi Color Traditions Across India</h3>
                <p>While yellow is universal, haldi color traditions vary by region. In North India, bright turmeric yellow and marigold orange dominate. In South India, mustard yellow and gold are preferred, often with temple jewellery. In Gujarati and Rajasthani weddings, the haldi features bold yellow with contrasting green or fuchsia accents. In Bengali weddings, the gaye holud (haldi equivalent) features bright yellow with white and red touches. Regardless of region, the common thread is yellow — the color of turmeric, blessing, and celebration.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">When to Order Your Haldi Outfit</h3>
                <p>Indian ethnic wear ships from India — even <strong>ready-to-ship items</strong> take 10-15 days door-to-door, and custom-stitched items take 3-4 weeks. <strong>Order your haldi outfit at least 4-6 weeks before the wedding date.</strong> If you need it faster, browse our <Link to="/ready-to-ship" className="text-primary underline font-medium">ready-to-ship collection</Link> for items that dispatch in 3-5 business days.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Related Pages</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><Link to="/collections/mehendi-outfits" className="text-primary underline">Mehendi Ceremony Outfits</Link></li>
                  <li><Link to="/collections/wedding-guest-outfits" className="text-primary underline">Wedding Guest Outfits</Link></li>
                  <li><Link to="/lehengas" className="text-primary underline">Shop Lehengas</Link> | <Link to="/suits" className="text-primary underline">Shop Suits</Link> | <Link to="/sarees" className="text-primary underline">Shop Sarees</Link></li>
                  <li><Link to="/ready-to-ship" className="text-primary underline">Ready to Ship — Fast Delivery</Link></li>
                  <li><Link to="/blog/mehendi-outfit-by-role" className="text-primary underline">Mehendi Outfit Ideas by Role</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">More Wedding Occasion Outfits</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/collections/mehendi-outfits"><Button variant="outline" size="sm">Mehendi Outfits</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/lehengas"><Button variant="outline" size="sm">Bridal Lehengas</Button></Link>
              <Link to="/suits"><Button variant="outline" size="sm">Anarkali Suits</Button></Link>
              <Link to="/sarees"><Button variant="outline" size="sm">Sarees</Button></Link>
              <Link to="/collections/diwali-outfits"><Button variant="outline" size="sm">Diwali Outfits</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions — Haldi Ceremony Outfits</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {haldiOutfitFaqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-background border border-border rounded-lg px-5">
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <RelatedOccasions currentOccasion="haldi" />

      <Footer />
    </div>
  );
};

export default HaldiOutfits;