import { Link } from 'react-router-dom';
import { BadgeCheck, Box, Factory, Leaf, Truck, SearchCheck } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

const claimStatus = [
  {
    icon: Leaf,
    title: 'Materials',
    description: 'A fabric or fiber is shown only when supplied for the selected product. A material name is not evidence that the item is organic, low-impact, biodegradable or environmentally preferable.',
  },
  {
    icon: BadgeCheck,
    title: 'Certifications',
    description: 'LuxeMia does not currently publish a store-wide organic, fair-trade, carbon-neutral, recycled-content or other environmental certification.',
  },
  {
    icon: Factory,
    title: 'Production and labor',
    description: 'LuxeMia does not infer factory conditions, artisan participation, handmade production, wage standards or supply-chain traceability from a garment name, supplier description or photograph.',
  },
  {
    icon: Box,
    title: 'Packaging',
    description: 'No universal recyclable, plastic-free, compostable or minimal-packaging claim is made. Packaging can vary according to the product and transit requirements.',
  },
  {
    icon: Truck,
    title: 'Delivery',
    description: 'The shipping page states supported destinations and current charges. LuxeMia does not describe shipping as carbon neutral or emissions free without a verified program.',
  },
  {
    icon: SearchCheck,
    title: 'Questions and corrections',
    description: 'When an environmental or sourcing detail is material to a purchase, request evidence for the exact product before ordering. Unsupported optional facts remain omitted.',
  },
];

const Sustainability = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="Environmental and Sourcing Claims | LuxeMia"
      description="What LuxeMia does and does not claim about materials, certifications, production, packaging and delivery."
      canonical="https://luxemia.shop/sustainability"
    />
    <Header />

    <main className="pt-[90px] lg:pt-[132px]">
      <section className="bg-gradient-to-b from-green-50 to-background py-20 dark:from-green-950/20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">Evidence before environmental claims</p>
          <h1 className="font-display text-4xl text-foreground md:text-5xl">Environmental and Sourcing Claims</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            LuxeMia publishes a product-specific environmental, origin or labor claim only when support for that
            exact claim is available. The store does not turn general goals, fabric names or supplier relationships
            into certifications or measured impact claims.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-center font-display text-3xl text-foreground">Current claim boundaries</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {claimStatus.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-lg border border-border bg-card p-6">
                <Icon className="h-6 w-6 text-green-700 dark:text-green-300" />
                <h3 className="mt-5 font-display text-xl text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/30 py-14">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl text-foreground">Check the selected product</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Use the exact listing for stated material and product facts. If a certification, manufacturing location,
            packaging characteristic or production method is essential, contact LuxeMia with the product link before ordering.
          </p>
          <nav className="mt-6 flex flex-wrap justify-center gap-5 text-sm">
            <Link className="text-primary underline underline-offset-4" to="/editorial-policy">Read the product-fact policy</Link>
            <Link className="text-primary underline underline-offset-4" to="/contact">Contact LuxeMia</Link>
          </nav>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default Sustainability;
