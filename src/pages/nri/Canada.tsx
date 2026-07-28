import { Truck, Shield, Clock } from 'lucide-react';
import NRILandingPage from './NRILandingPage';

const Canada = () => (
  <NRILandingPage
    config={{
      country: 'United States',
      countryCode: 'US',
      slug: 'nri',
      seoTitle: 'United States Shipping Only | LuxeMia',
      seoDescription: 'LuxeMia currently ships ready-to-ship Indian ethnic wear to United States addresses only.',
      heroTitle: 'United States Shipping Only',
      heroSubtitle: 'Ready-to-ship Indian ethnic wear held in US stock',
      shippingTime: 'Ships within 2 business days',
      shippingCost: 'Free over $150, $12 flat below that',
      customsNote: 'LuxeMia currently accepts United States shipping addresses only.',
      faqs: [
        {
          question: 'Does LuxeMia ship outside the United States?',
          answer: 'No. LuxeMia currently ships ready-to-ship Indian ethnic wear to United States addresses only.',
        },
        {
          question: 'How much is US shipping?',
          answer: 'Free US shipping applies on orders over $150. Orders below $150 ship for a flat $12 rate.',
        },
      ],
      benefits: [
        { icon: Truck, title: 'US Shipping', description: 'Ships within 2 business days' },
        { icon: Shield, title: 'Tracked Delivery', description: 'Tracking sent after dispatch' },
        { icon: Clock, title: 'Ready to Ship', description: 'For events coming up soon' },
      ],
    }}
  />
);

export default Canada;
