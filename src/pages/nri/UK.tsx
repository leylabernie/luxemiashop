import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';

const UK = () => (
  <NRILandingPage
    config={{
      country: 'UK',
      countryCode: 'GB',
      slug: 'indian-ethnic-wear-uk',
      seoTitle: 'Indian Designer Sarees & Lehengas UK | Free Delivery | LuxeMia',
      seoDescription: 'Shop Indian designer sarees, bridal lehengas & salwar suits in the UK. Free delivery on orders over $99. 7-12 day shipping from India to United Kingdom.',
      heroTitle: 'Authentic Indian Ethnic Wear Delivered to the UK',
      heroSubtitle: 'Free Delivery Across the United Kingdom',
      shippingTime: '7-12 business days',
      shippingCost: 'Free on orders over $99',
      customsNote: 'UK orders over £135 may be subject to 20% import VAT.',
      testimonial: {
        name: 'Deepa R.',
        location: 'London, UK',
        rating: 4,
        body: 'The suit is gorgeous — the fabric is soft and the work is detailed. Sizing was perfect with the size guide. Would definitely order again.',
      },
      faqs: [
        {
          question: 'How long does delivery to the UK take?',
          answer: 'Standard delivery to the UK takes 7-12 business days. Express delivery (3-5 business days) is also available at checkout.',
        },
        {
          question: 'Is delivery free to the UK?',
          answer: 'Yes! We offer free standard delivery on all orders over $99 to anywhere in the United Kingdom.',
        },
        {
          question: 'Will I have to pay import VAT?',
          answer: 'Orders over £135 in value may be subject to UK import VAT at 20%. This is collected by the carrier at delivery. Orders under £135 are typically VAT-free.',
        },
        {
          question: 'Can I return items from the UK?',
          answer: 'Yes, we accept returns within 7 days of delivery. Standard-sized items must be unworn with tags intact. Custom-sized items are final sale. Contact us via WhatsApp or email to arrange a return.',
        },
        {
          question: 'Do you ship to Northern Ireland and Scottish Highlands?',
          answer: 'Yes, we deliver to all UK addresses including Northern Ireland, Scottish Highlands, and Channel Islands. Delivery times may vary slightly for remote areas.',
        },
      ],
      benefits: [
        { icon: Truck, title: 'Free UK Delivery', description: 'Free on orders over $99 — 7-12 day delivery' },
        { icon: Shield, title: 'Secure Packaging', description: 'Premium gift-ready packaging on every order' },
        { icon: Clock, title: 'Express Available', description: '3-5 day express delivery at checkout' },
      ],
    }}
  />
);

export default UK;
