import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import SEOHead from "@/components/seo/SEOHead";

/**
 * 404 page — designed to:
 *   1. Stay indexable-but-deindexed (noIndex) so Google doesn't index "404" pages
 *   2. Provide real content (not a thin "Page Not Found" stub) so any 404 that
 *      leaks through doesn't trip Google's soft-404 heuristic
 *   3. Smart-suggest relevant destinations based on the broken URL's keywords
 *   4. Log every 404 hit to GA4 so we can monitor broken-link sources over time
 *      and proactively fix internal links pointing to retired URLs
 */
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Log 404s to GA4 for monitoring broken-link sources
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_404', {
        page_path: location.pathname,
        page_referrer: document.referrer,
        page_title: '404 — Page Not Found',
      });
    }
    // Also log to console for dev visibility
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Suggest relevant pages based on keywords in the broken URL
  const path = location.pathname.toLowerCase();
  const suggestions: { label: string; to: string }[] = [];
  if (path.includes('lehenga')) suggestions.push({ label: 'Shop Lehengas', to: '/lehengas' });
  if (path.includes('saree') || path.includes('sari')) suggestions.push({ label: 'Shop Sarees', to: '/sarees' });
  if (path.includes('suit') || path.includes('salwar') || path.includes('anarkali') || path.includes('sharara') || path.includes('palazzo'))
    suggestions.push({ label: 'Shop Suits', to: '/suits' });
  if (path.includes('men') || path.includes('sherwani') || path.includes('kurta') || path.includes('groom'))
    suggestions.push({ label: 'Shop Menswear', to: '/menswear' });
  if (path.includes('indowestern') || path.includes('indo-western') || path.includes('fusion'))
    suggestions.push({ label: 'Shop Indo-Western', to: '/indowestern' });
  if (path.includes('diwali')) suggestions.push({ label: 'Diwali Outfits', to: '/collections/diwali-outfits' });
  if (path.includes('wedding') && path.includes('guest')) suggestions.push({ label: 'Wedding Guest Outfits', to: '/collections/wedding-guest-outfits' });
  if (path.includes('mehendi') || path.includes('mehndi')) suggestions.push({ label: 'Mehendi Outfits', to: '/collections/mehendi-outfits' });
  if (path.includes('eid')) suggestions.push({ label: 'Eid Outfits', to: '/collections/eid-outfits' });
  if (path.includes('navratri') || path.includes('garba')) suggestions.push({ label: 'Navratri Outfits', to: '/collections/navratri-outfits' });
  if (path.includes('blog')) suggestions.push({ label: 'Read the Blog', to: '/blog' });
  if (path.includes('nri') || path.includes('usa') || path.includes('canada') || path.includes('uk'))
    suggestions.push({ label: 'NRI Shopping Hub', to: '/nri' });

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-16">
      <SEOHead
        title="Page Not Found — LuxeMia"
        description="The page you're looking for has moved or no longer exists. Explore LuxeMia's bridal lehengas, silk sarees, salwar suits, sherwanis and indo-western outfits."
        noIndex
      />
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-6xl md:text-7xl font-serif font-bold mb-4 text-foreground">404</h1>
        <p className="text-xl md:text-2xl text-foreground mb-3 font-serif">
          We can't find that page
        </p>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          The URL may have been renamed, moved, or retired. We've logged this error
          and will fix any broken internal links. In the meantime, try one of these
          popular destinations:
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <Link to="/" className="px-5 py-2.5 border border-border rounded-md hover:bg-accent transition-colors text-sm font-medium">
            Home
          </Link>
          <Link to="/collections" className="px-5 py-2.5 border border-border rounded-md hover:bg-accent transition-colors text-sm font-medium">
            All Collections
          </Link>
          <Link to="/lehengas" className="px-5 py-2.5 border border-border rounded-md hover:bg-accent transition-colors text-sm font-medium">
            Lehengas
          </Link>
          <Link to="/sarees" className="px-5 py-2.5 border border-border rounded-md hover:bg-accent transition-colors text-sm font-medium">
            Sarees
          </Link>
          <Link to="/suits" className="px-5 py-2.5 border border-border rounded-md hover:bg-accent transition-colors text-sm font-medium">
            Suits
          </Link>
          <Link to="/menswear" className="px-5 py-2.5 border border-border rounded-md hover:bg-accent transition-colors text-sm font-medium">
            Menswear
          </Link>
          <Link to="/blog" className="px-5 py-2.5 border border-border rounded-md hover:bg-accent transition-colors text-sm font-medium">
            Blog
          </Link>
        </div>

        {/* Smart suggestions based on the broken URL */}
        {suggestions.length > 0 && (
          <div className="border-t border-border pt-8 mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Based on the URL you tried, you might be looking for:
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {suggestions.map(s => (
                <Link
                  key={s.to}
                  to={s.to}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-sm font-medium"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Contact fallback */}
        <div className="border-t border-border pt-8 mt-8 text-xs text-muted-foreground">
          <p className="mb-2">Still can't find what you're looking for?</p>
          <p>
            Email{" "}
            <a href="mailto:hello@luxemia.shop" className="underline hover:text-foreground">
              hello@luxemia.shop
            </a>{" "}
            · Call{" "}
            <a href="tel:+1-215-341-9990" className="underline hover:text-foreground">
              +1-215-341-9990
            </a>{" "}
            · WhatsApp anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
