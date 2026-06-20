import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';

const NRIGeneral = () => (
  <NRILandingPage
    config={{
      country: 'USA, Canada & Australia',
      countryCode: 'WW',
      slug: 'nri',
      seoTitle: 'Buy Indian Ethnic Wear Online | NRI Shopping | LuxeMia Boutique',
      seoDescription: 'Shop authentic Indian ethnic wear delivered to USA, Canada & Australia. Designer sarees, bridal lehengas, salwar suits & menswear. Free shipping on orders over $350. 7-10 day delivery.',
      heroTitle: 'Authentic Indian Ethnic Wear Delivered to Your Door',
      heroSubtitle: 'Shopping From Abroad? We\'ve Got You Covered',
      shippingTime: '7-10 business days',
      shippingCost: 'Free on orders over $350',
      customsNote: 'We ship to USA, Canada, and Australia via DHL Express, USPS, or UPS. Import duties vary by country.',
      faqs: [
        {
          question: 'Do you ship internationally?',
          answer: 'We ship to the USA, Canada, and Australia via DHL Express, USPS, or UPS. Delivery takes 7-10 business days. Ready-made orders dispatch in 3-5 business days; custom/alteration orders dispatch in 5-7 business days.',
        },
        {
          question: 'When does shipping become free?',
          answer: 'Orders over $350 qualify for free shipping to USA, Canada, and Australia. Orders below $350 are charged $25 flat per order — no weight calculations or hidden fees.',
        },
        {
          question: 'Will I have to pay customs duties?',
          answer: 'Import duties vary by country. The US has a de minimis threshold of $800 for duty-free imports. Canada and Australia may charge GST/HST/VAT. We always declare accurate values on all shipments.',
        },
        {
          question: 'Can I get custom sizing?',
          answer: 'Absolutely! All our outfits are available in custom sizing. Provide your measurements during checkout and our tailors will create a perfect fit. Custom orders take an additional 5-7 business days for production.',
        },
        {
          question: 'What if my item arrives damaged?',
          answer: 'In the rare case of shipping damage, please record an unboxing video and contact us within 48 hours of delivery. We will resolve the issue promptly.',
        },
      ],
      benefits: [
        { icon: Truck, title: 'Delivery to US, CA & AU', description: 'Free shipping on orders over $350 — delivered to USA, Canada & Australia' },
        { icon: Shield, title: 'Secure Packaging', description: 'Every piece carefully wrapped to arrive in perfect condition' },
        { icon: Clock, title: 'Fast Dispatch', description: 'Ready-made orders dispatched within 3-5 business days' },
      ],
    }}
  />
);

export default NRIGeneral;
