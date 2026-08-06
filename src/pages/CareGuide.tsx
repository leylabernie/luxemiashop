import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { AlertTriangle, ArrowRight, CheckCircle2, PackageOpen, Sparkles, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const faqs = [
  {
    question: 'Should every silk saree be dry cleaned?',
    answer: 'Not every item uses the same fiber, dye, weave, lining or embellishment. Follow the care label or exact product instructions. If those are missing, ask a cleaner experienced with delicate Indian garments before cleaning.',
  },
  {
    question: 'Can I iron embroidery, sequins or zari?',
    answer: 'Avoid direct heat on embellishment. Follow the product label and test any permitted heat on a hidden area. A qualified cleaner is the safest option when the materials or adhesives are uncertain.',
  },
  {
    question: 'How should I store a heavy lehenga or saree?',
    answer: 'Store the item clean and completely dry, away from direct light, heat and damp. Support heavy work so it does not stretch. Use clean, colorfast and breathable storage materials appropriate for the garment.',
  },
  {
    question: 'What should I do if the care instructions are missing?',
    answer: 'Do not guess based only on the garment category. Contact LuxeMia for any available supplier guidance or take the item to a qualified cleaner who can inspect it in person.',
  },
];

const CareGuide = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="Indian Clothing Care Guide — Read the Garment Label First | LuxeMia"
      description="Care for sarees, lehengas, suits and embellished Indian clothing without one-size-fits-all washing claims. Start with the exact label and product instructions."
      canonical="https://luxemia.shop/care-guide"
      faqs={faqs}
    />
    <Header />

    <main className="pt-[90px] lg:pt-[132px]">
      <section className="bg-gradient-to-b from-primary/10 to-background py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" /> Garment-specific care
          </div>
          <h1 className="font-display text-4xl text-foreground md:text-5xl lg:text-6xl">Indian Clothing Care Guide</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">
            Fabric names alone do not reveal every fiber, dye, lining, adhesive or embellishment. Begin with the care label and exact product instructions—not a universal washing rule.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <Tag className="mb-4 h-8 w-8 text-primary" />
                <h2 className="font-semibold text-foreground">1. Read the label</h2>
                <p className="mt-2 text-sm text-muted-foreground">Use the sewn-in label, supplied care card and exact product page when instructions are available.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <AlertTriangle className="mb-4 h-8 w-8 text-primary" />
                <h2 className="font-semibold text-foreground">2. Do not assume</h2>
                <p className="mt-2 text-sm text-muted-foreground">Items called silk, velvet, georgette or embroidered can use different blends, dyes and construction.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <CheckCircle2 className="mb-4 h-8 w-8 text-primary" />
                <h2 className="font-semibold text-foreground">3. Ask a specialist</h2>
                <p className="mt-2 text-sm text-muted-foreground">When instructions are missing or conflict, let a qualified cleaner inspect the garment before treatment.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-display text-3xl text-foreground">Before cleaning or storing</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {[
                ['Record the instructions', 'Photograph the care label and keep any supplied care card before the first wear or cleaning.'],
                ['Check every component', 'The blouse, skirt, dupatta, lining and removable accessories may have different materials or instructions.'],
                ['Treat a stain cautiously', 'Blot only when the label permits it. Do not rub, apply home chemicals or use heat on an unknown stain.'],
                ['Store clean and dry', 'Allow the garment to dry fully and keep it away from direct light, damp, pests and sources of heat.'],
                ['Support weight and shape', 'Heavy embellishment can stretch fabric. Fold or support the garment according to its construction and label.'],
                ['Test storage materials', 'Use clean, colorfast materials that will not transfer dye, trap moisture or catch on embellishment.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <PackageOpen className="h-9 w-9 text-primary" />
              <h2 className="mt-4 font-display text-3xl text-foreground">When your order arrives</h2>
              <p className="mt-4 text-muted-foreground">If you need to report genuine shipping damage, an incorrect item, or a missing item, record a continuous unboxing/opening video beginning with the unopened package and contact LuxeMia within 48 hours of delivery.</p>
              <p className="mt-3 text-muted-foreground">All sales are final. For genuine shipping damage, an incorrect item, or a missing item, contact LuxeMia within 48 hours of delivery with clear photos and a continuous unboxing/opening video showing the unopened package, shipping label, and item condition.</p>
              <Link to="/returns" className="mt-6 inline-flex items-center gap-2 font-medium text-primary hover:underline">Read returns and damage policy <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-display text-3xl text-foreground">Care questions</h2>
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
          <h2 className="font-display text-3xl">Check product details before ordering</h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/90">Review the exact listing for stated fabric, work, included pieces and any available care information.</p>
          <Link to="/collections" className="mt-7 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 font-medium text-foreground">Browse collections <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default CareGuide;
