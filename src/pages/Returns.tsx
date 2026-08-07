import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

const Returns = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Returns Policy — LuxeMia"
        description="All LuxeMia sales are final. Report genuine shipping damage, an incorrect item, or a missing item within 48 hours with the required photos and continuous unboxing video."
        canonical="https://luxemia.shop/returns"
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">Returns</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Returns Policy</h1>
            <p className="text-muted-foreground leading-relaxed">
              Please read this policy before ordering. All sales are final. Covered order issues must be reported
              within 48 hours of delivery with the required photos and continuous unboxing/opening video.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 max-w-3xl py-12">
          <div className="prose prose-neutral max-w-none text-muted-foreground">
            <h2 className="text-foreground">Return window</h2>
            <p>All sales are final. We do not accept returns or exchanges for change of mind, sizing, color, fit, or custom-order preferences.</p>

            <h2 className="text-foreground">Covered order issues</h2>
            <p>For genuine shipping damage, an incorrect item, or a missing item, contact us within 48 hours of delivery. Provide clear photos and a continuous unboxing/opening video showing the unopened package, shipping label, opening process, contents, and item condition.</p>

            <h2 className="text-foreground">How to report a covered issue</h2>
            <p>
              Email <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a> with your order number, item name,
              clear photos and the required continuous video. Keep the item and all packaging until LuxeMia reviews the claim.
            </p>

            <h2 className="text-foreground">Required evidence</h2>
            <p>
              The continuous video must begin with the package unopened and clearly show the shipping label, the opening process,
              all package contents, and the condition of the item. Claims without the required evidence cannot be verified.
            </p>

            <h2 className="text-foreground">Order cancellations</h2>
            <p>Cancellation requests must be made within 24 hours of order placement. After that window, cancellation requests are not accepted. Email hello@luxemia.shop immediately with your order number.</p>

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
