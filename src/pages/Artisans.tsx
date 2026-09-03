import { Link } from 'react-router-dom';
import { FileCheck2, MapPinOff, SearchCheck } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

const standards = [
  {
    icon: FileCheck2,
    title: 'Use the exact listing',
    description: 'A product page may state a fabric, decorative work, included pieces or other details when the current catalog supplies them. Those statements apply only to that product.',
  },
  {
    icon: MapPinOff,
    title: 'Do not infer origin',
    description: 'A style name such as Banarasi, Kanjivaram, chikankari or zardozi does not by itself verify where an item was made, who made it, whether work was done by hand or whether a protected-origin standard applies.',
  },
  {
    icon: SearchCheck,
    title: 'Ask when a fact matters',
    description: 'If artisan participation, manufacturing location, technique, fiber composition or certification is not stated on the selected listing, treat it as not supplied and contact LuxeMia before ordering.',
  },
];

const Artisans = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="Product Origin and Craft Claims | LuxeMia"
      description="How LuxeMia handles product-origin, artisan, technique and authenticity claims without inferring facts from style names or photographs."
      canonical="https://luxemia.shop/artisans"
    />
    <Header />

    <main className="pt-[90px] lg:pt-[132px]">
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">Product-fact standard</p>
          <h1 className="font-display text-4xl text-foreground md:text-5xl">Origin and Craft Claims Require Evidence</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            LuxeMia does not make a store-wide claim that products come from particular textile regions,
            are artisan-made, handmade, authentic or certified. The exact product record controls, and a
            missing provenance or technique detail is not guessed.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto grid max-w-5xl gap-6 px-4 md:grid-cols-3">
          {standards.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-lg border border-border bg-card p-6">
              <Icon className="h-6 w-6 text-primary" />
              <h2 className="mt-5 font-display text-xl text-foreground">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-secondary/30 py-14">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl text-foreground">Where to verify a claim</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Review the selected product page first. For the rules LuxeMia uses when presenting catalog and
            educational information, see the editorial policy. Send a product link and the exact fact you need
            confirmed when the listing is incomplete.
          </p>
          <nav className="mt-6 flex flex-wrap justify-center gap-5 text-sm">
            <Link className="text-primary underline underline-offset-4" to="/editorial-policy">Editorial and product-fact policy</Link>
            <Link className="text-primary underline underline-offset-4" to="/contact">Ask a listing-specific question</Link>
          </nav>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default Artisans;
