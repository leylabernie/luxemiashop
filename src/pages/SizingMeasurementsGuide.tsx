import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import SizingMeasurementsContent from '@/components/SizingMeasurementsContent';
import { measurementFaqs, measurementTitle } from '@/data/sizingMeasurements';
import { howToMeasureSchema } from '@/lib/schema/howTo';

const SizingMeasurementsGuide = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title={measurementTitle}
      titleMaxLength={60}
      description="Measure for a saree blouse, lehenga, salwar suit, kurta or sherwani with a free printable worksheet. Compare your measurements with the exact product listing before ordering."
      canonical="https://luxemia.shop/sizing-measurements-guide"
      faqs={measurementFaqs}
      additionalSchemas={[howToMeasureSchema()]}
    />
    <Header />
    <main><SizingMeasurementsContent /></main>
    <Footer />
  </div>
);

export default SizingMeasurementsGuide;
