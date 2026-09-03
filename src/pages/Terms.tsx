import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { RETURN_POLICY_SUMMARY } from '@/lib/returnPolicyCopy';

const Section = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => (
  <section id={id} className="scroll-mt-32 space-y-4">
    <h2 className="font-serif text-2xl text-foreground">{title}</h2>
    <div className="space-y-4 leading-7 text-muted-foreground">{children}</div>
  </section>
);

const Terms = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="Terms of Service — LuxeMia"
      description="LuxeMia terms for online orders, product information, fulfillment, shipping, cancellations, covered order issues and website use."
      canonical="https://luxemia.shop/terms"
      breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Terms of Service', url: '/terms' }]}
    />
    <Header />

    <main id="main-content" className="pb-16 pt-[90px] lg:pt-[132px]">
      <section className="bg-secondary/45 py-14 lg:py-20">
        <div className="container mx-auto max-w-4xl px-4 lg:px-8">
          <p className="text-sm uppercase tracking-luxury text-muted-foreground">Website and order terms</p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">Terms of Service</h1>
          <p className="mt-5 max-w-3xl leading-7 text-muted-foreground">Last updated: September 2, 2026. These terms apply to the LuxeMia online store at luxemia.shop. Read the product listing, checkout total, shipping policy and returns policy before placing an order.</p>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-4 py-12 lg:px-8">
        <nav aria-label="Terms sections" className="mb-12 grid gap-2 rounded-sm border border-border bg-card p-6 text-sm sm:grid-cols-2">
          {[
            ['agreement', '1. Agreement and eligibility'],
            ['products', '2. Product information'],
            ['orders', '3. Orders, price and payment'],
            ['fulfillment', '4. Fulfillment and customization'],
            ['shipping', '5. Shipping and delivery'],
            ['returns', '6. Cancellations and order issues'],
            ['accounts', '7. Accounts and acceptable use'],
            ['content', '8. Website content and third-party rights'],
            ['privacy', '9. Privacy'],
            ['availability', '10. Service availability and liability'],
            ['disputes', '11. Questions and disputes'],
            ['changes', '12. Changes and contact'],
          ].map(([id, label]) => <a className="underline-offset-4 hover:underline" href={`#${id}`} key={id}>{label}</a>)}
        </nav>

        <div className="space-y-12">
          <Section id="agreement" title="1. Agreement and eligibility">
            <p>By using this website or placing an order, you agree to these terms and the policies linked from them. If you do not agree, do not use the service or submit an order.</p>
            <p>You must have legal capacity to enter the transaction and provide accurate order, contact and delivery information. You may not use the site for unlawful activity, fraud, interference, scraping that disrupts service, or unauthorized access.</p>
          </Section>

          <Section id="products" title="2. Product information">
            <p>The exact product page is the source of truth for the item&apos;s stated materials, included pieces, stitching status, measurements, selectable variants, customization, price and current availability. Optional facts that are not shown should not be assumed.</p>
            <p>Photography, lighting and display settings can change apparent color or texture. Handmade or decorated items may have product-specific variation only where the listing says so. Contact support before ordering if a detail is essential.</p>
            <p>We may correct a genuine listing, price or inventory error. If a material error affects an order before fulfillment, LuxeMia will contact the customer about the available resolution.</p>
          </Section>

          <Section id="orders" title="3. Orders, price and payment">
            <p>Prices and shipping thresholds are stated in USD unless checkout expressly displays another currency. The cart and checkout show the amount submitted for the selected products, shipping destination and available payment method.</p>
            <p>An automated order message confirms receipt; it does not override availability, payment review or a genuine catalog error. LuxeMia may reject or cancel an order for unavailability, failed or reversed payment, suspected fraud, an invalid address, a genuine pricing error or another lawful reason. Any amount captured for a cancelled order will be handled through the original payment channel.</p>
            <p>Checkout and payment processing are provided through Shopify and the payment methods shown there. LuxeMia does not ask customers to send full card details through email, WhatsApp or the contact form.</p>
          </Section>

          <Section id="fulfillment" title="4. Fulfillment and customization">
            <p><strong className="text-foreground">Ready-to-ship</strong> means the catalog supplies an explicit ready-to-ship tag or positive ships-within value for the selected item; order processing still occurs before carrier transit. <strong className="text-foreground">Made-to-order</strong> means production begins after order confirmation. <strong className="text-foreground">Customizable</strong> means only the options expressly offered on the product page can be requested.</p>
            <p>Availability for sale does not by itself prove immediate dispatch. Processing and transit are separate. When an event date is important, review the selected product and contact support before checkout; an event date shared with support is not a delivery guarantee.</p>
            <p>For measurements or selected custom options, submit the information requested by the exact listing and check it carefully. A customer-provided measurement does not create an unstated alteration or fit guarantee. Rights for damage, defects, material misdescription, incorrect items or missing pieces remain governed by the returns policy and applicable law.</p>
          </Section>

          <Section id="shipping" title="5. Shipping and delivery">
            <p>LuxeMia currently ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa and Mauritius. Current rates, thresholds, processing distinctions, tracking guidance and destination-charge information are on the <Link className="text-primary underline underline-offset-4" to="/shipping">Shipping Policy</Link>. Checkout is the final source for the selected cart and address.</p>
            <p>Carrier transit begins after dispatch. Tracking-label creation is not the same as carrier acceptance or delivery. Customs, weather, address problems, carrier operations and other events outside reasonable control can affect timing. No delivery date is guaranteed unless checkout expressly sells that guarantee.</p>
          </Section>

          <Section id="returns" title="6. Cancellations and covered order issues">
            <p>{RETURN_POLICY_SUMMARY}</p>
            <p>Keep the item and available packaging while the request is reviewed, and do not send an item back without instructions. A cancellation request is not confirmed until LuxeMia accepts it; fulfillment may begin before a request is reviewed. Read the complete <Link className="text-primary underline underline-offset-4" to="/returns">Returns &amp; Cancellations Policy</Link>.</p>
            <p>Nothing in these terms limits a consumer right or remedy that cannot lawfully be excluded.</p>
          </Section>

          <Section id="accounts" title="7. Accounts and acceptable use">
            <p>If you create an account, keep its credentials confidential and tell support if you believe it has been used without authorization. LuxeMia may restrict activity that threatens customers, the site, payment integrity or lawful operation.</p>
            <p>Content submitted through a form must be accurate to the best of your knowledge and must not contain malicious code, unlawful material, another person&apos;s sensitive information without authority, harassment or spam.</p>
          </Section>

          <Section id="content" title="8. Website content and third-party rights">
            <p>LuxeMia&apos;s original site copy, branding and software are owned by or licensed to LuxeMia. Product photographs, marks, descriptions and designs may belong to suppliers, brands or other rights holders. These terms do not claim LuxeMia created or owns every product design shown on the site.</p>
            <p>You may use the site for personal shopping and may share ordinary page links. You may not falsely present LuxeMia content as your own, remove rights notices, impersonate LuxeMia or exploit protected content where permission is required.</p>
          </Section>

          <Section id="privacy" title="9. Privacy">
            <p>The <Link className="text-primary underline underline-offset-4" to="/privacy">Privacy Policy</Link> explains the information used for storefront operation, checkout, support, consultation requests, email, reviews and optional analytics. It also explains analytics choices and how to make a privacy request.</p>
          </Section>

          <Section id="availability" title="10. Service availability and liability">
            <p>The site may be unavailable during maintenance, provider incidents or events outside reasonable control. To the extent permitted by applicable law, LuxeMia is not responsible for indirect or consequential loss that was not reasonably foreseeable from a breach of these terms.</p>
            <p>Nothing here excludes liability or remedies that applicable law does not allow a business to exclude. Product remedies are also subject to the mandatory protections that apply to the customer and transaction.</p>
          </Section>

          <Section id="disputes" title="11. Questions and disputes">
            <p>Contact <a className="text-primary underline underline-offset-4" href="mailto:hello@luxemia.shop">hello@luxemia.shop</a> with the order number and relevant facts so the issue can be reviewed. These terms do not impose a private arbitration venue, class-action waiver or a jurisdiction that overrides rights and forums available under applicable law.</p>
          </Section>

          <Section id="changes" title="12. Changes and contact">
            <p>LuxeMia may update these terms when the service, providers, policies or legal requirements change. The page shows its current review date; changes apply prospectively from publication unless applicable law requires otherwise.</p>
            <p>LuxeMia is an online-only store. Contact <a className="text-primary underline underline-offset-4" href="mailto:hello@luxemia.shop">hello@luxemia.shop</a>, call <a className="text-primary underline underline-offset-4" href="tel:+12153419990">+1 215-341-9990</a>, or use the <Link className="text-primary underline underline-offset-4" to="/contact">contact page</Link>. Response times vary. Review the <Link className="text-primary underline underline-offset-4" to="/editorial-policy">editorial policy</Link> and <Link className="text-primary underline underline-offset-4" to="/review-policy">review program</Link> for those separate standards.</p>
          </Section>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default Terms;
