import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Droplets, Wind, Sun, AlertTriangle, Sparkles, Shield } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const CareGuide = () => {
  const fabricCare = [
    {
      fabric: "Silk (Banarasi, Kanjeevaram, Raw Silk)",
      icon: Sparkles,
      tips: [
        "Always dry clean silk garments to preserve the fabric's luster and integrity",
        "Store in a muslin cloth bag, never in plastic which can trap moisture",
        "Air out silk pieces every few months to prevent musty odors",
        "Iron on low heat with a pressing cloth between the iron and fabric",
        "Keep away from direct sunlight to prevent color fading",
        "For minor stains, spot clean with a damp cloth and mild detergent"
      ]
    },
    {
      fabric: "Velvet",
      icon: Shield,
      tips: [
        "Dry clean only - water can permanently damage velvet's pile",
        "Hang vertically to prevent crushing; never fold velvet garments",
        "Use a soft brush to restore the pile direction after wearing",
        "Steam from the reverse side to remove wrinkles",
        "Store in a breathable garment bag with enough space",
        "Avoid sitting on rough surfaces while wearing velvet"
      ]
    },
    {
      fabric: "Georgette & Chiffon",
      icon: Wind,
      tips: [
        "Hand wash in cold water with mild detergent or dry clean",
        "Never wring or twist; gently press water out",
        "Dry flat or hang on a padded hanger",
        "Iron on low heat while slightly damp for best results",
        "Store on padded hangers to maintain shape",
        "Handle with care as these fabrics snag easily"
      ]
    },
    {
      fabric: "Brocade & Zari Work",
      icon: Sparkles,
      tips: [
        "Always dry clean to protect the metallic threads",
        "Store with acid-free tissue paper between folds",
        "Never iron directly on zari work; use a pressing cloth",
        "Keep away from moisture as zari can tarnish",
        "Wrap in soft muslin before storing",
        "Handle gently as zari threads can catch and pull"
      ]
    },
    {
      fabric: "Cotton & Chanderi",
      icon: Droplets,
      tips: [
        "Can be hand washed in cold water with mild detergent",
        "Turn inside out before washing to protect embroidery",
        "Dry in shade to prevent color fading",
        "Iron while slightly damp for crisp finish",
        "Store folded with tissue paper between layers",
        "Pre-treat stains immediately with cold water"
      ]
    },
    {
      fabric: "Net & Organza",
      icon: Wind,
      tips: [
        "Dry clean recommended for heavy embellishments",
        "Store flat or rolled to prevent creasing",
        "Steam to remove wrinkles; avoid direct iron contact",
        "Handle with care to avoid tears and snags",
        "Keep away from jewelry and accessories that might catch",
        "Store in acid-free tissue paper"
      ]
    }
  ];

  const embellishmentCare = [
    {
      type: "Zardozi & Thread Embroidery",
      care: "Avoid pressing directly on embroidery. Always use a protective cloth. Store flat with tissue paper padding to prevent crushing."
    },
    {
      type: "Sequins & Beadwork",
      care: "Handle gently as beads can break. Store in soft cloth bags. Avoid friction with other garments that might dislodge embellishments."
    },
    {
      type: "Mirror Work",
      care: "Keep away from extreme heat which can loosen adhesive. Store flat with mirrors facing up. Clean gently with a soft dry cloth."
    },
    {
      type: "Stone & Kundan Work",
      care: "Avoid water contact as it can loosen settings. Store separately to prevent scratching. Handle with clean, dry hands."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Preserve Your Treasures</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6"
            >
              Care Guide
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto"
            >
              Your Shringaar pieces are heirloom-quality garments meant to last generations. 
              Follow these care instructions to preserve their beauty and craftsmanship.
            </motion.p>
          </div>
        </section>

        {/* General Tips */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl text-foreground mb-6 text-center">
                Essential Care Tips
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card rounded-lg p-4 border border-border text-center">
                  <Droplets className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-medium text-foreground mb-2">Dry Clean</h3>
                  <p className="text-muted-foreground text-sm">Most ethnic wear should be dry cleaned to preserve embroidery and fabric</p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border text-center">
                  <Sun className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-medium text-foreground mb-2">Avoid Sunlight</h3>
                  <p className="text-muted-foreground text-sm">Store away from direct sunlight to prevent color fading</p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border text-center">
                  <Wind className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-medium text-foreground mb-2">Breathable Storage</h3>
                  <p className="text-muted-foreground text-sm">Use muslin bags, never plastic, for proper air circulation</p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border text-center">
                  <AlertTriangle className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-medium text-foreground mb-2">Handle With Care</h3>
                  <p className="text-muted-foreground text-sm">Remove jewelry before wearing to avoid snags and pulls</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fabric-Specific Care */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl text-foreground text-center mb-12">
              Fabric-Specific Care
            </h2>
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {fabricCare.map((item, index) => (
                  <AccordionItem 
                    key={item.fabric} 
                    value={`item-${index}`}
                    className="bg-card rounded-lg border border-border px-6"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-display text-lg text-foreground">{item.fabric}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-3 pl-14 pb-4">
                        {item.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Embellishment Care */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl text-foreground text-center mb-12">
              Embellishment Care
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {embellishmentCare.map((item, index) => (
                <motion.div
                  key={item.type}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-lg p-6 border border-border"
                >
                  <h3 className="font-display text-lg text-foreground mb-3">{item.type}</h3>
                  <p className="text-muted-foreground">{item.care}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Storage Tips */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6">
                Long-Term Storage Tips
              </h2>
              <div className="bg-card rounded-lg p-8 border border-border text-left space-y-4">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">1. Clean Before Storing:</strong> Always dry clean garments before long-term storage to prevent stains from setting.
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">2. Use Acid-Free Tissue:</strong> Layer acid-free tissue paper between folds to prevent creasing and color transfer.
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">3. Muslin Bags:</strong> Store in breathable muslin bags, never in plastic which traps moisture.
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">4. Cool, Dry Place:</strong> Keep away from humidity, heat sources, and direct sunlight.
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">5. Regular Airing:</strong> Take out and air your garments every 3-4 months to prevent musty odors.
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">6. Silica Gel Packets:</strong> Place silica gel packets near stored garments to absorb excess moisture.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">
              Have questions about caring for your Shringaar garment? Contact our care specialists at{" "}
              <span className="text-primary">care@shringaar.com</span>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CareGuide;
