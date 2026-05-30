export interface HomepageFaq {
  question: string;
  answer: string;
}

export const HOMEPAGE_FAQS: HomepageFaq[] = [
  {
    question: 'Do you offer international shipping for Indian ethnic wear?',
    answer: 'Yes, LuxeMia ships to the USA, Canada, and Australia. Free shipping on orders over $350 USD, and a flat rate of $25 USD for orders under $350. All shipments include full tracking and insurance. You can find more details on our Shipping Policy page.',
  },
  {
    question: 'What is your return policy?',
    answer: 'All sales are final. LuxeMia does not accept returns or exchanges for any reason, including sizing issues, colour variations, or change of mind. The only exception is genuine shipping damage, which must be supported by a mandatory unboxing video. Please refer to our Returns Policy page for full details.',
  },
  {
    question: 'Are your products authentic Indian ethnic wear?',
    answer: "Absolutely. At LuxeMia, we source our products directly from India's established textile hubs and suppliers, ensuring authentic designs and quality materials at fair prices.",
  },
  {
    question: 'Can I get custom sizing or alterations for my outfit?',
    answer: 'We understand the importance of a perfect fit. While many of our items are ready-to-wear, we do offer custom alteration services for select products. Please contact our styling assistance team for more information.',
  },
  {
    question: 'How can I ensure the color of the outfit is accurate when viewing online?',
    answer: 'We strive for accurate color representation in our product photography. However, slight color variations may occur due to screen settings and lighting. We recommend reviewing all available product images and descriptions.',
  },
  {
    question: 'Do I need to pay customs duties or taxes on international orders?',
    answer: 'While LuxeMia offers free shipping, customers are responsible for any customs duties, taxes, or import fees levied by their country of residence. Please check with your local customs office for more information.',
  },
  {
    question: 'How can I get styling advice for a specific occasion?',
    answer: 'Our dedicated styling assistance team is here to help! You can chat with us directly via WhatsApp for personalized recommendations and expert advice.',
  },
];

export function generateHomepageFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOMEPAGE_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
