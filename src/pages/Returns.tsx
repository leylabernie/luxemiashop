import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

const Returns = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Returns Policy — LuxeMia"
        description="LuxeMia returns policy: all sales are final except verified shipping damage reported within 48 hours with a mandatory unboxing video."
        canonical="https://luxemia.shop/returns"
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">Returns</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Returns Policy</h1>
            <p className="text-muted-foreground leading-relaxed">
              Please read this policy before ordering. All sales are final except for verified shipping damage reported
              within 48 hours of delivery with a mandatory unboxing video.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 max-w-3xl py-12">
          <div className="prose prose-neutral max-w-none text-muted-foreground">
            <h2 className="text-foreground">Return window</h2>
            <p>All sales are final. We do not accept returns or exchanges for change of mind, sizing, color, fit, or custom-order preferences.</p>

            <h2 className="text-foreground">Return conditions</h2>
            <p>For genuine shipping damage, contact us within 48 hours of delivery. Keep the packaging and provide a continuous unboxing video showing the unopened parcel and the damage. Claims without the required video may not be eligible.</p>

            <h2 className="text-foreground">How to start a return</h2>
            <p>
              Email <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a> with your order number, item name,
              photos of the item, and the reason for the request. Do not mail anything back until LuxeMia confirms
              the return instructions.
            </p>

            <h2 className="text-foreground">Shipping damage</h2>
            <p>
              If an item arrives damaged, email us as soon as possible with clear photos of the packaging and garment.
              Keep all packaging until the claim is resolved.
            </p>

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
