import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';
import { COVERED_ORDER_ISSUE_ANSWER } from '@/lib/returnPolicyCopy';

const NRIGeneral = () => (
  <NRILandingPage
    config={{
      country: 'the United States',
      countryCode: 'US',
      slug: 'nri',
      seoTitle: 'Indian Ethnic Wear Online for U.S. Shoppers | LuxeMia',
      seoDescription: 'Shop Indian ethnic wear online for U.S. delivery. Compare exact product details, sizing and availability. Free shipping at $199 and above; tracking after dispatch.',
      heroTitle: 'Indian Ethnic Wear Online for U.S. Shoppers',
      heroSubtitle: 'Compare Exact Product Details Before Ordering',
      shippingTime: 'tracking provided after dispatch',
      shippingCost: '$14.99 per order; free at $199 and above',
      customsNote: 'Taxes collected by LuxeMia, if applicable, are calculated at checkout.',
      faqs: [
        {
          question: 'Where does LuxeMia ship?',
          answer: 'LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. Tracking is provided after dispatch.',
        },
        {
          question: 'When does shipping become free?',
          answer: 'Orders at $199 and above qualify for free U.S. shipping. Orders below $199 cost $14.99 per order.',
        },
        {
          question: 'Will taxes be charged?',
          answer: 'Taxes collected by LuxeMia, if applicable, are calculated at checkout.',
        },
        {
          question: 'Can I get custom sizing?',
          answer: 'Sizing and tailoring options vary by garment. Review the product page and size selector, or contact LuxeMia before ordering if you need measurement help.',
        },
        {
          question: 'What if my item arrives damaged?',
          answer: COVERED_ORDER_ISSUE_ANSWER,
        },
      ],
      benefits: [
        { icon: Truck, title: 'U.S. Delivery', description: '$14.99 per order; free at $199 and above' },
        { icon: Shield, title: 'Clear Product Details', description: 'Review materials, sizing and included pieces' },
        { icon: Clock, title: 'Tracked', description: 'Tracking provided after dispatch' },
      ],
    }}
  />
);

export default NRIGeneral;
