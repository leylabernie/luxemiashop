import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const occasions = [
  {
    label: 'Bridal',
    sublabel: 'Make it unforgettable',
    href: '/collections/bridal-lehengas',
    color: 'bg-rose-50 dark:bg-rose-950/30',
    accent: 'text-rose-700 dark:text-rose-300',
  },
  {
    label: 'Wedding Sarees',
    sublabel: 'Ceremony-ready drapes',
    href: '/collections/wedding-sarees',
    color: 'bg-purple-50 dark:bg-purple-950/30',
    accent: 'text-purple-700 dark:text-purple-300',
  },
  {
    label: 'Reception',
    sublabel: 'Evening glamour',
    href: '/collections/reception-outfits',
    color: 'bg-indigo-50 dark:bg-indigo-950/30',
    accent: 'text-indigo-700 dark:text-indigo-300',
  },
  {
    label: 'Party Wear',
    sublabel: 'Lehengas for the dance floor',
    href: '/collections/party-wear-lehengas',
    color: 'bg-fuchsia-50 dark:bg-fuchsia-950/30',
    accent: 'text-fuchsia-700 dark:text-fuchsia-300',
  },
  {
    label: 'Haldi & Mehendi',
    sublabel: 'Vibrant ceremony wear',
    href: '/collections/mehendi-outfits',
    color: 'bg-yellow-50 dark:bg-yellow-950/30',
    accent: 'text-yellow-700 dark:text-yellow-300',
  },
  {
    label: 'Groom',
    sublabel: 'Dapper ethnic styles',
    href: '/menswear',
    color: 'bg-blue-50 dark:bg-blue-950/30',
    accent: 'text-blue-700 dark:text-blue-300',
  },
  {
    label: 'Wedding Guest',
    sublabel: 'Stand out at every shaadi',
    href: '/collections/wedding-guest-outfits',
    color: 'bg-amber-50 dark:bg-amber-950/30',
    accent: 'text-amber-700 dark:text-amber-300',
  },
  {
    label: 'Guest Dresses',
    sublabel: 'Easy outfit discovery',
    href: '/collections/wedding-guest-dresses',
    color: 'bg-pink-50 dark:bg-pink-950/30',
    accent: 'text-pink-700 dark:text-pink-300',
  },
  {
    label: 'Anarkali Suits',
    sublabel: 'Graceful festive dressing',
    href: '/collections/anarkali-suits',
    color: 'bg-emerald-50 dark:bg-emerald-950/30',
    accent: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    label: 'Sharara Suits',
    sublabel: 'Flowing celebration sets',
    href: '/collections/sharara-suits',
    color: 'bg-cyan-50 dark:bg-cyan-950/30',
    accent: 'text-cyan-700 dark:text-cyan-300',
  },
  {
    label: 'Gharara Suits',
    sublabel: 'Traditional flared styles',
    href: '/collections/gharara-suits',
    color: 'bg-lime-50 dark:bg-lime-950/30',
    accent: 'text-lime-700 dark:text-lime-300',
  },
  {
    label: 'Festive',
    sublabel: 'Diwali, Eid & more',
    href: '/collections/diwali-outfits',
    color: 'bg-orange-50 dark:bg-orange-950/30',
    accent: 'text-orange-700 dark:text-orange-300',
  },
  {
    label: 'Casual & Office',
    sublabel: 'Everyday elegance',
    href: '/suits',
    color: 'bg-teal-50 dark:bg-teal-950/30',
    accent: 'text-teal-700 dark:text-teal-300',
  },
];

const ShopByOccasion = () => {
  return (
    <section className="py-14 lg:py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Shop by Occasion</p>
          <h2 className="font-serif text-2xl lg:text-4xl">Dressed for Every Moment</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          {occasions.map((occ, i) => (
            <motion.div
              key={occ.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to={occ.href}
                data-testid={`occasion-${occ.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`block rounded-lg p-6 lg:p-8 text-center hover:shadow-md transition-all duration-300 border border-transparent hover:border-border/40 ${occ.color}`}
              >
                <h3 className={`font-serif text-lg lg:text-xl mb-1 ${occ.accent}`}>{occ.label}</h3>
                <p className="text-xs text-muted-foreground font-light">{occ.sublabel}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByOccasion;
