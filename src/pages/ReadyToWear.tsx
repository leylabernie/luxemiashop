import BuyerIntentCollectionPage, { type BuyerIntentCollectionConfig } from './BuyerIntentCollectionPage';

const config: BuyerIntentCollectionConfig = {
  route: '/collections/ready-to-wear',
  collectionKey: 'ready-to-wear',
  eyebrow: 'Convenience Edit',
  h1: 'Ready to Wear Indian Outfits',
  intro: 'Shop readymade and stitched Indian outfits selected for easier sizing and event-ready dressing. This edit includes ready-to-wear sarees, suits, lehengas, and menswear with clear ready-to-wear or readymade signals.',
  keywordIntro: 'Explore ready to wear Indian outfits, readymade sarees, stitched salwar suits, pre-stitched styles, and easy occasionwear for weddings, festivals, and family celebrations.',
  collectionName: 'Ready to Wear Indian Outfits',
  collectionDescription: 'Readymade and stitched Indian outfits selected with ready-to-wear, readymade, pre-stitched, stitched, or pre-draped product signals.',
  faqHeading: 'Frequently Asked Questions - Ready to Wear Indian Outfits',
  faqs: [
    {
      question: 'What does ready to wear mean for Indian outfits?',
      answer: 'Ready to wear means the product has a stitched, readymade, pre-stitched, or pre-draped signal in the product data. Always review the product size options and description before ordering.',
    },
    {
      question: 'Are ready to wear outfits the same as ready to ship?',
      answer: 'No. Ready to wear describes stitching or wearability. Ready to ship requires a separate fulfillment timing signal, so this page does not use shipping speed as a matching rule.',
    },
    {
      question: 'Can I wear these outfits to weddings and festivals?',
      answer: 'Yes. This collection includes occasion-ready ethnic wear for weddings, receptions, parties, festivals, and family events where the product has a true readymade or stitched signal.',
    },
  ],
  relatedHeading: 'Continue Shopping',
  relatedLinks: [
    { label: 'Suits Under $150', href: '/collections/suits-under-150' },
    { label: 'Sarees Under $100', href: '/collections/sarees-under-100' },
    { label: 'Wedding Guest Under $250', href: '/collections/wedding-guest-outfits-under-250' },
    { label: 'New Arrivals', href: '/new-arrivals' },
    { label: 'Size Guide', href: '/size-guide' },
  ],
  emptyTitle: 'Ready to wear edit is being refreshed',
  emptyDescription: 'No products currently meet the strict ready-to-wear rule. Browse new arrivals while this collection is updated.',
  emptyLink: { label: 'Explore New Arrivals', href: '/new-arrivals' },
};

export default function ReadyToWear() {
  return <BuyerIntentCollectionPage config={config} />;
}
