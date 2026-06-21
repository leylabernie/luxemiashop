import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';

const UK = () => (
  <NRILandingPage
    config={{
      country: 'UK',
      countryCode: 'GB',
      slug: 'indian-ethnic-wear-uk',
      seoTitle: 'Buy Indian Ethnic Wear Online UK | Sarees, Lehengas & Suits - LuxeMia Boutique',
      seoDescription: 'Buy Indian ethnic wear online in the UK. Shop sarees, bridal lehengas, salwar suits & menswear. Flat rate shipping $25/order, free on orders over $350. 7-10 day standard delivery to United Kingdom.',
      heroTitle: 'Authentic Indian Ethnic Wear Delivered to the UK',
      heroSubtitle: 'Shipped from India with Care',
      shippingTime: '7-10 business days',
      shippingCost: '$25/order, free on orders over $350',
      customsNote: 'UK orders over £135 may be subject to 20% import VAT. These charges are collected by the carrier at delivery.',
      faqs: [
        {
          question: 'How long does delivery to the UK take?',
          answer: 'Standard delivery (USPS/UPS) takes 7-10 business days transit. Express delivery (DHL) takes 3-5 business days transit. Ready-made orders dispatch in 3-5 business days; custom/alteration orders dispatch in 5-7 business days.',
        },
        {
          question: 'Is delivery free to the UK?',
          answer: 'We offer a flat shipping rate of $25 per order, with free shipping on all orders over $350. No coupon code needed — free shipping is applied automatically at checkout.',
        },
        {
          question: 'Will I have to pay import VAT?',
          answer: 'Orders over £135 in value may be subject to UK import VAT at 20%. This is collected by the carrier at delivery and is the customer\'s responsibility. Orders under £135 are typically VAT-free.',
        },
        {
          question: 'Can I return items from the UK?',
          answer: 'All sales are final. Due to the international nature of our shipments, LuxeMia Boutique does not accept returns or exchanges. The only exception is genuine shipping damage, which must be documented with an unboxing video and reported within 48 hours of delivery. Please review our Returns Policy for full details.',
        },
        {
          question: 'Do you ship to Northern Ireland and Scottish Highlands?',
          answer: 'Yes, we deliver to all UK addresses including Northern Ireland, Scottish Highlands, and Channel Islands. Delivery times may vary slightly for remote areas.',
        },
      ],
      benefits: [
        { icon: Truck, title: 'Worldwide Shipping', description: 'Flat rate $25/order, free over $350' },
        { icon: Shield, title: 'Insured Delivery', description: 'Every package fully insured and tracked' },
        { icon: Clock, title: 'Express Available', description: '3-5 day express delivery at checkout' },
      ],
    }}
  />
);

export default UK;
