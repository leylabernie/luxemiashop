import { Link } from "react-router-dom";

/**
 * Site-wide contextual internal-link block.
 *
 * Renders a 3-column footer of contextual links on every page where it's
 * mounted. Purpose:
 *
 *   1. Distribute PageRank from indexed pages to unindexed / weakly-indexed
 *      pages (fixes "Crawled — currently not indexed" by giving Google a
 *      clear internal-link signal that the target URL is canonical and
 *      important).
 *   2. Guarantee every page has at least N outbound internal links to
 *      category, occasion, and info pages — prevents thin-internal-link
 *      signals that can trigger soft-404 / "low value" deindexation.
 *   3. Improve crawl coverage by giving Googlebot a static, predictable
 *      link map of the entire site from every page.
 *
 * Mount once in the layout (above the Footer) so it appears on every
 * indexed route. The component is server-rendered (no client-only state)
 * so the prerendered HTML at /_prerender/*.html will include these links
 * for crawler discovery.
 */

interface LinkItem {
  to: string;
  label: string;
}

const SHOP_LINKS: LinkItem[] = [
  { to: "/lehengas", label: "Bridal & Wedding Lehengas" },
  { to: "/sarees", label: "Silk & Wedding Sarees" },
  { to: "/suits", label: "Salwar Kameez & Anarkali Suits" },
  { to: "/menswear", label: "Sherwanis & Kurta Pajama" },
  { to: "/indowestern", label: "Indo-Western Outfits" },
  { to: "/new-arrivals", label: "New Arrivals" },
  { to: "/bestsellers", label: "Bestsellers" },
  { to: "/collections", label: "All Collections" },
];

const OCCASION_LINKS: LinkItem[] = [
  { to: "/collections/diwali-outfits", label: "Diwali Outfits" },
  { to: "/collections/wedding-guest-outfits", label: "Wedding Guest Outfits" },
  { to: "/collections/mehendi-outfits", label: "Mehendi Ceremony Outfits" },
  { to: "/collections/eid-outfits", label: "Eid Outfits" },
  { to: "/collections/navratri-outfits", label: "Navratri & Garba Outfits" },
  { to: "/nri", label: "NRI Shopping Hub" },
  { to: "/nri/usa", label: "Indian Ethnic Wear — USA" },
  { to: "/nri/canada", label: "Indian Ethnic Wear — Canada" },
];

const INFO_LINKS: LinkItem[] = [
  { to: "/blog", label: "Indian Fashion Blog" },
  { to: "/brand-story", label: "Our Story" },
  { to: "/size-guide", label: "Size Guide" },
  { to: "/care-guide", label: "Garment Care Guide" },
  { to: "/shipping", label: "Shipping Policy" },
  { to: "/returns", label: "Returns & Cancellations" },
  { to: "/faq", label: "Frequently Asked Questions" },
  { to: "/contact", label: "Contact Us" },
  { to: "/style-consultation", label: "Book a Styling Consultation" },
  { to: "/style-quiz", label: "Find Your Style — Quiz" },
];

const InternalLinkBlock = () => {
  return (
    <section
      aria-label="Explore LuxeMia"
      className="border-t border-border bg-background/50"
    >
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <h2 className="text-xs tracking-luxury uppercase mb-8 text-center text-muted-foreground font-medium">
          Explore LuxeMia
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Shop by Category */}
          <nav aria-label="Shop by Category">
            <h3 className="text-sm font-serif font-semibold mb-4 text-foreground">
              Shop by Category
            </h3>
            <ul className="space-y-2">
              {SHOP_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Shop by Occasion */}
          <nav aria-label="Shop by Occasion">
            <h3 className="text-sm font-serif font-semibold mb-4 text-foreground">
              Shop by Occasion
            </h3>
            <ul className="space-y-2">
              {OCCASION_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Help & Information */}
          <nav aria-label="Help and Information">
            <h3 className="text-sm font-serif font-semibold mb-4 text-foreground">
              Help & Information
            </h3>
            <ul className="space-y-2">
              {INFO_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default InternalLinkBlock;
