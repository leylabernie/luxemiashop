import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';

const USA = () => (
  <NRILandingPage
    config={{
      country: 'USA',
      countryCode: 'US',
      slug: 'indian-ethnic-wear-usa',
      seoTitle: 'Buy Indian Ethnic Wear Online USA | LuxeMia',
      seoDescription: 'Shop authentic Indian ethnic wear delivered to USA. Designer sarees, bridal lehengas, salwar suits & menswear. Flat rate shipping $25/order, free on orders over $350. 7-10 day standard delivery.',
      heroTitle: 'Authentic Indian Ethnic Wear Delivered to the USA',
      heroSubtitle: 'Shipped from India with Care',
      shippingTime: '7-10 business days',
      shippingCost: '$25/order, free on orders over $350',
      customsNote: 'US imports may be subject to duties, taxes, and carrier processing fees based on the product classification, value, and current customs rules. These charges are not included unless checkout explicitly states otherwise.',
      faqs: [
        {
          question: 'How long does shipping to the USA take?',
          answer: 'Standard shipping (USPS/UPS) takes 7-10 business days transit. Express shipping (DHL) takes 3-5 business days transit. Ready-made orders dispatch in 3-5 business days; custom/alteration orders dispatch in 5-7 business days.',
        },
        {
          question: 'Is shipping free to the USA?',
          answer: 'We offer a flat shipping rate of $25 per order, with free shipping on all orders over $350. No coupon code needed — free shipping is applied automatically at checkout.',
        },
        {
          question: 'Will I have to pay customs duties?',
          answer: 'Possibly. Duties and taxes depend on the product classification, shipment value, and current US customs rules. They are not included unless checkout explicitly states otherwise. Please review current US Customs and Border Protection guidance before ordering.',
        },
        {
          question: 'Can I return items from the USA?',
          answer: 'All sales are final. Due to the international nature of our shipments, LuxeMia does not accept returns or exchanges. The only exception is genuine shipping damage, which must be documented with an unboxing video and reported within 48 hours of delivery. Please review our Returns Policy for full details.',
        },
        {
          question: 'Do you offer custom sizing for US customers?',
          answer: 'Absolutely! All our outfits are available in custom sizing. Provide your measurements during checkout and our tailors will create a perfect fit. Custom orders take an additional 3-4 weeks for production.',
        },
      ],
      benefits: [
        { icon: Truck, title: 'USA Delivery', description: 'Flat rate $25/order, free over $350' },
        { icon: Shield, title: 'Insured Delivery', description: 'Every package fully insured and tracked' },
        { icon: Clock, title: 'Express Available', description: '3-5 day express shipping at checkout' },
      ],
    }}
  />
);

export default USA;
