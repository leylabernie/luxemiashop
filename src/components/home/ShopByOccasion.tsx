import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const occasions = [
  {
    label: 'Bridal',
    sublabel: 'Make it unforgettable',
    href: '/lehengas',
    color: 'bg-rose-50 dark:bg-rose-950/30',
    accent: 'text-rose-700 dark:text-rose-300',
  },
  {
    label: 'Bridesmaids',
    sublabel: 'The perfect squad look',
    href: '/sarees',
    color: 'bg-purple-50 dark:bg-purple-950/30',
    accent: 'text-purple-700 dark:text-purple-300',
  },
  {
    label: 'Reception',
    sublabel: 'Evening glamour',
    href: '/collections',
    color: 'bg-indigo-50 dark:bg-indigo-950/30',
    accent: 'text-indigo-700 dark:text-indigo-300',
  },
  {
    label: 'Haldi & Mehendi',
    sublabel: 'Vibrant ceremony wear',
    href: '/collections',
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
    href: '/collections',
    color: 'bg-amber-50 dark:bg-amber-950/30',
    accent: 'text-amber-700 dark:text-amber-300',
  },
  {
    label: 'Festive',
    sublabel: 'Diwali, Eid & more',
    href: '/collections',
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
