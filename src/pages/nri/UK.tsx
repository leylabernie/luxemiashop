import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';

const UK = () => (
  <NRILandingPage
    config={{
      country: 'the United Kingdom',
      countryCode: 'GB',
      slug: 'indian-ethnic-wear-uk',
      seoTitle: 'Indian Ethnic Wear Online in the UK | LuxeMia',
      seoDescription: 'Shop Indian ethnic wear online for delivery to the United Kingdom. International standard shipping is $14.99 below $300 and free at $300 and above.',
      heroTitle: 'Indian Ethnic Wear Online in the UK',
      heroSubtitle: 'Indian ethnic wear available online',
      shippingTime: 'Tracking provided after dispatch',
      shippingCost: '$14.99 below $300 and free at $300 and above',
      customsNote: 'Duties, import taxes, brokerage, or carrier fees may apply unless checkout explicitly states otherwise.',
      faqs: [
        {
          question: 'Does LuxeMia ship outside the United States?',
          answer: 'Yes. LuxeMia currently accepts United Kingdom shipping addresses.',
        },
        {
          question: 'How much is shipping to the UK?',
          answer: 'International standard shipping is $14.99 below $300 and free at $300 and above. Checkout shows the final available service and charge.',
        },
      ],
      benefits: [
        { icon: Truck, title: 'UK Shipping', description: 'Tracking provided after dispatch' },
        { icon: Shield, title: 'Tracked Delivery', description: 'Tracking sent after dispatch' },
        { icon: Clock, title: 'Available Online', description: 'For events coming up soon' },
      ],
    }}
  />
);

export default UK;
