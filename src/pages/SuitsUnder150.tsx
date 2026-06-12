import BuyerIntentCollectionPage, { type BuyerIntentCollectionConfig } from './BuyerIntentCollectionPage';

const config: BuyerIntentCollectionConfig = {
  route: '/collections/suits-under-150',
  collectionKey: 'suits-under-150',
  eyebrow: 'Budget Edit',
  h1: 'Indian Suits Under $150',
  intro: 'Shop affordable Indian suits under $150, including salwar kameez, anarkali, sharara, palazzo, gharara, patiala, and churidar styles. Menswear is excluded from this women\'s suit edit.',
  keywordIntro: 'Find Indian suits under $150 for festivals, Eid, wedding guests, family gatherings, and easy celebration dressing without inflating the page with unrelated menswear.',
  collectionName: 'Indian Suits Under $150',
  collectionDescription: 'Affordable women\'s Indian suit collection under $150 with salwar, anarkali, sharara, gharara, palazzo, patiala, churidar, and kameez signals.',
  faqHeading: 'Frequently Asked Questions - Indian Suits Under $150',
  faqs: [
    {
      question: 'What styles are included in suits under $150?',
      answer: 'This page includes women\'s suit styles such as salwar kameez, anarkali suits, sharara suits, gharara suits, palazzo suits, patiala suits, and churidar suits when the price is under $150.',
    },
    {
      question: 'Are menswear products included?',
      answer: 'No. The matching rule excludes menswear, groom, sherwani, and men\'s kurta signals so this page stays focused on women\'s Indian suits.',
    },
    {
      question: 'Are these suits appropriate for weddings and festivals?',
      answer: 'Many under-$150 suits work well for festive events, Eid, parties, and wedding guest looks. Review each product\'s fabric, embellishment, and sizing before ordering for a specific event.',
    },
  ],
  relatedHeading: 'Shop Related Suit Collections',
  relatedLinks: [
    { label: 'All Suits', href: '/suits' },
    { label: 'Anarkali Suits', href: '/collections/anarkali-suits' },
    { label: 'Pakistani Suits', href: '/collections/pakistani-suits' },
    { label: 'Sharara Suits', href: '/collections/sharara-suits' },
    { label: 'Ready to Wear', href: '/collections/ready-to-wear' },
  ],
  emptyTitle: 'No suits under $150 right now',
  emptyDescription: 'No products currently meet the strict women\'s suit and under-$150 rule. Browse all suits for the latest options.',
  emptyLink: { label: 'Explore All Suits', href: '/suits' },
};

export default function SuitsUnder150() {
  return <BuyerIntentCollectionPage config={config} />;
}
