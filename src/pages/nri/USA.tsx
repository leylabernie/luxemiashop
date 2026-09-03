import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';
import { RETURN_POLICY_FAQ_ANSWER } from '@/lib/returnPolicyCopy';

const USA = () => (
  <NRILandingPage
    config={{
      country: 'the United States',
      countryCode: 'US',
      slug: 'indian-ethnic-wear-usa',
      seoTitle: 'Indian Ethnic Wear Online USA | LuxeMia',
      seoDescription: 'Shop sarees, lehengas, salwar suits, menswear and jewelry online for U.S. delivery. Free shipping at $199 and above; $14.99 below. Review current products and delivery guidance.',
      heroTitle: 'Indian Ethnic Wear Online for U.S. Shoppers',
      heroSubtitle: 'Product Details, Sizing Guidance and Tracked Shipping',
      shippingTime: 'tracking timing varies by fulfilled order',
      shippingCost: '$14.99 per order; free at $199 and above',
      customsNote: 'Taxes collected by LuxeMia, if applicable, are calculated at checkout.',
      faqs: [
        {
          question: 'How long does shipping to the United States take?',
          answer: 'When tracking is issued, carrier scans can appear after label creation. Carrier transit begins after dispatch. Delivery timing depends on the product, any selected tailoring, and the service shown at checkout. Contact LuxeMia before ordering if your event date is time-sensitive.',
        },
        {
          question: 'Is shipping free to the United States?',
          answer: 'Shipping is free at $199 and above and costs $14.99 below that. The applicable rate is shown at checkout.',
        },
        {
          question: 'Will taxes be charged?',
          answer: 'Taxes collected by LuxeMia, if applicable, are calculated at checkout.',
        },
        {
          question: 'Can I return an item?',
          answer: RETURN_POLICY_FAQ_ANSWER,
        },
        {
          question: 'Do you offer custom sizing?',
          answer: 'Sizing and tailoring options vary by garment. Review the product page and size selector, or contact LuxeMia before ordering if you need measurement help.',
        },
      ],
      benefits: [
        { icon: Truck, title: 'U.S. Delivery', description: '$14.99 per order; free at $199 and above' },
        { icon: Shield, title: 'Clear Policies', description: 'Shipping and damage-claim terms online' },
        { icon: Clock, title: 'Tracked', description: 'When tracking is issued, carrier scans may appear after label creation' },
      ],
    }}
  />
);

export default USA;
