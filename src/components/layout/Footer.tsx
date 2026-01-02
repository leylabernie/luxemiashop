import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Mail, MapPin, Phone, Clock } from 'lucide-react';

const footerLinks = {
  shop: [
    { name: 'New Arrivals', href: '/new-arrivals' },
    { name: 'Sarees', href: '/sarees' },
    { name: 'Lehengas', href: '/lehengas' },
    { name: 'Suits', href: '/suits' },
    { name: 'Menswear', href: '/menswear' },
  ],
  about: [
    { name: 'Our Story', href: '/brand-story' },
    { name: 'Artisans', href: '/artisans' },
    { name: 'Sustainability', href: '/sustainability' },
    { name: 'Press', href: '/press' },
  ],
  help: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Shipping', href: '/shipping' },
    { name: 'Returns', href: '/returns' },
    { name: 'Size Guide', href: '/size-guide' },
  ],
};

const Footer = forwardRef<HTMLElement>((props, ref) => {
  return (
    <footer ref={ref} className="bg-card border-t border-border/50">
      {/* Newsletter Section */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-serif text-2xl lg:text-3xl mb-3">
              Join Our World
            </h3>
            <p className="text-foreground/60 text-sm mb-6 font-light">
              Be the first to discover new collections, exclusive offers, and styling inspiration.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-background border border-border/50 px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors font-light placeholder:text-foreground/40"
              />
              <button
                type="submit"
                className="bg-foreground text-background px-8 py-3 text-sm tracking-editorial uppercase hover:bg-foreground/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links Section */}
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-serif text-2xl">
              LuxeMia
            </Link>
            <p className="mt-4 text-sm text-foreground/60 font-light leading-relaxed">
              Celebrating the artistry of Indian craftsmanship through timeless ethnic wear.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-background rounded-full transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-background rounded-full transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-background rounded-full transition-colors" aria-label="Youtube">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="mailto:hello@luxemia.com" className="p-2 hover:bg-background rounded-full transition-colors" aria-label="Email">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-xs tracking-luxury uppercase mb-4 font-medium">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-foreground/60 hover:text-foreground transition-colors font-light"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h4 className="text-xs tracking-luxury uppercase mb-4 font-medium">About</h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-foreground/60 hover:text-foreground transition-colors font-light"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="text-xs tracking-luxury uppercase mb-4 font-medium">Help</h4>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-foreground/60 hover:text-foreground transition-colors font-light"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xs tracking-luxury uppercase mb-4 font-medium">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-foreground/60 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground/60 font-light leading-relaxed">
                  123 Fashion District<br />
                  Mumbai, MH 400001<br />
                  India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-foreground/60 flex-shrink-0" />
                <a href="tel:+911234567890" className="text-sm text-foreground/60 hover:text-foreground transition-colors font-light">
                  +91 123 456 7890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-foreground/60 flex-shrink-0" />
                <a href="mailto:hello@luxemia.com" className="text-sm text-foreground/60 hover:text-foreground transition-colors font-light">
                  hello@luxemia.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-foreground/60 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground/60 font-light leading-relaxed">
                  Mon - Sat: 10am - 7pm<br />
                  Sun: 11am - 5pm
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-foreground/50">
            <p>© 2026 LuxeMia. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
