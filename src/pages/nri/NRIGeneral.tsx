import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';

const NRIGeneral = () => (
  <NRILandingPage
    config={{
      country: 'the United States',
      countryCode: 'US',
      slug: 'nri',
      seoTitle: 'Indian Ethnic Wear Online for U.S. Shoppers | LuxeMia',
      seoDescription: 'Shop Indian ethnic wear online for U.S. delivery. Compare exact product details, sizing and availability. Free shipping at $150 and above; tracking after dispatch.',
      heroTitle: 'Indian Ethnic Wear Online for U.S. Shoppers',
      heroSubtitle: 'Compare Exact Product Details Before Ordering',
      shippingTime: 'tracking provided after dispatch',
      shippingCost: '$12 per order; free at $150 and above',
      customsNote: 'Duties, taxes, or carrier processing fees may apply unless checkout explicitly states otherwise. Review current US customs guidance before ordering.',
      faqs: [
        {
          question: 'Where does LuxeMia ship?',
          answer: 'LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. Tracking is provided after dispatch.',
        },
        {
          question: 'When does shipping become free?',
          answer: 'Orders at $150 and above qualify for free U.S. shipping. Orders below $150 cost $12 per order.',
        },
        {
          question: 'Will I have to pay customs duties?',
          answer: 'Possibly. Duties, taxes, and carrier processing fees depend on current rules, product classification, and shipment value. They are not included unless checkout explicitly states otherwise.',
        },
        {
          question: 'Can I get custom sizing?',
          answer: 'Sizing and tailoring options vary by garment. Review the product page and size selector, or contact LuxeMia before ordering if you need measurement help.',
        },
        {
          question: 'What if my item arrives damaged?',
          answer: 'Sales are final to the extent permitted by applicable law. For genuine shipping damage, an incorrect item, or a missing item, contact LuxeMia within 48 hours of delivery with clear photos and a continuous unboxing/opening video showing the unopened package, shipping label, and item condition.',
        },
      ],
      benefits: [
        { icon: Truck, title: 'U.S. Delivery', description: '$12 per order; free at $150 and above' },
        { icon: Shield, title: 'Clear Product Details', description: 'Review materials, sizing and included pieces' },
        { icon: Clock, title: 'Tracked', description: 'Tracking provided after dispatch' },
      ],
    }}
  />
);

export default NRIGeneral;
