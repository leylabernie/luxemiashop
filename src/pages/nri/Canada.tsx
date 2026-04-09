import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';

const Canada = () => (
  <NRILandingPage
    config={{
      country: 'Canada',
      countryCode: 'CA',
      slug: 'indian-ethnic-wear-canada',
      seoTitle: 'Indian Ethnic Wear Canada | Sarees, Lehengas & Suits | LuxeMia',
      seoDescription: 'Shop Indian ethnic wear in Canada. Designer sarees, bridal lehengas, salwar suits & menswear. Free shipping on orders over $99. 10-14 day delivery to Canada.',
      heroTitle: 'Authentic Indian Ethnic Wear Delivered to Canada',
      heroSubtitle: 'Free Shipping Coast to Coast',
      shippingTime: '10-14 business days',
      shippingCost: 'Free on orders over $99',
      customsNote: 'Canadian orders may be subject to GST/HST (5-15%) on imported goods.',
      testimonial: {
        name: 'Sunita K.',
        location: 'Toronto, Canada',
        rating: 5,
        body: 'Ordered the saree for my daughter\'s reception ceremony. The colors are vibrant and exactly as shown. Shipping to Canada was faster than expected — arrived in 10 days.',
      },
      faqs: [
        {
          question: 'How long does shipping to Canada take?',
          answer: 'Standard shipping to Canada takes 10-14 business days. Express shipping (5-7 business days) is available at checkout.',
        },
        {
          question: 'Is shipping free to Canada?',
          answer: 'Yes! We offer free standard shipping on all orders over $99 to anywhere in Canada.',
        },
        {
          question: 'Will I have to pay customs duties in Canada?',
          answer: 'Canadian customs may charge GST/HST (5-15% depending on your province) and import duties of 0-18% on textile imports. These charges are collected by the carrier at delivery.',
        },
        {
          question: 'Can I return items from Canada?',
          answer: 'Yes, we accept returns within 14 days of delivery. Items must be unworn with tags intact. Contact us via WhatsApp or email to initiate a return.',
        },
        {
          question: 'Do you ship to all Canadian provinces?',
          answer: 'Yes, we deliver to all Canadian provinces and territories including British Columbia, Alberta, Ontario, Quebec, and the Maritime provinces. Remote areas may have slightly longer delivery times.',
        },
      ],
      benefits: [
        { icon: Truck, title: 'Free Canadian Shipping', description: 'Free on orders over $99 — 10-14 day delivery' },
        { icon: Shield, title: 'Insured Delivery', description: 'Every package fully insured and tracked' },
        { icon: Clock, title: 'Express Available', description: '5-7 day express shipping at checkout' },
      ],
    }}
  />
);

export default Canada;
