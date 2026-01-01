import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, User, Menu, X, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import CurrencySelector from './CurrencySelector';
import CartDrawer from '../cart/CartDrawer';

const navLinks = [
  { name: 'Collections', href: '/collections' },
  { name: 'Sarees', href: '/collections?category=sarees' },
  { name: 'Lehengas', href: '/collections?category=lehengas' },
  { name: 'Our Story', href: '/our-story' },
  { name: 'Lookbook', href: '/lookbook' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        {/* Announcement Bar */}
        <div className="bg-card py-2 text-center">
          <p className="text-xs tracking-luxury uppercase text-foreground/70">
            Complimentary Shipping on Orders Above ₹15,000
          </p>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Left Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="luxury-link text-sm tracking-editorial uppercase font-light text-foreground/80 hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Center Logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <motion.h1 
                className="font-serif text-2xl lg:text-3xl tracking-wide"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Vasantam
              </motion.h1>
            </Link>

            {/* Right Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.slice(3).map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="luxury-link text-sm tracking-editorial uppercase font-light text-foreground/80 hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-3 lg:gap-5">
              <CurrencySelector />
              
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 hover:bg-card rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>

              <Link 
                to="/wishlist"
                className="hidden sm:flex p-2 hover:bg-card rounded-full transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-4 h-4 lg:w-5 lg:h-5" />
              </Link>

              <Link 
                to="/account"
                className="hidden sm:flex p-2 hover:bg-card rounded-full transition-colors"
                aria-label="Account"
              >
                <User className="w-4 h-4 lg:w-5 lg:h-5" />
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-card rounded-full transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose text-foreground text-[10px] rounded-full flex items-center justify-center">
                  2
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-border/50 overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="relative max-w-xl mx-auto">
                  <input
                    type="text"
                    placeholder="Search for sarees, lehengas, suits..."
                    className="w-full bg-transparent border-b border-foreground/30 py-3 pl-0 pr-10 text-sm focus:outline-none focus:border-foreground placeholder:text-foreground/40 font-light"
                    autoFocus
                  />
                  <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 z-50 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-background z-50 lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h2 className="font-serif text-xl">Menu</h2>
                <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      className="block text-lg font-light tracking-editorial uppercase text-foreground/80 hover:text-foreground transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;
