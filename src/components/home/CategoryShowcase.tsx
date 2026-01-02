import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Helper to get high-resolution image URL
const getHighResImage = (url: string) => {
  return url.replace('/images/650/', '/images/1200/');
};

const categories = [
  {
    name: 'Sarees',
    description: 'Handwoven elegance',
    href: '/sarees',
    image: getHighResImage('https://kesimg.b-cdn.net/images/650/2025y/December/59744/Pink-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3176(1).jpg'),
  },
  {
    name: 'Lehengas',
    description: 'Bridal & Festive',
    href: '/lehengas',
    image: getHighResImage('https://kesimg.b-cdn.net/images/650/2025y/December/59645/Rani-Pink-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-A(1).jpg'),
  },
  {
    name: 'Suits',
    description: 'Contemporary classics',
    href: '/suits',
    image: getHighResImage('https://kesimg.b-cdn.net/images/650/2025y/December/59658/Dusty-Pink-Georgette-Party-Wear-Embroidery-Work-Salwar-Suit-Salwar-Street-Vol-5-6208-E(1).jpg'),
  },
];

const CategoryShowcase = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p className="text-xs tracking-luxury uppercase text-foreground/60 mb-3">
            Curated Collections
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl">Shop by Category</h2>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Link
                to={category.href}
                className="group block relative aspect-[3/4] overflow-hidden"
              >
                {/* Category Image */}
                <img 
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-foreground/10 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                    <p className="text-xs tracking-luxury uppercase text-background/80 mb-1">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-2xl lg:text-3xl text-background">
                        {category.name}
                      </h3>
                      <ArrowRight className="w-5 h-5 text-background opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                    </div>
                  </div>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 border border-transparent group-hover:border-background/20 transition-colors duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
