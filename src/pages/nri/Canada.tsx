import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';

const Canada = () => (
  <NRILandingPage
    config={{
      country: 'Canada',
      countryCode: 'CA',
      slug: 'indian-ethnic-wear-canada',
      seoTitle: 'Buy Indian Ethnic Wear Online Canada | Sarees, Lehengas & Suits - LuxeMia',
      seoDescription: 'Buy Indian ethnic wear online in Canada. Shop sarees, bridal lehengas, salwar suits & menswear. Flat rate shipping $14.95/item, free on orders over $300. 7-10 day standard delivery to Canada.',
      heroTitle: 'Authentic Indian Ethnic Wear Delivered to Canada',
      heroSubtitle: 'Shipped from India with Care',
      shippingTime: '7-10 business days',
      shippingCost: '$14.95/item, free on orders over $300',
      customsNote: 'Canadian orders may be subject to GST/HST (5-15%) and import duties of 0-18% on textile imports. These charges are collected by the carrier at delivery.',
      faqs: [
        {
          question: 'How long does shipping to Canada take?',
          answer: 'Standard shipping (USPS/UPS) takes 7-10 business days transit. Express shipping (DHL) takes 3-5 business days transit. Ready-made orders dispatch in 3-5 business days; custom/alteration orders dispatch in 5-7 business days.',
        },
        {
          question: 'Is shipping free to Canada?',
          answer: 'We offer a flat shipping rate of $14.95 per item, with free shipping on all orders over $300. No coupon code needed — free shipping is applied automatically at checkout.',
        },
        {
          question: 'Will I have to pay customs duties in Canada?',
          answer: 'Canadian customs may charge GST/HST (5-15% depending on your province) and import duties of 0-18% on textile imports. These charges are collected by the carrier at delivery and are the customer\'s responsibility.',
        },
        {
          question: 'Can I return items from Canada?',
          answer: 'All sales are final. Due to the international nature of our shipments, LuxeMia does not accept returns or exchanges. The only exception is genuine shipping damage, which must be documented with an unboxing video and reported within 48 hours of delivery. Please review our Returns Policy for full details.',
        },
        {
          question: 'Do you ship to all Canadian provinces?',
          answer: 'Yes, we deliver to all Canadian provinces and territories including British Columbia, Alberta, Ontario, Quebec, and the Maritime provinces. Remote areas may have slightly longer delivery times.',
        },
      ],
      benefits: [
        { icon: Truck, title: 'Worldwide Shipping', description: 'Flat rate $14.95/item, free over $300' },
        { icon: Shield, title: 'Insured Delivery', description: 'Every package fully insured and tracked' },
        { icon: Clock, title: 'Express Available', description: '3-5 day DHL express shipping at checkout' },
      ],
    }}
  />
);

export default Canada;
