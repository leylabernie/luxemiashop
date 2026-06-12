import BuyerIntentCollectionPage, { type BuyerIntentCollectionConfig } from './BuyerIntentCollectionPage';

const config: BuyerIntentCollectionConfig = {
  route: '/collections/sarees-under-100',
  collectionKey: 'sarees-under-100',
  eyebrow: 'Affordable Sarees',
  h1: 'Sarees Under $100',
  intro: 'Shop affordable Indian sarees under $100 for parties, festivals, weddings, and everyday celebrations. This page only includes true saree or sari products under the price threshold.',
  keywordIntro: 'Browse sarees under $100, affordable Indian sarees, readymade sarees, festive sarees, party sarees, and celebration-ready drapes at accessible prices.',
  collectionName: 'Sarees Under $100',
  collectionDescription: 'Affordable Indian saree collection under $100 using saree or sari product signals and price filtering.',
  faqHeading: 'Frequently Asked Questions - Sarees Under $100',
  faqs: [
    {
      question: 'What types of sarees are included under $100?',
      answer: 'This collection includes products with saree or sari signals where the minimum product price is under $100. It excludes non-saree products and jewelry.',
    },
    {
      question: 'Are sarees under $100 good for weddings?',
      answer: 'Some under-$100 sarees can work for wedding guest events, festivals, parties, and family celebrations. For bridal or very formal ceremonies, review fabric and embellishment carefully.',
    },
    {
      question: 'Do sarees include blouse stitching?',
      answer: 'Blouse and stitching details vary by product. Check the product page for included pieces, size options, and available customization before ordering.',
    },
  ],
  relatedHeading: 'More Saree Shopping',
  relatedLinks: [
    { label: 'All Sarees', href: '/sarees' },
    { label: 'Wedding Sarees', href: '/collections/wedding-sarees' },
    { label: 'Silk Sarees', href: '/collections/silk-sarees' },
    { label: 'Ready to Wear', href: '/collections/ready-to-wear' },
    { label: 'Wedding Guest Under $250', href: '/collections/wedding-guest-outfits-under-250' },
  ],
  emptyTitle: 'No sarees under $100 right now',
  emptyDescription: 'No products currently meet the strict saree and under-$100 rule. Browse all sarees for the latest arrivals.',
  emptyLink: { label: 'Explore All Sarees', href: '/sarees' },
};

export default function SareesUnder100() {
  return <BuyerIntentCollectionPage config={config} />;
}
