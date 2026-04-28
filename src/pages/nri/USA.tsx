import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';

const USA = () => (
  <NRILandingPage
    config={{
      country: 'USA',
      countryCode: 'US',
      slug: 'indian-ethnic-wear-usa',
      seoTitle: 'Buy Indian Ethnic Wear Online USA | Free Shipping | LuxeMia',
      seoDescription: 'Shop authentic Indian ethnic wear delivered to USA. Designer sarees, bridal lehengas, salwar suits & menswear. Free shipping on orders over $99. 7-12 day delivery.',
      heroTitle: 'Authentic Indian Ethnic Wear Delivered to the USA',
      heroSubtitle: 'Free Shipping Across America',
      shippingTime: '7-12 business days',
      shippingCost: 'Free on orders over $99',
      customsNote: 'Most orders under $800 are duty-free under the US de minimis threshold.',
      faqs: [
        {
          question: 'How long does shipping to the USA take?',
          answer: 'Standard shipping to the USA takes 7-12 business days. Express shipping (3-5 business days) is available at checkout for an additional fee.',
        },
        {
          question: 'Is shipping free to the USA?',
          answer: 'Yes! We offer free standard shipping on all orders over $99 to the contiguous United States. Alaska and Hawaii may have additional shipping charges.',
        },
        {
          question: 'Will I have to pay customs duties?',
          answer: 'Most individual orders under $800 enter the US duty-free under the de minimis threshold. Orders over $800 may be subject to import duties of 0-32% depending on the item classification.',
        },
        {
          question: 'Can I return items from the USA?',
          answer: 'Yes, we accept returns within 7 days of delivery. Standard-sized items must be unworn with tags intact. Custom-sized items are final sale. Contact us via WhatsApp or email to initiate a return. We provide prepaid return labels for US customers.',
        },
        {
          question: 'Do you offer custom sizing for US customers?',
          answer: 'Absolutely! All our outfits are available in custom sizing. Provide your measurements during checkout and our tailors will create a perfect fit. Custom orders take an additional 2-3 weeks.',
        },
      ],
      benefits: [
        { icon: Truck, title: 'Free US Shipping', description: 'Free on orders over $99 — 7-12 day delivery' },
        { icon: Shield, title: 'Duty-Free Under $800', description: 'Most orders enter the US without customs duties' },
        { icon: Clock, title: 'Express Available', description: '3-5 day express shipping at checkout' },
      ],
    }}
  />
);

export default USA;
