import { forwardRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, Clock, Shield, Lock, CreditCard, Truck, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Google Customer Reviews badge — loads the merchant widget script and renders
// the badge showing our seller rating. Positioned in the footer so it appears
// on every page. Shows "no rating available" until we collect enough reviews.
declare global {
  interface Window {
    merchantwidget?: {
      start: (config: { merchant_id: number; position?: string; region?: string }) => void;
    };
  }
}

const footerLinks = {
  shop: [
    { name: 'New Arrivals', href: '/new-arrivals' },
    { name: 'Bestsellers', href: '/bestsellers' },
    { name: 'Sarees', href: '/sarees' },
    { name: 'Lehengas', href: '/lehengas' },
    { name: 'Suits', href: '/suits' },
    { name: 'Indo-Western', href: '/indowestern' },
    { name: 'Menswear', href: '/menswear' },
  ],
  collections: [
    { name: 'Bridal Lehengas', href: '/lehengas?sub=bridal' },
    { name: 'Wedding Sarees', href: '/sarees?sub=bridal' },
    { name: 'Indo-Western', href: '/indowestern' },
    { name: 'Festive Wear', href: '/collections' },
    { name: 'Ready to Ship', href: '/ready-to-ship' },
    { name: 'Jewelry', href: '/jewelry' },
  ],
  about: [
    { name: 'Our Story', href: '/brand-story' },
    { name: 'Style Quiz', href: '/style-quiz' },
    { name: 'Our Regions', href: '/artisans' },
    { name: 'Blog', href: '/blog' },
    { name: 'Press', href: '/press' },
  ],
  help: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns & Cancellations', href: '/returns' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'Care Guide', href: '/care-guide' },
    { name: 'Style Consultation', href: '/style-consultation' },
  ],
};

const Footer = forwardRef<HTMLElement>((_props, ref) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setNewsletterSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('submit-email', {
        body: { email: newsletterEmail, type: 'newsletter', source: 'footer' },
      });
      if (error) throw error;
      setNewsletterSubmitted(true);
      toast.success('You\'re on the list!', {
        description: 'We\'ll send you new arrivals and exclusive offers.',
      });
    } catch {
      toast.error('Something went wrong', {
        description: 'Please try again or contact us directly.',
      });
    } finally {
      setNewsletterSubmitting(false);
    }
  };
  // Google Customer Reviews badge — load script and render badge
  useEffect(() => {
    // Skip if script already loaded (e.g., on client-side navigation)
    if (document.querySelector('script[src*="merchantwidget.js"]')) {
      return;
    }
    const script = document.createElement('script');
    script.id = 'merchantWidgetScript';
    script.src = 'https://www.gstatic.com/shopping/merchant/merchantwidget.js';
    script.defer = true;
    script.addEventListener('load', () => {
      if (window.merchantwidget) {
        window.merchantwidget.start({
          merchant_id: 5773333098,
          position: 'BOTTOM_LEFT',
        });
      }
    });
    document.body.appendChild(script);
  }, []);

  return (
    <footer ref={ref} className="bg-card border-t border-border/50">
      {/* ─── Newsletter Section ─────────────────────────────────────────── */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-serif text-2xl lg:text-3xl mb-3">
              Join Our World
            </h3>
            <p className="text-foreground/60 text-sm mb-6 font-light">
              Be the first to discover new collections, exclusive offers, and styling inspiration.
            </p>
            {newsletterSubmitted ? (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-green-700 dark:text-green-400">
                <Check className="h-4 w-4" />
                <span>Thank you! You\'re on the list.</span>
              </div>
            ) : (
              <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 bg-background border border-border/50 px-4 py-3 text-base sm:text-sm focus:outline-none focus:border-foreground transition-colors font-light placeholder:text-foreground/40 rounded-md"
                />
                <button
                  type="submit"
                  disabled={newsletterSubmitting}
                  className="bg-foreground text-background px-8 py-3 text-sm tracking-editorial uppercase hover:bg-foreground/90 transition-colors rounded-md whitespace-nowrap disabled:opacity-50"
                >
                  {newsletterSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ─── Main Links Section ─────────────────────────────────────────── */}
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10">

          {/* Brand Column — spans 2 cols on all screens for breathing room */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <Link to="/" className="font-serif text-2xl">
              LuxeMia
            </Link>
            <p className="mt-4 text-sm text-foreground/60 font-light leading-relaxed max-w-xs">
              Beautiful Indian ethnic wear at fair prices — shipped worldwide to USA, Canada & Australia.
            </p>
            {/* Social icons */}
            <div className="flex gap-3 mt-6">
              <a href="https://www.instagram.com/luxemiashop" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-background hover:bg-primary/10 rounded-full transition-colors" aria-label="Follow us on Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/LuxeMia" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-background hover:bg-primary/10 rounded-full transition-colors" aria-label="Follow us on Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.pinterest.com/luxemiashop" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-background hover:bg-primary/10 rounded-full transition-colors" aria-label="Follow us on Pinterest">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@shopluxemia" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-background hover:bg-primary/10 rounded-full transition-colors" aria-label="Follow us on TikTok">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/>
                </svg>
              </a>
            </div>
            {/* Contact info — consolidated here, removed from separate column */}
            <div className="mt-6 space-y-2 text-sm text-foreground/60 font-light">
              <a href="tel:+1-215-341-9990" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" />
                +1-215-341-9990
              </a>
              <a href="mailto:hello@luxemia.shop" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />
                hello@luxemia.shop
              </a>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Mon-Sat 10am-7pm EST<br />Sun 11am-5pm EST</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-xs tracking-luxury uppercase mb-4 font-medium">Shop</h4>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-foreground/60 hover:text-foreground transition-colors font-light">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections Links */}
          <div>
            <h4 className="text-xs tracking-luxury uppercase mb-4 font-medium">Collections</h4>
            <ul className="space-y-2.5">
              {footerLinks.collections.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-foreground/60 hover:text-foreground transition-colors font-light">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h4 className="text-xs tracking-luxury uppercase mb-4 font-medium">About</h4>
            <ul className="space-y-2.5">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-foreground/60 hover:text-foreground transition-colors font-light">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="text-xs tracking-luxury uppercase mb-4 font-medium">Help</h4>
            <ul className="space-y-2.5">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-foreground/60 hover:text-foreground transition-colors font-light">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ─── Trust Badges Bar ───────────────────────────────────────────── */}
      <div className="border-t border-border/50 bg-background/50">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <Lock className="h-5 w-5 text-foreground/50" />
              <span className="text-xs font-medium">SSL Secure Checkout</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Shield className="h-5 w-5 text-foreground/50" />
              <span className="text-xs font-medium">Quality Guaranteed</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Truck className="h-5 w-5 text-foreground/50" />
              <span className="text-xs font-medium">Tracked Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <CreditCard className="h-5 w-5 text-foreground/50" />
              <span className="text-xs font-medium">Safe Payments</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Bar — copyright + legal links + business info ──────── */}
      <div className="border-t border-border/50 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          {/* Legal links — top row */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-foreground/60 mb-4">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <span className="text-foreground/20">·</span>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <span className="text-foreground/20">·</span>
            <Link to="/returns" className="hover:text-foreground transition-colors">Returns & Cancellations</Link>
            <span className="text-foreground/20">·</span>
            <Link to="/shipping" className="hover:text-foreground transition-colors">Shipping Info</Link>
            <span className="text-foreground/20">·</span>
            <Link to="/pages/shipping-customs" className="hover:text-foreground transition-colors">Shipping & Customs</Link>
          </div>

          {/* Copyright + business info — bottom row, centered */}
          <div className="text-center text-xs text-foreground/50 space-y-1">
            <p>© 2026 LuxeMia. All rights reserved.</p>
            <p>
              luxemia.shop is owned and operated by <strong className="text-foreground/70">Glamour Indian Wear</strong>
              {' '}&middot;{' '}
              USA-based support
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
