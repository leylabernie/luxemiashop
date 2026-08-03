import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { ArrowRight, CheckCircle2, HelpCircle, Ruler, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const faqs = [
  {
    question: 'Does LuxeMia use one size chart for every outfit?',
    answer: 'No. Fit and available sizing can vary by product, brand and garment construction. Use the size options and measurements shown on the exact product page.',
  },
  {
    question: 'How do I choose a size when shopping online?',
    answer: 'Take your current body measurements, compare every relevant number with the selected listing, and contact LuxeMia before ordering if the listing does not give enough information.',
  },
  {
    question: 'What if I am between sizes?',
    answer: 'Do not rely only on your usual U.S. dress size. Compare the bust or chest, waist, hips and garment length shown for that product, then ask before ordering if the measurements fall across two sizes.',
  },
  {
    question: 'Is measurement-based tailoring included?',
    answer: 'Only the size or stitching options shown on the selected product page are included. Confirm any measurement-based option and timing before ordering.',
  },
];

const SizeGuide = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="Indian Clothing Size Guide — Compare Product Measurements | LuxeMia"
      description="Choose Indian clothing sizes online by comparing your current body measurements with the exact LuxeMia product listing. Free printable measurement worksheet included."
      canonical="https://luxemia.shop/size-guide"
      faqs={faqs}
    />
    <Header />

    <main className="pt-[90px] lg:pt-[132px]">
      <section className="bg-gradient-to-b from-primary/10 to-background py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Ruler className="h-4 w-4" /> Listing-specific sizing
          </div>
          <h1 className="font-display text-4xl text-foreground md:text-5xl lg:text-6xl">Indian Clothing Size Guide</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">
            Indian clothing does not follow one reliable universal conversion. Measure your body, then compare those numbers with the size and construction details on the exact product page.
          </p>
          <Link
            to="/sizing-measurements-guide"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
          >
            Open printable measurement worksheet <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-display text-3xl text-foreground">Choose a size in three checks</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <Ruler className="mb-4 h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-foreground">1. Measure today</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Use a soft tape and record the measurements relevant to the garment. Do not use an old size label as a substitute.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Tag className="mb-4 h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-foreground">2. Read the listing</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Check the available variants, stitching status, included pieces and any product-specific measurements.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <HelpCircle className="mb-4 h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-foreground">3. Ask before ordering</h3>
                  <p className="mt-2 text-sm text-muted-foreground">If important details are missing or your event is time-sensitive, contact LuxeMia before checkout.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl text-foreground">Measurements commonly used</h2>
              <p className="mt-4 text-muted-foreground">The exact measurements needed depend on the selected garment. These are useful to have ready when comparing listings:</p>
              <ul className="mt-6 space-y-3">
                {['Bust or chest and underbust', 'Natural waist and intended waistband', 'Hips at the fullest point', 'Shoulder, armhole and sleeve length', 'Garment length with planned shoes'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-foreground">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-primary" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <h2 className="font-display text-2xl text-foreground">Body vs. garment measurements</h2>
              <p className="mt-4 text-muted-foreground">Body measurements describe you. Garment measurements describe the finished item. They should not be assumed to match because ease, lining, silhouette and construction affect fit.</p>
              <p className="mt-4 text-muted-foreground">Record your actual body measurements without adding or subtracting inches unless the selected listing specifically instructs otherwise.</p>
              <Link to="/sizing-measurements-guide" className="mt-6 inline-flex items-center gap-2 font-medium text-primary hover:underline">
                Measure step by step <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-display text-3xl text-foreground">Sizing questions</h2>
            <div className="mt-8 space-y-6">
              {faqs.map((faq) => (
                <div key={faq.question} className="border-b border-border pb-6">
                  <h3 className="text-lg font-semibold text-foreground">{faq.question}</h3>
                  <p className="mt-2 text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary py-14 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl">Ready to compare current listings?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/90">Open the product page and use only the size and stitching options shown there.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link to="/lehengas" className="rounded-full bg-background px-6 py-3 font-medium text-foreground">Shop lehengas</Link>
            <Link to="/sarees" className="rounded-full border border-primary-foreground/30 bg-background/15 px-6 py-3 font-medium">Shop sarees</Link>
            <Link to="/suits" className="rounded-full border border-primary-foreground/30 bg-background/15 px-6 py-3 font-medium">Shop suits</Link>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default SizeGuide;
