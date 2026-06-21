import { ShieldCheck, Truck, Clock, MapPin, Search, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const TrustBadgeSection = () => {
  const advantages = [
    {
      icon: MapPin,
      title: "Philadelphia-Based Support",
      description: "Chat with us in your time zone. We're a US business providing direct support before and after your purchase."
    },
    {
      icon: Search,
      title: "Expert Quality Inspection",
      description: "Every piece undergoes a rigorous 12-point check at our source workshop before being dispatched directly to your door."
    },
    {
      icon: Truck,
      title: "Direct Global Shipping",
      description: "Direct shipping from our source to your doorstep in the USA, Canada, and Australia via DHL/UPS. Fully tracked and secure."
    },
    {
      icon: Clock,
      title: "Reliable Event Timelines",
      description: "Planning for an event? We provide honest timelines so your outfit arrives exactly when you need it."
    },
    {
      icon: ShieldCheck,
      title: "Secure Shopify Platform",
      description: "Shop with peace of mind. Your payments and data are protected by Shopify's world-class PCI-DSS security."
    },
    {
      icon: CheckCircle,
      title: "Curated Selection",
      description: "We don't sell 20,000 items. We curate only the finest, authentic designs that meet our high standards."
    }
  ];

  return (
    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif mb-4">The LuxeMia Boutique Advantage</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Why thousands of NRIs in the USA, Canada, and Australia trust LuxeMia Boutique for their special occasions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {advantages.map((adv, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-4 p-6 bg-background border border-border/50 rounded-sm hover:border-primary/30 transition-colors group"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <adv.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <h3 className="font-serif text-lg mb-2">{adv.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{adv.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBadgeSection;
