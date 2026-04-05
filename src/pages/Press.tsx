import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { ExternalLink, Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Press = () => {
  const pressFeatures = [
    {
      publication: "Vogue India",
      title: "LuxeMia: Redefining Bridal Couture for the Modern Indian Woman",
      date: "December 2025",
      excerpt: "How this heritage brand is blending centuries-old craftsmanship with contemporary design sensibilities."
    },
    {
      publication: "Elle India",
      title: "The Artisans Behind India's Most Coveted Lehengas",
      date: "November 2025",
      excerpt: "A deep dive into the master craftsmen who create LuxeMia's signature pieces."
    },
    {
      publication: "Harper's Bazaar",
      title: "Sustainable Luxury: LuxeMia's Commitment to Ethical Fashion",
      date: "October 2025",
      excerpt: "Exploring how the brand is leading the charge in sustainable ethnic fashion."
    },
    {
      publication: "Forbes",
      title: "Building a Heritage Brand in the Digital Age",
      date: "September 2025",
      excerpt: "The business of preserving tradition while embracing e-commerce innovation."
    },
    {
      publication: "Architectural Digest",
      title: "Inside LuxeMia's Stunning New Flagship Store",
      date: "August 2025",
      excerpt: "Where traditional Indian aesthetics meet contemporary retail design."
    },
    {
      publication: "The New York Times",
      title: "Reviving India's Dying Crafts: The LuxeMia Story",
      date: "July 2025",
      excerpt: "How the brand is creating sustainable livelihoods for artisan communities."
    }
  ];

  const awards = [
    { year: "2024", award: "Best Bridal Collection - India Fashion Awards" },
    { year: "2024", award: "Sustainability Excellence Award - Fashion Revolution" },
    { year: "2023", award: "Heritage Brand of the Year - Textile India" },
    { year: "2023", award: "Best Artisan Partnership - Craft Council of India" },
    { year: "2022", award: "Emerging Luxury Brand - Luxury Lifestyle Awards" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Press & Media — LuxeMia"
        description="LuxeMia in the press. Read our latest media coverage, awards, and recognition in publications like Vogue India, Elle, and Harper's Bazaar."
        canonical="https://luxemia.shop/press"
      />
      <Header />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6"
            >
              Press & Media
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto"
            >
              Discover what the world's leading publications are saying about LuxeMia 
              and our mission to preserve India's artisanal heritage.
            </motion.p>
          </div>
        </section>

        {/* Press Contact */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 bg-card rounded-lg p-6 border border-border">
              <div>
                <h2 className="font-display text-xl text-foreground mb-2">Press Inquiries</h2>
                <p className="text-muted-foreground">For media inquiries, interviews, and press kit requests</p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="gap-2">
                  <Mail className="w-4 h-4" />
                  press@luxemia.com
                </Button>
                <Button className="gap-2">
                  <Download className="w-4 h-4" />
                  Press Kit
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured In */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl text-foreground text-center mb-12">
              Featured In
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {pressFeatures.map((feature, index) => (
                <motion.article
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-shadow group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-primary font-medium">{feature.publication}</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-display text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">{feature.excerpt}</p>
                  <p className="text-muted-foreground text-xs">{feature.date}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Awards */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl text-foreground text-center mb-12">
              Awards & Recognition
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {awards.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-6 bg-card rounded-lg p-4 border border-border"
                >
                  <span className="font-display text-2xl text-primary">{item.year}</span>
                  <span className="text-foreground">{item.award}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Assets */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">
              Brand Assets
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Download our official logos, brand guidelines, and high-resolution images 
              for editorial use.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Logo Package
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Brand Guidelines
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Product Images
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Press;
