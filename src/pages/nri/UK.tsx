import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';

const UK = () => (
  <NRILandingPage
    config={{
      country: 'United States',
      countryCode: 'US',
      slug: 'nri',
      seoTitle: 'United States Shipping Only | LuxeMia',
      seoDescription: 'LuxeMia currently ships Indian ethnic wear online to United States addresses only.',
      heroTitle: 'United States Shipping Only',
      heroSubtitle: 'Indian ethnic wear available online',
      shippingTime: 'Tracking provided after dispatch',
      shippingCost: 'Free over $150, $12 flat below that',
      customsNote: 'LuxeMia currently accepts United States shipping addresses only.',
      faqs: [
        {
          question: 'Does LuxeMia ship outside the United States?',
          answer: 'No. LuxeMia currently ships Indian ethnic wear online to United States addresses only.',
        },
        {
          question: 'How much is US shipping?',
          answer: 'Free US shipping applies on orders over $150. Orders below $150 ship for a flat $12 rate.',
        },
      ],
      benefits: [
        { icon: Truck, title: 'US Shipping', description: 'Tracking provided after dispatch' },
        { icon: Shield, title: 'Tracked Delivery', description: 'Tracking sent after dispatch' },
        { icon: Clock, title: 'Available Online', description: 'For events coming up soon' },
      ],
    }}
  />
);

export default UK;
