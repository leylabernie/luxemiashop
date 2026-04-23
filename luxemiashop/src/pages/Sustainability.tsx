import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Leaf, Droplets, Recycle, Heart, Sun, Shield } from "lucide-react";

const Sustainability = () => {
  const initiatives = [
    {
      icon: Leaf,
      title: "Natural & Organic Fabrics",
      description: "We prioritize organic cotton, natural silk, and handwoven textiles sourced from certified sustainable farms across India."
    },
    {
      icon: Droplets,
      title: "Water Conservation",
      description: "Our dyeing processes use 60% less water than industry standards, with closed-loop systems that recycle and purify water."
    },
    {
      icon: Recycle,
      title: "Zero-Waste Production",
      description: "Fabric scraps are repurposed into accessories, and we've eliminated single-use plastics from our packaging."
    },
    {
      icon: Sun,
      title: "Solar-Powered Workshops",
      description: "Many of our partner workshops operate on renewable energy, reducing our carbon footprint significantly."
    },
    {
      icon: Heart,
      title: "Fair Trade Practices",
      description: "We ensure fair wages, safe conditions, and healthcare benefits for all artisans in our supply chain."
    },
    {
      icon: Shield,
      title: "Chemical-Free Dyes",
      description: "We use natural dyes derived from plants, minerals, and insects, avoiding harmful chemicals that damage ecosystems."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Sustainability — LuxeMia"
        description="LuxeMia's commitment to sustainable luxury fashion. Discover our eco-friendly practices, fair trade partnerships, and goal of carbon neutrality by 2030."
        canonical="https://luxemia.shop/sustainability"
      />
      <Header />
      
      <main className="pt-[90px] lg:pt-[132px]">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-b from-green-50 to-background dark:from-green-950/20">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full mb-6"
            >
              <Leaf className="w-4 h-4" />
              <span className="text-sm font-medium">Our Commitment to the Planet</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6"
            >
              Sustainable Luxury
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto"
            >
              At LuxeMia, we believe that true luxury respects both people and planet. 
              Our commitment to sustainability is woven into every thread of our creations.
            </motion.p>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl p-8 md:p-12 border border-border">
                <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6 text-center">
                  Our Sustainability Promise
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed text-center">
                  By 2030, we pledge to achieve carbon neutrality across our entire supply chain, 
                  use 100% sustainable materials, and ensure that every artisan family we work with 
                  has access to education, healthcare, and financial security.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Initiatives Grid */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl text-foreground text-center mb-12">
              Our Initiatives
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {initiatives.map((initiative, index) => (
                <motion.div
                  key={initiative.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-lg p-6 border border-border"
                >
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                    <initiative.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-display text-xl text-foreground mb-3">{initiative.title}</h3>
                  <p className="text-muted-foreground">{initiative.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Goals */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl text-foreground text-center mb-12">
              Our Goals
            </h2>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-muted-foreground text-lg leading-relaxed">
                We are actively working to increase our use of sustainable materials, reduce water consumption
                in our dyeing processes, maintain plastic-free packaging across all orders, and support
                reforestation efforts in the communities where our artisans live and work.
              </p>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-8">
              Certifications & Partnerships
            </h2>
            <div className="flex flex-wrap justify-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>GOTS Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Fair Trade</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>OEKO-TEX Standard</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>B Corp Pending</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Sustainability;
