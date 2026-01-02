import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag, Sparkles, Crown, Gem } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

interface Accessory {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  material: string;
  isNew?: boolean;
  isBestseller?: boolean;
}

const accessories: Accessory[] = [
  // Jewelry
  {
    id: 'acc-001',
    name: 'Kundan Choker Necklace Set',
    category: 'Jewelry',
    price: 289,
    originalPrice: 349,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop',
    description: 'Exquisite kundan choker with matching earrings, perfect for bridal occasions.',
    material: 'Kundan, Pearl, Gold-plated brass',
    isBestseller: true,
  },
  {
    id: 'acc-002',
    name: 'Polki Diamond Maang Tikka',
    category: 'Jewelry',
    price: 159,
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&h=800&fit=crop',
    description: 'Traditional polki maang tikka with delicate chain and pearl drops.',
    material: 'Polki, Pearl, Gold-plated',
    isNew: true,
  },
  {
    id: 'acc-003',
    name: 'Temple Jewelry Jhumka Earrings',
    category: 'Jewelry',
    price: 129,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop',
    description: 'Classic South Indian temple jewelry jhumkas with intricate detailing.',
    material: 'Antique gold finish, Stone work',
  },
  {
    id: 'acc-004',
    name: 'Pearl & Kundan Bangles Set',
    category: 'Jewelry',
    price: 199,
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=800&fit=crop',
    description: 'Set of 6 elegant bangles with pearl and kundan embellishments.',
    material: 'Pearl, Kundan, Gold-plated brass',
  },
  // Bags & Clutches
  {
    id: 'acc-005',
    name: 'Zardozi Embroidered Potli Bag',
    category: 'Bags',
    price: 89,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=800&fit=crop',
    description: 'Handcrafted potli bag with intricate zardozi embroidery and pearl handle.',
    material: 'Silk, Zardozi thread, Pearls',
    isBestseller: true,
  },
  {
    id: 'acc-006',
    name: 'Velvet Box Clutch',
    category: 'Bags',
    price: 119,
    originalPrice: 149,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop',
    description: 'Luxurious velvet clutch with crystal clasp and chain strap.',
    material: 'Velvet, Crystal, Metal chain',
    isNew: true,
  },
  {
    id: 'acc-007',
    name: 'Beaded Wristlet Pouch',
    category: 'Bags',
    price: 69,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop',
    description: 'Delicate beaded pouch perfect for carrying essentials at celebrations.',
    material: 'Beads, Satin lining',
  },
  // Hair Accessories
  {
    id: 'acc-008',
    name: 'Floral Hair Pins Set',
    category: 'Hair Accessories',
    price: 49,
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=800&fit=crop',
    description: 'Set of 5 floral hair pins with crystal and pearl embellishments.',
    material: 'Crystal, Pearl, Metal',
  },
  {
    id: 'acc-009',
    name: 'Bridal Hair Vine',
    category: 'Hair Accessories',
    price: 139,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=800&fit=crop',
    description: 'Flexible hair vine with delicate leaves and crystal beads for bridal styling.',
    material: 'Crystal, Pearl, Flexible wire',
    isNew: true,
  },
  // Footwear
  {
    id: 'acc-010',
    name: 'Embroidered Mojari Juttis',
    category: 'Footwear',
    price: 79,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=800&fit=crop',
    description: 'Traditional Rajasthani juttis with colorful thread embroidery.',
    material: 'Leather, Thread embroidery',
    isBestseller: true,
  },
  {
    id: 'acc-011',
    name: 'Pearl Embellished Heels',
    category: 'Footwear',
    price: 149,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=800&fit=crop',
    description: 'Elegant block heels adorned with pearl detailing.',
    material: 'Satin, Pearl, Block heel',
  },
  // Dupattas & Stoles
  {
    id: 'acc-012',
    name: 'Banarasi Silk Dupatta',
    category: 'Dupattas',
    price: 189,
    originalPrice: 229,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop',
    description: 'Luxurious Banarasi silk dupatta with gold zari border.',
    material: 'Pure Banarasi silk, Zari',
  },
];

const categories = ['All', 'Jewelry', 'Bags', 'Hair Accessories', 'Footwear', 'Dupattas'];

const Jewelry = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const addItem = useCartStore((state) => state.addItem);

  const filteredAccessories = selectedCategory === 'All' 
    ? accessories 
    : accessories.filter(acc => acc.category === selectedCategory);

  const handleAddToCart = (accessory: Accessory) => {
    // Create a CartItem compatible with the store
    addItem({
      product: {
        node: {
          id: accessory.id,
          title: accessory.name,
          handle: accessory.id,
          description: accessory.description,
          images: { edges: [{ node: { url: accessory.image, altText: accessory.name } }] },
          priceRange: { 
            minVariantPrice: { amount: String(accessory.price), currencyCode: 'USD' } 
          },
          variants: { 
            edges: [{ 
              node: { 
                id: accessory.id, 
                title: 'Default',
                price: { amount: String(accessory.price), currencyCode: 'USD' },
                availableForSale: true,
                selectedOptions: []
              } 
            }] 
          },
          options: [],
        }
      },
      variantId: accessory.id,
      variantTitle: 'Default',
      price: { amount: String(accessory.price), currencyCode: 'USD' },
      quantity: 1,
      selectedOptions: [],
    });
    toast.success('Added to cart!', {
      description: accessory.name,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-20 w-48 h-48 bg-primary/30 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Complete Your Look</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6"
            >
              Jewelry Collection
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto"
            >
              From statement necklaces to elegant earrings, discover exquisite handcrafted jewelry 
              to complement your ethnic ensemble.
            </motion.p>
          </div>
        </section>

        {/* Category Highlights */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Crown, title: 'Jewelry', count: '45+ pieces' },
                { icon: ShoppingBag, title: 'Bags & Clutches', count: '30+ styles' },
                { icon: Gem, title: 'Hair Accessories', count: '25+ designs' },
                { icon: Sparkles, title: 'Footwear', count: '20+ pairs' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 bg-card rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedCategory(item.title === 'Bags & Clutches' ? 'Bags' : item.title)}
                >
                  <item.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.count}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 sticky top-20 bg-background/95 backdrop-blur-sm z-30 border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <p className="text-muted-foreground">
                Showing {filteredAccessories.length} {selectedCategory === 'All' ? 'accessories' : selectedCategory.toLowerCase()}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAccessories.map((accessory, index) => (
                <motion.div
                  key={accessory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-lg bg-secondary/30 aspect-[3/4] mb-4">
                    <img
                      src={accessory.image}
                      alt={accessory.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {accessory.isNew && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          New
                        </span>
                      )}
                      {accessory.isBestseller && (
                        <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded">
                          Bestseller
                        </span>
                      )}
                      {accessory.originalPrice && (
                        <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">
                          Sale
                        </span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3">
                      <button className="p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Add to Cart Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleAddToCart(accessory)}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-primary uppercase tracking-wider">
                      {accessory.category}
                    </span>
                    <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {accessory.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {accessory.material}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="font-semibold text-foreground">${accessory.price}</span>
                      {accessory.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${accessory.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Styling Tips */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl md:text-3xl text-foreground text-center mb-12">
              Styling Tips
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Match Your Metals</h3>
                <p className="text-muted-foreground text-sm">
                  Coordinate your jewelry with the zari and embellishments on your outfit for a cohesive look.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Size Your Bag Right</h3>
                <p className="text-muted-foreground text-sm">
                  Choose a clutch or potli that complements your outfit's volume—smaller bags for heavy lehengas.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gem className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Balance is Key</h3>
                <p className="text-muted-foreground text-sm">
                  If your outfit is heavily embellished, opt for minimalist accessories and vice versa.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">
              Need Help Styling?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our styling experts can help you find the perfect accessories to complete your look. 
              Book a free virtual consultation today.
            </p>
            <Link to="/contact">
              <Button size="lg">Contact Our Stylists</Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Jewelry;