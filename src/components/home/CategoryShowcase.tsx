import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FEATURED_CATEGORY_PRODUCTS } from '@/config/featuredCategoryProducts';

const categories = [
  {
    name: 'Lehengas',
    subtitle: 'Bridal & Festive',
    description: 'Bridal, wedding guest and festive lehengas for current celebrations.',
    href: '/lehengas',
    image: FEATURED_CATEGORY_PRODUCTS.lehengas.image,
    imageWebp: FEATURED_CATEGORY_PRODUCTS.lehengas.imageWebp,
    imageAlt: FEATURED_CATEGORY_PRODUCTS.lehengas.alt,
  },
  {
    name: 'Sarees',
    subtitle: 'Timeless Elegance',
    description: 'Kanjivaram, Banarasi, wedding and festive sarees available online.',
    href: '/sarees',
    image: FEATURED_CATEGORY_PRODUCTS.sarees.image,
    imageWebp: FEATURED_CATEGORY_PRODUCTS.sarees.imageWebp,
    imageAlt: FEATURED_CATEGORY_PRODUCTS.sarees.alt,
  },
  {
    name: 'Salwar Kameez',
    subtitle: 'Classic Grace',
    description: 'Anarkali, sharara, palazzo and salwar kameez styles.',
    href: '/suits',
    image: FEATURED_CATEGORY_PRODUCTS.suits.image,
    imageWebp: FEATURED_CATEGORY_PRODUCTS.suits.imageWebp,
    imageAlt: FEATURED_CATEGORY_PRODUCTS.suits.alt,
  },
  {
    name: 'Menswear',
    subtitle: 'Classic Style',
    description: 'Sherwanis, kurta pajama sets and wedding menswear.',
    href: '/menswear',
    image: FEATURED_CATEGORY_PRODUCTS.menswear.image,
    imageWebp: FEATURED_CATEGORY_PRODUCTS.menswear.imageWebp,
    imageAlt: FEATURED_CATEGORY_PRODUCTS.menswear.alt,
  },
  {
    name: 'Indo-Western',
    subtitle: 'Modern Fusion',
    description: 'Contemporary Indian silhouettes for weddings and parties.',
    href: '/indowestern',
    image: FEATURED_CATEGORY_PRODUCTS.indowestern.image,
    imageWebp: FEATURED_CATEGORY_PRODUCTS.indowestern.imageWebp,
    imageAlt: FEATURED_CATEGORY_PRODUCTS.indowestern.alt,
  },
  {
    name: 'Bridal Jewelry',
    subtitle: 'Finishing Touches',
    description: 'Kundan-style, polki-style and bridal necklace sets.',
    href: '/jewelry',
    image: FEATURED_CATEGORY_PRODUCTS.jewelry.image,
    imageWebp: FEATURED_CATEGORY_PRODUCTS.jewelry.imageWebp,
    imageAlt: FEATURED_CATEGORY_PRODUCTS.jewelry.alt,
  },
];

const CategoryShowcase = () => {
  return (
    <section className="bg-[radial-gradient(circle_at_90%_8%,rgba(232,195,182,0.32),transparent_24%),#f8f0e8] py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 lg:mb-16"
        >
          <p className="mb-3 text-xs uppercase tracking-luxury text-[#a96f72]">
            Featured Collections
          </p>
          <h2 className="mb-4 font-serif text-3xl text-[#3b292c] lg:text-5xl">Shop by Category</h2>
          <p className="mx-auto max-w-xl text-[#7f706d]">
            Explore Indian ethnic wear for weddings, festivals, and special occasions
          </p>
        </motion.div>

        {/* Six verified category images — one current Shopify product per category. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
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
                className="group/card relative block aspect-[3/4] overflow-hidden rounded-[2px] shadow-[0_12px_28px_rgba(78,49,50,0.1)]"
                aria-label={`Shop ${category.name} - ${category.subtitle}`}
              >
                {/* Category Image */}
                <div className="absolute inset-0 overflow-hidden">
                  <picture>
                    <source
                      srcSet={category.imageWebp}
                      type="image/webp"
                    />
                    <img 
                      src={category.image}
                      alt={category.imageAlt}
                      width={300} height={400}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover object-top transition-all duration-700 ease-out group-hover/card:scale-110"
                    />
                  </picture>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2f2023]/82 via-[#4a3136]/18 to-transparent opacity-90 transition-opacity duration-500 group-hover/card:opacity-100" />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 lg:p-6">
                  <div className="transform transition-all duration-500 ease-out group-hover/card:-translate-y-2">
                    <p className="text-xs tracking-[0.15em] uppercase text-white/70 mb-1.5">
                      {category.subtitle}
                    </p>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif text-2xl lg:text-3xl text-white">
                        {category.name}
                      </h3>
                      <div className="flex h-8 w-8 scale-90 items-center justify-center rounded-full bg-[#f2bbb4]/90 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover/card:scale-100 group-hover/card:opacity-100">
                        <ArrowRight className="h-4 w-4 text-[#3b292c]" />
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-white/70 font-light max-w-xs leading-relaxed">
                      {category.description}
                    </p>
                    <div className="mt-3 translate-y-3 opacity-0 transition-all delay-100 duration-500 group-hover/card:translate-y-0 group-hover/card:opacity-100">
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
