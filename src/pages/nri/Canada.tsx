import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';

const Canada = () => (
  <NRILandingPage
    config={{
      country: 'Canada',
      countryCode: 'CA',
      slug: 'indian-ethnic-wear-canada',
      seoTitle: 'Indian Ethnic Wear Online in Canada | LuxeMia',
      seoDescription: 'Shop Indian ethnic wear online for delivery to Canada. International standard shipping is $14.99 below $300 and free at $300 and above.',
      heroTitle: 'Indian Ethnic Wear Online in Canada',
      heroSubtitle: 'Indian ethnic wear available online',
      shippingTime: 'Tracking provided after dispatch',
      shippingCost: '$14.99 below $300 and free at $300 and above',
      customsNote: 'Duties, import taxes, brokerage, or carrier fees may apply unless checkout explicitly states otherwise.',
      faqs: [
        {
          question: 'Does LuxeMia ship outside the United States?',
          answer: 'Yes. LuxeMia currently accepts Canadian shipping addresses.',
        },
        {
          question: 'How much is shipping to Canada?',
          answer: 'International standard shipping is $14.99 below $300 and free at $300 and above. Checkout shows the final available service and charge.',
        },
      ],
      benefits: [
        { icon: Truck, title: 'Canada Shipping', description: 'Tracking provided after dispatch' },
        { icon: Shield, title: 'Tracked Delivery', description: 'Tracking sent after dispatch' },
        { icon: Clock, title: 'Available Online', description: 'For events coming up soon' },
      ],
    }}
  />
);

export default Canada;
