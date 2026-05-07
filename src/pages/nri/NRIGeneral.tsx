import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';

const NRIGeneral = () => (
  <NRILandingPage
    config={{
      country: 'Worldwide',
      countryCode: 'WW',
      slug: 'nri',
      seoTitle: 'Buy Indian Ethnic Wear Online | NRI Shopping | LuxeMia',
      seoDescription: 'Shop authentic Indian ethnic wear delivered worldwide. Designer sarees, bridal lehengas, salwar suits & menswear. Free shipping on orders over $350. 3-10 day express delivery.',
      heroTitle: 'Authentic Indian Ethnic Wear Delivered to Your Door',
      heroSubtitle: 'Shopping From Abroad? We\'ve Got You Covered',
      shippingTime: '3-10 business days',
      shippingCost: 'Free on orders over $350',
      customsNote: 'We ship DHL Express worldwide. Import duties vary by country.',
      faqs: [
        {
          question: 'Do you ship internationally?',
          answer: 'Yes! We ship to over 100 countries worldwide via DHL Express, USPS, or UPS. Express delivery takes 3-5 business days transit; standard takes 7-10 business days transit. Ready-made orders dispatch in 3-5 business days.',
        },
        {
          question: 'When does shipping become free?',
          answer: 'Orders over $350 qualify for free worldwide shipping. Orders below $350 are charged $25 flat per order — no weight calculations or hidden fees.',
        },
        {
          question: 'Will I have to pay customs duties?',
          answer: 'Import duties vary by country. Many countries have duty-free thresholds for personal imports. We recommend checking your local customs rules. We always declare accurate values on all shipments.',
        },
        {
          question: 'Can I get custom sizing?',
          answer: 'Absolutely! All our outfits are available in custom sizing. Provide your measurements during checkout and our tailors will create a perfect fit. Custom orders take an additional 3-4 weeks for production.',
        },
        {
          question: 'What if my item arrives damaged?',
          answer: 'In the rare case of shipping damage, please record an unboxing video and contact us within 48 hours of delivery. We will resolve the issue promptly.',
        },
      ],
      benefits: [
        { icon: Truck, title: 'Worldwide Delivery', description: 'Free shipping on orders over $350 — delivered to 100+ countries' },
        { icon: Shield, title: 'Secure Packaging', description: 'Every piece carefully wrapped to arrive in perfect condition' },
        { icon: Clock, title: 'Fast Dispatch', description: 'Ready-made orders dispatched within 3-5 business days' },
      ],
    }}
  />
);

export default NRIGeneral;
