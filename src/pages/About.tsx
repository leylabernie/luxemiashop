import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About LuxeMia — Indian Ethnic Wear Online"
        description="Learn about LuxeMia, an online Indian ethnic wear store serving U.S. shoppers with clear product details, sizing guidance, and tracked delivery."
        canonical="https://luxemia.shop/about"
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">About LuxeMia</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">
              Indian outfits for the date that is already on the calendar.
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              LuxeMia is an online Indian ethnic wear store created for U.S. shoppers planning
              weddings, festivals, receptions, and other special occasions.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 max-w-3xl py-12 space-y-8 text-muted-foreground leading-relaxed">
          <p>
            Our catalog brings together garments from established supplier partners in India. Each product page
            states the available fabric, work, stitching status, sizes, and shipping terms so you can make an informed
            decision before ordering.
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
              <p className="font-medium text-foreground">LuxeMia</p>
              <p>Online-only Indian ethnic wear store</p>
              <p>USA-based customer support</p>
              <p>
                Phone:{' '}
                <a href="tel:+12153419990" className="text-foreground underline underline-offset-4 hover:text-primary">
                  +1 215-341-9990
                </a>
              </p>
              <p>
                Email:{' '}
                <a href="mailto:hello@luxemia.shop" className="text-foreground underline underline-offset-4 hover:text-primary">
                  hello@luxemia.shop
                </a>
              </p>
            </address>
          </div>

          <div className="text-center pt-6">
            <Link
              to="/collections"
              className="inline-flex items-center justify-center px-8 py-3 bg-foreground text-background text-sm uppercase tracking-editorial hover:bg-foreground/90 transition-colors"
            >
              Shop online styles
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
