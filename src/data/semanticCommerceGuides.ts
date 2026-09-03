const PUBLISHED_AT = '2026-09-02';
const REVIEWED_AT = '2026-09-02';

type GuideSource = { title: string; url: string; publisher: string };
type ComparisonRow = [choice: string, usefulWhen: string, verify: string];
type DecisionRow = [signal: string, startWith: string, why: string];
type ShopLink = [label: string, href: string, verify: string];
type GuideFaq = { question: string; answer: string };

const sources = {
  editorial: { title: 'LuxeMia Editorial Policy', url: 'https://luxemia.shop/editorial-policy', publisher: 'LuxeMia' },
  shipping: { title: 'LuxeMia Shipping Policy', url: 'https://luxemia.shop/shipping', publisher: 'LuxeMia' },
  sizing: { title: 'LuxeMia Sizing and Measurement Guide', url: 'https://luxemia.shop/sizing-measurements-guide', publisher: 'LuxeMia' },
  nistBody: { title: 'Body Dimensions for Apparel', url: 'https://www.nist.gov/publications/body-dimensions-apparel', publisher: 'National Institute of Standards and Technology' },
  ftcCare: { title: 'Care Labeling of Textile Wearing Apparel', url: 'https://www.ftc.gov/legal-library/browse/rules/care-labeling-textile-wearing-apparel-certain-piece-goods', publisher: 'U.S. Federal Trade Commission' },
  ftcTextiles: { title: 'Threading Your Way Through Textile and Wool Labeling Requirements', url: 'https://www.ftc.gov/business-guidance/resources/threading-your-way-through-labeling-requirements-under-textile-wool-acts', publisher: 'U.S. Federal Trade Commission' },
  cbpInternet: { title: 'Internet Purchases and Import Responsibilities', url: 'https://www.cbp.gov/trade/basic-import-export/internet-purchases', publisher: 'U.S. Customs and Border Protection' },
  vaIndianTextiles: { title: 'Indian Textiles', url: 'https://www.vam.ac.uk/articles/indian-textiles', publisher: 'Victoria and Albert Museum' },
  vaWeddingColour: { title: 'Wedding Colour', url: 'https://www.vam.ac.uk/articles/wedding-colour', publisher: 'Victoria and Albert Museum' },
  smithsonianSari: { title: 'The Evolution and Reinvention of the Sari', url: 'https://www.smithsonianmag.com/smart-news/offbeat-sari-london-design-museum-180982226/', publisher: 'Smithsonian Magazine' },
  smithsonianIndianAmerican: { title: 'Beyond Bollywood: Indian Americans Shape the Nation', url: 'https://www.smithsonianmag.com/smithsonian-institution/how-museums-arts-are-presenting-identity-so-that-it-unites-not-divides-180951560/', publisher: 'Smithsonian Institution' },
} satisfies Record<string, GuideSource>;

const sourceSets: Record<string, GuideSource[]> = {
  'what-should-a-male-guest-wear-to-a-three-day-indian-wedding': [sources.vaIndianTextiles, sources.vaWeddingColour, sources.smithsonianIndianAmerican],
  'what-should-a-non-indian-guest-wear-to-an-indian-wedding': [sources.vaIndianTextiles, sources.vaWeddingColour, sources.smithsonianIndianAmerican],
  'what-saree-fabrics-work-for-an-outdoor-summer-wedding': [sources.ftcTextiles, sources.ftcCare, sources.vaIndianTextiles],
  'saree-versus-lehenga-for-a-wedding-guest': [sources.vaIndianTextiles, sources.vaWeddingColour, sources.smithsonianSari],
  'sherwani-versus-kurta-set': [sources.vaIndianTextiles, sources.vaWeddingColour, sources.smithsonianIndianAmerican],
  'what-should-guests-wear-to-a-mehendi': [sources.vaWeddingColour, sources.vaIndianTextiles, sources.smithsonianIndianAmerican],
  'what-should-guests-wear-to-a-sangeet': [sources.vaWeddingColour, sources.vaIndianTextiles, sources.smithsonianIndianAmerican],
  'ready-to-ship-versus-made-to-order': [sources.cbpInternet, sources.nistBody, sources.shipping],
  'what-does-semi-stitched-lehenga-mean': [sources.nistBody, sources.ftcTextiles, sources.sizing],
  'how-to-measure-for-a-lehenga-ordered-online': [sources.nistBody, sources.sizing, sources.ftcCare],
  'chaniya-choli-versus-lehenga': [sources.vaIndianTextiles, sources.vaWeddingColour, sources.smithsonianSari],
  'how-early-to-order-for-a-fixed-wedding-date': [sources.cbpInternet, sources.shipping, sources.nistBody],
};

type GuideInput = {
  slug: string;
  title: string;
  answer: string;
  category: string;
  atAGlance: ComparisonRow[];
  decisions: DecisionRow[];
  nuances: string[];
  shopLinks: ShopLink[];
  relatedGuides: Array<[label: string, href: string]>;
  faqs: GuideFaq[];
};

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const guide = ({ slug, title, answer, category, atAGlance, decisions, nuances, shopLinks, relatedGuides, faqs }: GuideInput) => ({
  id: `semantic-${slug}`,
  slug,
  title,
  excerpt: answer,
  content: `
    <h2>At a glance</h2>
    <table data-guide-table="at-a-glance"><thead><tr><th>Choice</th><th>Useful when</th><th>Verify before ordering</th></tr></thead><tbody>
      ${atAGlance.map(([choice, use, verify]) => `<tr><td>${escapeHtml(choice)}</td><td>${escapeHtml(use)}</td><td>${escapeHtml(verify)}</td></tr>`).join('')}
    </tbody></table>
    <h2>Decision matrix</h2>
    <table data-guide-table="decision-matrix"><thead><tr><th>Your situation</th><th>Start with</th><th>Why or what to check</th></tr></thead><tbody>
      ${decisions.map(([signal, start, why]) => `<tr><td>${escapeHtml(signal)}</td><td>${escapeHtml(start)}</td><td>${escapeHtml(why)}</td></tr>`).join('')}
    </tbody></table>
    <h2>Nuance and exceptions</h2>
    <ul>${nuances.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    <p>These are shopping guidelines, not universal cultural rules. Hosts, families, regions, religions, venues and personal comfort can change the best choice. Product photographs provide styling context; the written listing and selected variant control the product specification.</p>
    <h2>Collections to compare using verified attributes</h2>
    <table data-guide-table="commercial-selections"><thead><tr><th>Collection or resource</th><th>Verify on the exact listing</th></tr></thead><tbody>
      ${shopLinks.map(([label, href, verify]) => `<tr><td><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></td><td>${escapeHtml(verify)}</td></tr>`).join('')}
    </tbody></table>
    <p data-guide-selection-rule>These links use declared category, occasion or fulfillment routes only. No material, included piece, stitching, size, price, availability or processing fact is inferred for an individual product; verify each attribute on its current listing and selected variant.</p>
    <h2>Related Guides</h2>
    <ul>${relatedGuides.map(([label, href]) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`).join('')}</ul>
    <h2>Common questions</h2>
    <div data-guide-visible-faqs>
      ${faqs.map(({ question, answer: faqAnswer }) => `<h3>${escapeHtml(question)}</h3><p>${escapeHtml(faqAnswer)}</p>`).join('')}
    </div>
    <h2>Methodology and corrections</h2>
    <p>This guide applies the <a href="/editorial-policy">LuxeMia editorial policy</a>: unsupported product facts are omitted, fulfillment is separated from sale availability and cultural variation is preserved. Sources were last reviewed on ${REVIEWED_AT}. Send a correction request with the page URL and supporting information to <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a>.</p>
  `,
  author: 'LuxeMia Editorial Team',
  publishedAt: PUBLISHED_AT,
  updatedAt: REVIEWED_AT,
  factCheckedAt: REVIEWED_AT,
  category,
  tags: title.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 8),
  image: '/images/campaigns/new-indian-ethnic-wear-2026-desktop.webp',
  imagePresentation: 'editorial' as const,
  readTime: 7,
  sources: [sources.editorial, ...(sourceSets[slug] || [])],
  guideStandard: { directAnswer: answer, faqs },
});

export const semanticCommerceGuides = [
  guide({
    slug: 'what-should-a-male-guest-wear-to-a-three-day-indian-wedding',
    title: 'What should a male guest wear to a three-day Indian wedding?',
    answer: 'A male guest can plan one outfit for each event: a comfortable kurta set for a daytime gathering, a festive kurta, bandhgala or Indo-Western set for Sangeet, and a more formal sherwani, bandhgala or kurta set for the ceremony or reception. Treat the invitation and the hosts’ guidance—not this sequence—as the final authority.',
    category: 'Wedding Guest Guide',
    atAGlance: [
      ['Daytime gathering', 'Warm venues, sitting and active celebrations', 'Fabric wording, lining, sleeve length and footwear'],
      ['Sangeet', 'An evening with dancing or performances', 'Jacket pieces, trouser fit, hem and range of movement'],
      ['Ceremony or reception', 'The hosts request more formal clothing', 'Coat length, closures, included bottoms and processing'],
    ],
    decisions: [
      ['The invitation names a dress code', 'The named level of formality', 'Ask the hosts if a term or color theme is unclear.'],
      ['You need one repeatable base', 'A kurta set with separately verified layers', 'Confirm that any jacket shown is actually included.'],
      ['The event has extensive dancing', 'A secure hem and comfortable bottoms', 'Test movement and footwear before the event.'],
    ],
    nuances: ['A sherwani is not required for every male guest.', 'There is no universal guest color ban; follow instructions from the couple or hosts.', 'Religious-site coverage and footwear practices vary, so ask before the event.'],
    shopLinks: [
      ['Wedding menswear', '/menswear', 'Included pieces, measurements, fabric wording and processing status'],
      ['Wedding guest outfits', '/collections/wedding-guest-outfits', 'Event fit, selected size, included layers and current availability'],
    ],
    relatedGuides: [['Sherwani versus kurta set', '/blog/sherwani-versus-kurta-set'], ['Indian wedding terms glossary', '/blog/indian-wedding-terms-glossary-50-events-rituals-roles']],
    faqs: [
      { question: 'Does a male guest need three completely different outfits?', answer: 'No. Repeating a well-fitting base can be practical when the hosts do not specify otherwise; verify that any added jacket or accessory is actually included.' },
      { question: 'Must a male guest wear a sherwani to the ceremony?', answer: 'No. A formal kurta set, bandhgala, Indo-Western set or non-Indian formalwear may be appropriate depending on the invitation, venue and hosts.' },
      { question: 'Can a guest wear the same color as the groom?', answer: 'There is no universal prohibition. Follow a stated palette or ask the hosts rather than relying on a broad color rule.' },
      { question: 'What matters most for a Sangeet outfit?', answer: 'Prioritize the stated formality and safe movement. Check trouser fit, coat or kurta length, secure fastenings and footwear before dancing.' },
    ],
  }),
  guide({
    slug: 'what-should-a-non-indian-guest-wear-to-an-indian-wedding',
    title: 'What should a non-Indian guest wear to an Indian wedding?',
    answer: 'A non-Indian guest can wear respectful Indian attire or suitable formalwear. Start with the invitation, ask the hosts about event-specific expectations, and choose coverage, fit and footwear for the venue. A saree, lehenga, salwar suit, kurta set or another formal outfit can work, but no single garment or color rule applies to every family or ceremony.',
    category: 'Wedding Guest Guide',
    atAGlance: [
      ['Saree or lehenga', 'A festive draped or skirt-based option suits the event', 'Draping plan, blouse, petticoat, stitching and included pieces'],
      ['Salwar suit or Anarkali', 'You want a trouser-based outfit and easier movement', 'Kurta, bottom, dupatta, lining and size measurements'],
      ['Kurta set or formalwear', 'You prefer menswear or non-Indian formal clothing', 'Dress code, jacket or bottom pieces, fit and venue expectations'],
    ],
    decisions: [
      ['You have never draped a saree', 'A suit, lehenga or professionally secured drape', 'Allow practice or dressing help rather than assuming the photographed drape is simple.'],
      ['A ceremony uses a religious venue', 'Host-confirmed coverage and footwear', 'Requirements differ; ask before choosing a neckline, hem or head covering.'],
      ['The invitation is silent', 'Comfortable formalwear', 'Ask the hosts before inferring a theme from social-media examples.'],
    ],
    nuances: ['Indian weddings differ by region, religion, family and venue.', 'Wearing Indian clothing respectfully does not require claiming an identity or ceremonial role.', 'A photographed blouse, petticoat, dupatta or accessory may not be included.'],
    shopLinks: [
      ['Women’s wedding guest outfits', '/collections/wedding-guest-outfits', 'Included pieces, coverage, stitching, selected size and processing'],
      ['Men’s wedding outfits', '/menswear', 'Kurta, jacket and bottom components plus current measurements'],
    ],
    relatedGuides: [['Saree versus lehenga for a wedding guest', '/blog/saree-versus-lehenga-for-a-wedding-guest'], ['Indian wedding terms glossary', '/blog/indian-wedding-terms-glossary-50-events-rituals-roles']],
    faqs: [
      { question: 'Is it respectful for a non-Indian guest to wear Indian attire?', answer: 'It can be when worn as guest clothing with care. Follow the invitation and hosts, and avoid claiming sacred, professional or family-specific meaning.' },
      { question: 'Do guests have to wear bright colors?', answer: 'No universal palette applies. A family may suggest festive colors, a theme or formal neutrals, so use their guidance rather than a blanket rule.' },
      { question: 'Should a first-time wearer choose a saree?', answer: 'A saree is an option, not an obligation. Plan the blouse and petticoat, practice the drape or arrange help, and confirm included pieces.' },
      { question: 'Can a guest wear non-Indian formalwear?', answer: 'Often yes, unless the invitation says otherwise. Match the stated formality and ask about ceremony-specific coverage or footwear expectations.' },
    ],
  }),
  guide({
    slug: 'what-saree-fabrics-work-for-an-outdoor-summer-wedding',
    title: 'What saree fabrics work for an outdoor summer wedding?',
    answer: 'For an outdoor summer wedding, compare the exact listing’s stated material, lining, opacity, embellishment and garment weight rather than relying on a fabric name alone. Chiffon or georgette may offer a lighter-looking drape, while cotton or linen blends may suit some wearers, but fiber content, construction, humidity, shade and personal heat tolerance can change the result.',
    category: 'Fabric Guide',
    atAGlance: [
      ['Chiffon or georgette', 'You prefer a fluid, lighter-looking drape', 'Exact fiber claim, opacity, embellishment, blouse and care label'],
      ['Cotton or linen blend', 'You prioritize a less layered construction', 'Fiber percentages, creasing, lining and care instructions'],
      ['Silk-labelled saree', 'The invitation calls for a formal appearance', 'Exact material wording, weave, weight, embellishment and venue heat'],
    ],
    decisions: [
      ['High humidity is likely', 'Fewer heavy layers and verified lining', 'A material name alone does not establish breathability.'],
      ['The ceremony is in direct sun', 'A manageable drape with coverage you prefer', 'Consider shade, duration and sun protection separately from style.'],
      ['The event continues indoors', 'A saree that works across both settings', 'Confirm opacity, blouse coverage and whether a wrap is practical.'],
    ],
    nuances: ['A fabric-family name does not prove its fiber percentages.', 'Embellishment, lining and number of layers can matter as much as the named material.', 'Weather, shade, ceremony duration and individual temperature tolerance vary.'],
    shopLinks: [
      ['Browse sarees', '/sarees', 'Material wording, lining, included blouse piece, care and current variant'],
      ['Wedding sarees', '/collections/wedding-sarees', 'Weight clues stated in the listing, embellishment, opacity and processing'],
    ],
    relatedGuides: [['Saree versus lehenga for a wedding guest', '/blog/saree-versus-lehenga-for-a-wedding-guest'], ['Does a saree come with a blouse?', '/blog/does-a-saree-come-with-a-blouse']],
    faqs: [
      { question: 'Is georgette always breathable?', answer: 'No. Georgette describes a fabric structure, not one guaranteed fiber content or comfort level. Check the listing, garment label, lining and construction.' },
      { question: 'Is chiffon always lighter than silk?', answer: 'Not as a universal product claim. Fiber, weave, lining and embellishment change weight and feel, so compare the exact sarees being considered.' },
      { question: 'Should an outdoor saree be unlined?', answer: 'Not necessarily. Lining can affect opacity, structure and warmth. Verify the actual construction and decide which tradeoff suits the venue and wearer.' },
      { question: 'What else should be planned for outdoor heat?', answer: 'Consider shade, water access, ceremony duration, sun protection, secure draping and footwear in addition to the saree’s stated material and construction.' },
    ],
  }),
  guide({
    slug: 'saree-versus-lehenga-for-a-wedding-guest',
    title: 'Saree versus lehenga for a wedding guest',
    answer: 'Choose a saree when you want a draped silhouette and can practice or arrange dressing help; choose a lehenga when a skirt-and-blouse format better suits movement and repeat wear. Neither is automatically more formal or respectful. Compare the exact outfit’s material, work, weight, coverage, included pieces, stitching and the hosts’ dress guidance before deciding.',
    category: 'Outfit Comparison',
    atAGlance: [
      ['Saree', 'You prefer adjustable draping and varied styling', 'Blouse or blouse piece, petticoat, drape length and care'],
      ['Lehenga', 'You prefer a skirt-based outfit', 'Skirt, choli, dupatta, stitching, waistband and hem'],
      ['Pre-draped saree', 'You want a more fixed saree construction', 'Closure, sizing, exact drape construction and included pieces'],
    ],
    decisions: [
      ['You have limited dressing time', 'The option whose fit and dressing method you have tested', 'A pre-draped label does not replace checking closures and size.'],
      ['You expect extensive dancing', 'A secure waist, hem and drape', 'Test movement; garment names do not guarantee ease.'],
      ['You want to restyle the outfit', 'A saree or separable lehenga with verified pieces', 'Confirm every component rather than inferring it from photographs.'],
    ],
    nuances: ['Neither silhouette is inherently more formal.', 'Regional and family preferences can influence ceremony choices.', 'A saree may include fabric for a blouse rather than a stitched blouse; a lehenga may be semi-stitched.'],
    shopLinks: [
      ['Compare sarees', '/sarees', 'Blouse details, material, drape, care, current size or unstitched status'],
      ['Compare lehengas', '/lehengas', 'Skirt and choli stitching, dupatta, measurements, weight and processing'],
    ],
    relatedGuides: [['What does semi-stitched lehenga mean?', '/blog/what-does-semi-stitched-lehenga-mean'], ['What should a non-Indian guest wear?', '/blog/what-should-a-non-indian-guest-wear-to-an-indian-wedding']],
    faqs: [
      { question: 'Is a saree more formal than a lehenga?', answer: 'No universal hierarchy applies. Material, work, styling, venue and the hosts’ expectations shape formality more than the silhouette name alone.' },
      { question: 'Which option is easier for dancing?', answer: 'That depends on fit and construction. Compare skirt hems, waist security, drape security, footwear and your familiarity with each outfit.' },
      { question: 'Does a saree listing include a stitched blouse?', answer: 'Do not assume it does. A listing may include fabric, a stitched blouse or no blouse; verify the exact included pieces and selected option.' },
      { question: 'Does a lehenga arrive ready to wear?', answer: 'Not always. It may be unstitched, semi-stitched or fully stitched, and individual components can differ. Read the construction and measurement details.' },
    ],
  }),
  guide({
    slug: 'sherwani-versus-kurta-set',
    title: 'Sherwani versus kurta set',
    answer: 'A sherwani is generally a longer, more structured coat-style option, while a kurta set is usually less structured and can range from simple to highly festive. Choose by your role, the invitation, venue and comfort—not the garment name alone. Then verify the exact coat or kurta length, closures, bottoms, included layers, measurements, material wording and processing status.',
    category: 'Menswear Guide',
    atAGlance: [
      ['Sherwani', 'The hosts request formal ceremony clothing', 'Coat, inner layer, bottoms, closures, length and selected size'],
      ['Kurta set', 'You want adaptable guest clothing', 'Kurta, pajama or trouser components and fabric wording'],
      ['Indo-Western or bandhgala set', 'The event has a contemporary formal direction', 'Jacket, inner layer, bottoms, measurements and actual included pieces'],
    ],
    decisions: [
      ['You are the groom', 'The couple’s chosen formality and confirmed fit', 'Do not infer that every sherwani includes all photographed accessories.'],
      ['You are a guest at several events', 'A versatile, correctly sized kurta set', 'Add layers only when their inclusion and fit are verified.'],
      ['The venue is warm or active', 'The least restrictive verified construction', 'Check lining, layers, length and movement instead of relying on a category label.'],
    ],
    nuances: ['A guest does not need to dress at the groom’s level of formality.', 'The word “set” does not identify which pieces are included.', 'Bandhgala, Indo-Western and sherwani retail labels can overlap; use construction details.'],
    shopLinks: [
      ['Sherwanis and menswear', '/menswear', 'Coat or kurta, inner layer, bottoms, material wording, size and processing'],
      ['Groomsmen outfits', '/collections/groomsmen-outfits', 'Group needs, current variants, measurements and included components'],
    ],
    relatedGuides: [['Three-day Indian wedding menswear', '/blog/what-should-a-male-guest-wear-to-a-three-day-indian-wedding'], ['Sherwani fit measurement checklist', '/blog/how-should-a-sherwani-fit-measurement-checklist']],
    faqs: [
      { question: 'Is a sherwani only for the groom?', answer: 'No, but the couple may reserve a particular level, color or style. Guests should use the invitation or ask the hosts about formality.' },
      { question: 'Is a kurta set always casual?', answer: 'No. Kurta sets range widely in construction and surface work. Evaluate the exact garment and dress guidance instead of the category name alone.' },
      { question: 'What can be included in a sherwani listing?', answer: 'Components vary. A coat, inner kurta, bottoms, stole or footwear should be treated as included only when the exact listing says so.' },
      { question: 'Which is better for repeat wear?', answer: 'A correctly fitting option with separately usable, verified pieces may be easier to repeat, but that depends on the specific construction and your events.' },
    ],
  }),
  guide({
    slug: 'what-should-guests-wear-to-a-mehendi',
    title: 'What should guests wear to a Mehendi?',
    answer: 'For a Mehendi, choose festive clothing that supports sitting, walking and comfortable arm movement. A salwar suit, sharara, lighter lehenga, saree, kurta set or suitable formalwear can work, subject to the invitation and hosts. Verify sleeve and hem practicality, material and care wording, included pieces, stitching and venue conditions rather than assuming green or one silhouette is mandatory.',
    category: 'Wedding Event Guide',
    atAGlance: [
      ['Sharara or salwar suit', 'You prefer trousers and seated movement', 'Kurta, bottom, dupatta, sleeve shape and selected size'],
      ['Lighter lehenga', 'You prefer a skirt silhouette', 'Skirt weight, waistband, hem, choli, dupatta and stitching'],
      ['Kurta set', 'You prefer menswear or a less layered option', 'Bottoms, sleeves, jacket pieces, material wording and fit'],
    ],
    decisions: [
      ['You plan to receive henna', 'Accessible forearms and a manageable drape', 'Consider possible contact with fabric and follow product care information.'],
      ['The event is outdoors', 'Verified layers and a secure hem', 'Check ground conditions, shade and weather separately.'],
      ['The hosts specify a palette', 'The requested palette', 'A common green association is not a universal requirement.'],
    ],
    nuances: ['Green appears in some Mehendi styling but is not universally required.', 'Henna application may affect sleeve, jewelry and drape practicality.', 'Event scale ranges from informal home gatherings to formal venue celebrations.'],
    shopLinks: [
      ['Mehendi outfits', '/collections/mehendi-outfits', 'Sleeves, hem, included pieces, material wording, stitching and processing'],
      ['Wedding guest outfits', '/collections/wedding-guest-outfits', 'Invitation fit, current size, coverage and selected variant'],
    ],
    relatedGuides: [['What should guests wear to a Sangeet?', '/blog/what-should-guests-wear-to-a-sangeet'], ['Indian wedding terms glossary', '/blog/indian-wedding-terms-glossary-50-events-rituals-roles']],
    faqs: [
      { question: 'Do Mehendi guests have to wear green?', answer: 'No. Green is common in some celebrations, but it is not universal. Follow any palette from the hosts or choose suitable festive clothing.' },
      { question: 'Are long sleeves practical when receiving henna?', answer: 'They may make forearm access difficult. Consider the planned design area and choose sleeves that can be moved without damaging the garment.' },
      { question: 'Can a guest wear a saree to a Mehendi?', answer: 'Yes when it fits the event and wearer. Plan a secure drape, sitting movement and blouse coverage, and verify the included pieces.' },
      { question: 'What footwear works for an outdoor Mehendi?', answer: 'Choose for the actual surface, weather and amount of standing. Test stability and comfort; no single footwear type suits every venue.' },
    ],
  }),
  guide({
    slug: 'what-should-guests-wear-to-a-sangeet',
    title: 'What should guests wear to a Sangeet?',
    answer: 'Sangeet clothing should match the hosts’ stated formality while allowing safe movement for dancing or performances. Lehengas, shararas, sarees, kurta sets, bandhgala or Indo-Western outfits and suitable formalwear can all work. Prioritize secure draping, manageable hems, stable footwear and verified fit, included pieces, material wording and processing instead of treating one silhouette or color as required.',
    category: 'Wedding Event Guide',
    atAGlance: [
      ['Lehenga or sharara', 'You want festive volume with movement', 'Waist security, hem, bottoms, dupatta, choli and stitching'],
      ['Saree', 'You are comfortable with a secured drape', 'Blouse, petticoat, pleats, pallu security and exact included pieces'],
      ['Kurta, bandhgala or Indo-Western set', 'You want festive menswear', 'Jacket, kurta, trousers, closures, length and measurements'],
    ],
    decisions: [
      ['You are performing choreography', 'The outfit tested through the actual movements', 'Check hem, waist, closures, drape and footwear before the event.'],
      ['The event is cocktail-formal', 'The invitation’s level of formality', 'Sangeet does not imply one universal dress code.'],
      ['You want a dramatic layer', 'A verified jacket or dupatta you can secure', 'Confirm it is included and does not restrict movement.'],
    ],
    nuances: ['A Sangeet can be informal, cocktail-like or highly formal.', 'The hosts may specify a color or performance theme.', 'Photographs do not prove that a jacket, dupatta, blouse or accessory is included.'],
    shopLinks: [
      ['Wedding guest outfits', '/collections/wedding-guest-outfits', 'Event formality, exact components, selected size and processing'],
      ['Party-wear lehengas', '/collections/party-wear-lehengas', 'Hem, waistband, choli, dupatta, stitching and current variant'],
      ['Menswear', '/menswear', 'Jacket or kurta components, closures, bottoms, length and movement'],
    ],
    relatedGuides: [['What should guests wear to a Mehendi?', '/blog/what-should-guests-wear-to-a-mehendi'], ['Saree versus lehenga for a wedding guest', '/blog/saree-versus-lehenga-for-a-wedding-guest']],
    faqs: [
      { question: 'Does every Sangeet require very formal clothing?', answer: 'No. The scale and dress code vary. Use the invitation and hosts rather than assuming that every Sangeet is cocktail-formal.' },
      { question: 'Which outfit is easiest for a dance performance?', answer: 'The one that fits securely through the choreography. Test the waist, hem, drape, closures and footwear using the intended movements.' },
      { question: 'Can a guest wear a saree to a Sangeet?', answer: 'Yes. Secure the pleats and pallu, check blouse fit and footwear, and confirm whether the blouse or petticoat is included.' },
      { question: 'Should guests follow a performance color theme?', answer: 'Follow a theme when the hosts or group organizer gives one. Otherwise, there is no universal Sangeet color requirement.' },
    ],
  }),
  guide({
    slug: 'ready-to-ship-versus-made-to-order',
    title: 'Ready-to-ship versus made-to-order',
    answer: 'Ready-to-ship means the selected item is classified as stocked before dispatch; made-to-order means production begins after purchase. Neither label guarantees a delivery date, and sale availability alone does not prove immediate stock. Compare the selected variant’s stated processing status, size, included pieces and current availability, then plan carrier transit, customs when applicable, inspection and alterations as separate stages.',
    category: 'Shopping Guide',
    atAGlance: [
      ['Ready to ship', 'Reducing production time matters', 'Selected variant, physical stock classification, processing and size'],
      ['Made to order', 'Production after purchase is acceptable', 'Measurements, supported options, stated lead time and approval steps'],
      ['Customizable', 'A listed change is important', 'Exact supported change, written confirmation, measurements and timing'],
    ],
    decisions: [
      ['The event date is close', 'A correctly sized, verified ready-to-ship variant', 'Processing and carrier transit still remain and no date is guaranteed.'],
      ['Standard sizing is unsuitable', 'A made-to-order or customizable listing with confirmed options', 'Do not assume every design accepts measurements or changes.'],
      ['You are ordering internationally', 'The option with enough total contingency', 'Add border processing and local obligations to production and transit.'],
    ],
    nuances: ['Carrier transit starts after dispatch, not when the order is placed.', 'A wrong stocked size is not safer than a correctly planned made-to-order item.', 'Customizable and made-to-order are related but do not promise the same options.'],
    shopLinks: [
      ['Ready-to-ship outfits', '/shop-by-fulfillment/ready-to-ship', 'Selected variant, size, stocked classification and processing'],
      ['Made-to-order guidance', '/shop-by-fulfillment/made-to-order', 'Production status, measurements, stated timing and supported choices'],
      ['Customizable outfits', '/collections/customizable-indian-outfits', 'Exact offered change, confirmation, selected option and timing'],
    ],
    relatedGuides: [['How early to order for a fixed wedding date', '/blog/how-early-to-order-for-a-fixed-wedding-date'], ['Sizing and measurement guide', '/sizing-measurements-guide']],
    faqs: [
      { question: 'Does available for sale mean ready to ship?', answer: 'No. Sale availability and physical fulfillment classification are different. Check the selected variant’s current processing information before ordering.' },
      { question: 'Does ready to ship guarantee faster delivery?', answer: 'It can remove a production stage, but it does not guarantee dispatch or delivery. Processing, carrier transit and possible customs still apply.' },
      { question: 'Is every made-to-order item customizable?', answer: 'No. Production after purchase does not establish that color, neckline, sleeves or measurements can change. Use only options offered or confirmed.' },
      { question: 'Which option is safer for a fixed date?', answer: 'The option with verified fit, processing and enough contingency is safer to plan around, but LuxeMia does not guarantee an event-date delivery.' },
    ],
  }),
  guide({
    slug: 'what-does-semi-stitched-lehenga-mean',
    title: 'What does semi-stitched lehenga mean?',
    answer: 'A semi-stitched lehenga has some construction completed but still needs final fitting or tailoring before wear. The unfinished stage is not standardized: the skirt, waistband, side seams, hem, blouse or choli and lining can differ by product. Confirm each component, the available adjustment range, required measurements, tailoring responsibility and whether the dupatta or any photographed accessory is included.',
    category: 'Fit Guide',
    atAGlance: [
      ['Semi-stitched skirt', 'A tailor will complete fit work', 'Waist range, seam state, length, closure, lining and hem'],
      ['Unstitched blouse piece', 'A local blouse will be constructed', 'Fabric dimensions, material wording and design limitations'],
      ['Fully stitched option', 'A listed standard size is preferred', 'Body and garment measurements, alteration allowance and components'],
    ],
    decisions: [
      ['You have a trusted local tailor', 'The semi-stitched option whose unfinished work is documented', 'Share the listing and confirm what the tailor must complete.'],
      ['The event is soon', 'An option with verified completion and alteration time', 'Shipping arrival is not the end of the preparation timeline.'],
      ['You expect a ready-to-wear blouse', 'Only a listing that explicitly states a stitched blouse', 'A blouse piece is fabric, not a finished blouse.'],
    ],
    nuances: ['Semi-stitched has no single universal construction standard.', 'A stated maximum waist is not the same as a finished garment measurement.', 'One component may be semi-stitched while another is unstitched or fully stitched.'],
    shopLinks: [
      ['Shop lehengas', '/lehengas', 'Stitching status for every component, waist range, length, lining and included pieces'],
      ['Measurement guide', '/sizing-measurements-guide', 'How to record body measurements before comparing them with a listing'],
    ],
    relatedGuides: [['How to measure for a lehenga ordered online', '/blog/how-to-measure-for-a-lehenga-ordered-online'], ['Saree versus lehenga for a wedding guest', '/blog/saree-versus-lehenga-for-a-wedding-guest']],
    faqs: [
      { question: 'Can a semi-stitched lehenga be worn on arrival?', answer: 'Do not assume so. It usually needs some fitting or finishing, but the exact unfinished work must be confirmed on the product listing.' },
      { question: 'Does semi-stitched mean one size fits all?', answer: 'No. Adjustment ranges and construction vary. Compare your measurements with the exact stated range and ask a tailor about the required work.' },
      { question: 'Is the choli stitched in a semi-stitched set?', answer: 'It may be stitched, semi-stitched or supplied as fabric. Treat it as finished only when the exact listing clearly says so.' },
      { question: 'Who completes a semi-stitched lehenga?', answer: 'Responsibility varies. Confirm whether local tailoring is required and arrange enough time for fitting, construction and corrections before the event.' },
    ],
  }),
  guide({
    slug: 'how-to-measure-for-a-lehenga-ordered-online',
    title: 'How to measure for a lehenga ordered online',
    answer: 'Measure over the undergarments you plan to wear, using a flexible tape kept level and comfortably close to the body. Record bust, underbust, waist, hips, shoulder, armhole, upper arm, sleeve length, blouse length and desired skirt length with planned footwear. Compare body measurements with the exact listing’s garment measurements, stitching status and alteration allowance; size labels are not standardized.',
    category: 'Fit Guide',
    atAGlance: [
      ['Body circumferences', 'Selecting a size or supplying requested measurements', 'Tape level, breathing normally and body versus garment dimensions'],
      ['Upper-body lengths', 'Checking blouse or choli proportions', 'Shoulder point, armhole, sleeve and blouse endpoints'],
      ['Skirt length', 'Planning waistband placement and footwear', 'Natural waist or stated placement, shoes, hem and alteration allowance'],
    ],
    decisions: [
      ['You fall between listed sizes', 'The measurements that fit the least alterable area', 'Ask what seam or alteration allowance actually exists.'],
      ['The lehenga is semi-stitched', 'Your body measurements plus the listed adjustment range', 'Confirm which seams and closures a tailor must finish.'],
      ['Custom measurements are offered', 'The seller’s exact measurement form', 'Do not substitute a different method without confirmation.'],
    ],
    nuances: ['Body measurements and finished garment measurements are different.', 'Tape position and the intended waistband placement affect the result.', 'Another person can improve shoulder, back and length measurement consistency.'],
    shopLinks: [
      ['Measurement worksheet', '/sizing-measurements-guide', 'Definitions and a repeatable way to record the requested dimensions'],
      ['Lehengas', '/lehengas', 'Exact size chart, component measurements, stitching status and alteration information'],
    ],
    relatedGuides: [['What does semi-stitched lehenga mean?', '/blog/what-does-semi-stitched-lehenga-mean'], ['How to buy a bridal lehenga online', '/blog/how-to-buy-a-bridal-lehenga-online-checklist']],
    faqs: [
      { question: 'Should the measuring tape be pulled tight?', answer: 'No. Keep it level and comfortably close without compressing the body, unless the seller’s product-specific instructions explicitly require another method.' },
      { question: 'Are body and garment measurements interchangeable?', answer: 'No. Garment measurements include construction and ease. Identify which type a chart uses before comparing its numbers with your body.' },
      { question: 'Which shoes should be worn for skirt length?', answer: 'Use footwear with the heel height planned for the event and measure from the waistband position specified for the selected lehenga.' },
      { question: 'Can a usual dress size replace measurements?', answer: 'No. Size labels vary across products. Compare current body measurements with the exact product chart and selected stitching option.' },
    ],
  }),
  guide({
    slug: 'chaniya-choli-versus-lehenga',
    title: 'Chaniya choli versus lehenga',
    answer: 'Chaniya choli and lehenga choli can both describe a skirt, blouse and often a dupatta, but retail use differs. Chaniya choli is often associated with Gujarati festive and Garba contexts, while lehenga is a broader shopping category that includes wedding and party styles. Because regional vocabulary overlaps, choose from the exact construction, weight, movement, stitching and stated occasion—not the label alone.',
    category: 'Outfit Comparison',
    atAGlance: [
      ['Chaniya choli', 'You are shopping for Navratri or Garba intent', 'Skirt movement, choli, dupatta, mirrors or embellishment, and stitching'],
      ['Wedding lehenga', 'You are shopping for a wedding role', 'Role, weight, skirt construction, blouse, dupatta and processing'],
      ['Party lehenga', 'You want a broader festive skirt set', 'Exact occasion, components, measurements, material wording and care'],
    ],
    decisions: [
      ['The event involves Garba or Dandiya', 'A route labeled for that event', 'Still verify range of movement, hem, closures and exact pieces.'],
      ['The outfit is for a bride', 'A wedding-role collection', 'Do not infer bridal suitability from skirt shape or embellishment alone.'],
      ['Two listings use different names', 'Their stated components and construction', 'Retail terms can overlap, so compare attributes rather than labels.'],
    ],
    nuances: ['Vocabulary differs by region, language and retailer.', 'A lehenga-style skirt is not automatically bridal.', 'Mirror work, flare or bright colors do not by themselves define an item as Garba wear.'],
    shopLinks: [
      ['Navratri outfits', '/collections/navratri-outfits', 'Declared occasion, skirt and choli components, dupatta, stitching and movement'],
      ['Garba outfits', '/collections/garba-outfits', 'Hem, closures, component fit, embellishment and selected size'],
      ['Lehengas', '/lehengas', 'Stated occasion, weight, material wording, included pieces and processing'],
    ],
    relatedGuides: [['What does semi-stitched lehenga mean?', '/blog/what-does-semi-stitched-lehenga-mean'], ['Navratri 2026 buying guide', '/blog/navratri-9-day-color-guide-2026']],
    faqs: [
      { question: 'Are chaniya choli and lehenga choli the same?', answer: 'They can overlap in physical components, but their regional and retail usage differs. Compare the exact construction and stated occasion.' },
      { question: 'Is every chaniya choli intended for Garba?', answer: 'No. The name alone is not enough. Use the listing’s declared occasion and verify movement, weight, hem and component construction.' },
      { question: 'Can a chaniya choli be worn to a wedding?', answer: 'It may suit some wedding events if the hosts and formality support it, but the label does not establish wedding or bridal appropriateness.' },
      { question: 'What attributes matter more than the name?', answer: 'Check the skirt, choli and dupatta, stitching status, measurements, weight, material wording, embellishment, care and stated occasion.' },
    ],
  }),
  guide({
    slug: 'how-early-to-order-for-a-fixed-wedding-date',
    title: 'How early to order for a fixed wedding date',
    answer: 'Order early enough to cover the selected product’s processing, carrier transit, customs when applicable, inspection, tailoring or alterations and contingency time. There is no safe universal number of days. Work backward from the wedding date using the exact variant’s stated fulfillment details, destination and fit needs, then contact LuxeMia before checkout when timing is critical; event-date delivery is not guaranteed.',
    category: 'Shopping Guide',
    atAGlance: [
      ['Verified stocked variant', 'You have confirmed the correct size and fulfillment class', 'Processing, dispatch, transit, inspection and alteration time'],
      ['Made-to-order item', 'Production after purchase fits the schedule', 'Measurements, supported choices, lead time and approval steps'],
      ['International shipment', 'The destination is outside the shipping origin', 'Production, carrier transit, customs, duties and local delivery'],
    ],
    decisions: [
      ['You need tailoring after arrival', 'A plan with a fitting and correction buffer', 'Do not treat carrier delivery as the ready-to-wear date.'],
      ['The listing’s timing is unclear', 'Written clarification before checkout', 'An event date in a note or message is not a delivery promise.'],
      ['The date is too close for adequate contingency', 'A local or already-owned alternative', 'No fulfillment label can eliminate all carrier and fit risk.'],
    ],
    nuances: ['Tracking creation is not the same as carrier acceptance or delivery.', 'Customs timing can vary and is outside a fixed retail estimate.', 'A product arriving on time may still need inspection, pressing, draping practice or alterations.'],
    shopLinks: [
      ['Shipping policy', '/shipping', 'Supported destination, current rate, threshold and how timing is described'],
      ['Ready-to-ship outfits', '/shop-by-fulfillment/ready-to-ship', 'Correct selected variant, physical stock classification, processing and size'],
      ['Contact support', '/us-support', 'Product link, destination, selected option, measurements and event date for clarification'],
    ],
    relatedGuides: [['Ready-to-ship versus made-to-order', '/blog/ready-to-ship-versus-made-to-order'], ['How to measure for a lehenga ordered online', '/blog/how-to-measure-for-a-lehenga-ordered-online']],
    faqs: [
      { question: 'How many weeks before a wedding should I order?', answer: 'There is no reliable universal number. Add the exact product’s processing, transit, customs if applicable, inspection, alterations and contingency.' },
      { question: 'Does ready to ship mean it will arrive by my event?', answer: 'No. Ready-to-ship classification can remove production time, but processing, carrier transit and other delays remain. Event-date delivery is not guaranteed.' },
      { question: 'When should alteration time be added?', answer: 'Add it after the planned arrival and inspection date, with enough room for a fitting and any correction the tailor recommends.' },
      { question: 'What information should I send support about timing?', answer: 'Send the product link, selected variant, destination, measurements or size needs and event date, while understanding that clarification is not a guarantee.' },
    ],
  }),
];

export const SEMANTIC_COMMERCE_GUIDE_SLUGS = semanticCommerceGuides.map(({ slug }) => slug);
