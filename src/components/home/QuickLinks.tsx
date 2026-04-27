import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const quickLinks = [
  { label: 'Bestsellers', href: '/collections', featured: true },
  { label: 'Bridal Lehengas', href: '/lehengas', featured: true },
  { label: 'Wedding Sarees', href: '/sarees', featured: false },
  { label: 'Indo-Western', href: '/indowestern', featured: false },
  { label: 'Festive Wear', href: '/collections', featured: false },
  { label: 'Salwar Kameez', href: '/suits', featured: false },
  { label: 'Menswear', href: '/menswear', featured: false },
];

const QuickLinks = () => {
  return (
    <section className="py-6 lg:py-8 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3"
        >
          {quickLinks.map((link, index) => (
            <motion.div
              key={link.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Link
                to={link.href}
                className={`
                  inline-block px-5 py-2.5 text-sm tracking-editorial transition-all duration-300
                  ${
                    link.featured
                      ? 'bg-foreground text-background hover:bg-foreground/90'
                      : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border/50'
                  }
                `}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default QuickLinks;
