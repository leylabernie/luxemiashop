import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

const Returns = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Returns, Refunds & Cancellations | LuxeMia"
        description="LuxeMia change-of-mind rules, issue-reporting process and remedies for damage, defects, misdescription, incorrect items or missing pieces, without limiting mandatory rights."
        canonical="https://luxemia.shop/returns"
      />
      <Header />

      <main id="merchant-return-policy" className="pt-[90px] lg:pt-[132px] pb-16">
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">Returns</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Returns Policy</h1>
            <p className="text-muted-foreground leading-relaxed">
              Change-of-mind purchases are final sale. Damage, defects, material misdescription, an incorrect item or missing pieces should be
              reported promptly—preferably within 48 hours—with available photos and unboxing evidence. This evidence request does not limit rights that cannot legally be excluded.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 max-w-3xl py-12">
          <div className="prose prose-neutral max-w-none text-muted-foreground">
            <h2 className="text-foreground">Final sale</h2>
            <p>
              LuxeMia does not voluntarily accept buyer-remorse returns or exchanges for fit, color preference, event changes or a change of mind.
              This change-of-mind rule is separate from remedies for faulty, damaged, materially misdescribed, incorrect or incomplete orders and from mandatory legal rights.
            </p>

            <h2 className="text-foreground">Covered order issues</h2>
            <p>
              If an item arrives damaged or defective, is materially different from its listing, is incorrect, or has missing pieces, contact LuxeMia promptly; reporting within 48 hours is strongly preferred because it helps preserve delivery evidence. Provide clear photos and, when available, a continuous
              unboxing/opening video showing the unopened package, shipping label, opening process, contents, and item condition. A missing video does not by itself remove rights that cannot legally be excluded. If LuxeMia confirms a covered
              issue, LuxeMia will provide the applicable resolution and any required return instructions. Do not send an item back unless LuxeMia authorizes it.
            </p>

            <h2 className="text-foreground">How to report a covered issue</h2>
            <p>
              Email <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a> with your order number, item name, and issue. For a covered order issue,
              include the required photos and continuous video. Keep the item and all packaging until LuxeMia reviews the request.
            </p>

            <h2 className="text-foreground">Order cancellations</h2>
            <p>
              Cancellation requests must be made within 24 hours of order placement. After that window, cancellation requests are not accepted.
              Email hello@luxemia.shop immediately with your order number.
            </p>

            <h2 className="text-foreground">Personalized and made-to-order goods</h2>
            <p>
              Personalized, altered or made-to-order goods cannot ordinarily be returned for change of mind once work begins. Fault, damage,
              material misdescription, incorrect fulfillment, missing pieces and mandatory legal rights remain separate and are reviewed under the applicable circumstances.
            </p>

            <h2 className="text-foreground">Mandatory rights</h2>
            <p>Nothing in this policy limits consumer rights or remedies that cannot legally be excluded in the customer&apos;s jurisdiction.</p>

            <h2 className="text-foreground">Questions</h2>
            <p>
              For return questions, email <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a> or call{' '}
              <a href="tel:+12153419990">+1 215-341-9990</a>.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Returns;
