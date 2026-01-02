import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'New York, USA',
    quote: 'The bridal lehenga exceeded all my expectations. The craftsmanship is impeccable and I felt like royalty on my wedding day.',
    rating: 5,
    product: 'Bridal Lehenga',
  },
  {
    name: 'Ananya Patel',
    location: 'London, UK',
    quote: 'Absolutely stunning sarees! The quality of silk and the attention to detail in the embroidery is remarkable.',
    rating: 5,
    product: 'Banarasi Silk Saree',
  },
  {
    name: 'Meera Kapoor',
    location: 'Dubai, UAE',
    quote: 'LuxeMia has become my go-to for all occasions. Their collection is unique and the customer service is exceptional.',
    rating: 5,
    product: 'Designer Anarkali',
  },
];

const CustomerStories = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-xs tracking-luxury uppercase text-muted-foreground mb-3 block"
          >
            Customer Stories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="font-serif text-3xl lg:text-4xl"
          >
            Loved by Brides Worldwide
          </motion.h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="bg-card p-6 lg:p-8 border border-border/50"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-accent text-accent"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-sm lg:text-base text-foreground/80 mb-6 font-light leading-relaxed italic">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="border-t border-border/50 pt-4">
                <p className="font-medium text-foreground">
                  {testimonial.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {testimonial.location}
                </p>
                <p className="text-xs text-primary mt-2">
                  Purchased: {testimonial.product}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerStories;
