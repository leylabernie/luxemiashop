import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';

const NRIGeneral = () => (
  <NRILandingPage
    config={{
      country: 'Worldwide',
      countryCode: 'WW',
      slug: 'nri',
      seoTitle: 'Buy Indian Ethnic Wear Online | NRI Shopping | LuxeMia',
      seoDescription: 'Shop authentic Indian ethnic wear delivered worldwide. Designer sarees, bridal lehengas, salwar suits & menswear. Free shipping on orders over $300. 3-12 day delivery.',
      heroTitle: 'Authentic Indian Ethnic Wear Delivered to Your Door',
      heroSubtitle: 'Shopping From Abroad? We\'ve Got You Covered',
      shippingTime: '3-12 business days',
      shippingCost: 'Free on orders over $300',
      customsNote: 'We ship DHL Express worldwide. Import duties vary by country.',
      testimonial: {
        name: 'Meera S.',
        location: 'NRI Customer',
        rating: 5,
        body: 'As an NRI, finding authentic Indian ethnic wear was always a challenge. LuxeMia makes it so easy — beautiful pieces, safe packaging, and arrived right on time for our festival celebration.',
      },
      faqs: [
        {
          question: 'Do you ship internationally?',
          answer: 'Yes! We ship to over 50 countries worldwide via DHL Express. Standard delivery takes 3-12 business days depending on your location.',
        },
        {
          question: 'When does shipping become free?',
          answer: 'Orders over $300 qualify for free worldwide shipping. Orders below $300 are charged $14.95 flat per item — no weight calculations or hidden fees.',
        },
        {
          question: 'Will I have to pay customs duties?',
          answer: 'Import duties vary by country. Many countries have duty-free thresholds for personal imports. We recommend checking your local customs rules. We always declare accurate values on all shipments.',
        },
        {
          question: 'Can I get custom sizing?',
          answer: 'Absolutely! All our outfits are available in custom sizing. Provide your measurements during checkout and our tailors will create a perfect fit. Custom orders take an additional 2-3 weeks.',
        },
        {
          question: 'What if my item arrives damaged?',
          answer: 'In the rare case of shipping damage, please record an unboxing video and contact us within 48 hours. We will resolve the issue promptly.',
        },
      ],
      benefits: [
        { icon: Truck, title: 'Worldwide Delivery', description: 'Free shipping on orders over $300 — delivered to 50+ countries' },
        { icon: Shield, title: 'Secure Packaging', description: 'Every piece carefully wrapped to arrive in perfect condition' },
        { icon: Clock, title: 'Fast Dispatch', description: 'Orders dispatched within 24-48 hours via DHL Express' },
      ],
    }}
  />
);

export default NRIGeneral;
