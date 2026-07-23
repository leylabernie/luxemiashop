import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, Truck, ShieldCheck, Scissors, Headphones, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

// ─── Organization Schema ─────────────────────────────────────────────────────
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Glamour Indian Wear',
  alternateName: 'LuxeMia',
  url: 'https://luxemia.shop',
  logo: 'https://luxemia.shop/favicon.ico',
  email: 'hello@luxemia.shop',
  description:
    'LuxeMia (Glamour Indian Wear) is an online Indian ethnic wear store shipping authentic sarees, lehengas, salwar suits, and bridal couture directly from India to customers in the USA, Canada, and Australia. We source from India\u2019s finest textile hubs\u2014Surat, Varanasi, Jaipur, and more\u2014offering quality-inspected ethnic wear at fair prices with free shipping on orders over $350.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
    addressRegion: 'Pennsylvania',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-215-341-9990',
    contactType: 'customer service',
    areaServed: ['US', 'CA', 'AU'],
    availableLanguage: ['English', 'Hindi'],
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      opens: '10:00',
      closes: '19:00',
    },
  },
  knowsAbout: [
    'Indian Ethnic Wear',
    'Bridal Lehengas',
    'Sarees',
    'Salwar Kameez',
    'Sherwanis',
    'Anarkali Suits',
    'Bridal Wear',
    'Indian Wedding Fashion',
    'NRI Ethnic Wear Shopping',
    'Traditional Indian Textiles',
    'Banarasi Silk',
    'Kanjivaram Sarees',
    'Chikankari Embroidery',
    'Block Printing',
    'Zardozi Work',
    'Indian Wedding Guest Attire',
    'Diwali Outfits',
    'Mehendi Outfits',
    'Custom Tailoring Indian Wear',
  ],
  sameAs: [
    'https://www.instagram.com/luxemiashop',
    'https://www.facebook.com/LuxeMia',
    'https://www.pinterest.com/luxemiashop',
    'https://www.tiktok.com/@shopluxemia',
  ],
  foundingDate: '2025',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Indian Ethnic Wear Collection',
    description:
      'Curated collection of authentic Indian ethnic wear including bridal lehengas, silk sarees, salwar suits, anarkali suits, and indo-western outfits.',
    itemListElement: [
      {
        '@type': 'OfferCatalog',
        name: 'Lehengas',
        description: 'Bridal, wedding, and party wear lehengas',
      },
      {
        '@type': 'OfferCatalog',
        name: 'Sarees',
        description: 'Banarasi, Kanchipuram, and designer silk sarees',
      },
      {
        '@type': 'OfferCatalog',
        name: 'Salwar Suits',
        description: 'Anarkali, straight cut, and palazzo suits',
      },
      {
        '@type': 'OfferCatalog',
        name: 'Indo-Western',
        description: 'Fusion wear blending Indian and Western silhouettes',
      },
    ],
  },
};

// ─── BreadcrumbList Schema ───────────────────────────────────────────────────
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://luxemia.shop',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Our Story',
      item: 'https://luxemia.shop/brand-story',
    },
  ],
};

// ─── Data ────────────────────────────────────────────────────────────────────

const philosophyPoints = [
  {
    icon: '◇',
    title: 'Honest Descriptions',
    description:
      "No exaggerated claims. We show real photos, accurate measurements, and genuine fabric details so you know exactly what you're getting. Every product listing includes detailed sizing charts, fabric composition, and care instructions — because you deserve full transparency before you buy.",
  },
  {
    icon: '○',
    title: 'Responsive Support',
    description:
      'Questions? Concerns? We actually reply. Our team is available Mon\u2013Sat 10 AM\u20137 PM EST and Sun 11 AM\u20135 PM EST via email, phone, and WhatsApp. You\u2019ll never be left waiting for a robotic response \u2014 real people who care about your experience are just a message away.',
  },
  {
    icon: '△',
    title: 'Quality Checks',
    description:
      'Every piece is inspected before shipping from our facility in India. We check stitching, fabric quality, embellishment security, and sizing accuracy. If something is not right, we fix it before it reaches you \u2014 not after.',
  },
  {
    icon: '⊕',
    title: 'Global Reach',
    description:
      'We ship exclusively to the USA, Canada, and Australia \u2014 the three countries with the largest NRI communities looking for authentic Indian ethnic wear. Free shipping on orders over $350, flat $25 shipping under that, with DHL Express, USPS, and UPS delivery options to your door.',
  },
  {
    icon: '✦',
    title: 'Cultural Authenticity',
    description:
      'We preserve traditional Indian craftsmanship by sourcing directly from the artisans and textile hubs that have been perfecting their craft for generations. From Banarasi weavers in Varanasi to block printers in Jaipur, every piece carries forward centuries of authentic Indian artistry.',
  },
];

const timelineEvents = [
  {
    year: '2025',
    title: 'The Spark \u2014 LuxeMia is Founded',
    description:
      'After years of hearing friends and family complain about the struggles of buying Indian ethnic wear from abroad \u2014 confusing sizing, quality uncertainty, and weeks of anxious waiting \u2014 we decided to build something better. LuxeMia launches with our first curated collection of lehengas, sarees, and suits.',
  },
  {
    year: '2025',
    title: 'Building Trust, One Order at a Time',
    description:
      'Our first year is focused on earning your trust: delivering great first orders, gathering honest feedback, and refining every step of our process from sourcing to shipping. We introduce our pre-shipment quality inspection process and real-time order tracking.',
  },
  {
    year: '2025',
    title: 'Expanding the Collection',
    description:
      'Based on customer requests, we add new categories: menswear (sherwanis, kurtas), accessories (juttis, clutches, jewelry), and seasonal festive collections. Custom tailoring options become available for select styles.',
  },
  {
    year: '2026',
    title: 'Deepening Our Artisan Partnerships',
    description:
      'We expand direct sourcing to new textile hubs \u2014 Lucknow for chikankari, Kanchipuram for silk, and Hyderabad for pearl-embellished pieces. A dedicated quality assurance team is established at our India facility.',
  },
  {
    year: '2026',
    title: 'Your Feedback Shapes Our Future',
    description:
      'We launch a customer advisory panel and introduce a wishlist feature driven by community voting. Every review, suggestion, and critique helps us become the brand you want us to be. This is just the beginning.',
  },
];

const whyChooseLuxeMia = [
  {
    icon: Globe,
    title: 'Direct from India \u2014 No Middlemen',
    description:
      'We source directly from India\u2019s renowned textile hubs like Surat, Varanasi, and Jaipur. By cutting out intermediaries, we pass real savings on to you while ensuring artisans receive fair compensation for their craft.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Inspected Before Shipping',
    description:
      'Every single piece undergoes a thorough quality inspection at our India facility before it ships. We check stitching integrity, embellishment security, fabric quality, and sizing accuracy so you receive exactly what you ordered.',
  },
  {
    icon: Scissors,
    title: 'Custom Tailoring Available',
    description:
      'Select styles can be custom-tailored to your measurements. Our partner tailors in India craft each piece to your specifications, with an additional 2\u20133 business days for production. Perfect fit, no compromise.',
  },
  {
    icon: Truck,
    title: 'Free Shipping Over $350',
    description:
      'Enjoy free shipping on all orders over $350 to the USA, Canada, and Australia. Orders under $350 ship for a flat $25. All shipments include full tracking, insurance, and delivery via DHL Express, USPS, or UPS.',
  },
  {
    icon: Headphones,
    title: 'Dedicated Customer Support',
    description:
      'Reach us by phone, email, or WhatsApp. Our team responds within 24 hours (usually much sooner) and works with you until you\u2019re satisfied. We\u2019re a small team that genuinely cares about every customer.',
  },
];

// ─── ParallaxSection Component ───────────────────────────────────────────────

interface ParallaxSectionProps {
  title: string;
  subtitle: string;
  content: string;
  imagePosition: 'left' | 'right';
  bgColor: string;
  imageUrl: string;
  imageAlt: string;
}

const ParallaxSection = ({
  title,
  subtitle,
  content,
  imagePosition,
  bgColor,
  imageUrl,
  imageAlt,
}: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={ref} className={`py-32 px-4 ${bgColor} overflow-hidden`}>
      <div className="max-w-6xl mx-auto">
        <div
          className={`grid md:grid-cols-2 gap-16 items-center ${
            imagePosition === 'left' ? '' : 'md:grid-flow-dense'
          }`}
        >
          <motion.div
            style={{ y }}
            className={`relative aspect-[4/5] rounded-sm overflow-hidden ${
              imagePosition === 'left' ? 'md:order-1' : 'md:order-2'
            }`}
          >
            <picture>
              <source
                srcSet={imageUrl.replace(/\.jpg$/, '.webp')}
                type="image/webp"
              />
              <img
                src={imageUrl}
                alt={imageAlt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: imagePosition === 'left' ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className={imagePosition === 'left' ? 'md:order-2' : 'md:order-1'}
          >
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">
              {subtitle}
            </p>
            <h2 className="text-4xl md:text-5xl font-serif mb-8">{title}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {content}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const BrandStory = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      {/* SEO Head with enriched props */}
      <SEOHead
        title="Our Story \u2014 LuxeMia | Authentic Indian Ethnic Wear for USA, Canada & Australia"
        description="Discover the LuxeMia story. We source authentic Indian ethnic wear directly from India\u2019s textile hubs \u2014 Surat, Varanasi, Jaipur \u2014 and deliver quality-inspected sarees, lehengas & suits to the USA, Canada & Australia. Free shipping over $350."
        canonical="https://luxemia.shop/brand-story"
        image="/images/heroes/hero-bridal-couture.jpg"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Our Story', url: '/brand-story' },
        ]}
      />

      {/* Structured Data: Organization + BreadcrumbList */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <Header />

      {/* Breadcrumb Navigation */}
      <nav
        className="bg-muted/30 py-4 border-b border-border"
        aria-label="Breadcrumb"
      >
        <div className="container mx-auto px-4">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link
                to="/"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Home
              </Link>
            </li>
            <li className="text-muted-foreground" aria-hidden="true">
              /
            </li>
            <li className="text-foreground" aria-current="page">
              Our Story
            </li>
          </ol>
        </div>
      </nav>

      {/* Hero Section with Parallax */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background"
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative text-center px-4 max-w-4xl mx-auto"
        >
          <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-6">
            Welcome to LuxeMia
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-8 leading-tight">
            A New Chapter
            <br />
            in Ethnic Fashion
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We&#39;re a new brand with a clear mission: bringing authentic Indian
            ethnic wear directly to you, with transparency, quality, and care.
            Sourced from India&#39;s finest textile hubs and delivered to your door
            in the USA, Canada, and Australia.
          </p>
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12"
        >
          <ArrowDown className="h-6 w-6 text-muted-foreground" />
        </motion.div>
      </section>

      {/* Origin Story - Parallax Section */}
      <ParallaxSection
        title="Why We Started"
        subtitle="Fresh Perspective, 2025"
        content="LuxeMia was born from a genuine frustration shared by NRIs around the world: finding quality Indian ethnic wear online meant navigating confusing sizing that never matched Western equivalents, questionable fabric quality with no way to verify before buying, long and opaque shipping timelines with little to no tracking, and a lack of transparency about where products actually came from. Too many stores offered glamorous photos but delivered disappointment. We decided to change that. LuxeMia is built on the idea that you deserve honest descriptions, real sizing guidance, and customer service that actually responds. All our products are sourced directly from India's established textile hubs and shipped via DHL Express, USPS, or UPS, ensuring reliable tracked delivery to your door in the USA, Canada, and Australia."
        imagePosition="right"
        bgColor="bg-card"
        imageUrl="/images/heroes/hero-bridal-couture.jpg"
        imageAlt="Bridal Indian ethnic wear \u2014 LuxeMia curated lehenga collection"
      />

      {/* Craftsmanship Section */}
      <ParallaxSection
        title="Our Approach"
        subtitle="Quality Over Quantity"
        content="We&#39;re not claiming decades of heritage \u2014 we&#39;re a new team learning and growing every day. What we can promise is careful curation, quality checks on every piece before it ships from our facility in India, and a commitment to partnering with skilled craftspeople. Our team visits textile hubs in Surat (known for embroidered fabrics and synthetic sarees), Varanasi (home of legendary Banarasi silk), Jaipur (famous for block printing and bandhani), and Lucknow (the heart of delicate chikankari embroidery). Each product undergoes a multi-point quality inspection \u2014 checking stitching integrity, embellishment security, fabric consistency, and sizing accuracy \u2014 before it&#39;s packed and dispatched. We ship via DHL Express (3\u20135 business days transit), USPS, or UPS (7\u201310 business days transit), all with full tracking and insurance. We&#39;re transparent about our journey and welcome your feedback as we build this together."
        imagePosition="left"
        bgColor="bg-background"
        imageUrl="/images/lookbook/hero-main.jpg"
        imageAlt="LuxeMia lookbook — authentic Indian ethnic wear sourced from India's textile hubs"
      />

      {/* Philosophy Section */}
      <section className="py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-20"
          >
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-6">
              What We Stand For
            </p>
            <h2 className="text-4xl md:text-5xl font-serif mb-8">
              Our Commitments to You
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              These aren&#39;t just marketing slogans \u2014 they&#39;re the principles
              that guide every decision we make, from which artisans we partner
              with to how we handle your questions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
            {philosophyPoints.map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-2xl font-serif">{point.icon}</span>
                </div>
                <h3 className="text-lg font-serif mb-3">{point.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {point.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose LuxeMia Section */}
      <section className="py-32 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-20"
          >
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-6">
              The LuxeMia Difference
            </p>
            <h2 className="text-4xl md:text-5xl font-serif mb-8">
              Why Choose LuxeMia
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We built LuxeMia to solve the real problems NRIs face when
              shopping for Indian ethnic wear online. Here&#39;s what sets us
              apart.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseLuxeMia.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="p-6 bg-background border border-border/50 rounded-lg"
                >
                  <div className="w-12 h-12 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-serif mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Expert Styling Team Section — E-E-A-T signal (SEO audit Item #9)
          Shows expertise and authority without naming individual founders.
          Demonstrates to Google's E-E-A-T evaluators that LuxeMia has
          genuine fashion expertise behind the brand. */}
      <section className="py-32 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-20"
          >
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-6">
              Expertise You Can Trust
            </p>
            <h2 className="text-4xl md:text-5xl font-serif mb-8">
              Our Styling &amp; Sourcing Team
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Behind every LuxeMia order is a small, dedicated team with deep
              roots in Indian textiles and ethnic fashion. We combine
              generations of textile knowledge with modern e-commerce
              standards to bring you authentic pieces you&#39;ll love.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0 }}
              viewport={{ once: true }}
              className="p-6 bg-card border border-border/50 rounded-lg text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Scissors className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-serif mb-3">Sourcing Specialists</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our team travels to Surat, Varanasi, Jaipur, and Lucknow to
                personally select fabrics and partner with weaving families
                who have practiced their craft for generations. We verify
                authenticity at the source.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              viewport={{ once: true }}
              className="p-6 bg-card border border-border/50 rounded-lg text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-serif mb-3">Quality Inspectors</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every garment passes a 5-point inspection: stitching
                integrity, embellishment security, fabric consistency, sizing
                accuracy, and overall finish. No piece ships without
                sign-off from our India facility.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="p-6 bg-card border border-border/50 rounded-lg text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-serif mb-3">Styling Advisors</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our USA-based styling team speaks English and Hindi, available
                via WhatsApp, phone, and email. We help you choose the right
                outfit for your occasion, body type, and budget — before and
                after your purchase.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              viewport={{ once: true }}
              className="p-6 bg-card border border-border/50 rounded-lg text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-serif mb-3">Master Tailors</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For made-to-measure orders, our master tailors in India
                stitch each piece to your exact measurements. They
                specialize in lehenga choli fitting, saree blouse
                construction, and sherwani tailoring.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 p-8 bg-secondary/30 rounded-lg text-center"
          >
            <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              <strong className="text-foreground">Our promise:</strong> We
              may be a new brand, but our team brings decades of combined
              experience in Indian textiles, ethnic fashion, and
              international e-commerce. We&#39;re based in Pennsylvania, USA
              with sourcing and fulfillment operations in India. When you
              contact us, you&#39;re talking to real people who know
              ethnic wear — not a call center reading from a script.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-32 px-4 bg-card">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-6">
              Where We&#39;re Headed
            </p>
            <h2 className="text-4xl md:text-5xl font-serif">Our Roadmap</h2>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-border" />

            {timelineEvents.map((event, index) => (
              <motion.div
                key={`${event.year}-${index}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, margin: '-50px' }}
                className={`relative flex items-center mb-16 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div
                  className={`flex-1 ${
                    index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'
                  }`}
                >
                  <span className="text-sm tracking-luxury uppercase text-primary">
                    {event.year}
                  </span>
                  <h3 className="text-xl font-serif mt-2 mb-3">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground">{event.description}</p>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <blockquote className="text-3xl md:text-4xl font-serif leading-relaxed mb-8">
            &ldquo;We&#39;re not perfect, but we&#39;re committed to getting
            better with every order. Thank you for being part of our
            beginning.&rdquo;
          </blockquote>
          <cite className="text-muted-foreground not-italic">
            &mdash; The LuxeMia Team
          </cite>
        </motion.div>
      </section>

      {/* Business Transparency Section */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">
              Who We Are
            </p>
            <h2 className="text-3xl md:text-4xl font-serif mb-6">
              Our Business
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We believe in full transparency about how we operate. Here&#39;s
              everything you should know about LuxeMia before you place an
              order.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-background border border-border/50 rounded-lg">
              <h3 className="font-serif text-lg mb-3">Business Model</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                LuxeMia is an online-only retailer of Indian ethnic wear
                operated by Glamour Indian Wear. We source our products directly
                from manufacturers and textile hubs in India &mdash; including
                Surat (embroidered fabrics), Varanasi (Banarasi silk), Jaipur
                (block printing &amp; bandhani), and Lucknow (chikankari)
                &mdash; which allows us to offer authentic craftsmanship at fair
                prices with no middlemen markup. All orders are shipped from our
                facility in India via DHL Express, USPS, or UPS with full
                tracking and insurance.
              </p>
            </div>
            <div className="p-6 bg-background border border-border/50 rounded-lg">
              <h3 className="font-serif text-lg mb-3">
                Shipping &amp; Delivery
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Shipping from:</strong> India (all orders).<br />
                <strong>Free shipping:</strong> Orders over $350 (USA, Canada,
                Australia).<br />
                <strong>Flat rate:</strong> $25 per order under $350.<br />
                <strong>Ready-made dispatch:</strong> 3&ndash;5 business
                days.<br />
                <strong>Custom/alterations dispatch:</strong> 5&ndash;7
                business days.<br />
                <strong>DHL Express transit:</strong> 3&ndash;5 business
                days.<br />
                <strong>USPS/UPS transit:</strong> 7&ndash;10 business
                days.<br />
                <strong>Total estimated delivery:</strong> 6&ndash;15 business
                days (ready-made) or 8&ndash;17 business days (custom).<br />
                <strong>Tracking:</strong> Full tracking provided for all
                shipments.<br />
                <strong>Customs:</strong> See our{' '}
                <Link to="/pages/shipping-customs" className="text-primary underline">Shipping &amp; Customs</Link>
                {' '}page for details on import duties and local taxes.
              </p>
            </div>
            <div className="p-6 bg-background border border-border/50 rounded-lg">
              <h3 className="font-serif text-lg mb-3">Quality Inspection</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every product undergoes a multi-point quality inspection at our
                India facility before shipment. We verify: (1) stitching
                integrity and seam strength, (2) embellishment security
                &mdash; beads, sequins, and embroidery are checked for
                looseness, (3) fabric quality and color consistency against our
                standards, (4) sizing accuracy against our published
                measurements, and (5) overall finish and presentation. If any
                issue is found, the piece is either corrected or replaced
                before shipping. This process adds no extra time to our
                dispatch windows &mdash; it&#39;s built into our workflow.
              </p>
            </div>
            <div className="p-6 bg-background border border-border/50 rounded-lg">
              <h3 className="font-serif text-lg mb-3">Return Policy</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Due to the international nature of our shipments, all sales are
                final. We do not accept returns or exchanges. The only exception
                is genuine shipping damage, which must be documented with photos
                or an unboxing video and reported within 7 days of delivery. We
                strongly recommend recording an unboxing video when you receive
                your package &mdash; it protects both of us and makes resolving
                any issues straightforward.
              </p>
            </div>
            <div className="p-6 bg-background border border-border/50 rounded-lg md:col-span-2">
              <h3 className="font-serif text-lg mb-3">Contact Us</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground leading-relaxed">
                <div>
                  <p className="font-medium text-foreground mb-1">
                    Glamour Indian Wear
                  </p>
                  <p>USA-based support</p>
                  <p>
                    Email:{' '}
                    <a
                      href="mailto:hello@luxemia.shop"
                      className="text-primary hover:underline"
                    >
                      hello@luxemia.shop
                    </a>
                  </p>
                  <p>
                    Phone:{' '}
                    <a
                      href="tel:+12153419990"
                      className="text-primary hover:underline"
                    >
                      +1-215-341-9990
                    </a>
                  </p>
                  <p>WhatsApp: Available on our website</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">
                    Customer Service Hours
                  </p>
                  <p>Monday &ndash; Saturday: 10:00 AM &ndash; 7:00 PM EST</p>
                  <p>Sunday: 11:00 AM &ndash; 5:00 PM EST</p>
                  <p className="mt-2">
                    Average response time: within 24 hours (usually sooner
                    during business hours)
                  </p>
                  <p className="mt-2">
                    <span className="font-medium text-foreground">
                      Languages:
                    </span>{' '}
                    English &amp; Hindi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BrandStory;
