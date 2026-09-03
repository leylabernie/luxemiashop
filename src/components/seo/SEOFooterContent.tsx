import { Link } from 'react-router-dom';

const linkClass = 'text-foreground underline transition-colors hover:text-primary';

const SEOFooterContent = () => (
  <section className="border-t border-border/50 bg-secondary/30">
    <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-serif text-xl lg:text-2xl">Compare Current Indian Ethnic Wear Online</h2>
        <p className="mx-auto mt-5 max-w-3xl text-center text-sm font-light leading-7 text-muted-foreground">
          LuxeMia is an online-only store serving seven supported countries. Product availability, price,
          materials, included pieces, sizes and fulfillment can differ by listing and selected variant, so the
          exact product page is the source of truth before checkout.
        </p>

        <div className="mt-10 grid gap-8 text-sm font-light leading-7 text-muted-foreground md:grid-cols-2">
          <article>
            <h3 className="mb-3 font-serif text-lg text-foreground">Shop by Garment Type</h3>
            <p>
              Compare current <Link className={linkClass} to="/lehengas">lehenga listings</Link>,{' '}
              <Link className={linkClass} to="/sarees">saree listings</Link>,{' '}
              <Link className={linkClass} to="/suits">salwar kameez and suit listings</Link>, and{' '}
              <Link className={linkClass} to="/menswear">sherwani, kurta and menswear listings</Link>.
              Each collection helps narrow the catalog; it does not add a fabric, technique, included piece,
              fit, occasion or availability claim to an individual product.
            </p>
          </article>

          <article>
            <h3 className="mb-3 font-serif text-lg text-foreground">Sarees and Lehengas</h3>
            <p>
              Use the <Link className={linkClass} to="/collections/wedding-sarees">wedding saree collection</Link>,{' '}
              <Link className={linkClass} to="/collections/banarasi-sarees">Banarasi saree collection</Link>,{' '}
              <Link className={linkClass} to="/collections/bridal-lehengas">bridal lehenga collection</Link> or{' '}
              <Link className={linkClass} to="/collections/wedding-guest-lehengas">wedding-guest lehengas</Link> to
              compare current matches. Verify the exact fabric wording, work, blouse or choli information,
              dupatta or other included pieces, measurements, selected option and fulfillment on the listing.
            </p>
          </article>

          <article>
            <h3 className="mb-3 font-serif text-lg text-foreground">Suits, Indo-Western and Jewelry</h3>
            <p>
              Browse <Link className={linkClass} to="/collections/anarkali-suits">Anarkali suits</Link>,{' '}
              <Link className={linkClass} to="/collections/sharara-suits">sharara suits</Link>,{' '}
              <Link className={linkClass} to="/collections/palazzo-suits">palazzo suits</Link>,{' '}
              <Link className={linkClass} to="/indowestern">Indo-Western listings</Link>, and{' '}
              <Link className={linkClass} to="/jewelry">jewelry listings</Link>. Style labels are browsing aids;
              the selected product record controls its construction, materials, components and current options.
            </p>
          </article>

          <article>
            <h3 className="mb-3 font-serif text-lg text-foreground">Shop by Occasion</h3>
            <p>
              Start with the <Link className={linkClass} to="/festive-wear">festive-wear hub</Link>,{' '}
              <Link className={linkClass} to="/indian-wedding-guest-outfits">wedding-guest hub</Link>, or{' '}
              <Link className={linkClass} to="/wedding-events">Indian wedding-event hub</Link>. Follow the
              invitation and host guidance, then compare listing-specific details rather than treating a
              collection name as a universal dress rule or product-suitability promise. Inventory-backed paths
              include <Link className={linkClass} to="/collections/wedding-guest-kurta-sets">wedding-guest kurta sets</Link>,{' '}
              <Link className={linkClass} to="/collections/diwali-womenswear">Diwali womenswear</Link> and{' '}
              <Link className={linkClass} to="/collections/diwali-menswear">Diwali menswear</Link>.
            </p>
          </article>

          <article>
            <h3 className="mb-3 font-serif text-lg text-foreground">Groom and Wedding-Party Menswear</h3>
            <p>
              Compare <Link className={linkClass} to="/collections/sherwani-for-groom">groom sherwanis</Link> and{' '}
              <Link className={linkClass} to="/collections/groomsmen-outfits">groomsmen outfits</Link>, then verify
              every included garment, selected size, fulfillment classification and current availability on the
              exact product page. Group quantity and matching sizes require a current availability check.
            </p>
          </article>

          <article>
            <h3 className="mb-3 font-serif text-lg text-foreground">Compare Fulfillment</h3>
            <p>
              Use the <Link className={linkClass} to="/shop-by-fulfillment">fulfillment shopping guide</Link> to
              distinguish positively identified ready-to-ship products from made-to-order and expressly
              customizable products. Availability for sale alone does not prove ready-to-ship status, and
              processing remains separate from carrier transit.
            </p>
          </article>

          <article>
            <h3 className="mb-3 font-serif text-lg text-foreground">Shipping and Product Questions</h3>
            <p>
              Review <Link className={linkClass} to="/shipping">current destination rates</Link>,{' '}
              <Link className={linkClass} to="/returns">returns and covered order issues</Link>, and the{' '}
              <Link className={linkClass} to="/editorial-policy">product-fact policy</Link>. If an essential fact
              is absent, <Link className={linkClass} to="/contact">contact LuxeMia</Link> with the product link
              before ordering; missing optional facts are not guessed.
            </p>
          </article>
        </div>
      </div>
    </div>
  </section>
);

export default SEOFooterContent;
