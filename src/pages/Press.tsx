import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Press = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Press & Media — LuxeMia"
        description="LuxeMia press and media inquiries. Download our press kit and brand assets."
        canonical="https://luxemia.shop/press"
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px]">
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
              For press inquiries, partnerships, and media requests, please get in touch with our team.
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
