import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Leaf, Droplets, Recycle, Heart, Sun, Shield } from "lucide-react";

const Sustainability = () => {
  const initiatives = [
    {
      icon: Leaf,
      title: "Natural Fabrics",
      description: "We offer a selection of natural fiber fabrics including cotton and silk from established Indian textile suppliers."
    },
    {
      icon: Droplets,
      title: "Learning & Improving",
      description: "We are learning about the environmental impact of textile production and encourage our suppliers to adopt water-efficient practices."
    },
    {
      icon: Recycle,
      title: "Minimal Packaging",
      description: "We use minimal packaging and are working toward reducing waste wherever we can. Each order is packaged with care using recyclable materials where possible."
    },
    {
      icon: Sun,
      title: "Reducing Our Footprint",
      description: "We are exploring ways to reduce our environmental footprint as we grow, from shipping efficiency to material choices."
    },
    {
      icon: Heart,
      title: "Responsible Sourcing",
      description: "We choose to work with established suppliers and manufacturers and aim to build long-term, responsible relationships."
    },
    {
      icon: Shield,
      title: "Honest Standards",
      description: "We believe in being upfront about where we are. We don't claim certifications we don't have, and we're committed to earning trust through transparency."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Our Approach to Responsibility — LuxeMia"
        description="Learn about LuxeMia's approach to responsible business and our goals for doing better as we grow. Honest, transparent, and committed to improvement."
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
              <span className="text-sm font-medium">Doing Better, Honestly</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6"
            >
              Our Approach to Responsibility
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto"
            >
              At LuxeMia, we're honest about where we are. We're a growing business and we have a long way to go, 
              but we're committed to learning and improving every step of the way.
            </motion.p>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl p-8 md:p-12 border border-border">
                <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6 text-center">
                  What We're Working Toward
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed text-center">
                  We are a young company, and we know we have a lot to learn. Our goals include understanding our supply 
                  chain better, reducing waste where we can, and being transparent about what we can and cannot verify. 
                  We'd rather under-promise and over-deliver than make claims we can't back up.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Initiatives Grid */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl text-foreground text-center mb-12">
              Where We Stand
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
              Looking Ahead
            </h2>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-muted-foreground text-lg leading-relaxed">
                We are a small team doing our best. Right now that means careful packaging, choosing quality over quantity, 
                and being honest about our limitations. As we grow, we'll share real progress — not just promises. 
                We believe that transparency is more valuable than certifications we haven't earned.
              </p>
            </div>
          </div>
        </section>

        {/* Transparency Note */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-8">
              Our Promise to You
            </h2>
            <div className="max-w-2xl mx-auto">
              <p className="text-muted-foreground text-lg">
                We won't claim certifications we don't hold or make promises we can't verify. 
                What we can promise is that we'll keep learning, keep improving, and always be honest with you about 
                where we stand. If you have questions about our practices, reach out — we're happy to talk.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Sustainability;
