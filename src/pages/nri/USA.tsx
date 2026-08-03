import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';

const USA = () => (
  <NRILandingPage
    config={{
      country: 'the United States',
      countryCode: 'US',
      slug: 'indian-ethnic-wear-usa',
      seoTitle: 'Indian Ethnic Wear Online USA | LuxeMia',
      seoDescription: 'Shop sarees, lehengas, salwar suits, menswear and jewelry online for U.S. delivery. Free shipping over $150; $12 below. Tracking after dispatch.',
      heroTitle: 'Indian Ethnic Wear Online for U.S. Shoppers',
      heroSubtitle: 'Product Details, Sizing Guidance and Tracked Shipping',
      shippingTime: 'tracking provided after dispatch',
      shippingCost: '$12 per order; free over $150',
      customsNote: 'US imports may be subject to duties, taxes, or carrier processing fees based on product classification, value, and current customs rules. These charges are not included unless checkout explicitly states otherwise.',
      faqs: [
        {
          question: 'How long does shipping to the United States take?',
          answer: 'Tracking is provided after dispatch, and carrier transit begins after dispatch. Delivery timing depends on the product, any selected tailoring, and the service shown at checkout. Contact LuxeMia before ordering if your event date is time-sensitive.',
        },
        {
          question: 'Is shipping free to the United States?',
          answer: 'Shipping is free on orders over $150 and costs $12 below that. The applicable rate is shown at checkout.',
        },
        {
          question: 'Will I have to pay customs duties?',
          answer: 'Possibly. Duties, taxes, and carrier processing fees depend on current rules, product classification, and shipment value. Review current US Customs and Border Protection guidance before ordering.',
        },
        {
          question: 'Can I return an item?',
          answer: 'All sales are final. Genuine shipping damage must be documented with an unboxing video and reported within 48 hours of delivery. Review the Returns Policy for full details.',
        },
        {
          question: 'Do you offer custom sizing?',
          answer: 'Sizing and tailoring options vary by garment. Review the product page and size selector, or contact LuxeMia before ordering if you need measurement help.',
        },
      ],
      benefits: [
        { icon: Truck, title: 'U.S. Delivery', description: '$12 per order; free over $150' },
        { icon: Shield, title: 'Clear Policies', description: 'Shipping and damage-claim terms online' },
        { icon: Clock, title: 'Tracked', description: 'Tracking provided after dispatch' },
      ],
    }}
  />
);

export default USA;
