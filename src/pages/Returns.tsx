import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

const Returns = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Returns Policy — LuxeMia"
        description="LuxeMia returns policy for ready-to-ship Indian ethnic wear. Return window and conditions require owner confirmation before launch."
        canonical="https://luxemia.shop/returns"
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">Returns</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Returns Policy</h1>
            <p className="text-muted-foreground leading-relaxed">
              Please read this policy before ordering. LuxeMia sells a small ready-to-ship inventory, and return terms
              need to be confirmed by the owner before this policy goes live.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 max-w-3xl py-12">
          <div className="prose prose-neutral max-w-none text-muted-foreground">
            <h2 className="text-foreground">Return window</h2>
            <p>[TODO(owner): confirm return window]</p>

            <h2 className="text-foreground">Return conditions</h2>
            <p>[TODO(owner): confirm return window]</p>

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
