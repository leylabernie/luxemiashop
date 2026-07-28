import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';

const NRIGeneral = () => (
  <NRILandingPage
    config={{
      country: 'the United States',
      countryCode: 'WW',
      slug: 'nri',
      seoTitle: 'Buy Indian Ethnic Wear Online | NRI Shopping | LuxeMia',
      seoDescription: 'Shop authentic Indian ethnic wear delivered to the United States. Designer sarees, bridal lehengas, salwar suits & menswear. Free U.S. shipping over $150. 7-10 day delivery.',
      heroTitle: 'Authentic Indian Ethnic Wear Delivered to Your Door',
      heroSubtitle: 'Shopping From Abroad? We\'ve Got You Covered',
      shippingTime: 'carrier transit after dispatch',
      shippingCost: 'Free on orders over $150',
      customsNote: 'We ship to the United States via DHL Express, USPS, or UPS. Import duties vary by country.',
      faqs: [
        {
          question: 'Do you ship internationally?',
          answer: 'We ship to the United States via DHL Express, USPS, or UPS. Delivery takes carrier transit after dispatch. Ready-made orders ship with tracking after dispatch; custom/alteration orders requires timing confirmation before ordering.',
        },
        {
          question: 'When does shipping become free?',
          answer: 'Orders over $150 qualify for free shipping to the United States. Orders below $150 are charged $12 flat per order — no weight calculations or hidden fees.',
        },
        {
          question: 'Will I have to pay customs duties?',
          answer: 'Import duties vary by country. The US has a de minimis threshold of $800 for duty-free imports. the United States may charge GST/HST/VAT. We always declare accurate values on all shipments.',
        },
        {
          question: 'Can I get custom sizing?',
          answer: 'Absolutely! All our outfits are available in custom sizing. Provide your measurements during checkout and our tailors will create a perfect fit. Custom orders take an additional confirm timing before ordering for production.',
        },
        {
          question: 'What if my item arrives damaged?',
          answer: 'In the rare case of shipping damage, please record an unboxing video and contact us within 48 hours of delivery. We will resolve the issue promptly.',
        },
      ],
      benefits: [
        { icon: Truck, title: 'Delivery to US, CA & AU', description: 'Free U.S. shipping over $150 — delivered to the United States' },
        { icon: Shield, title: 'Secure Packaging', description: 'Every piece carefully wrapped to arrive in perfect condition' },
        { icon: Clock, title: 'Tracked Delivery', description: 'Tracking provided after dispatch' },
      ],
    }}
  />
);

export default NRIGeneral;
