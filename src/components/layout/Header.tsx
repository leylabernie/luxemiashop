import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, User, Menu, X, Heart, LogOut, ChevronRight, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CurrencySelector from './CurrencySelector';
import CartDrawer from '../cart/CartDrawer';
import ProductSearch from '../search/ProductSearch';
import { MegaMenuNavItem } from './MegaMenuNavItem';
import { MEGA_MENUS } from '@/config/categoryConfig';
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
  'Free shipping on orders over $350 · Worldwide delivery',
  'New arrivals just landed — shop the latest styles',
  'Quality Indian ethnic wear at fair prices',
  'Flat $25 shipping · Trackable worldwide delivery',
];

// Categories without a mega-menu use plain links.
// Indo-Western removed from top-level nav — will become a menswear subcategory later.

// Combined nav links for the mobile menu (mega-menu not used on mobile).
const navLinks = [
  ...MEGA_MENUS.map(m => ({ name: m.label, href: m.href })),
];

const secondaryLinks = [
  { name: 'New Arrivals', href: '/new-arrivals' },
  { name: 'Bestsellers', href: '/bestsellers' },
  { name: 'Blog', href: '/blog' },
];

const occasionLinks = [
  { name: 'Diwali Outfits', href: '/collections/diwali-outfits' },
  { name: 'Wedding Guest', href: '/collections/wedding-guest-outfits' },
  { name: 'Mehendi Ceremony', href: '/collections/mehendi-outfits' },
  { name: 'Eid Outfits', href: '/collections/eid-outfits' },
  { name: 'Navratri & Garba', href: '/collections/navratri-outfits' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [announcementIdx, setAnnouncementIdx] = useState(0);

  const wishlistItems = useWishlistStore(state => state.items);
  const loadFromDatabase = useWishlistStore(state => state.loadFromDatabase);
  const cartItems = useCartStore(state => state.items);
  const isCartOpen = useCartStore(state => state.isCartOpen);
  const openCart = useCartStore(state => state.openCart);
  const closeCart = useCartStore(state => state.closeCart);
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

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
        {/* Rotating Announcement Bar — CSS-only fade (PSI 2026-07-22: removed framer-motion) */}
        <div className="bg-foreground text-background overflow-hidden" style={{ height: '32px' }}>
          <div className="container mx-auto px-4 h-full flex items-center justify-center relative">
            <p
              key={announcementIdx}
              className="text-xs tracking-wide text-center absolute"
              data-testid="announcement-bar"
              style={{
                animation: 'announcementFade 0.35s ease-out',
                willChange: 'opacity',
              }}
            >
              {announcements[announcementIdx]}
            </p>
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
              {MEGA_MENUS.slice(0, 3).map(menu => (
                <MegaMenuNavItem key={menu.href} menu={menu} />
              ))}
            </nav>

            {/* Center Logo — CSS-only fade-in (PSI 2026-07-22: removed framer-motion) */}
            <Link to="/" className="flex-shrink-0 mx-6 lg:mx-8">
              <div
                className="font-serif text-2xl lg:text-3xl tracking-wide"
                style={{
                  animation: 'heroFadeIn 0.6s ease-out',
                  willChange: 'opacity',
                }}
              >
                <span>LuxeMia</span>
              </div>
            </Link>

            {/* Right Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-5 flex-1 justify-end">
              {MEGA_MENUS.slice(3).map(menu => (
                <MegaMenuNavItem key={menu.href} menu={menu} />
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
                onClick={() => openCart()}
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
              {/* Occasions dropdown removed — products not mapped to occasion pages */}
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <ProductSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Menu — CSS-only slide (PSI 2026-07-22: removed framer-motion) */}
      {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-foreground/20 z-50 lg:hidden"
              style={{ animation: 'menuFadeIn 0.3s ease-out', willChange: 'opacity' }}
              onClick={() => setIsMenuOpen(false)}
            />
            <nav
              className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-background z-50 lg:hidden overflow-y-auto"
              style={{ animation: 'menuSlideIn 0.3s ease-out', willChange: 'transform' }}
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
                  <div
                    key={link.name}
                    style={{ animation: `menuItemIn 0.3s ease-out ${index * 0.05}s both`, willChange: 'opacity, transform' }}
                  >
                    <Link
                      to={link.href}
                      className="flex items-center justify-between py-2.5 text-base font-light tracking-wide text-foreground/80 hover:text-foreground transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </div>
                ))}

                {/* Secondary links */}
                <div className="pt-4 border-t border-border/30">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground py-2">Collections</p>
                  {secondaryLinks.map((link, index) => (
                    <div
                      key={link.name}
                      style={{ animation: `menuItemIn 0.3s ease-out ${(navLinks.length + index) * 0.05}s both`, willChange: 'opacity, transform' }}
                    >
                      <Link
                        to={link.href}
                        className="flex items-center justify-between py-2 text-sm font-light text-foreground/70 hover:text-foreground transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Occasion links removed — products not mapped to occasion pages */}

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
            </nav>
          </>
        )}
      <style>{`
        @keyframes menuFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes menuSlideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes menuItemIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes announcementFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
};

export default Header;
