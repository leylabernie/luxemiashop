import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';

const USA = () => (
  <NRILandingPage
    config={{
      country: 'USA',
      countryCode: 'US',
      slug: 'indian-ethnic-wear-usa',
      seoTitle: 'Buy Indian Ethnic Wear Online USA | LuxeMia',
      seoDescription: 'Shop authentic Indian ethnic wear delivered to USA. Designer sarees, bridal lehengas, salwar suits & menswear. Flat rate shipping $14.95/item, free on orders over $300. 7-10 day standard delivery.',
      heroTitle: 'Authentic Indian Ethnic Wear Delivered to the USA',
      heroSubtitle: 'Shipped from India with Care',
      shippingTime: '7-10 business days',
      shippingCost: '$14.95/item, free on orders over $300',
      customsNote: 'US imports from India may be subject to tariffs and duties. As of 2025, an additional 50% tariff applies to many goods from India. Customers are responsible for all customs fees.',
      faqs: [
        {
          question: 'How long does shipping to the USA take?',
          answer: 'Standard shipping (USPS/UPS) takes 7-10 business days transit. Express shipping (DHL) takes 3-5 business days transit. Ready-made orders dispatch in 3-5 business days; custom/alteration orders dispatch in 5-7 business days.',
        },
        {
          question: 'Is shipping free to the USA?',
          answer: 'We offer a flat shipping rate of $14.95 per item, with free shipping on all orders over $300. No coupon code needed — free shipping is applied automatically at checkout.',
        },
        {
          question: 'Will I have to pay customs duties?',
          answer: 'Possibly. As of 2025, goods imported from India to the United States may be subject to an additional 50% tariff on top of standard duty rates. These charges are determined by US Customs and are the customer\'s responsibility. We recommend checking with your local customs office for the most current rates.',
        },
        {
          question: 'Can I return items from the USA?',
          answer: 'All sales are final. Due to the international nature of our shipments, LuxeMia does not accept returns or exchanges. The only exception is genuine shipping damage, which must be documented with photos or an unboxing video and reported within 7 days of delivery. Please review our Returns Policy for full details.',
        },
        {
          question: 'Do you offer custom sizing for US customers?',
          answer: 'Absolutely! All our outfits are available in custom sizing. Provide your measurements during checkout and our tailors will create a perfect fit. Custom orders take an additional 2-3 weeks.',
        },
      ],
      benefits: [
        { icon: Truck, title: 'Worldwide Shipping', description: 'Flat rate $14.95/item, free over $300' },
        { icon: Shield, title: 'Insured Delivery', description: 'Every package fully insured and tracked' },
        { icon: Clock, title: 'Express Available', description: '3-5 day express shipping at checkout' },
      ],
    }}
  />
);

export default USA;
