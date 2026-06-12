import BuyerIntentCollectionPage, { type BuyerIntentCollectionConfig } from './BuyerIntentCollectionPage';

const config: BuyerIntentCollectionConfig = {
  route: '/collections/wedding-guest-outfits-under-250',
  collectionKey: 'wedding-guest-outfits-under-250',
  eyebrow: 'Wedding Guest Value',
  h1: 'Indian Wedding Guest Outfits Under $250',
  intro: 'Shop Indian wedding guest outfits under $250 across sarees, suits, lehengas, and reception-ready occasionwear. This page excludes bridal, groom, sherwani, and heavy bridal signals.',
  keywordIntro: 'Explore affordable wedding guest sarees, party wear suits, reception outfits, sangeet-ready styles, and festive Indian outfits under $250.',
  collectionName: 'Indian Wedding Guest Outfits Under $250',
  collectionDescription: 'Non-bridal, non-menswear Indian wedding guest outfits under $250 with wedding, reception, sangeet, party, festive, or occasion signals.',
  faqHeading: 'Frequently Asked Questions - Wedding Guest Outfits Under $250',
  faqs: [
    {
      question: 'What can I wear to an Indian wedding as a guest under $250?',
      answer: 'Sarees, salwar suits, anarkali suits, shararas, lehengas, and party-ready ethnic outfits can work well under $250 when they are festive without looking bridal.',
    },
    {
      question: 'Are bridal or groom outfits included?',
      answer: 'No. This page excludes bridal, bride, groom, sherwani, and heavy bridal signals so the collection stays focused on guest-appropriate products.',
    },
    {
      question: 'Can one outfit work for multiple wedding events?',
      answer: 'Yes. A polished saree or suit can often work for reception, sangeet, and family wedding events. Choose the level of embellishment based on the ceremony and dress code.',
    },
  ],
  relatedHeading: 'More Wedding Guest Shopping',
  relatedLinks: [
    { label: 'All Wedding Guest Outfits', href: '/collections/wedding-guest-outfits' },
    { label: 'Reception Outfits', href: '/collections/reception-outfits' },
    { label: 'Sarees Under $100', href: '/collections/sarees-under-100' },
    { label: 'Suits Under $150', href: '/collections/suits-under-150' },
    { label: 'Ready to Wear', href: '/collections/ready-to-wear' },
  ],
  emptyTitle: 'No wedding guest outfits under $250 right now',
  emptyDescription: 'No products currently meet the strict non-bridal wedding guest and under-$250 rule. Browse the full wedding guest collection instead.',
  emptyLink: { label: 'Explore Wedding Guest Outfits', href: '/collections/wedding-guest-outfits' },
};

export default function WeddingGuestOutfitsUnder250() {
  return <BuyerIntentCollectionPage config={config} />;
}
