import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, User, Menu, X, Heart, LogOut, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CurrencySelector from './CurrencySelector';
import CartDrawer from '../cart/CartDrawer';
import ProductSearch from '../search/ProductSearch';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const announcements = [
  'Free shipping on orders over $300 · Worldwide delivery',
  'New arrivals just landed — shop the latest styles',
  'Custom sizing on all orders · Made to your measurements',
  'Duty-free delivery to USA, UK & Canada',
];

const navLinks = [
  { name: 'Lehengas', href: '/lehengas' },
  { name: 'Sarees', href: '/sarees' },
  { name: 'Salwar Kameez', href: '/suits' },
  { name: 'Menswear', href: '/menswear' },
  { name: 'Jewelry', href: '/jewelry' },
  { name: 'Indo-Western', href: '/indowestern' },
];

const secondaryLinks = [
  { name: 'New Arrivals', href: '/new-arrivals' },
  { name: 'Bestsellers', href: '/bestsellers' },
  { name: 'Bridal', href: '/collections/bridal-lehengas' },
  { name: 'Wedding Sarees', href: '/collections/wedding-sarees' },
  { name: 'Festive Wear', href: '/collections/festive-wear' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [announcementIdx, setAnnouncementIdx] = useState(0);

  const wishlistItems = useWishlistStore(state => state.items);
  const loadFromDatabase = useWishlistStore(state => state.loadFromDatabase);
  const cartItems = useCartStore(state => state.items);
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) loadFromDatabase(user.id);
  }, [user, loadFromDatabase]);

  // Rotate announcement bar
  useEffect(() => {
    const id = setInterval(() => {
      setAnnouncementIdx(i => (i + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        {/* Rotating Announcement Bar */}
        <div className="bg-foreground text-background overflow-hidden" style={{ height: '32px' }}>
          <div className="container mx-auto px-4 h-full flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              <motion.p
                key={announcementIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="text-xs tracking-wide text-center absolute"
                data-testid="announcement-bar"
              >
                {announcements[announcementIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center h-14 lg:h-16">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-3 -ml-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              data-testid="mobile-menu-open"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Left Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-5 flex-1">
              {navLinks.slice(0, 3).map(link => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="luxury-link text-xs tracking-editorial uppercase font-light text-foreground/80 hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Center Logo */}
            <Link to="/" className="flex-shrink-0 mx-6 lg:mx-8" aria-label="LuxeMia Home">
              <motion.span
                className="font-serif text-2xl lg:text-3xl tracking-wide"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                LuxeMia
              </motion.span>
            </Link>

            {/* Right Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-5 flex-1 justify-end">
              {navLinks.slice(3).map(link => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="luxury-link text-xs tracking-editorial uppercase font-light text-foreground/80 hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 ml-auto lg:ml-6">
              <div className="hidden sm:block">
                <CurrencySelector />
              </div>

              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-card rounded-full transition-colors"
                aria-label="Search"
                data-testid="search-open"
              >
                <Search className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>

              <Link
                to="/wishlist"
                className="hidden sm:flex p-2.5 min-w-[40px] min-h-[40px] items-center justify-center hover:bg-card rounded-full transition-colors relative"
                aria-label="Wishlist"
                data-testid="link-wishlist"
              >
                <Heart className="w-4 h-4 lg:w-5 lg:h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-foreground text-[10px] rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {!loading && (
                user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="hidden sm:flex p-2 hover:bg-card rounded-full transition-colors" aria-label="Account">
                        <User className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="text-muted-foreground text-xs">{user.email}</DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/account" className="cursor-pointer">
                          <User className="w-4 h-4 mr-2" />My Account
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                        <LogOut className="w-4 h-4 mr-2" />Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to="/auth" className="hidden sm:flex p-2 hover:bg-card rounded-full transition-colors" aria-label="Sign In">
                    <User className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Link>
                )
              )}

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-card rounded-full transition-colors"
                aria-label="Cart"
                data-testid="cart-open"
              >
                <ShoppingBag className="w-4 h-4 lg:w-5 lg:h-5" />
                {totalCartItems > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-foreground text-[10px] rounded-full flex items-center justify-center">
                    {totalCartItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Nav — desktop only */}
        <div className="hidden lg:block border-t border-border/20 bg-secondary/20">
          <div className="container mx-auto px-8">
            <div className="flex items-center justify-center gap-8 py-1.5">
              {secondaryLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <ProductSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

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
              className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-background z-50 lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h2 className="font-serif text-xl">Menu</h2>
                <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu" data-testid="mobile-menu-close">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-1">
                {/* Main categories */}
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground py-2">Categories</p>
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.href}
                      className="flex items-center justify-between py-2.5 text-base font-light tracking-wide text-foreground/80 hover:text-foreground transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </motion.div>
                ))}

                {/* Secondary links */}
                <div className="pt-4 border-t border-border/30">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground py-2">Collections</p>
                  {secondaryLinks.map((link, index) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (navLinks.length + index) * 0.05 }}
                    >
                      <Link
                        to={link.href}
                        className="flex items-center justify-between py-2 text-sm font-light text-foreground/70 hover:text-foreground transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Auth */}
                <div className="pt-4 border-t border-border/50">
                  {user ? (
                    <>
                      <p className="text-xs text-muted-foreground mb-3">{user.email}</p>
                      <Link
                        to="/account"
                        className="flex items-center gap-2 py-2.5 text-base font-light text-foreground/80 hover:text-foreground transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />My Account
                      </Link>
                      <button
                        onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                        className="flex items-center gap-2 py-2.5 text-base font-light text-foreground/80 hover:text-foreground transition-colors"
                      >
                        <LogOut className="w-4 h-4" />Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      className="flex items-center gap-2 py-2.5 text-base font-light text-foreground/80 hover:text-foreground transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />Sign In
                    </Link>
                  )}
                </div>
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
