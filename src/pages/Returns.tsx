import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Phone, Mail, Scissors, ShieldCheck, Truck, Clock } from 'lucide-react';

const Returns = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Returns, Exchanges & Refunds | LuxeMia — Mini's Honest Policy"
        description="LuxeMia's returns policy, written by Mini. Items ship from India so change-of-mind returns aren't possible — but if something arrives wrong, damaged, or misdescribed, Mini fixes it. Read what's covered and how to get help fast."
        canonical="https://luxemia.shop/returns"
      />
      <Header />

      <main id="merchant-return-policy" className="pt-[90px] lg:pt-[132px] pb-16">
        {/* Hero */}
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">Returns &amp; Refunds</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Mini&rsquo;s honest policy.</h1>
            <p className="text-muted-foreground leading-relaxed">
              Every LuxeMia order ships from India. That makes change-of-mind returns impossible without losing more in shipping than the refund is worth &mdash; so I won&rsquo;t pretend otherwise. But if an item arrives wrong, damaged, or not as described, that&rsquo;s on me, and I fix it. Here is exactly what is covered, what isn&rsquo;t, and how to reach me.
            </p>
          </div>
        </section>

        {/* What's covered — at a glance */}
        <section className="container mx-auto px-4 lg:px-8 max-w-3xl py-12">
          <h2 className="text-2xl font-serif text-foreground mb-6 text-center">At a glance</h2>
          <div className="overflow-hidden border border-border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-foreground">
                <tr>
                  <th className="p-4 font-medium">Situation</th>
                  <th className="p-4 font-medium">What I do</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-t border-border">
                  <td className="p-4">Item arrives <strong className="text-foreground">damaged, defective, wrong, or not as described</strong></td>
                  <td className="p-4"><strong className="text-foreground">Full refund or replacement, your choice.</strong> You don&rsquo;t pay return shipping. Report within 7 days.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-4">Item arrives but the <strong className="text-foreground">size doesn&rsquo;t fit</strong></td>
                  <td className="p-4"><strong className="text-foreground">$30 alteration credit</strong> at a local U.S. tailor, or I help you resell through LuxeMia at no fee. No international return shipping.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-4"><strong className="text-foreground">Change of mind</strong> (didn&rsquo;t like the color, event was cancelled, found something else)</td>
                  <td className="p-4">Not returnable &mdash; <em>and I&rsquo;ll explain why honestly below.</em> Email me before ordering if you&rsquo;re unsure.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-4">You want to <strong className="text-foreground">cancel</strong> an order</td>
                  <td className="p-4">Full refund if cancelled within <strong className="text-foreground">24 hours</strong> of ordering. After that, the supplier has started work and I can&rsquo;t always pull it back.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-4"><strong className="text-foreground">Made-to-order / custom-stitched</strong> items</td>
                  <td className="p-4">Not returnable for change of mind once stitching starts. Still fully covered if they arrive wrong, damaged, or misdescribed.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Why change-of-mind isn't returnable — honest explanation */}
        <section className="container mx-auto px-4 lg:px-8 max-w-3xl py-12">
          <div className="prose prose-neutral max-w-none text-muted-foreground">
            <h2 className="text-foreground">Why I can&rsquo;t accept change-of-mind returns</h2>
            <p>
              Every LuxeMia order is sourced and shipped from India &mdash; from my family&rsquo;s textile contacts in Surat, Kanchipuram, Banaras, and Gujarat. Return shipping from the U.S. to India typically costs $30&ndash;$50, requires customs paperwork, and the supplier doesn&rsquo;t always accept returns. By the time the item got back to India, the shipping cost would be more than the refund on most sarees and suits.
            </p>
            <p>
              I could pretend otherwise and write a &ldquo;no-questions-asked 30-day returns&rdquo; policy like the big stores do &mdash; and then fight you when you actually tried to use it. I won&rsquo;t. Honesty is the whole reason LuxeMia exists.
            </p>
            <p>
              So instead of a fake returns policy, here is what I do instead: I answer every email and every phone call myself before you order. If you&rsquo;re not sure about a color, a fabric, a size, or whether a piece is right for the occasion you&rsquo;re shopping for &mdash; <a href="mailto:hello@luxemia.shop">email me</a> or call <a href="tel:+12153419990">+1-215-341-9990</a>. I&rsquo;ll send you extra photos, real measurements, fit notes from past customers, and an honest opinion on whether that piece is right for you. The goal is to get it right the first time, not to ship the wrong thing and argue about it later.
            </p>
          </div>
        </section>

        {/* What's covered in detail */}
        <section className="container mx-auto px-4 lg:px-8 max-w-3xl py-12">
          <div className="prose prose-neutral max-w-none text-muted-foreground">
            <h2 className="text-foreground">If an item arrives wrong, damaged, or not as described</h2>
            <p>
              If your order arrives damaged, defective, materially different from its listing, incorrect, or with missing pieces, that is on me &mdash; and I will fix it. <strong className="text-foreground">You choose</strong> a full refund or a replacement, and you do not pay return shipping. Here is how to report it:
            </p>
            <ol className="list-decimal pl-6 space-y-2 my-4">
              <li>Email <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a> within <strong className="text-foreground">7 days of delivery</strong> with your order number and a clear description of the issue.</li>
              <li>Attach 2&ndash;3 photos of the item and the packaging. A short video helps but is <em>not</em> required.</li>
              <li>Keep the item and all packaging until I review and reply &mdash; usually within 48 hours, often faster.</li>
              <li>Once I confirm the issue, I refund you in full or ship a replacement &mdash; your choice. You do not pay return shipping.</li>
            </ol>
            <p>
              If the issue is something that requires you to return the item (for example, the supplier needs it back to honor their own defect policy), I will email you a prepaid return label. You don&rsquo;t pay for it.
            </p>
            <p className="text-sm italic mt-4">
              Note: a 7-day window is the U.S. FTC Mail Order Rule standard and matches or beats most major Indian ethnic wear stores. Reporting earlier is always better and helps me resolve faster, but I won&rsquo;t deny a legitimate claim because you needed an extra day to take photos.
            </p>
          </div>
        </section>

        {/* Size issues — the honest alternative */}
        <section className="container mx-auto px-4 lg:px-8 max-w-3xl py-12">
          <div className="prose prose-neutral max-w-none text-muted-foreground">
            <h2 className="text-foreground">If the size doesn&rsquo;t fit</h2>
            <p>
              Sizing is the #1 reason shoppers ask about returns on Indian ethnic wear. Here is how I handle it honestly:
            </p>
            <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
              <div className="border border-border rounded-lg p-6 bg-secondary/30">
                <Scissors className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-serif text-lg text-foreground mb-2">Option 1: $30 alteration credit</h3>
                <p className="text-sm">If a saree blouse, lehenga choli, or suit doesn&rsquo;t fit, take it to a local U.S. tailor. Email me the receipt and I refund up to $30 toward the alteration. Most blouse and choli alterations cost $15&ndash;$25 in the U.S.</p>
              </div>
              <div className="border border-border rounded-lg p-6 bg-secondary/30">
                <ShieldCheck className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-serif text-lg text-foreground mb-2">Option 2: I help you resell</h3>
                <p className="text-sm">If the piece is unworn and you&rsquo;d rather get your money back than alter it, I will list it on LuxeMia&rsquo;s &ldquo;Pre-Loved&rdquo; section at no fee. You keep 100% of the resale price. Most resell within 30&ndash;60 days.</p>
              </div>
            </div>
            <p>
              To avoid the size issue in the first place: email me your measurements (or your daughter&rsquo;s, your niece&rsquo;s &mdash; whoever the outfit is for) before you order. I will check against the actual garment measurements from the supplier and tell you honestly whether it will fit. I&rsquo;d rather lose a sale than ship the wrong size.
            </p>
          </div>
        </section>

        {/* Cancellations */}
        <section className="container mx-auto px-4 lg:px-8 max-w-3xl py-12">
          <div className="prose prose-neutral max-w-none text-muted-foreground">
            <h2 className="text-foreground">Order cancellations</h2>
            <p>
              Email <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a> with your order number as soon as you can. If you cancel within <strong className="text-foreground">24 hours of ordering</strong>, I refund you in full, no questions. After that window, the supplier has usually started work or cutting fabric, and I may not be able to pull the order back. If I can, I will &mdash; and I&rsquo;ll refund minus any non-recoverable supplier costs (typically 10&ndash;20%, which I&rsquo;ll tell you upfront before charging).
            </p>
          </div>
        </section>

        {/* Made-to-order */}
        <section className="container mx-auto px-4 lg:px-8 max-w-3xl py-12">
          <div className="prose prose-neutral max-w-none text-muted-foreground">
            <h2 className="text-foreground">Custom and made-to-order pieces</h2>
            <p>
              Custom-stitched or made-to-order pieces (where you specify measurements, color, or fabric changes) cannot be returned for change of mind once the supplier has started cutting or stitching. They are still fully covered if they arrive wrong, damaged, or materially different from what we agreed on &mdash; I will compare against the email confirmation we sent you.
            </p>
          </div>
        </section>

        {/* Your rights */}
        <section className="container mx-auto px-4 lg:px-8 max-w-3xl py-12">
          <div className="prose prose-neutral max-w-none text-muted-foreground">
            <h2 className="text-foreground">Your legal rights</h2>
            <p>
              Nothing in this policy limits any consumer rights or remedies that cannot legally be excluded under U.S. federal or state law (including the FTC Mail Order Rule, which gives you the right to refuse or return merchandise that was misdescribed, and to a refund if you exercise that right).
            </p>
          </div>
        </section>

        {/* Contact Mini directly */}
        <section className="container mx-auto px-4 lg:px-8 max-w-3xl py-12">
          <div className="border border-border rounded-lg bg-secondary/30 p-8 text-center">
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-3">Questions? Talk to Mini.</p>
            <h2 className="text-2xl font-serif text-foreground mb-4">You don&rsquo;t have to figure this out alone.</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              If you&rsquo;re not sure whether something is covered, or you want help deciding before you order, email me or call me. I read every email and answer the phone myself, in English, Hindi, or Gujarati &mdash; whatever is easier for you.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="mailto:hello@luxemia.shop" className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background hover:opacity-90">
                <Mail className="h-4 w-4" /> hello@luxemia.shop
              </a>
              <a href="tel:+12153419990" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary">
                <Phone className="h-4 w-4" /> +1-215-341-9990
              </a>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              <Clock className="inline h-3 w-3 mr-1" /> Business hours: Mon&ndash;Sat 10&ndash;7 EST, Sun 11&ndash;5 EST
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Returns;
