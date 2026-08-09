export interface BlogSource {
  title: string;
  url: string;
  publisher: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  factCheckedAt: string;
  category: string;
  tags: string[];
  image: string;
  imagePresentation?: 'photo' | 'editorial';
  readTime: number;
  sources: BlogSource[];
}

/**
 * Publishing standard
 * -------------------
 * Only articles that have been reviewed against the sources attached to the
 * post belong in this allowlist. Advice is labelled as guidance, cultural
 * practices are never presented as universal rules, and a product listing is
 * always the source of truth for a LuxeMia item's materials, construction,
 * included pieces, sizing and availability.
 */
export const PUBLISHED_BLOG_SLUGS = [
  'indian-to-us-clothing-size-conversion-guide',
  'wedding-guest-outfit-ideas',
  'wedding-saree-for-mother-of-bride',
  'accessorize-indian-ethnic-wear',
  'fabric-guide-indian-ethnic-wear-georgette-silk-chiffon',
  'styling-indian-ethnic-wear-festive-occasions-abroad',
  'lehenga-vs-sharara-vs-anarkali-comparison',
  'how-to-drape-saree-beginner-guide',
  'how-to-choose-salwar-kameez-body-type',
  'sherwani-vs-jodhpuri-vs-bandhgala-groom-guide',
  'anamika-khanna-designer-profile-kolkata-couture',
  'bindi-meaning-history-indian-women',
  'tarun-tahiliani-designer-profile-india-modern-couture',
  'rahul-mishra-designer-profile-paris-haute-couture-sustainable',
  'navratri-9-day-color-guide-2026',
  'sabyasachi-mukherjee-designer-profile-handloom-revival',
] as const;

const FACT_CHECKED_AT = '2026-08-08';
const EDITORIAL_TEAM = 'LuxeMia Editorial Team';

const source = (title: string, url: string, publisher: string): BlogSource => ({
  title,
  url,
  publisher,
});

const SOURCES = {
  nistSizing: source(
    'Body Dimensions for Apparel',
    'https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir5411.pdf',
    'National Institute of Standards and Technology',
  ),
  ftcTextiles: source(
    'Clothing and Textiles: Labeling Guidance',
    'https://www.ftc.gov/business-guidance/industry/clothing-and-textiles',
    'U.S. Federal Trade Commission',
  ),
  ftcCare: source(
    'Care Labeling of Textile Wearing Apparel',
    'https://www.ftc.gov/legal-library/browse/rules/care-labeling-textile-wearing-apparel-certain-piece-goods-text',
    'U.S. Federal Trade Commission',
  ),
  vaIndianTextiles: source(
    'Indian Textiles',
    'https://www.vam.ac.uk/articles/indian-textiles',
    'Victoria and Albert Museum',
  ),
  vaSariDraping: source(
    'Slippery Sari Sagas and Delightful Draping',
    'https://www.vam.ac.uk/blog/caring-for-our-collections/slippery-sari-sagas-and-delightful-draping',
    'Victoria and Albert Museum',
  ),
  romSherwani: source(
    'Sherwani: A Fashion Dialogue Between East and West',
    'https://www.rom.on.ca/magazine/sherwani',
    'Royal Ontario Museum',
  ),
  incredibleIndiaNavratri: source(
    'Navratri: Nine Nights of Divine Celebration',
    'https://www.incredibleindia.gov.in/en/festivals-and-events/navratri',
    'Incredible India, Ministry of Tourism',
  ),
  navratri2026: source(
    '2026 Shardiya Navratri Calendar',
    'https://www.drikpanchang.com/navratri/ashwin-shardiya-navratri-dates.html',
    'Drik Panchang',
  ),
  bindi: source(
    'The Purpose of the Bindi',
    'https://www.hinduamerican.org/blog/the-purpose-of-the-bindi/',
    'Hindu American Foundation',
  ),
  anamikaOfficial: source(
    'Anamika Khanna Official Website',
    'https://anamikakhanna.com/',
    'Anamika Khanna',
  ),
  anamikaBof: source(
    'Anamika Khanna, BoF 500',
    'https://www.businessoffashion.com/people/anamika-khanna/',
    'The Business of Fashion',
  ),
  tarunOfficial: source(
    'Tarun Tahiliani: Legacy',
    'https://taruntahiliani.com/pages/legacy',
    'Tarun Tahiliani',
  ),
  rahulOfficial: source(
    'Rahul Mishra: About Us',
    'https://rahulmishra.in/pages/about-us',
    'Rahul Mishra',
  ),
  rahulWoolmark: source(
    "Rahul Mishra's Parisian Love",
    'https://www.woolmark.com/fashion/rahul-mishras-parisian-love/',
    'The Woolmark Company',
  ),
  sabyasachiOfficial: source(
    'Sabyasachi: History',
    'https://sabyasachi.com/pages/history',
    'Sabyasachi',
  ),
  luxemiaSizing: source(
    'Sizing and Measurement Guide',
    'https://luxemia.shop/sizing-measurements-guide',
    'LuxeMia',
  ),
  luxemiaShipping: source(
    'U.S. Shipping Policy',
    'https://luxemia.shop/shipping',
    'LuxeMia',
  ),
};

const editorialNote = `
  <aside>
    <p><strong>Editorial standard:</strong> This guide was fact-checked on August 8, 2026. Documented facts are tied to the sources shown below. Styling ideas are optional suggestions, not cultural rules. For a LuxeMia product, use the individual listing for exact materials, included pieces, stitching, measurements, price and availability.</p>
  </aside>
`;

export const blogPosts: BlogPost[] = [
  {
    id: '67',
    slug: 'indian-to-us-clothing-size-conversion-guide',
    title: 'Indian to U.S. Clothing Sizes: Why Measurements Matter More Than Conversion Charts',
    excerpt: 'There is no universal Indian-to-U.S. clothing-size conversion. Compare your body measurements with the exact garment or variant chart instead of relying on XS, M, 38, or a U.S. dress-size label alone.',
    content: `
      ${editorialNote}
      <h2>The factual answer: there is no universal conversion</h2>
      <p>Indian and U.S. apparel labels are not one standardized system. Two brands can assign different measurements to the same letter or number. A label such as M, U.S. 8, or 38 is therefore not enough to predict fit across retailers or garments.</p>
      <p>NIST's apparel-sizing work describes sizing systems through body dimensions and measurement definitions. The practical conclusion for online shopping is simple: use inches or centimeters, not a country-to-country conversion claim.</p>

      <h2>Measurements to compare</h2>
      <table>
        <thead><tr><th>Garment</th><th>Measurements commonly needed</th><th>What else to verify</th></tr></thead>
        <tbody>
          <tr><td>Saree blouse or choli</td><td>Bust, under-bust, shoulder, armhole, upper arm, sleeve and blouse length</td><td>Finished-garment measurements, margin and closure</td></tr>
          <tr><td>Lehenga</td><td>Waist, hip and desired skirt length</td><td>Waistband type, drawstring or zip, and alteration margin</td></tr>
          <tr><td>Kurta, salwar suit or anarkali</td><td>Bust, waist, hip, shoulder, sleeve and garment length</td><td>Ease, lining and the measurements of each included piece</td></tr>
          <tr><td>Men's kurta, jacket or sherwani</td><td>Chest, waist, shoulder, sleeve and garment length</td><td>Whether the chart lists body or finished-garment measurements</td></tr>
        </tbody>
      </table>

      <h2>Body measurement versus garment measurement</h2>
      <p>A body measurement is taken on the wearer. A finished-garment measurement is taken on the clothing. They should not be treated as interchangeable because garments usually need some room for movement, and the appropriate amount depends on the cut, fabric and wearer's preference.</p>
      <p>When a listing does not say which type of measurement it provides, ask before ordering. Do not assume that a 38-inch garment is intended for a 38-inch body.</p>

      <h2>How to measure</h2>
      <ol>
        <li>Use a flexible measuring tape and keep it level rather than pulling it tight.</li>
        <li>Measure over the undergarments or light clothing you expect to wear with the outfit.</li>
        <li>Record the number without deliberately reducing it.</li>
        <li>Repeat the measurement, and ask another person to help with shoulders, back and length when possible.</li>
        <li>Compare the result with the exact product's current chart or request clarification from LuxeMia before checkout.</li>
      </ol>

      <h2>What LuxeMia does and does not promise</h2>
      <p>Available sizes, stitching status, margins and customization options vary by product. A general guide cannot guarantee fit. Review the exact listing and the <a href="/sizing-measurements-guide">LuxeMia measurement guide</a>; for a final-sale order, ask about any unclear measurement before purchasing.</p>
    `,
    author: EDITORIAL_TEAM,
    publishedAt: '2026-07-15',
    updatedAt: FACT_CHECKED_AT,
    factCheckedAt: FACT_CHECKED_AT,
    category: 'Fit Guide',
    tags: ['indian to us size', 'indian size chart', 'clothing measurements', 'lehenga sizing', 'saree blouse size'],
    image: '/images/blog/blog-004-ivory-shimmer.webp',
    readTime: 5,
    sources: [SOURCES.nistSizing, SOURCES.luxemiaSizing],
  },
  {
    id: '10',
    slug: 'wedding-guest-outfit-ideas',
    title: 'What to Wear to an Indian Wedding: A Fact-Checked Guest Guide',
    excerpt: 'Indian and South Asian weddings are diverse. Use the invitation and the hosts as the authority on ceremony names, formality, color requests and religious-venue requirements.',
    content: `
      ${editorialNote}
      <h2>Start with the invitation, not an internet rule</h2>
      <p>There is no single dress code shared by every Indian wedding. Families may follow different regional, religious and personal customs, and two events with the same name may have different levels of formality. The invitation, wedding website or host is the most reliable source for the event you are attending.</p>

      <h2>Questions to confirm</h2>
      <ul>
        <li>Which events are you invited to, and are they indoors, outdoors or at a religious venue?</li>
        <li>Does the couple specify formal, cocktail, traditional, fusion or another dress code?</li>
        <li>Are any colors reserved or requested? Do not assume that red, black or white is universally forbidden.</li>
        <li>Will the venue require covered shoulders, a head covering, removal of shoes or another practice?</li>
        <li>How long will you be standing, sitting on the floor or dancing?</li>
      </ul>

      <h2>Common outfit categories</h2>
      <p>Sarees, lehengas, salwar suits, anarkalis, shararas, kurtas, bandhgala-style jackets and fusion outfits are all used for celebrations, but none is automatically correct for every event. Choose only after checking the host's guidance and the garment's comfort and movement.</p>

      <h2>Practical shopping guidance</h2>
      <p>Confirm the exact fabric or materials, lining, included pieces, stitching status, measurements and care instructions on the listing. If you need an outfit for a fixed date, contact LuxeMia before ordering; the site does not promise a universal delivery time or guaranteed event-date arrival.</p>

      <h2>Respectful guest etiquette</h2>
      <p>When a custom or garment term is unfamiliar, asking the hosts is more respectful than treating a generalized online checklist as a rule. A guest does not need to imitate a specific regional or religious tradition to participate thoughtfully.</p>
    `,
    author: EDITORIAL_TEAM,
    publishedAt: '2026-01-02',
    updatedAt: FACT_CHECKED_AT,
    factCheckedAt: FACT_CHECKED_AT,
    category: 'Wedding Guide',
    tags: ['indian wedding guest', 'wedding guest outfit', 'south asian wedding', 'guest dress code', 'ethnic wear'],
    image: '/images/blog/gdrive/bridesmaid-green-outfit.webp',
    readTime: 4,
    sources: [SOURCES.vaIndianTextiles, SOURCES.ftcTextiles],
  },
  {
    id: '6',
    slug: 'wedding-saree-for-mother-of-bride',
    title: 'Choosing a Wedding Saree for the Mother of the Bride: A Practical Guide',
    excerpt: 'There is no universal age, color or blouse rule for a mother of the bride. Start with the family dress code, the wearer’s preferences, accurate measurements and the exact product details.',
    content: `
      ${editorialNote}
      <h2>No universal mother-of-the-bride formula</h2>
      <p>A mother's saree does not have to follow a particular color, sleeve length, embellishment level or definition of “age appropriate.” Those choices belong to the wearer and the family. If outfits are being coordinated, confirm the plan directly rather than inferring it from generalized wedding advice.</p>

      <h2>What to decide before shopping</h2>
      <ul>
        <li><strong>Dress code:</strong> Ask about requested colors, level of formality and any venue requirements.</li>
        <li><strong>Comfort:</strong> Consider event length, weather, walking, stairs, sitting and dancing.</li>
        <li><strong>Drape preference:</strong> Sarees can be draped in different ways; the preferred drape affects petticoat, blouse and footwear choices.</li>
        <li><strong>Blouse fit:</strong> Compare bust, shoulder, armhole, sleeve and blouse length with the exact listing.</li>
        <li><strong>Care:</strong> Follow the garment's care label or listing rather than assuming every silk-like or embellished textile has the same cleaning method.</li>
      </ul>

      <h2>Fabric names are not complete specifications</h2>
      <p>Cotton and silk have long histories in Indian textiles, but modern sarees may use natural, manufactured or blended fibers. A name such as “silk saree” should not be interpreted as pure silk unless the listing or label verifies the fiber content. The FTC requires most textiles sold in the United States to disclose fiber content and country of origin.</p>

      <h2>Optional styling guidance</h2>
      <p>Jewelry, blouse neckline, footwear and bag are personal styling decisions. If the saree is visually detailed, some wearers prefer fewer accessories; others prefer a layered ceremonial look. Neither is a factual rule. Choose what suits the wearer, event and host guidance.</p>
    `,
    author: EDITORIAL_TEAM,
    publishedAt: '2026-01-05',
    updatedAt: FACT_CHECKED_AT,
    factCheckedAt: FACT_CHECKED_AT,
    category: 'Wedding Guide',
    tags: ['mother of bride saree', 'wedding saree', 'saree measurements', 'family wedding outfit'],
    image: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/Yellow-Viscose-Silk-Occasional-Wear-Embroidery-Work-Saree-PREMIKA-282_1.jpg?v=1782934327&width=1200&height=675&crop=center',
    readTime: 4,
    sources: [SOURCES.vaIndianTextiles, SOURCES.ftcTextiles, SOURCES.ftcCare],
  },
  {
    id: '4',
    slug: 'accessorize-indian-ethnic-wear',
    title: 'How to Accessorize Indian Ethnic Wear Without Inventing Rules',
    excerpt: 'Accessories are a styling choice, not a fixed formula. Match scale and comfort to the outfit and event, and verify materials instead of assuming that terms such as kundan, polki or gold describe precious contents.',
    content: `
      ${editorialNote}
      <h2>Accessorizing is optional guidance</h2>
      <p>There is no factual “one statement piece” rule and no neckline-to-necklace formula that applies to everyone. Jewelry visibility changes with the neckline, dupatta or pallu placement and hairstyle, but the final choice is personal.</p>

      <h2>Verify what a jewelry listing actually says</h2>
      <p>Design terms can describe an appearance or tradition without proving precious-metal content, natural stones, diamonds, hand-setting or a specific production method. For each LuxeMia item, verify the listed materials, finish, stones or accents, closures, measurements and included pieces. Do not infer them from the product title or photograph.</p>

      <h2>Practical considerations</h2>
      <ul>
        <li>Check earring weight and closure if the event will last several hours.</li>
        <li>Check whether a necklace sits above, inside or over the garment neckline.</li>
        <li>Confirm that rings, bangles, bags and garment embellishment will not snag delicate fabric.</li>
        <li>Choose footwear for the actual venue and hem length; comfort cannot be predicted from heel type alone.</li>
        <li>For heirloom or religious pieces, follow the family's handling and wearing practices.</li>
      </ul>

      <h2>Optional visual approaches</h2>
      <p>Some wearers repeat one color or metal tone across accessories. Others intentionally mix them. Some balance a detailed outfit with quieter accessories, while others build a layered ceremonial look. These are styling approaches—not claims about what is correct.</p>
    `,
    author: EDITORIAL_TEAM,
    publishedAt: '2025-12-15',
    updatedAt: FACT_CHECKED_AT,
    factCheckedAt: FACT_CHECKED_AT,
    category: 'Styling Guide',
    tags: ['indian jewelry styling', 'ethnic wear accessories', 'necklace styling', 'wedding accessories'],
    image: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/M-640.jpg?v=1783368953&width=1200&height=675&crop=center',
    readTime: 3,
    sources: [SOURCES.ftcTextiles],
  },
  {
    id: '16',
    slug: 'fabric-guide-indian-ethnic-wear-georgette-silk-chiffon',
    title: 'Indian Ethnic-Wear Fabric Guide: Fiber, Weave and Product Claims',
    excerpt: 'Georgette, chiffon and satin describe fabric structures or finishes, while silk, cotton and polyester identify fibers. One term does not reveal the full composition, weight, lining, care or performance of a garment.',
    content: `
      ${editorialNote}
      <h2>Fiber and fabric are not the same thing</h2>
      <p>Silk, cotton and polyester are fiber terms. Georgette and chiffon describe fabric constructions that can be produced from different fibers. Satin describes a weave structure rather than one specific fiber. Therefore, “satin,” “georgette” or “chiffon” alone does not prove whether a garment is silk or manufactured fiber.</p>

      <h2>Common terms</h2>
      <table>
        <thead><tr><th>Term</th><th>What it tells you</th><th>What it does not prove</th></tr></thead>
        <tbody>
          <tr><td>Silk</td><td>A fiber claim that should be supported by the product information or label</td><td>Weave, weight, geographic origin, handloom status or care method</td></tr>
          <tr><td>Georgette</td><td>A lightweight, textured fabric category</td><td>Pure silk, breathability, exact weight or snag resistance</td></tr>
          <tr><td>Chiffon</td><td>A light, sheer fabric category</td><td>Fiber content, opacity after lining or durability</td></tr>
          <tr><td>Satin</td><td>A smooth-faced weave category</td><td>That the fiber is silk</td></tr>
          <tr><td>Net</td><td>An open structure commonly used alone or as an overlay</td><td>Fiber, softness, lining or embellishment method</td></tr>
        </tbody>
      </table>

      <h2>What to verify on a listing</h2>
      <ul>
        <li>Fiber content and whether different pieces use different fabrics</li>
        <li>Lining, opacity and stretch</li>
        <li>Embroidery, sequins or other surface work exactly as stated</li>
        <li>Care instructions for the complete garment</li>
        <li>Country of origin and the business responsible for the textile label</li>
      </ul>

      <h2>Care facts</h2>
      <p>Do not assign one cleaning method to every garment with the same fabric name. Construction, dye, lining and embellishment can change the appropriate care. Follow the permanent care label or the product-specific instruction. The FTC's Care Labeling Rule requires a reasonable basis for the care instructions supplied with covered garments.</p>
    `,
    author: EDITORIAL_TEAM,
    publishedAt: '2026-07-12',
    updatedAt: FACT_CHECKED_AT,
    factCheckedAt: FACT_CHECKED_AT,
    category: 'Fabric Guide',
    tags: ['indian fabric guide', 'georgette fabric', 'chiffon fabric', 'silk fiber', 'textile labels'],
    image: '/images/blog/gdrive/banarasi-saree-blue-gold.webp',
    readTime: 5,
    sources: [SOURCES.vaIndianTextiles, SOURCES.ftcTextiles, SOURCES.ftcCare],
  },
  {
    id: '17',
    slug: 'styling-indian-ethnic-wear-festive-occasions-abroad',
    title: 'Styling Indian Ethnic Wear for U.S. Festivals: A Practical, Respectful Guide',
    excerpt: 'Festival practices and dress vary by family, region, faith and event. Confirm the organizer’s expectations, then choose the garment for venue, weather, movement and the exact listing details.',
    content: `
      ${editorialNote}
      <h2>Festival names do not create one dress code</h2>
      <p>Diwali, Eid, Navratri and other celebrations are observed by diverse communities. A temple program, family dinner, community garba and formal fundraiser can require different clothing even when held for the same festival. Use the invitation or organizer's instructions as the authority.</p>

      <h2>Plan for the actual event</h2>
      <ul>
        <li><strong>Venue:</strong> Confirm footwear, head-covering and modesty expectations directly with the venue or host.</li>
        <li><strong>Movement:</strong> For garba, dancing or children's activities, check hem length, closures and whether jewelry can snag fabric.</li>
        <li><strong>Weather:</strong> U.S. climates differ widely. Plan layers and outerwear for the city and date rather than relying on the season in India.</li>
        <li><strong>Transit:</strong> Consider stairs, public transportation, parking and garment storage.</li>
      </ul>

      <h2>Ordering from LuxeMia</h2>
      <p>LuxeMia currently ships to United States addresses. Shipping is $12 for orders below $150 and free at $150 and above. Tracking is provided, but “tracked” does not mean guaranteed arrival by an event date. If timing is important, contact LuxeMia before ordering.</p>

      <h2>Optional styling suggestions</h2>
      <p>You may coordinate with a family color palette, repeat a garment color in one accessory or choose footwear for dancing. These are optional styling decisions, not festival requirements. Religious or family practices should come from the people hosting the event.</p>
    `,
    author: EDITORIAL_TEAM,
    publishedAt: '2026-07-12',
    updatedAt: FACT_CHECKED_AT,
    factCheckedAt: FACT_CHECKED_AT,
    category: 'Festival Guide',
    tags: ['festival outfits usa', 'indian ethnic wear usa', 'diwali outfit', 'navratri outfit', 'event planning'],
    image: '/images/blog/gdrive/bride-blue-lehenga-festive.webp',
    readTime: 4,
    sources: [SOURCES.incredibleIndiaNavratri, SOURCES.luxemiaShipping],
  },
  {
    id: '18',
    slug: 'lehenga-vs-sharara-vs-anarkali-comparison',
    title: 'Lehenga, Sharara and Anarkali: What the Garment Terms Mean',
    excerpt: 'A lehenga is built around a separate skirt, a sharara around flared divided bottoms, and an anarkali around a long flared top. Retail use varies, so the included pieces and measurements on the listing are decisive.',
    content: `
      ${editorialNote}
      <h2>Basic silhouette differences</h2>
      <table>
        <thead><tr><th>Term</th><th>Typical structure</th><th>Listing details to verify</th></tr></thead>
        <tbody>
          <tr><td>Lehenga</td><td>A separate skirt, commonly paired with a blouse or choli and sometimes a dupatta</td><td>Included pieces, waist closure, skirt length, lining and blouse stitching</td></tr>
          <tr><td>Sharara</td><td>Separated trousers that flare through the leg, paired with a top and often a dupatta</td><td>Where the flare begins, waistband, rise, inseam, top length and included pieces</td></tr>
          <tr><td>Anarkali</td><td>A long, flared kurta or dress-like top, usually worn with bottoms and sometimes a dupatta</td><td>Bodice measurements, flare, lining, garment length, bottoms and dupatta</td></tr>
        </tbody>
      </table>

      <h2>Terms vary in retail use</h2>
      <p>Product naming is not perfectly standardized. A retailer may use “gharara” and “sharara” differently, or describe a coordinated skirt set as a lehenga-style outfit. Photographs and the exact list of included pieces are more reliable than the category name alone.</p>

      <h2>How to compare the three</h2>
      <ul>
        <li>Compare body and finished-garment measurements.</li>
        <li>Check whether the garment is ready to wear, semi-stitched, unstitched or offered with a listed stitching option.</li>
        <li>Check the fabric or materials for each piece, not only the main garment.</li>
        <li>Consider sitting, walking and dancing in the actual venue.</li>
        <li>Do not choose by a claimed “best body type”; fit depends on the garment measurements and wearer's preference.</li>
      </ul>
    `,
    author: EDITORIAL_TEAM,
    publishedAt: '2026-07-12',
    updatedAt: FACT_CHECKED_AT,
    factCheckedAt: FACT_CHECKED_AT,
    category: 'Outfit Guide',
    tags: ['lehenga vs sharara', 'anarkali guide', 'indian outfit terms', 'sharara suit', 'lehenga choli'],
    image: '/images/blog/gdrive/anarkali-gold-mint.webp',
    readTime: 4,
    sources: [SOURCES.vaIndianTextiles, SOURCES.luxemiaSizing],
  },
  {
    id: '19',
    slug: 'how-to-drape-saree-beginner-guide',
    title: 'How to Drape a Saree: One Beginner Method, Not a Universal Rule',
    excerpt: 'Sarees are worn in many regional and personal drapes. This guide explains a common pleated front-and-shoulder method while recognizing that it is only one approach.',
    content: `
      ${editorialNote}
      <h2>There is more than one saree drape</h2>
      <p>A saree is an unstitched length of textile that can be draped in many ways. Regional methods differ in direction, pleats, pallu placement and whether the cloth passes between the legs. The steps below describe one common modern approach; they do not define the only correct way to wear a saree.</p>

      <h2>Before starting</h2>
      <ul>
        <li>Confirm saree length, blouse fit and whether a petticoat or another support garment is needed for the chosen drape.</li>
        <li>Put on the footwear you expect to wear before setting the hem.</li>
        <li>Use pins only where they will not damage the fabric or embellishment, and keep sharp points away from skin.</li>
      </ul>

      <h2>A common beginner sequence</h2>
      <ol>
        <li>Secure the plain end at the waist and wrap once around the body, checking that the lower edge is even.</li>
        <li>Create a group of front pleats and tuck them securely at the waist. The number and width are personal and depend on the saree.</li>
        <li>Bring the remaining fabric around the body and place the pallu over the shoulder.</li>
        <li>Leave the pallu open or pleat it, according to preference and the fabric.</li>
        <li>Walk, sit and raise your arms to confirm that the drape is secure before leaving.</li>
      </ol>

      <h2>Fabric and care</h2>
      <p>Different textiles respond differently to folding and pinning. A museum's draping method for display is not a garment-care instruction for consumers. Follow the care label and avoid assuming that all silk-like or embellished sarees tolerate steam, washing or direct ironing.</p>
    `,
    author: EDITORIAL_TEAM,
    publishedAt: '2026-07-13',
    updatedAt: FACT_CHECKED_AT,
    factCheckedAt: FACT_CHECKED_AT,
    category: 'How-To Guide',
    tags: ['how to drape saree', 'beginner saree drape', 'saree pleats', 'saree guide'],
    image: '/images/blog/gdrive/kanchipuram-saree-brass-lamps.webp',
    readTime: 4,
    sources: [SOURCES.vaSariDraping, SOURCES.ftcCare],
  },
  {
    id: '20',
    slug: 'how-to-choose-salwar-kameez-body-type',
    title: 'How to Choose a Salwar Kameez by Measurements, Not Body-Type Rules',
    excerpt: 'Body-shape labels do not determine which salwar kameez someone may wear. Compare the exact garment measurements, cut, included pieces and your own fit preference.',
    content: `
      ${editorialNote}
      <h2>Why this guide no longer prescribes “flattering” body types</h2>
      <p>Terms such as apple, pear or hourglass do not supply the measurements needed to fit a garment. They also turn personal style into a rule. A useful fit guide compares the wearer's measurements with the exact garment and states where the design is fitted, straight or flared.</p>

      <h2>Measurements to check</h2>
      <ul>
        <li>Bust, waist and hip</li>
        <li>Shoulder width, armhole, upper arm and sleeve length</li>
        <li>Kurta length and side-slit height</li>
        <li>Bottom waist, hip, rise, thigh, inseam and hem opening as applicable</li>
        <li>Dupatta dimensions if coverage or draping is important</li>
      </ul>

      <h2>Understand the listed cut</h2>
      <p>A straight kurta, anarkali, short kurti, palazzo, churidar, salwar and sharara use different garment shapes. Those terms help describe construction, but they do not guarantee fit. Check whether the size chart gives body measurements or finished-garment measurements and ask how much ease is built into the item.</p>

      <h2>Practical fit preferences</h2>
      <p>Some wearers prefer a close bodice and others prefer more movement. Sleeve length, neckline, slit height and garment length are similarly personal. Record the preference separately from the body measurement so a seller or tailor does not have to guess.</p>

      <h2>Before a final-sale purchase</h2>
      <p>Confirm the included pieces, stitching status, measurements and available margin on the exact listing. If any field is unclear, contact LuxeMia before ordering rather than relying on the label alone.</p>
    `,
    author: EDITORIAL_TEAM,
    publishedAt: '2026-07-13',
    updatedAt: FACT_CHECKED_AT,
    factCheckedAt: FACT_CHECKED_AT,
    category: 'Fit Guide',
    tags: ['salwar kameez fit', 'anarkali measurements', 'suit sizing', 'indian clothing measurements'],
    image: '/images/blog/gdrive/anarkali-gold-mint.webp',
    readTime: 4,
    sources: [SOURCES.nistSizing, SOURCES.luxemiaSizing],
  },
  {
    id: '21',
    slug: 'sherwani-vs-jodhpuri-vs-bandhgala-groom-guide',
    title: 'Sherwani, Jodhpuri and Bandhgala: A Factual Menswear Comparison',
    excerpt: 'Retail terminology overlaps, especially for Jodhpuri and bandhgala styles. Use the product construction, length, included pieces and measurements rather than assuming the name guarantees a specific outfit.',
    content: `
      ${editorialNote}
      <h2>Typical retail meanings</h2>
      <table>
        <thead><tr><th>Term</th><th>Common description</th><th>What to verify</th></tr></thead>
        <tbody>
          <tr><td>Sherwani</td><td>A long, structured coat worn over lower garments</td><td>Coat length, closure, lining and whether kurta, trousers or accessories are included</td></tr>
          <tr><td>Bandhgala</td><td>A closed-neck jacket or coat with a standing collar</td><td>Jacket length, vents, trouser inclusion and exact fabric</td></tr>
          <tr><td>Jodhpuri suit</td><td>A term often used for a bandhgala-style jacket with trousers</td><td>Because usage overlaps, rely on the actual pieces and photographs</td></tr>
        </tbody>
      </table>

      <h2>Names do not guarantee construction</h2>
      <p>Historical garments and modern retail categories are not identical, and sellers may apply these terms differently. The safest comparison is the listing's garment length, collar, closure, lining, vents, lower garment and included accessories.</p>

      <h2>Fit measurements</h2>
      <p>Compare chest, waist, shoulder, sleeve and garment length. For trousers, compare waist, hip, rise and inseam. Ask whether a chart lists body or finished-garment measurements and do not assume a Western jacket size converts directly.</p>

      <h2>Optional event guidance</h2>
      <p>A longer coat may be chosen for a wedding ceremony and a shorter jacket for another event, but that is not a universal cultural rule. Follow the couple's dress code, venue requirements and the wearer's comfort.</p>
    `,
    author: EDITORIAL_TEAM,
    publishedAt: '2026-07-13',
    updatedAt: FACT_CHECKED_AT,
    factCheckedAt: FACT_CHECKED_AT,
    category: 'Menswear Guide',
    tags: ['sherwani vs bandhgala', 'jodhpuri suit', 'groom menswear', 'indian menswear terms'],
    image: '/images/blog/gdrive/groomsmen-lavender-pink-turbans.webp',
    readTime: 4,
    sources: [SOURCES.romSherwani, SOURCES.nistSizing],
  },
  {
    id: '48',
    slug: 'anamika-khanna-designer-profile-kolkata-couture',
    title: 'Anamika Khanna: A Source-Based Designer Profile',
    excerpt: 'Anamika Khanna is an Indian fashion designer working from Kolkata. This profile limits itself to claims supported by her official site and an established industry profile.',
    content: `
      ${editorialNote}
      <h2>Verified profile</h2>
      <p>Anamika Khanna's official site identifies her work through current collections and public fashion appearances. The Business of Fashion profile describes her approach as combining Indian textiles and techniques with Western silhouettes and tailoring, and identifies her with Kolkata.</p>

      <h2>What the source record supports</h2>
      <ul>
        <li>She is an Indian fashion designer associated with a Kolkata-based studio.</li>
        <li>Her work uses Indian textile and decorative traditions alongside contemporary tailoring and silhouettes.</li>
        <li>Her official site documents current couture and occasionwear work.</li>
      </ul>

      <h2>Claims intentionally left out</h2>
      <p>This revised profile does not repeat unsupported birth details, “first Indian designer” claims, celebrity-wedding claims, prices, awards or descriptions such as “invented the dhoti sari” unless a cited source establishes the exact statement. It also does not imply that LuxeMia sells, represents or is affiliated with Anamika Khanna.</p>

      <h2>How to use a designer profile</h2>
      <p>A designer profile provides fashion-history context. It is not evidence that a separate retailer's product is made by, inspired by or connected with that designer. LuxeMia product pages should be read only for the facts stated on that exact listing.</p>
    `,
    author: EDITORIAL_TEAM,
    publishedAt: '2026-07-14',
    updatedAt: FACT_CHECKED_AT,
    factCheckedAt: FACT_CHECKED_AT,
    category: 'Designer Profile',
    tags: ['anamika khanna', 'indian fashion designer', 'kolkata fashion', 'indian couture'],
    image: '/og-image.jpg',
    imagePresentation: 'editorial',
    readTime: 3,
    sources: [SOURCES.anamikaOfficial, SOURCES.anamikaBof],
  },
  {
    id: 'cc2',
    slug: 'bindi-meaning-history-indian-women',
    title: 'The Bindi: Meanings, Names and Respectful Context',
    excerpt: 'Bindi comes from the Sanskrit bindu, meaning a point or dot. Meanings and practices vary across religions, regions, families and occasions, so no single explanation applies to every wearer.',
    content: `
      ${editorialNote}
      <h2>What the word means</h2>
      <p>The Hindu American Foundation traces “bindi” to the Sanskrit word <em>bindu</em>, meaning a point, drop or particle. Related forehead marks and names vary by language, region and practice.</p>

      <h2>Why one explanation is not enough</h2>
      <p>Bindis can carry religious, cultural, marital, regional, family or decorative meaning. A red bindi should not automatically be described as proof of marital status, and a decorative sticker should not be assumed to have the same meaning for every wearer.</p>

      <h2>Bindi and tilak are not always interchangeable</h2>
      <p>English-language explanations sometimes collapse different forehead marks into one category. Materials, shapes, placement, wearers and ritual contexts differ. When discussing a specific practice, use the name supplied by the community or person involved.</p>

      <h2>Respectful use and styling</h2>
      <p>A bindi can be part of an outfit, but it should not be reduced to a costume prop or presented with invented spiritual claims. If attending a religious or family ceremony, ask the hosts whether a forehead mark is expected, offered to guests or best left to participants in the practice.</p>

      <h2>Editorial boundary</h2>
      <p>This article describes documented context; it does not tell a reader what every Hindu, Jain, Buddhist, South Asian or diaspora community believes. Individual and community meanings take priority over a general guide.</p>
    `,
    author: EDITORIAL_TEAM,
    publishedAt: '2026-07-12',
    updatedAt: FACT_CHECKED_AT,
    factCheckedAt: FACT_CHECKED_AT,
    category: 'Cultural Guide',
    tags: ['bindi meaning', 'bindu', 'forehead mark', 'south asian culture', 'bindi context'],
    image: '/og-image.jpg',
    imagePresentation: 'editorial',
    readTime: 4,
    sources: [SOURCES.bindi],
  },
  {
    id: '46',
    slug: 'tarun-tahiliani-designer-profile-india-modern-couture',
    title: 'Tarun Tahiliani: A Source-Based Designer Profile',
    excerpt: 'Tarun Tahiliani’s official chronology records the 1987 founding of Ensemble, fashion study at FIT, participation in founding FDCI in 1999 and a 2003 Milan Fashion Week presentation.',
    content: `
      ${editorialNote}
      <h2>Early career and Ensemble</h2>
      <p>Tarun Tahiliani's official legacy page states that he and Sailaja Tahiliani co-founded Ensemble in Mumbai in 1987 as a multi-brand fashion boutique. It says he later studied at the Fashion Institute of Technology in New York and held a solo show at London's Dorchester Hotel in 1994.</p>

      <h2>Industry milestones in the official chronology</h2>
      <ul>
        <li>The official page lists Tahiliani among the group that formed the Fashion Design Council of India in 1999.</li>
        <li>It records a Milan Fashion Week presentation in September 2003.</li>
        <li>His current official store includes womenswear, menswear and accessories, including lehenga, saree, kurta, sherwani and bandhgala categories.</li>
      </ul>

      <h2>Design language</h2>
      <p>The house describes its work through Indian craft, drape, tailoring and lightness. Those are the brand's own descriptions of its practice; they should not be converted into unsupported claims that Tahiliani invented a construction method or that another seller's item is connected with his label.</p>

      <h2>No LuxeMia affiliation</h2>
      <p>This independent editorial profile does not imply endorsement, representation, collaboration or product affiliation between Tarun Tahiliani and LuxeMia.</p>
    `,
    author: EDITORIAL_TEAM,
    publishedAt: '2026-07-14',
    updatedAt: FACT_CHECKED_AT,
    factCheckedAt: FACT_CHECKED_AT,
    category: 'Designer Profile',
    tags: ['tarun tahiliani', 'ensemble boutique', 'fdci', 'indian fashion designer'],
    image: '/og-image.jpg',
    imagePresentation: 'editorial',
    readTime: 4,
    sources: [SOURCES.tarunOfficial],
  },
  {
    id: '47',
    slug: 'rahul-mishra-designer-profile-paris-haute-couture-sustainable',
    title: 'Rahul Mishra: Woolmark, Paris Couture and Craft—With Sources',
    excerpt: 'Rahul Mishra’s official biography records his 2014 International Woolmark Prize and Paris Haute Couture Week participation. The brand describes its work through craft-community participation and the “3 E’s.”',
    content: `
      ${editorialNote}
      <h2>Verified milestones</h2>
      <p>Rahul Mishra's official biography states that he won the International Woolmark Prize in 2014 and became the first Indian designer invited to show at Paris Haute Couture Week. The Woolmark Company separately records the 2014 prize in Milan and later Paris Fashion Week collections.</p>

      <h2>How the house describes its work</h2>
      <p>The Rahul Mishra house says its design philosophy centers on Environment, Employment and Empowerment. It describes hand embroidery, weaving and artisanal craft as part of its process and presents fashion as participation in craft communities.</p>

      <h2>Attributed claims versus independent facts</h2>
      <p>Artisan counts, livelihood impacts and sustainability outcomes are difficult to verify from a retailer's page alone. This article therefore attributes those statements to the brand instead of presenting them as independently audited results. “Sustainable” is not used here as a blanket certification.</p>

      <h2>No LuxeMia affiliation</h2>
      <p>LuxeMia does not claim that its products are made by, licensed by, inspired by or affiliated with Rahul Mishra. This profile is included for documented fashion-industry context only.</p>
    `,
    author: EDITORIAL_TEAM,
    publishedAt: '2026-07-14',
    updatedAt: FACT_CHECKED_AT,
    factCheckedAt: FACT_CHECKED_AT,
    category: 'Designer Profile',
    tags: ['rahul mishra', 'woolmark prize', 'paris haute couture', 'indian fashion designer'],
    image: '/og-image.jpg',
    imagePresentation: 'editorial',
    readTime: 4,
    sources: [SOURCES.rahulOfficial, SOURCES.rahulWoolmark],
  },
  {
    id: '63',
    slug: 'navratri-9-day-color-guide-2026',
    title: 'Navratri 2026 Dates, Garba Clothing and the Truth About Color Lists',
    excerpt: 'Sharad Navratri begins October 11, 2026, with Maha Navami on October 19 and Vijayadashami on October 20 in the cited New Delhi calendar. Dates and practices can vary by location and tradition.',
    content: `
      ${editorialNote}
      <h2>Verified 2026 dates</h2>
      <p>Incredible India explains Navratri as “nine nights” honoring forms of Goddess Durga. For New Delhi, the cited 2026 panchang places the start of Sharad Navratri on Sunday, October 11, Maha Navami on Monday, October 19, and Vijayadashami on Tuesday, October 20. Religious-calendar observances can vary by location, tithi and community, so confirm dates with your temple or event organizer.</p>

      <h2>Are the nine colors universal?</h2>
      <p>No single nine-color list should be presented as a rule followed by every Navratri observer. Published color calendars can depend on the year and source, while families and organizations may use different themes or no daily color schedule. The previous LuxeMia article incorrectly used 2025 dates as 2026 dates; this revision corrects that error.</p>

      <h2>What to wear for garba</h2>
      <p>Garba clothing varies. Chaniya choli, kediyu-style garments, kurtas, lehengas and other festive outfits may be worn, but the event organizer's dress code is the authority. For dancing, check garment security, hem length, footwear, jewelry weight and whether mirrors, sequins or other work can snag nearby clothing.</p>

      <h2>Ordering for an event</h2>
      <p>LuxeMia ships only to United States addresses. Shipping is $12 below $150 and free at $150 and above. The store does not promise that every item will arrive by a particular Navratri event. Contact support before ordering when the date is important.</p>
    `,
    author: EDITORIAL_TEAM,
    publishedAt: '2026-07-15',
    updatedAt: FACT_CHECKED_AT,
    factCheckedAt: FACT_CHECKED_AT,
    category: 'Festival Guide',
    tags: ['navratri 2026', 'navratri dates', 'garba outfit', 'navratri colors', 'chaniya choli'],
    image: '/images/blog/blog-006-teal-green-net.webp',
    readTime: 4,
    sources: [SOURCES.incredibleIndiaNavratri, SOURCES.navratri2026, SOURCES.luxemiaShipping],
  },
  {
    id: 'fc1',
    slug: 'sabyasachi-mukherjee-designer-profile-handloom-revival',
    title: 'Sabyasachi: A Source-Based History of the Fashion House',
    excerpt: 'Sabyasachi’s official chronology records the founder’s NIFT Kolkata graduation, the start of the label with three workers, fashion-week milestones and later expansion into bridalwear, jewelry and accessories.',
    content: `
      ${editorialNote}
      <h2>Starting the label</h2>
      <p>The Sabyasachi house's official history says Sabyasachi Mukherjee graduated from the National Institute of Fashion Technology in Kolkata and started the eponymous label six months later with a workforce of three.</p>

      <h2>Milestones documented by the house</h2>
      <ul>
        <li>The chronology records a Lakmé Fashion Week debut with the collection “Kashgaar Bazaar.”</li>
        <li>It records later presentations in Milan and New York.</li>
        <li>It documents the house's expansion into bridalwear, jewelry, accessories and international retail.</li>
        <li>It describes recurring use of Indian craft, handwoven textiles and heritage references in the brand's work.</li>
      </ul>

      <h2>How claims are handled here</h2>
      <p>Because the main source is the fashion house's own chronology, statements about influence, “firsts,” commercial records and cultural impact must be understood as brand claims unless corroborated independently. This revision removes unsupported revenue estimates, employee totals and claims that one celebrity event caused an industry-wide trend.</p>

      <h2>No LuxeMia affiliation</h2>
      <p>LuxeMia does not claim to sell Sabyasachi products or to be affiliated with the designer or fashion house. The name must not be attached to a LuxeMia product unless an authentic commercial relationship and product provenance are documented.</p>
    `,
    author: EDITORIAL_TEAM,
    publishedAt: '2026-07-12',
    updatedAt: FACT_CHECKED_AT,
    factCheckedAt: FACT_CHECKED_AT,
    category: 'Designer Profile',
    tags: ['sabyasachi', 'sabyasachi history', 'indian fashion house', 'indian couture'],
    image: '/og-image.jpg',
    imagePresentation: 'editorial',
    readTime: 4,
    sources: [SOURCES.sabyasachiOfficial],
  },
];

export const getPostBySlug = (slug: string): BlogPost | undefined =>
  blogPosts.find(post => post.slug === slug);

export const getRelatedPosts = (currentPost: BlogPost, limit: number = 3): BlogPost[] =>
  blogPosts
    .filter(post => post.id !== currentPost.id)
    .sort((a, b) => {
      const sameCategoryA = a.category === currentPost.category ? 1 : 0;
      const sameCategoryB = b.category === currentPost.category ? 1 : 0;
      return sameCategoryB - sameCategoryA;
    })
    .slice(0, limit);
