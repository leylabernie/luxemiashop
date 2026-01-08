import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import ProductSearch from '@/components/search/ProductSearch';
import CartDrawer from '@/components/cart/CartDrawer';

const MobileBottomNav = () => {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalWishlistItems = wishlistItems.length;

  const navItems = [
    { 
      icon: Home, 
      label: 'Home', 
      href: '/',
      isActive: location.pathname === '/'
    },
    { 
      icon: Search, 
      label: 'Search', 
      onClick: () => setSearchOpen(true),
      isActive: false
    },
    { 
      icon: Heart, 
      label: 'Wishlist', 
      href: '/wishlist',
      badge: totalWishlistItems > 0 ? totalWishlistItems : undefined,
      isActive: location.pathname === '/wishlist'
    },
    { 
      icon: ShoppingBag, 
      label: 'Cart', 
      onClick: () => setCartOpen(true),
      badge: totalCartItems > 0 ? totalCartItems : undefined,
      isActive: false
    },
    { 
      icon: User, 
      label: 'Account', 
      href: '/account',
      isActive: location.pathname === '/account' || location.pathname === '/auth'
    },
  ];

  return (
    <>
      {/* Search Dialog */}
      <ProductSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      
      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      
      {/* Bottom Navigation Bar - Only visible on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                    "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    item.isActive && "text-primary"
                  )}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {item.badge && (
                      <Badge 
                        className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground"
                      >
                        {item.badge > 9 ? '9+' : item.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.href!}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  item.isActive && "text-primary"
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.badge && (
                    <Badge 
                      className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
