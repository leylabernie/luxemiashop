import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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
            Our Vision
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-8 leading-tight">
            Reimagining<br />Ethnic Elegance
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Born from a passion for preserving India's rich textile heritage while embracing modern sensibilities.
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
        title="The Beginning"
        subtitle="Los Angeles, 2024"
        content="LuxeMia was founded with a simple yet powerful vision: to bring the exquisite artistry of Indian ethnic wear to fashion-forward women worldwide. We partner directly with master craftsmen across India, ensuring authentic craftsmanship reaches your doorstep while supporting traditional artisan communities."
        imagePosition="right"
        bgColor="bg-card"
      />

      {/* Craftsmanship Section */}
      <ParallaxSection
        title="Our Artisans"
        subtitle="Handcrafted Excellence"
        content="Every LuxeMia piece is created by skilled artisans who have inherited techniques passed down through generations. From the intricate Zardozi embroidery of Lucknow to the delicate threadwork of Jaipur, we celebrate and preserve these timeless art forms by connecting them with a global audience."
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
              Our Philosophy
            </p>
            <h2 className="text-4xl md:text-5xl font-serif mb-8">
              Slow Fashion, Lasting Beauty
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
              Our Journey
            </p>
            <h2 className="text-4xl md:text-5xl font-serif">Milestones</h2>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-border" />

            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.year}
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
            "We believe every woman deserves to experience the magic of handcrafted Indian artistry—wherever she is in the world."
          </blockquote>
          <cite className="text-muted-foreground not-italic">
            — The LuxeMia Team
          </cite>
        </motion.div>
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
            className={`relative aspect-[4/5] bg-secondary rounded-sm overflow-hidden ${
              imagePosition === 'left' ? 'md:order-1' : 'md:order-2'
            }`}
          >
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
              <span className="text-sm uppercase tracking-luxury">Editorial Image</span>
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
    title: 'Conscious Craft',
    description: 'Each piece takes weeks to create, ensuring every detail receives the attention it deserves.',
  },
  {
    icon: '○',
    title: 'Sustainable Luxury',
    description: 'We use natural dyes, organic fabrics, and support fair trade practices throughout our supply chain.',
  },
  {
    icon: '△',
    title: 'Timeless Design',
    description: 'Our designs transcend seasons, creating heirlooms meant to be passed down through generations.',
  },
];

const timelineEvents = [
  {
    year: '2024',
    title: 'The Dream Takes Shape',
    description: 'LuxeMia is born with a vision to bridge traditional Indian craftsmanship with modern global fashion.',
  },
  {
    year: '2024',
    title: 'Artisan Partnerships',
    description: 'Established direct relationships with master craftsmen across Jaipur, Lucknow, and Varanasi.',
  },
  {
    year: '2025',
    title: 'Digital Launch',
    description: 'Our online boutique goes live, bringing authentic ethnic wear to customers worldwide.',
  },
  {
    year: 'Future',
    title: 'Growing Together',
    description: 'Expanding our artisan network and introducing new collections that honor tradition while embracing innovation.',
  },
];

export default BrandStory;
