import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

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
      <SEOHead
        title="Our Story — LuxeMia"
        description="Discover the LuxeMia story. Learn about our mission to bring authentic Indian ethnic wear at affordable prices to the world."
        canonical="https://luxemia.shop/brand-story"
      />
      <Header />

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
            Welcome to Luxemia
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-8 leading-tight">
            A New Chapter<br />in Ethnic Fashion
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We're a new brand with a clear mission: bringing authentic Indian ethnic wear directly to you, with transparency, quality, and care.
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
        content="Luxemia was born from a genuine frustration: finding quality Indian ethnic wear online meant navigating confusing sizing, questionable quality, and impersonal service. We're building something different — a curated collection sourced directly from India's established textile hubs, with honest descriptions, real sizing guidance, and customer service that actually responds. All our products are shipped from India via DHL Express, USPS, or UPS, ensuring reliable tracked delivery to your door."
        imagePosition="right"
        bgColor="bg-card"
      />

      {/* Craftsmanship Section */}
      <ParallaxSection
        title="Our Approach"
        subtitle="Quality Over Quantity"
        content="We're not claiming decades of heritage — we're a new team learning and growing every day. What we can promise is careful curation, quality checks on every piece before it ships from our facility in India, and a commitment to partnering with skilled craftspeople. We're transparent about our journey: our products are sourced from and shipped from India, which allows us to offer authentic ethnic wear at fair prices. We welcome your feedback as we build this together."
        imagePosition="left"
        bgColor="bg-background"
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
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {philosophyPoints.map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center p-8"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-2xl font-serif">{point.icon}</span>
                </div>
                <h3 className="text-xl font-serif mb-4">{point.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{point.description}</p>
              </motion.div>
            ))}
          </div>
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
              Where We're Headed
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
                <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <span className="text-sm tracking-luxury uppercase text-primary">{event.year}</span>
                  <h3 className="text-xl font-serif mt-2 mb-3">{event.title}</h3>
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
            "We're not perfect, but we're committed to getting better with every order. Thank you for being part of our beginning."
          </blockquote>
          <cite className="text-muted-foreground not-italic">
            — The Luxemia Team
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
            <h2 className="text-3xl md:text-4xl font-serif mb-6">Our Business</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We believe in full transparency about how we operate. Here's what you should know about LuxeMia.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-background border border-border/50 rounded-lg">
              <h3 className="font-serif text-lg mb-3">Business Model</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                LuxeMia is an online-only retailer of Indian ethnic wear. We source our products directly from manufacturers and textile hubs in India, which allows us to offer authentic craftsmanship at fair prices. All orders are shipped from India via DHL Express, USPS, or UPS with full tracking and insurance.
              </p>
            </div>
            <div className="p-6 bg-background border border-border/50 rounded-lg">
              <h3 className="font-serif text-lg mb-3">Shipping & Delivery</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We charge a flat rate of $14.95 per item for international shipping, with free shipping on orders over $300. Ready-made orders dispatch in 3-5 business days; custom/alterations in 5-7 business days. Standard delivery (USPS/UPS) takes 7-10 business days transit; express (DHL) takes 3-5 business days transit. Import duties and local taxes are the customer's responsibility.
              </p>
            </div>
            <div className="p-6 bg-background border border-border/50 rounded-lg">
              <h3 className="font-serif text-lg mb-3">Return Policy</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Due to the international nature of our shipments, all sales are final. We do not accept returns or exchanges. The only exception is genuine shipping damage, which must be documented with photos or an unboxing video and reported within 7 days of delivery.
              </p>
            </div>
            <div className="p-6 bg-background border border-border/50 rounded-lg">
              <h3 className="font-serif text-lg mb-3">Contact Us</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                LuxeMia Fashion Inc.<br />
                2208 Michener St, Philadelphia, PA 19115<br />
                Email: hello@luxemia.com<br />
                Phone: +1-215-341-9990<br />
                WhatsApp: Available on our website<br />
                Hours: Mon-Sat 10AM-7PM EST, Sun 11AM-5PM EST
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

interface ParallaxSectionProps {
  title: string;
  subtitle: string;
  content: string;
  imagePosition: 'left' | 'right';
  bgColor: string;
}

const ParallaxSection = ({ title, subtitle, content, imagePosition, bgColor }: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={ref} className={`py-32 px-4 ${bgColor} overflow-hidden`}>
      <div className="max-w-6xl mx-auto">
        <div className={`grid md:grid-cols-2 gap-16 items-center ${imagePosition === 'left' ? '' : 'md:grid-flow-dense'}`}>
          <motion.div
            style={{ y }}
            className={`relative aspect-[4/5] rounded-sm overflow-hidden ${
              imagePosition === 'left' ? 'md:order-1' : 'md:order-2'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#f5e6d3] via-[#e8d5c4] to-[#d4b896]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="w-16 h-px bg-foreground/20 mb-6" />
                <span className="text-sm uppercase tracking-luxury text-foreground/40 font-serif">Luxemia</span>
                <div className="w-16 h-px bg-foreground/20 mt-6" />
              </div>
            </div>
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
            <p className="text-lg text-muted-foreground leading-relaxed">{content}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const philosophyPoints = [
  {
    icon: '◇',
    title: 'Honest Descriptions',
    description: "No exaggerated claims. We show real photos, accurate measurements, and genuine fabric details so you know exactly what you're getting.",
  },
  {
    icon: '○',
    title: 'Responsive Support',
    description: 'Questions? Concerns? We actually reply. Our small team means you talk to real people who care about your experience.',
  },
  {
    icon: '△',
    title: 'Quality Checks',
    description: 'Every piece is inspected before shipping. If something is not right, we fix it before it reaches you.',
  },
];

const timelineEvents = [
  {
    year: '2025',
    title: 'Launch',
    description: 'Luxemia.shop goes live with our first curated collection of lehengas, sarees, and suits.',
  },
  {
    year: '2025',
    title: 'Building Trust',
    description: 'Focused on delivering great first orders, gathering feedback, and refining our processes.',
  },
  {
    year: '2025',
    title: 'Expanding Selection',
    description: 'Adding new categories based on customer requests: menswear, accessories, and seasonal collections.',
  },
  {
    year: 'Ahead',
    title: 'Your Feedback Shapes Us',
    description: 'We are listening. Every review, suggestion, and critique helps us become the brand you want us to be.',
  },
];

export default BrandStory;
