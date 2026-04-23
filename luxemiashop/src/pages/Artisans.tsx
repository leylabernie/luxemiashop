import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { motion } from "framer-motion";

const Artisans = () => {
  const artisans = [
    {
      name: "Master Zardozi Craftsmen",
      location: "Lucknow, Uttar Pradesh",
      specialty: "Gold & Silver Thread Embroidery",
      experience: "40+ years",
      description: "Our Lucknowi artisans preserve the 500-year-old tradition of Zardozi, meticulously hand-embroidering each piece with gold and silver threads, creating intricate floral and geometric patterns that have adorned royalty for centuries."
    },
    {
      name: "Banarasi Weaving Masters",
      location: "Varanasi, Uttar Pradesh",
      specialty: "Silk Brocade Weaving",
      experience: "5 generations",
      description: "Working on traditional handlooms, our Banarasi weavers create the legendary silk brocades using techniques passed down through five generations, weaving stories of heritage into every thread."
    },
    {
      name: "Chikankari Artisans",
      location: "Lucknow, Uttar Pradesh",
      specialty: "White-on-White Embroidery",
      experience: "35+ years",
      description: "The delicate art of Chikankari comes alive through our skilled embroiderers who create shadow work and intricate patterns using 36 different stitches, each piece taking weeks to complete."
    },
    {
      name: "Kanjeevaram Weavers",
      location: "Kanchipuram, Tamil Nadu",
      specialty: "Temple Border Silk Sarees",
      experience: "4 generations",
      description: "Our Kanjeevaram master weavers use pure mulberry silk and real gold zari, creating sarees with distinctive temple borders that are treasured as heirlooms across generations."
    },
    {
      name: "Gota Patti Specialists",
      location: "Jaipur, Rajasthan",
      specialty: "Appliqué Work",
      experience: "25+ years",
      description: "Rajasthani artisans bring the vibrant spirit of the desert to life through Gota Patti work, hand-applying gold and silver ribbons in traditional motifs that shimmer with every movement."
    },
    {
      name: "Block Printing Craftsmen",
      location: "Sanganer, Rajasthan",
      specialty: "Hand Block Printing",
      experience: "6 generations",
      description: "Using hand-carved wooden blocks that have been in their families for generations, our Sanganeri printers create stunning patterns using natural dyes and age-old techniques."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Our Artisans — LuxeMia"
        description="Meet the master artisans behind LuxeMia's luxury Indian ethnic wear. Skilled artisan families preserving centuries-old craftsmanship across India."
        canonical="https://luxemia.shop/artisans"
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
              Our Master Artisans
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto"
            >
              Behind every LuxeMia creation are the skilled hands of India's finest craftsmen, 
              preserving centuries-old traditions while creating timeless pieces of wearable art.
            </motion.p>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
                Preserving Heritage, Empowering Communities
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                We work directly with artisan families across India, ensuring fair wages,
                safe working conditions, and sustainable livelihoods. Our partnerships span generations,
                preserving diverse craft traditions for the future.
              </p>
            </div>
          </div>
        </section>

        {/* Artisans Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl text-foreground text-center mb-12">
              Meet Our Craftsmen
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artisans.map((artisan, index) => (
                <motion.div
                  key={artisan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🧵</span>
                  </div>
                  <h3 className="font-display text-xl text-foreground mb-2">{artisan.name}</h3>
                  <p className="text-primary text-sm mb-1">{artisan.specialty}</p>
                  <p className="text-muted-foreground text-sm mb-1">{artisan.location}</p>
                  <p className="text-muted-foreground text-sm mb-4">{artisan.experience} experience</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{artisan.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">
              Experience the Art of Handcraft
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Each LuxeMia piece carries the soul of its maker. Discover our collections
              and wear a piece of India's rich artisanal heritage.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Artisans;
