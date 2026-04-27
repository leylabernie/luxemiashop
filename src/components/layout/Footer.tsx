import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Mail, Phone, Clock, Twitter, Linkedin } from 'lucide-react';

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
    { name: 'Bridal Lehengas', href: '/lehengas' },
    { name: 'Wedding Sarees', href: '/sarees' },
    { name: 'Indo-Western', href: '/indowestern' },
    { name: 'Festive Wear', href: '/collections' },
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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-serif text-2xl">
              LuxeMia
            </Link>
            <p className="mt-4 text-sm text-foreground/60 font-light leading-relaxed">
              Beautiful Indian ethnic wear at fair prices — shipped worldwide.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="https://www.instagram.com/luxemiashop" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-background hover:bg-primary/10 rounded-full transition-colors" aria-label="Follow us on Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/luxemiashop" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-background hover:bg-primary/10 rounded-full transition-colors" aria-label="Follow us on Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.youtube.com/@luxemiashop" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-background hover:bg-primary/10 rounded-full transition-colors" aria-label="Subscribe on YouTube">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://twitter.com/luxemia" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-background hover:bg-primary/10 rounded-full transition-colors" aria-label="Follow us on Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://www.pinterest.com/luxemiashop" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-background hover:bg-primary/10 rounded-full transition-colors" aria-label="Follow us on Pinterest">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
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

          {/* Collections Links */}
          <div>
            <h4 className="text-xs tracking-luxury uppercase mb-4 font-medium">Collections</h4>
            <ul className="space-y-3">
              {footerLinks.collections.map((link) => (
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
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-foreground/60 flex-shrink-0" />
                <a href="tel:+1-215-341-9990" className="text-sm text-foreground/60 hover:text-foreground transition-colors font-light">
                  +1-215-341-9990
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
                  Mon - Sat: 10am - 7pm EST<br />
                  Sun: 11am - 5pm EST
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
            <div className="flex flex-wrap gap-5">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="/returns" className="hover:text-foreground transition-colors">Returns & Cancellations</Link>
              <Link to="/shipping" className="hover:text-foreground transition-colors">Shipping Info</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
