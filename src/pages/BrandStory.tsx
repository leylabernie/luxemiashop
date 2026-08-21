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
  name: 'LuxeMia',
  legalName: 'Glamour Indian Wear',
  url: 'https://luxemia.shop',
  logo: 'https://luxemia.shop/favicon.ico',
  email: 'hello@luxemia.shop',
  description:
    'LuxeMia is an online Indian ethnic wear store shipping sarees, lehengas, salwar suits, and occasion wear to United States addresses.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
    addressRegion: 'Pennsylvania',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-215-341-9990',
    contactType: 'customer service',
    areaServed: ['US'],
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
  ],
  sameAs: [
    'https://www.instagram.com/luxemiausa',
    'https://www.facebook.com/LuxeMia',
    'https://www.pinterest.com/luxemiashop',
    'https://www.tiktok.com/@shopluxemia',
  ],
  foundingDate: '2025',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Indian Ethnic Wear Collection',
    description:
      'Online collection of Indian ethnic wear including lehengas, sarees, salwar suits, anarkali suits, and indo-western outfits.',
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
    title: 'Listing-Specific Details',
    description:
      'Product pages present the available fabric, work, sizes, stitching status, and included pieces supplied for each listing.',
  },
  {
    icon: '○',
    title: 'U.S.-Based Support',
    description:
      'Contact LuxeMia by email, phone, or WhatsApp before ordering with product, sizing, shipping, or policy questions.',
  },
  {
    icon: '△',
    title: 'Published Policies',
    description:
      'Shipping costs, cancellation terms, final-sale terms, and the 48-hour shipping-damage process are available before checkout.',
  },
  {
    icon: '⊕',
    title: 'Tracked U.S. Shipping',
    description:
      'Shipping is available to United States addresses only. Standard shipping is $12 below $150 and free at $150 and above.',
  },
  {
    icon: '✦',
    title: 'Catalog Focus',
    description:
      'The catalog focuses on Indian silhouettes, textiles, occasionwear, menswear, and jewelry for weddings and festivals.',
  },
];

const timelineEvents = [
  {
    year: '2025',
    title: 'LuxeMia is Founded',
    description:
      'LuxeMia begins as an online Indian ethnic wear store with U.S.-based support.',
  },
  {
    year: '2025',
    title: 'Building the Online Catalog',
    description:
      'The catalog expands across lehengas, sarees, suits, menswear, jewelry, and occasion-based collections.',
  },
  {
    year: '2026',
    title: 'Improving Product Information',
    description:
      'Listing pages are updated with clearer product attributes, available sizes, included pieces, and policy information.',
  },
  {
    year: '2026',
    title: 'Expanding Search Discovery',
    description:
      'LuxeMia strengthens collection pages, merchant listings, and source-reviewed educational content.',
  },
];

const whyChooseLuxeMia = [
  {
    icon: Globe,
    title: 'Listing-Specific Details',
    description:
      'Review the available fabric, work, stitching status, sizes, and included-piece information on each product page.',
  },
  {
    icon: ShieldCheck,
    title: 'Published Policies',
    description:
      'Shipping, cancellation, final-sale, and damage-claim terms are available before checkout.',
  },
  {
    icon: Scissors,
    title: 'Sizing and Stitching Help',
    description:
      'Available sizing or tailoring options vary by listing. Contact LuxeMia before ordering to confirm details and timing.',
  },
  {
    icon: Truck,
    title: 'Free Shipping at $150+',
    description:
      'U.S. shipping is free at $150 and above and costs a flat $12 below that. Tracking is provided after dispatch.',
  },
  {
    icon: Headphones,
    title: 'Customer Support',
    description:
      'Reach LuxeMia by phone, email, or WhatsApp for product, sizing, stitching, and order questions.',
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
        title="Our Story \u2014 LuxeMia | Indian Ethnic Wear Online"
        description="Discover LuxeMia, an online Indian ethnic wear store with clear product details, sizing guidance, U.S.-based support, and tracked United States shipping."
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
            We&#39;re a new online brand with a clear mission: make Indian ethnic
            wear easier to understand and order, with transparent
            product details, practical sizing guidance, and responsive support.
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
        content="LuxeMia was created to make Indian ethnic wear easier to review online. We focus on listing-specific product details, sizing guidance, published policies, and support before purchase. Tracking is provided after dispatch to supported destinations."
        imagePosition="right"
        bgColor="bg-card"
        imageUrl="/images/heroes/hero-bridal-couture.jpg"
        imageAlt="Bridal Indian ethnic wear \u2014 LuxeMia curated lehenga collection"
      />

      {/* Craftsmanship Section */}
      <ParallaxSection
        title="Our Approach"
        subtitle="Quality Over Quantity"
        content="We&#39;re not claiming decades of heritage — we&#39;re a new online brand learning and improving every day. Our focus is clear product information, sizing guidance, published policies, and customer support before purchase. Delivery timing depends on the product and selected options. Tracking is provided after dispatch."
        imagePosition="left"
        bgColor="bg-background"
        imageUrl="/images/lookbook/hero-main.webp"
        imageAlt="LuxeMia lookbook — Indian ethnic wear from the LuxeMia online catalog"
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
              These are the practical standards we use for product information,
              policies, shipping terms, and customer questions.
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

      {/* Customer support and listing-specific service details. */}
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
              Product Information &amp; Customer Support
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              LuxeMia combines current product information with practical
              e-commerce support. Our focus is helping shoppers understand
              fabrics, embellishments, stitching status, sizing, and delivery
              before placing an order.
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
              <h3 className="text-lg font-serif mb-3">Catalog Curation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We publish the available fabric, work, size, stitching, and
                package details for each current product listing.
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
              <h3 className="text-lg font-serif mb-3">Product Details</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Review the product photos, available attributes, selected
                options, and size guide before ordering.
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
              <h3 className="text-lg font-serif mb-3">Customer Support</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Contact LuxeMia in English or Hindi by WhatsApp, phone, or
                email for questions about current listings, sizing, stitching,
                shipping, policies, or an existing order.
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
              <h3 className="text-lg font-serif mb-3">Listing-Specific Stitching</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ready-to-wear, semi-stitched, and made-to-measure options vary
                by product. Use only the options shown on the selected listing
                and contact LuxeMia before ordering if a detail is unclear.
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
              publish the product details available to us, explain stitching
              and sizing in plain language, and provide USA-based support by
              email, phone, and WhatsApp.
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
                LuxeMia is an online-only Indian ethnic wear store with shipping
                to United States addresses. We publish the available information about fabrics,
                embellishments, stitching status, measurements, and package
                contents. Tracking is provided after dispatch.
              </p>
            </div>
            <div className="p-6 bg-background border border-border/50 rounded-lg">
              <h3 className="font-serif text-lg mb-3">
                Shipping &amp; Delivery
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Free U.S. standard shipping:</strong> Orders at $150 and above.<br />
                <strong>Flat rate:</strong> $12 per order below $150.<br />
                <strong>Delivery timing:</strong> Depends on the product and selected options.<br />
                <strong>Tracking:</strong> Provided after dispatch.<br />
                <strong>Taxes:</strong> See our{' '}
                <Link to="/pages/shipping-customs" className="text-primary underline">U.S. Shipping &amp; Taxes</Link>
                {' '}page for details.
              </p>
            </div>
            <div className="p-6 bg-background border border-border/50 rounded-lg">
              <h3 className="font-serif text-lg mb-3">Product Information</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Product photos, listing details, selected options, and the size
                guide are the primary references for the item ordered. Contact
                LuxeMia before ordering if an important detail is not listed.
              </p>
            </div>
            <div className="p-6 bg-background border border-border/50 rounded-lg">
              <h3 className="font-serif text-lg mb-3">Return Policy</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Due to the online nature of our shipments, all sales are
                final. We do not accept returns or exchanges. The only exception
                is genuine shipping damage, which must be documented with photos
                or a mandatory unboxing video and reported within 48 hours of delivery. We
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
                    LuxeMia
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
                  <p>Monday &ndash; Saturday: 10:00 AM &ndash; 7:00 PM ET</p>
                  <p>Sunday: 11:00 AM &ndash; 5:00 PM ET</p>
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
