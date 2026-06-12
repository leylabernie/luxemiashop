import BuyerIntentCollectionPage, { type BuyerIntentCollectionConfig } from './BuyerIntentCollectionPage';

const config: BuyerIntentCollectionConfig = {
  route: '/collections/groom-outfits',
  collectionKey: 'groom-outfits',
  eyebrow: 'Wedding Menswear',
  h1: 'Indian Groom Outfits',
  intro: 'Shop Indian groom outfits online, including sherwanis and wedding menswear selected with groom, sherwani, or wedding menswear signals. Women\'s bridal products are excluded from this page.',
  keywordIntro: 'Explore groom sherwanis, Indian wedding menswear, reception sherwanis, embroidered sherwanis, and formal ethnic wear for ceremonies and receptions.',
  collectionName: 'Indian Groom Outfits',
  collectionDescription: 'Indian groom outfit collection with menswear, groom, sherwani, and wedding menswear product signals.',
  faqHeading: 'Frequently Asked Questions - Indian Groom Outfits',
  faqs: [
    {
      question: 'What does an Indian groom usually wear?',
      answer: 'Indian grooms often wear sherwanis, kurta pajama sets, Indo-Western menswear, or formal ethnic jackets depending on the ceremony, region, and wedding dress code.',
    },
    {
      question: 'Are women\'s bridal products included here?',
      answer: 'No. This page uses menswear plus groom, sherwani, or wedding menswear signals and excludes women\'s bridal product signals.',
    },
    {
      question: 'When should a groom order his outfit?',
      answer: 'For wedding menswear, order as early as possible so there is time to confirm sizing, styling, shipping, and any tailoring needs before the ceremony.',
    },
  ],
  relatedHeading: 'Complete the Wedding Wardrobe',
  relatedLinks: [
    { label: 'All Menswear', href: '/menswear' },
    { label: 'Ready to Wear', href: '/collections/ready-to-wear' },
    { label: 'Bridal Lehengas', href: '/collections/bridal-lehengas' },
    { label: 'Wedding Guest Outfits', href: '/collections/wedding-guest-outfits' },
    { label: 'Size Guide', href: '/size-guide' },
  ],
  emptyTitle: 'No groom outfits right now',
  emptyDescription: 'No products currently meet the strict groom outfit rule. Browse all menswear for the latest sherwanis and kurta sets.',
  emptyLink: { label: 'Explore Menswear', href: '/menswear' },
};

export default function GroomOutfits() {
  return <BuyerIntentCollectionPage config={config} />;
}
