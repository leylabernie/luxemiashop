import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { openAnalyticsConsentSettings } from '@/lib/analyticsConsent';

const PolicySection = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => (
  <section id={id} className="scroll-mt-32 space-y-4">
    <h2 className="font-serif text-2xl text-foreground">{title}</h2>
    <div className="space-y-4 leading-7 text-muted-foreground">{children}</div>
  </section>
);

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="Privacy Policy — LuxeMia"
      description="How LuxeMia handles storefront, checkout, support, consultation, email, review-program and optional analytics information, including analytics choices."
      canonical="https://luxemia.shop/privacy"
      breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Privacy Policy', url: '/privacy' }]}
    />
    <Header />

    <main id="main-content" className="pb-16 pt-[90px] lg:pt-[132px]">
      <section className="bg-secondary/45 py-14 lg:py-20">
        <div className="container mx-auto max-w-4xl px-4 lg:px-8">
          <p className="text-sm uppercase tracking-luxury text-muted-foreground">Information and choices</p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">Privacy Policy</h1>
          <p className="mt-5 max-w-3xl leading-7 text-muted-foreground">Last reviewed: September 2, 2026. This notice describes the information flows currently used at luxemia.shop. Merely using the site is not consent to optional analytics; Google Analytics remains off unless you accept it.</p>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-4 py-12 lg:px-8">
        <nav aria-label="Privacy policy sections" className="mb-12 grid gap-2 rounded-sm border border-border bg-card p-6 text-sm sm:grid-cols-2">
          {[
            ['collection', '1. Information handled'],
            ['purposes', '2. Why it is used'],
            ['providers', '3. Providers and recipients'],
            ['analytics', '4. Analytics choice and storage'],
            ['reviews', '5. Google Customer Reviews'],
            ['legal-bases', '6. Legal bases'],
            ['retention', '7. Retention'],
            ['rights', '8. Privacy requests'],
            ['transfers', '9. International processing'],
            ['security', '10. Security and children'],
            ['changes', '11. Changes and contact'],
          ].map(([id, label]) => <a key={id} href={`#${id}`} className="underline-offset-4 hover:underline">{label}</a>)}
        </nav>

        <div className="space-y-12">
          <PolicySection id="collection" title="1. Information LuxeMia handles">
            <ul className="list-disc space-y-2 pl-6">
              <li><strong className="text-foreground">Store and order information:</strong> products and variants, cart contents, checkout and order identifiers, price, shipping destination, name, email, phone, delivery address, payment status and fulfillment or tracking information. Full payment-card details are entered with the checkout/payment provider and are not collected through LuxeMia contact forms.</li>
              <li><strong className="text-foreground">Account and preference information:</strong> account identifiers, wishlist or cart state, selected currency or storefront preferences where used, and the analytics choice stored in the browser.</li>
              <li><strong className="text-foreground">Support and consultation information:</strong> name, email, phone or WhatsApp number, country, event or preferred date, role, group size, budget, measurements, requested options and free-text requirements submitted through contact, customization or wedding-party forms.</li>
              <li><strong className="text-foreground">Order-issue evidence:</strong> messages and any photos, packaging images or unboxing/opening video that a customer chooses to provide for damage, defects, material misdescription, an incorrect item or missing pieces.</li>
              <li><strong className="text-foreground">Newsletter information:</strong> the submitted email address, subscription status and basic anti-abuse records.</li>
              <li><strong className="text-foreground">Technical and security information:</strong> IP address, request time, route, browser or device information made available in ordinary hosting and function logs, plus rate-limit and blocked-request records used to protect forms.</li>
              <li><strong className="text-foreground">Optional analytics information:</strong> only after acceptance, a sanitized page URL without customer query parameters, referrer origin, browser/device context and storefront interactions such as page views, searches, item views and cart events. Free-form customer messages and contact details are not intended analytics fields.</li>
            </ul>
          </PolicySection>

          <PolicySection id="purposes" title="2. Why the information is used">
            <p>LuxeMia uses the information to operate the storefront and cart, send a shopper to Shopify checkout, process and fulfill an order, provide tracking, answer questions, review consultations or group-order requests, investigate covered order issues, maintain newsletter choices, prevent abuse and fraud, comply with lawful obligations, and keep records needed for the transaction.</p>
            <p>Optional Google Analytics is used to understand aggregate storefront use and improve navigation or merchandising only after acceptance. The current analytics configuration denies ad storage, ad user data, ad personalization and Google signals.</p>
          </PolicySection>

          <PolicySection id="providers" title="3. Providers and recipients">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead><tr><th className="border border-border p-3">Provider or recipient</th><th className="border border-border p-3">Current role and information</th></tr></thead>
                <tbody>
                  <tr><td className="border border-border p-3 font-medium text-foreground">Shopify and checkout/payment providers</td><td className="border border-border p-3">Storefront commerce data, cart and checkout, order, payment-status and shipping information. Payment methods and their provider are shown at checkout. See <a className="text-primary underline" href="https://www.shopify.com/legal/privacy" target="_blank" rel="noopener noreferrer">Shopify&apos;s privacy notice</a>.</td></tr>
                  <tr><td className="border border-border p-3 font-medium text-foreground">Supabase</td><td className="border border-border p-3">Database and Edge Function processing for contact/consultation leads, newsletter records, application data and anti-abuse controls. Public forms submit through a validated Edge Function; browser database roles are not permitted to read or write consultation-lead records directly.</td></tr>
                  <tr><td className="border border-border p-3 font-medium text-foreground">Resend</td><td className="border border-border p-3">Email delivery for operational notifications generated from consultation/contact requests when that service is configured.</td></tr>
                  <tr><td className="border border-border p-3 font-medium text-foreground">Vercel</td><td className="border border-border p-3">Website hosting, content delivery, security and ordinary request/deployment logs.</td></tr>
                  <tr><td className="border border-border p-3 font-medium text-foreground">Carriers and logistics providers</td><td className="border border-border p-3">Recipient name, delivery address, phone, parcel and customs information needed for the selected shipment.</td></tr>
                  <tr><td className="border border-border p-3 font-medium text-foreground">WhatsApp</td><td className="border border-border p-3">If a shopper chooses the WhatsApp link or number, Meta/WhatsApp processes that conversation under its own terms. Do not send card details through WhatsApp.</td></tr>
                  <tr><td className="border border-border p-3 font-medium text-foreground">Google</td><td className="border border-border p-3">Optional Google Analytics after consent, plus any future Customer Reviews badge or survey processing only under the verified conditions described below.</td></tr>
                  <tr><td className="border border-border p-3 font-medium text-foreground">Authorities or transaction advisers</td><td className="border border-border p-3">Information may be disclosed where lawfully required, to protect customers or the service, or as part of a genuine business transaction subject to appropriate handling.</td></tr>
                </tbody>
              </table>
            </div>
            <p>LuxeMia does not knowingly exchange customer contact or consultation records for money. Applicable law may define “sale” or “sharing” more broadly; a customer can contact LuxeMia about a location-specific right.</p>
          </PolicySection>

          <PolicySection id="analytics" title="4. Analytics choice, cookies and local storage">
            <p>Essential browser storage supports functions such as cart, wishlist, account session, interface preferences, form-abuse prevention and the saved analytics choice. Blocking essential storage can affect those features.</p>
            <p>Google Analytics does not load from LuxeMia&apos;s initial HTML and remains disabled when no choice exists or when analytics is declined. If accepted, Google&apos;s tag and analytics cookies such as <code>_ga</code> or <code>_ga_*</code> may be used. Declining or later withdrawing analytics disables the tag and attempts to remove LuxeMia-domain Google Analytics cookies. A browser or Google may retain information already processed before withdrawal as allowed by its settings and law.</p>
            <div id="cookie-settings" className="rounded-sm border border-border bg-card p-5">
              <p className="font-medium text-foreground">Your choice is available at any time.</p>
              <p className="mt-2 text-sm">Use the footer&apos;s “Cookie Settings” control or open the panel here. Accept and decline are both available; declining does not disable checkout or support forms.</p>
              <button type="button" onClick={openAnalyticsConsentSettings} className="mt-4 min-h-11 rounded-md border border-foreground px-5 py-2.5 text-sm font-medium text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">Open analytics settings</button>
            </div>
          </PolicySection>

          <PolicySection id="reviews" title="5. Google Customer Reviews">
            <p>LuxeMia does not operate or seed a separate on-site customer-review feed. The storefront does not currently request Google&apos;s Customer Reviews rating-badge script. A badge-script request is not a claim that program enrollment, survey eligibility or a seller rating is currently active. A badge must not be enabled until program status is verified and its third-party data flow is covered by a specific, informed choice.</p>
            <p>The public LuxeMia return page does not trust order identifiers, email addresses, totals, countries or delivery dates supplied in its URL and does not send those values to Google or record a purchase from them. A Customer Reviews survey may be enabled only within Shopify&apos;s protected post-purchase context when every required order field and an evidence-based delivery estimate are verified. If a required value is unavailable or cannot be verified, the survey must not render.</p>
            <p>If a survey is later verified and enabled, Google controls its optional survey, content rules, privacy handling and any aggregate rating. LuxeMia does not create, seed or rewrite those reviews. See the <Link className="text-primary underline" to="/review-policy">customer review safeguards page</Link> for the storefront explanation.</p>
          </PolicySection>

          <PolicySection id="legal-bases" title="6. Legal bases where they apply">
            <p>Depending on the customer&apos;s location and the activity, processing may be needed to take steps requested before a purchase or perform the order contract; based on consent for optional analytics or marketing email; necessary for legitimate interests such as form security, fraud prevention, service integrity and responding to inquiries; or required to meet a legal obligation.</p>
            <p>LuxeMia does not rely on legitimate interests to turn on Google Analytics. Analytics requires the explicit choice described above. Consent can be withdrawn for future processing without affecting processing that was lawful before withdrawal.</p>
          </PolicySection>

          <PolicySection id="retention" title="7. Retention and deletion">
            <p>Records are kept only as long as reasonably needed for the purpose, dispute or fraud prevention, provider operation and applicable legal, tax, accounting or customs requirements. Different systems and record types therefore have different periods; LuxeMia does not promise a single fixed period for all data.</p>
            <p>Order and transaction records may need to remain after an account or marketing request is closed. Consultation/contact records and supplied evidence are reviewed for operational need and can be requested for deletion, subject to a continuing order, dispute, security record or legal requirement. Newsletter records retain the subscription or suppression status needed to honor the choice. Provider backups and logs expire under provider configuration and operational cycles.</p>
          </PolicySection>

          <PolicySection id="rights" title="8. Privacy requests and choices">
            <p>Depending on location, a person may have rights to request access, correction, deletion, portability or restriction; object to certain processing; withdraw consent; opt out of direct marketing; or appeal or complain to an applicable regulator. These rights have legal conditions and exceptions.</p>
            <p>Email <a className="text-primary underline" href="mailto:hello@luxemia.shop">hello@luxemia.shop</a> with “Privacy request” and enough information to identify the relevant interaction. LuxeMia may ask for proportionate verification and will respond within the period required by applicable law; this policy does not promise a shorter universal deadline.</p>
            <p>Marketing email can also be stopped through the unsubscribe control where provided. Analytics can be changed immediately through Cookie Settings.</p>
          </PolicySection>

          <PolicySection id="transfers" title="9. International processing">
            <p>LuxeMia serves seven countries and uses providers that can process information in the United States and other locations where they operate. An order may also require cross-border carrier and customs processing. Laws in those places can differ from the customer&apos;s home jurisdiction.</p>
            <p>Provider contracts, configurations and legal transfer mechanisms are handled according to the parties&apos; roles and applicable requirements. LuxeMia does not claim that one particular transfer mechanism applies to every provider or transaction.</p>
          </PolicySection>

          <PolicySection id="security" title="10. Security and children">
            <p>The storefront uses HTTPS, and payment-card entry occurs through Shopify-hosted checkout rather than the LuxeMia contact or consultation forms. LuxeMia and its providers use access, abuse-prevention and service-security measures appropriate to their roles. No internet transmission or storage system is completely secure, and this notice does not guarantee that an incident cannot occur.</p>
            <p>The storefront is intended for adult shoppers and is not directed to children. If a parent or guardian believes a child submitted personal information, contact LuxeMia so the request can be reviewed.</p>
          </PolicySection>

          <PolicySection id="changes" title="11. Changes and contact">
            <p>This page is updated when material information practices or providers change. The current review date appears at the top.</p>
            <div className="rounded-sm border border-border bg-card p-5">
              <p className="font-medium text-foreground">LuxeMia — online customer support</p>
              <p>Email: <a className="text-primary underline" href="mailto:hello@luxemia.shop">hello@luxemia.shop</a></p>
              <p>Phone: <a className="text-primary underline" href="tel:+12153419990">+1 215-341-9990</a></p>
              <p>WhatsApp: <a className="text-primary underline" href="https://wa.me/12153419990" target="_blank" rel="noopener noreferrer">+1 215-341-9990</a></p>
            </div>
          </PolicySection>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default Privacy;
