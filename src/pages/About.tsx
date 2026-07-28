import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About LuxeMia — Ready-to-Ship Indian Ethnic Wear"
        description="LuxeMia is the ready-to-ship side of CeremonyVerse, run by Bhamini, with a small US-stock edit of Indian ethnic wear for events coming up soon."
        canonical="https://luxemia.shop/about"
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">About LuxeMia</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">
              Ready-to-ship Indian outfits for the date that is already on the calendar.
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              LuxeMia is the ready-to-ship side of CeremonyVerse, run by Bhamini, whose family has worked
              in Surat&apos;s fabric trade for three generations.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 max-w-3xl py-12 space-y-8 text-muted-foreground leading-relaxed">
          <p>
            We keep a small, tightly-edited range in stock in the US so you can have it in days rather than months.
            LuxeMia is for the guest, sibling, parent, or last-minute event shopper who needs something beautiful,
            finished, and ready to leave quickly.
          </p>

          <p>
            For made-to-measure outfits, matched colors, and full wedding parties, see{' '}
            <a
              href="https://www.ceremonyverse.com"
              target="_blank"
              rel="noopener"
              className="text-foreground underline underline-offset-4 hover:text-primary"
            >
              CeremonyVerse
            </a>.
          </p>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-serif text-2xl text-foreground mb-4">Business details</h2>
            <address className="not-italic space-y-2 text-sm">
              <p>LuxeMia / Glamour Indian Wear</p>
              <p>[STREET ADDRESS]</p>
              <p>Philadelphia, PA [ZIP]</p>
              <p>United States</p>
              <p>
                Phone:{' '}
                <a href="tel:+12153419990" className="text-foreground underline underline-offset-4 hover:text-primary">
                  +1 215-341-9990
                </a>
              </p>
            </address>
          </div>

          <div className="text-center pt-6">
            <Link
              to="/collections"
              className="inline-flex items-center justify-center px-8 py-3 bg-foreground text-background text-sm uppercase tracking-editorial hover:bg-foreground/90 transition-colors"
            >
              Shop ready-to-ship styles
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
