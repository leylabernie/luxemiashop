import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

import productSaree1 from '@/assets/product-saree-1.jpg';
import productLehenga1 from '@/assets/product-lehenga-1.jpg';
import productSaree2 from '@/assets/product-saree-2.jpg';
import productSuit1 from '@/assets/product-suit-1.jpg';

const products = [
  {
    id: 1,
    name: 'Chanderi Silk Saree',
    price: 12500,
    originalPrice: 15000,
    category: 'Sarees',
    isNew: true,
    image: productSaree1,
  },
  {
    id: 2,
    name: 'Embroidered Lehenga Set',
    price: 28000,
    category: 'Lehengas',
    isNew: false,
    image: productLehenga1,
  },
  {
    id: 3,
    name: 'Banarasi Silk Saree',
    price: 18500,
    category: 'Sarees',
    isNew: true,
    image: productSaree2,
  },
  {
    id: 4,
    name: 'Palazzo Suit Set',
    price: 9800,
    originalPrice: 12000,
    category: 'Suits',
    isNew: false,
    image: productSuit1,
  },
];

const FeaturedProducts = () => {
  return (
    <section className="py-20 lg:py-28 bg-card/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-14"
        >
          <div>
            <p className="text-xs tracking-luxury uppercase text-foreground/60 mb-3">
              Hand-Picked For You
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl">Featured Pieces</h2>
          </div>
          <Link
            to="/shop"
            className="luxury-link text-sm tracking-editorial uppercase text-foreground/70 hover:text-foreground transition-colors"
          >
            View All
          </Link>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <Link to={`/product/${product.id}`} className="block">
                {/* Image Container */}
                <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-card">
                  {/* Product Image */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isNew && (
                      <span className="bg-foreground text-background text-[10px] tracking-luxury uppercase px-2 py-1">
                        New
                      </span>
                    )}
                    {product.originalPrice && (
                      <span className="bg-rose text-foreground text-[10px] tracking-luxury uppercase px-2 py-1">
                        Sale
                      </span>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <button
                    className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="w-4 h-4" />
                  </button>

                  {/* Quick Shop Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <button className="w-full bg-background/95 backdrop-blur-sm py-3 text-xs tracking-editorial uppercase hover:bg-background transition-colors">
                      Quick View
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-1">
                  <p className="text-xs text-foreground/50 uppercase tracking-wide">
                    {product.category}
                  </p>
                  <h3 className="font-serif text-sm lg:text-base group-hover:underline underline-offset-4 transition-all">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-foreground/40 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
