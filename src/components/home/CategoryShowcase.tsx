import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import categorySareesImg from '@/assets/category-sarees.jpg';
import categoryLehengasImg from '@/assets/category-lehengas.jpg';
import categorySuitsImg from '@/assets/category-suits.jpg';
import categoryMenswearImg from '@/assets/category-menswear.jpg';

const categories = [
  {
    name: 'Lehengas',
    subtitle: 'Bridal & Festive',
    description: 'Lehengas with beautiful embroidery on quality fabrics',
    href: '/lehengas',
    image: categoryLehengasImg,
    tag: 'Most Popular',
  },
  {
    name: 'Sarees',
    subtitle: 'Timeless Elegance',
    description: 'Handpicked silk and elegant drape sarees for every occasion',
    href: '/sarees',
    image: categorySareesImg,
    tag: 'New Collection',
  },
  {
    name: 'Salwar Kameez',
    subtitle: 'Classic Grace',
    description: 'Elegant salwar kameez and anarkali sets in quality organza silk',
    href: '/suits',
    image: categorySuitsImg,
    tag: 'Trending Now',
  },
  {
    name: 'Menswear',
    subtitle: 'Classic Style',
    description: 'Sherwanis, kurta sets and Indo-western outfits for grooms',
    href: '/menswear',
    image: categoryMenswearImg,
    tag: 'New Arrivals',
  },
];

const CategoryShowcase = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 lg:mb-16"
        >
          <p className="text-xs tracking-luxury uppercase text-muted-foreground mb-3">
            Curated Collections
          </p>
          <h2 className="font-serif text-3xl lg:text-5xl mb-4">Shop by Category</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore our handpicked collections of authentic Indian ethnic wear
          </p>
        </motion.div>

        {/* Category Grid - 2x2 on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              className="group"
            >
              <Link
                to={category.href}
                className="block relative aspect-[3/4] overflow-hidden rounded-sm"
                aria-label={`Shop ${category.name} - ${category.subtitle}`}
              >
                {/* Category Image */}
                <div className="absolute inset-0 overflow-hidden">
                  <img 
                    src={category.image}
                    alt={`${category.name} collection - ${category.description}`}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
                  />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Tag Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-3 py-1.5 bg-white/90 backdrop-blur-sm text-foreground text-xs font-medium tracking-wide rounded-sm">
                    {category.tag}
                  </span>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 lg:p-6">
                  <div className="transform transition-all duration-500 ease-out group-hover:-translate-y-2">
                    <p className="text-xs tracking-[0.15em] uppercase text-white/70 mb-1.5">
                      {category.subtitle}
                    </p>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif text-2xl lg:text-3xl text-white">
                        {category.name}
                      </h3>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-white/70 font-light max-w-xs leading-relaxed">
                      {category.description}
                    </p>
                    <div className="mt-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                      <span className="inline-flex items-center gap-1.5 text-xs text-white font-medium border-b border-white/50 pb-0.5 hover:border-white transition-colors">
                        Explore Collection
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
