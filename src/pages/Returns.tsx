import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

const Returns = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Returns, Refunds & Cancellations | LuxeMia"
        description="LuxeMia's final-sale policy and 48-hour process for genuine shipping damage or defect, incorrect items, or missing items."
        canonical="https://luxemia.shop/returns"
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">Returns</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Returns Policy</h1>
            <p className="text-muted-foreground leading-relaxed">
              All sales are final and exchanges are not accepted. Genuine shipping damage or defect, an incorrect item, or a missing item
              must be reported within 48 hours of delivery with the required photos and continuous unboxing/opening video.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 max-w-3xl py-12">
          <div className="prose prose-neutral max-w-none text-muted-foreground">
            <h2 className="text-foreground">Final sale</h2>
            <p>
              All purchases are final sale. LuxeMia does not accept buyer-remorse returns or exchanges for fit, color preference, event changes,
              or a change of mind. Review the product details, images, measurements, and selected options before ordering.
            </p>

            <h2 className="text-foreground">Covered order issues</h2>
            <p>
              If an item arrives damaged or defective, is incorrect, or is missing, contact LuxeMia within 48 hours of delivery. Provide clear photos and a continuous
              unboxing/opening video showing the unopened package, shipping label, opening process, contents, and item condition. If LuxeMia confirms a covered
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
