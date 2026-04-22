import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import categorySareesImg from '@/assets/category-sarees.jpg';
import categoryLehengasImg from '@/assets/category-lehengas.jpg';
import categorySuitsImg from '@/assets/category-suits.jpg';

const categories = [
  {
    name: 'Sarees',
    subtitle: 'Timeless Elegance',
    description: 'Handpicked silk and designer sarees for every occasion',
    href: '/sarees',
    image: categorySareesImg,
    tag: 'New Collection',
  },
  {
    name: 'Lehengas',
    subtitle: 'Bridal & Festive',
    description: 'Designer lehengas for your special moments',
    href: '/lehengas',
    image: categoryLehengasImg,
    tag: 'Most Popular',
  },
  {
    name: 'Salwar Kameez',
    subtitle: 'Classic Grace',
    description: 'Elegant salwar kameez and anarkali sets',
    href: '/suits',
    image: categorySuitsImg,
    tag: 'Trending Now',
  },
  {
    name: 'Jewelry',
    subtitle: 'Exquisite Adornments',
    description: 'Kundan, polki and bridal jewellery sets for every occasion',
    href: '/jewelry',
    image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59471/Yellow--Wedding-Wear-Kundan-Ethnic-Design-Necklace-Set-FNKN102YLW(1).jpg',
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

        {/* Hero-style Category Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group"
            >
              <Link
                to={category.href}
                className="block relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden rounded-sm"
                aria-label={`Shop ${category.name} - ${category.subtitle}`}
              >
                {/* Category Image with Parallax Effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <img 
                    src={category.image}
                    alt={`${category.name} collection - ${category.description}`}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
                  />
                </div>

                {/* Animated Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                
                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                </div>

                {/* Tag Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-3 py-1.5 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium tracking-wide rounded-sm">
                    {category.tag}
                  </span>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  <div className="transform transition-all duration-500 ease-out group-hover:-translate-y-3">
                    {/* Subtitle */}
                    <p className="text-xs tracking-luxury uppercase text-background/80 mb-2">
                      {category.subtitle}
                    </p>
                    
                    {/* Title with Arrow */}
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-serif text-3xl lg:text-4xl text-background">
                        {category.name}
                      </h3>
                      <div className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                        <ArrowRight className="w-5 h-5 text-background" />
                      </div>
                    </div>

                    {/* Description - appears on hover */}
                    <p className="text-sm text-background/80 font-light max-w-xs opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                      {category.description}
                    </p>

                    {/* CTA Button - appears on hover */}
                    <div className="mt-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-150">
                      <span className="inline-flex items-center gap-2 text-sm text-background font-medium border-b border-background/50 pb-0.5 hover:border-background transition-colors">
                        Explore Collection
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-background/30 transition-colors duration-300 rounded-sm pointer-events-none" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
