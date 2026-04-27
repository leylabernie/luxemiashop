import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { motion } from "framer-motion";

const Artisans = () => {
  const regions = [
    {
      name: "Lucknow, Uttar Pradesh",
      specialty: "Zardozi & Chikankari Embroidery",
      description: "Known for its refined embroidery traditions, Lucknow produces some of India's most sought-after zardozi and chikankari work, featuring intricate thread patterns that add elegance to any outfit."
    },
    {
      name: "Varanasi, Uttar Pradesh",
      specialty: "Silk Brocade Weaving",
      description: "Varanasi is famous for its silk brocades and Banarasi sarees. The city's weaving tradition produces beautiful silk fabrics with rich zari patterns that are popular across India and abroad."
    },
    {
      name: "Kanchipuram, Tamil Nadu",
      specialty: "Temple Border Silk Sarees",
      description: "Kanchipuram is renowned for its distinctive silk sarees with bold temple borders. These sarees are a staple of South Indian weddings and celebrations, known for their durability and rich colors."
    },
    {
      name: "Jaipur, Rajasthan",
      specialty: "Gota Patti & Block Printing",
      description: "Jaipur is a hub for vibrant gota patti appliqué and block printing. The city's colorful aesthetic brings a festive, eye-catching quality to ethnic wear that's perfect for celebrations."
    },
    {
      name: "Surat, Gujarat",
      specialty: "Synthetic & Art Silk Fabrics",
      description: "Surat is India's textile capital, producing a wide range of affordable fabrics from art silk to georgette. The city's mills supply quality materials that make beautiful ethnic wear accessible to everyone."
    },
    {
      name: "Sanganer, Rajasthan",
      specialty: "Textile Printing & Dyeing",
      description: "Sanganer is known for its fine textile printing and dyeing traditions. The town produces colorful printed fabrics used in kurtas, suits, and home textiles, blending traditional motifs with modern designs."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Our Sourcing Regions — LuxeMia"
        description="Discover the regions across India where LuxeMia sources its Indian ethnic wear. From Lucknow embroidery to Banarasi silk, learn about the textile traditions behind our collections."
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
              Where Our Products Come From
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto"
            >
              Our collections are sourced from India's most renowned textile regions, 
              bringing you authentic designs and quality fabrics at affordable prices.
            </motion.p>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
                Sourced from India's Best Textile Regions
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                We source our products from established suppliers and manufacturers across India's 
                famous textile hubs. Our goal is to bring you beautiful, well-made Indian ethnic wear 
                at prices that work for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Artisans Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl text-foreground text-center mb-12">
              Textile Regions We Source From
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regions.map((region, index) => (
                <motion.div
                  key={region.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🧵</span>
                  </div>
                  <h3 className="font-display text-xl text-foreground mb-2">{region.name}</h3>
                  <p className="text-primary text-sm mb-3">{region.specialty}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{region.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">
              Explore Our Collections
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Browse our curated selection of Indian ethnic wear sourced from the country's best textile regions. 
              Beautiful designs, quality fabrics, and affordable prices.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Artisans;
