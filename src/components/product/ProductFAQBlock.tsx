/**
 * ProductFAQBlock — Enhanced FAQ component with AI-search optimized answers
 *
 * Provides category-specific FAQs (lehenga, saree, suit, menswear) with
 * FAQPage schema markup for rich snippets in Google, Bing, and AI search.
 * Answers are structured, factual, and concise for LLM consumption.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  HelpCircle,
  Shirt,
  Ruler,
  Truck,
  Droplets,
  Package,
  Sparkles,
  RotateCcw,
  Clock,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ProductFAQBlockProps {
  productName: string;
  productType?: string;
  fabric?: string;
  price?: string;
}

interface FAQEntry {
  question: string;
  answer: string;
  category: 'sizing' | 'fabric' | 'shipping' | 'care' | 'styling' | 'returns' | 'general';
  icon: React.ReactNode;
}

// ─── Product Category Classifier ────────────────────────────────────────────

type ProductCategory = 'lehenga' | 'saree' | 'suit' | 'menswear' | 'other';

const classifyProduct = (productType?: string): ProductCategory => {
  if (!productType) return 'other';
  const lower = productType.toLowerCase();
  if (lower.includes('lehenga')) return 'lehenga';
  if (lower.includes('saree') || lower.includes('sari')) return 'saree';
  if (
    lower.includes('salwar') ||
    lower.includes('kameez') ||
    lower.includes('anarkali') ||
    lower.includes('sharara') ||
    lower.includes('pakistani') ||
    lower.includes('palazzo') ||
    lower.includes('gharara') ||
    lower.includes('suit') ||
    lower.includes('kurta') ||
    lower.includes('churidar')
  ) {
    if (lower.includes('men') || lower.includes('sherwani') || lower.includes('achkan') || lower.includes('jodhpuri')) return 'menswear';
    return 'suit';
  }
  if (lower.includes('men') || lower.includes('sherwani') || lower.includes('achkan') || lower.includes('jodhpuri') || lower.includes('bandhgala')) return 'menswear';
  return 'other';
};

// ─── FAQ Data by Category ───────────────────────────────────────────────────

const FAQ_ICONS = {
  sizing: <Ruler className="h-4 w-4" />,
  fabric: <Shirt className="h-4 w-4" />,
  shipping: <Truck className="h-4 w-4" />,
  care: <Droplets className="h-4 w-4" />,
  styling: <Sparkles className="h-4 w-4" />,
  returns: <RotateCcw className="h-4 w-4" />,
  general: <HelpCircle className="h-4 w-4" />,
};

const LEHENGA_FAQS: FAQEntry[] = [
  {
    question: 'What is included in a lehenga choli set?',
    answer: 'Every lehenga choli set from LuxeMia Boutique includes three pieces: (1) the lehenga (flared skirt) with drawstring or zip closure, (2) the choli (blouse) in a matching or complementary design, and (3) the dupatta (scarf) with coordinated embroidery or border work. All three pieces are designed to be worn together as a complete ensemble. Some bridal lehengas may also include additional embellishments like a kamarbandh (waist chain) or second dupatta.',
    category: 'general',
    icon: FAQ_ICONS.general,
  },
  {
    question: 'How do I choose the right lehenga size?',
    answer: 'Measure your waist at the navel and your bust at the fullest point. Lehengas are sized primarily by waist measurement since the skirt sits at the waist. The choli (blouse) is sized by bust. LuxeMia Boutique offers sizes XS through XXL, plus complimentary custom tailoring with our Made to Measure (UDesign) service. For the best fit, choose a lehenga waist size 1-2 inches larger than your actual waist measurement to allow for comfortable sitting and movement.',
    category: 'sizing',
    icon: FAQ_ICONS.sizing,
  },
  {
    question: 'What is the difference between semi-stitched and ready-to-wear lehenga?',
    answer: 'Semi-stitched lehengas come with pre-constructed panels and open side seams, allowing a local tailor to adjust the fit easily. They are the fastest option with no extra tailoring lead time. Ready-to-wear lehengas are fully stitched to standard bust and waist measurements — select your size and wear it straight out of the box. Ready-to-wear adds $15 and 3 extra business days. Made to Measure offers full customization of neckline, sleeve style, and bottom for $25 extra and 5 additional business days.',
    category: 'general',
    icon: FAQ_ICONS.general,
  },
  {
    question: 'Which fabric is best for a bridal lehenga?',
    answer: 'For bridal lehengas, velvet and raw silk are the top choices. Velvet offers unmatched richness and depth, making it ideal for winter weddings and evening ceremonies. Raw silk provides a structured silhouette that holds heavy zardozi and resham embroidery beautifully. For destination weddings or summer events, georgette lehengas are lightweight and comfortable while still looking festive. Net lehengas create an ethereal, princess-like look perfect for receptions.',
    category: 'fabric',
    icon: FAQ_ICONS.fabric,
  },
  {
    question: 'How far in advance should I order a bridal lehenga?',
    answer: 'Order your bridal lehenga at least 4-6 weeks before the wedding date. Readymade lehengas ship in 3-5 business days. Ready-to-wear (stitched) orders take 5-7 business days. Made to Measure (bespoke) orders take 7-10 business days. Shipping to the USA takes 3-5 business days via DHL Express or 7-10 days via standard shipping. This timeline allows for any last-minute alterations and ensures your lehenga arrives with time to spare.',
    category: 'shipping',
    icon: FAQ_ICONS.shipping,
  },
  {
    question: 'How do I store and care for my lehenga after the wedding?',
    answer: 'Dry clean your lehenga immediately after the event — do not store it with stains or perspiration. Once cleaned, fold the lehenga with acid-free tissue paper between layers to prevent embroidery from pressing into the fabric. Store in a breathable muslin or cotton garment bag — never in plastic, which traps moisture. Add natural moth repellents like cedar blocks or neem leaves. Store in a cool, dry place away from direct sunlight. Refold every 3-4 months to prevent permanent creasing.',
    category: 'care',
    icon: FAQ_ICONS.care,
  },
  {
    question: 'How do I drape the lehenga dupatta?',
    answer: 'The most popular draping styles are: (1) Over one shoulder — pin the dupatta at the shoulder and let it flow down the back for elegance and ease of movement. (2) Front pallu drape — drape the dupatta over both shoulders with the pallu across the chest for a traditional bridal look. (3) Saree-style drape — pleat and tuck the dupatta into the waistband, then bring it over the shoulder. (4) Cape drape — pin both ends at the shoulders so the dupatta falls like a cape behind you. Use decorative pins (sari pins) to secure without damaging the fabric.',
    category: 'styling',
    icon: FAQ_ICONS.styling,
  },
  {
    question: 'Can I return or exchange my lehenga if it does not fit?',
    answer: 'All sales are final. LuxeMia Boutique does not accept returns or exchanges for any reason, including sizing issues. We strongly recommend reviewing our detailed Size Guide and contacting our customer service team before ordering if you have any questions about fit. For the best results, opt for Semi-Stitched sizing, which allows easy local alteration. The only exception is genuine shipping damage, which requires a mandatory unboxing video recorded at the time of delivery and must be reported within 48 hours.',
    category: 'returns',
    icon: FAQ_ICONS.returns,
  },
  {
    question: 'What is the lehenga flare and how do I choose the right one?',
    answer: 'Lehenga flare refers to the circumference of the skirt hem. A standard lehenga has a 3-4 meter flare, suitable for most body types and occasions. A full bridal flare (5-6 meters) creates maximum volume and drama, ideal for brides and grand entrances. A minimal flare (2-3 meters) is lighter and easier to manage, perfect for pre-wedding events like mehndi and sangeet where you will be moving and dancing. The flare is supported by a can-can (structured netting) sewn underneath — LuxeMia Boutique lehengas include this support by default.',
    category: 'general',
    icon: FAQ_ICONS.general,
  },
  {
    question: 'What jewelry pairs best with a bridal lehenga?',
    answer: 'A bridal lehenga pairs best with a coordinated jewelry set: (1) Maang tikka — worn at the hairline, it is essential for bridal ceremonies. (2) Choker or statement necklace — polki, kundan, or uncut diamond sets complement red, maroon, and gold lehengas. (3) Jhumkas or chandelier earrings — match the metal tone to the embroidery (gold zari with gold jewelry, silver zari with silver/diamond). (4) Bangles or haath phool (hand harness) — add finishing bridal detail. (5) Nose ring (nath) — optional but traditional for the wedding ceremony. Gold-toned jewelry suits warm palettes; diamond and platinum suit cool tones like pastels and ice blues.',
    category: 'styling',
    icon: FAQ_ICONS.styling,
  },
];

const SAREE_FAQS: FAQEntry[] = [
  {
    question: 'Is a blouse piece included with the saree?',
    answer: 'Yes, every saree from LuxeMia Boutique includes a matching or contrast blouse piece (approximately 0.8 to 1 meter of fabric) attached to the saree pallu end. The blouse piece fabric matches the saree body or border design. You will need to get the blouse stitched by a tailor according to your measurements. LuxeMia Boutique also offers Ready to Wear and Made to Measure tailoring services where we can stitch the blouse for you — simply select your tailoring preference when ordering and submit your blouse measurements after checkout.',
    category: 'general',
    icon: FAQ_ICONS.general,
  },
  {
    question: 'How do I choose the right saree for my body type?',
    answer: 'For petite frames, choose lightweight fabrics like chiffon, georgette, or cotton silk that drape closely without overwhelming your silhouette. Taller women can carry heavy Banarasi silks and Kanchipuram sarees beautifully. For curvier figures, opt for sarees with medium-width borders and vertical motifs that create a lengthening effect. Small, dense prints and fine embroidery work better than large, sparse motifs. Darker colors and jewel tones have a slimming effect. Avoid very stiff fabrics like heavy organza if you prefer a softer drape.',
    category: 'sizing',
    icon: FAQ_ICONS.sizing,
  },
  {
    question: 'What is the difference between Banarasi and Kanchipuram silk sarees?',
    answer: 'Banarasi silk sarees are handwoven in Varanasi, Uttar Pradesh, and are characterized by intricate gold and silver zari brocade patterns (kalga and bel motifs), fine silk, and opulent pallus. They are generally lighter in weight than Kanchipuram sarees. Kanchipuram (Kanjeevaram) silk sarees are handwoven in Kanchipuram, Tamil Nadu, and are known for their heavy-weight pure mulberry silk, distinctive contrasting borders, and temple-inspired designs (mythological scenes, peacocks, checks). Kanchipuram sarees use a unique technique where the border and body are woven separately and then interlocked — a hallmark of authenticity.',
    category: 'fabric',
    icon: FAQ_ICONS.fabric,
  },
  {
    question: 'How do I drape a saree properly?',
    answer: 'The Nivi drape (most common): Tuck the plain end into the right side petticoat waistband, wrap once around, make 5-7 pleats, tuck them in at the center front, then drape the remaining fabric over the left shoulder as the pallu. Secure with a safety pin at the shoulder. For beginners: (1) Wear a well-fitted petticoat (matching the saree color). (2) Use safety pins at the shoulder, waist, and pleats to secure the drape. (3) The saree should just graze the floor — adjust the petticoat height accordingly. (4) Practice draping before the event. Many dry cleaners also offer professional draping services.',
    category: 'styling',
    icon: FAQ_ICONS.styling,
  },
  {
    question: 'How long does saree delivery take to the USA?',
    answer: 'Saree delivery to the USA takes 3-5 business days via DHL Express or 7-10 business days via standard USPS/UPS shipping. Readymade sarees are dispatched within 3-5 business days from our quality inspection center in India. If you opt for Ready to Wear blouse stitching, add 3 business days. Made to Measure blouse stitching adds 5 business days. We offer flat-rate shipping of $25 with FREE shipping on all orders over $350 to the USA, Canada, and Australia. You will receive a tracking number as soon as your order is dispatched.',
    category: 'shipping',
    icon: FAQ_ICONS.shipping,
  },
  {
    question: 'How should I wash and store my silk saree?',
    answer: 'Silk sarees should always be dry cleaned. Never machine wash or hand wash silk, Banarasi, or Kanchipuram sarees at home. For cotton silk sarees, gentle hand washing in cold water with mild detergent is acceptable. To store: (1) Always dry clean before storing. (2) Fold and store flat in a cool, dry place — never hang silk sarees as the weight can distort the fabric. (3) Wrap in muslin cloth or a cotton saree bag. (4) Refold every 3-4 months to prevent permanent creases. (5) Keep away from direct sunlight to prevent color fading. (6) Use natural cedar or neem repellents — never mothballs, which can damage silk and zari.',
    category: 'care',
    icon: FAQ_ICONS.care,
  },
  {
    question: 'What type of blouse design works best with a silk saree?',
    answer: 'For Banarasi and Kanchipuram silk sarees, a high-neck or boat-neck blouse with elbow-length or full sleeves creates a classic, elegant look. Deep U-back and keyhole back designs add modern sophistication. For party-wear georgette sarees, a sleeveless or halter-neck blouse works beautifully. A well-fitted blouse with proper darts and structure is essential — the blouse can make or break the saree look. LuxeMia Boutique offers custom blouse stitching through our Ready to Wear (+$15) and Made to Measure (+$25) services with neckline and sleeve customization options.',
    category: 'styling',
    icon: FAQ_ICONS.styling,
  },
  {
    question: 'Can I return a saree if the color does not match my expectations?',
    answer: 'All sales are final. LuxeMia Boutique does not accept returns or exchanges for any reason, including color mismatch or change of mind. We make every effort to display accurate product colors through high-resolution images taken under professional lighting. However, screen variations may cause slight color differences. If you need precise color matching, contact our team via WhatsApp at +1 (215) 341-9990 and we can share additional photos or a video of the actual product before you order. For genuine shipping damage, a mandatory unboxing video is required and the claim must be filed within 48 hours of delivery.',
    category: 'returns',
    icon: FAQ_ICONS.returns,
  },
  {
    question: 'What footwear should I wear with a saree?',
    answer: 'The best footwear for a saree is comfortable block heels (2-3 inches) that provide stability while walking with the draped fabric. Embellished juttis (traditional Indian footwear) and mojaris are also excellent choices — they complement the ethnic aesthetic and are comfortable for long events. Avoid stilettos, as they can get caught in the saree pleats and are uncomfortable for extended wear. Wedges are a good middle-ground option. Choose footwear that matches or complements the saree border color for a coordinated look. Gold or metallic-toned footwear pairs well with most silk and zari sarees.',
    category: 'styling',
    icon: FAQ_ICONS.styling,
  },
  {
    question: 'How do I identify an authentic handloom saree?',
    answer: 'Authentic handloom sarees have these telltale signs: (1) The reverse side shows the weaving pattern clearly — machine-made sarees have a flat, uniform back. (2) Slight irregularities in the weave and minor thread bunching are normal in handlooms — perfect uniformity indicates power-loom production. (3) Handloom Banarasi sarees have silk mark tags and GI (Geographical Indication) certifications. (4) Kanchipuram sarees have a distinctive zari test — scratch the zari gently; real zari (silver or gold-coated) will show a copper or silver core, while fake zari is simply plastic thread. LuxeMia Boutique sources all handloom sarees directly from certified weavers in Varanasi and Kanchipuram with full authenticity documentation.',
    category: 'fabric',
    icon: FAQ_ICONS.fabric,
  },
];

const SUIT_FAQS: FAQEntry[] = [
  {
    question: 'What is the difference between an Anarkali, Sharara, and Palazzo suit?',
    answer: 'An Anarkali suit features a fitted bodice that flares out from the bust or waist into a flowing, floor-length skirt — resembling a gown silhouette. It is the most formal and dramatic of the three. A Sharara suit has a straight or slightly flared kameez (tunic) paired with wide-legged, flared trousers (sharara) that resemble a skirt when standing still — popular for weddings and festive occasions. A Palazzo suit pairs a straight or A-line kameez with wide, straight-leg trousers (palazzo) that are comfortable and modern — ideal for casual, office, and semi-formal events. All three include a matching dupatta.',
    category: 'general',
    icon: FAQ_ICONS.general,
  },
  {
    question: 'How do I select the correct size for a salwar kameez?',
    answer: 'For salwar kameez suits, your bust measurement is the most important sizing factor. Measure around the fullest part of your bust with the tape level across your back. Also measure your waist at the navel and hips at the widest point. LuxeMia Boutique offers sizes XS (Bust 32") through XXL (Bust 44"), plus custom sizing. If you fall between sizes, choose the larger size — it is easier to take a garment in than let it out. For Semi-Stitched suits, the side seams are left open for easy local alteration. For Ready to Wear, we stitch to your exact measurements. Length can always be adjusted by a local tailor.',
    category: 'sizing',
    icon: FAQ_ICONS.sizing,
  },
  {
    question: 'Which fabric is best for daily wear versus festive wear suits?',
    answer: 'For daily and office wear, cotton and rayon suits are the best choices — they are breathable, easy to maintain, and comfortable for all-day wear. Cotton suits can be machine washed and require minimal care. For festive occasions like Diwali and Eid, silk, georgette, and chanderi suits offer the right balance of elegance and comfort. Silk suits are the most formal and suitable for weddings and receptions. Georgette suits are lightweight and flowy, perfect for parties and pre-wedding events. Chanderi suits offer a heritage, sophisticated look with their characteristic sheer texture and subtle sheen — ideal for engagement ceremonies and formal gatherings.',
    category: 'fabric',
    icon: FAQ_ICONS.fabric,
  },
  {
    question: 'How do I care for my embroidered salwar suit?',
    answer: 'For heavily embroidered suits: dry clean only. Do not machine wash or hand wash, as water can damage the embroidery threads and cause colors to bleed. For lightly embroidered or printed cotton/rayon suits: gentle hand wash in cold water with mild detergent. Always wash dark and light colors separately. Do not wring or twist — gently squeeze out excess water and hang in shade to dry. Never tumble dry. Iron on medium heat using a pressing cloth over embroidered areas. Store embellished suits folded with tissue paper between layers to protect the thread work. Keep in a breathable cotton bag, never plastic.',
    category: 'care',
    icon: FAQ_ICONS.care,
  },
  {
    question: 'How long does delivery take for suits to the USA and Canada?',
    answer: 'Delivery to the USA takes 3-5 business days via DHL Express or 7-10 business days via standard shipping. Delivery to Canada takes 5-10 business days. Readymade and Semi-Stitched suits are dispatched within 3-5 business days. Ready to Wear (fully stitched) suits are dispatched within 5-7 business days. Made to Measure (bespoke) suits take 7-10 business days for dispatch. All orders ship with full tracking. Shipping is a flat $25 with FREE shipping on orders over $350 to the USA, Canada, and Australia.',
    category: 'shipping',
    icon: FAQ_ICONS.shipping,
  },
  {
    question: 'What is the difference between semi-stitched and unstitched salwar kameez?',
    answer: 'A semi-stitched salwar kameez comes with pre-cut fabric pieces that are partially sewn — the main body is assembled but side seams are left open for easy size adjustment. You can have a local tailor take it in or let it out within 2-3 inches. An unstitched salwar kameez is fabric only — you receive the material for the kameez, salwar, and dupatta, which you then have stitched completely by a tailor from scratch. Semi-stitched is faster and requires minimal tailoring. Unstitched gives maximum customization freedom but requires more time and a skilled tailor. LuxeMia Boutique offers Semi-Stitched at no extra charge.',
    category: 'general',
    icon: FAQ_ICONS.general,
  },
  {
    question: 'How can I style a salwar kameez for a wedding?',
    answer: 'To elevate a salwar kameez for a wedding: (1) Choose silk, georgette, or heavily embroidered fabric with zari, sequin, or mirror work. (2) Add a statement maang tikka and chandelier earrings — skip a heavy necklace to keep the look balanced. (3) Drape the dupatta over one shoulder and pin it elegantly, or let it flow freely for a graceful effect. (4) Wear embroidered juttis or embellished block heels. (5) Add bangles or a delicate hand harness (haath phool) for bridal-adjacent events. (6) Carry a small embellished clutch. For reception events, choose deeper jewel tones like wine, emerald, or midnight blue. For daytime weddings, pastels and gold tones work beautifully.',
    category: 'styling',
    icon: FAQ_ICONS.styling,
  },
  {
    question: 'What is the return policy for salwar kameez suits?',
    answer: 'All sales are final. LuxeMia Boutique does not accept returns or exchanges for salwar kameez suits or any other products. This policy applies to all reasons including sizing issues, color mismatch, and change of mind. We encourage all customers to review our detailed Size Guide, fabric descriptions, and product images carefully before ordering. If you have sizing questions, contact our customer service team via WhatsApp at +1 (215) 341-9990 before placing your order — we are happy to provide guidance. The only exception is genuine shipping damage, which must be reported within 48 hours of delivery with a mandatory unboxing video as proof.',
    category: 'returns',
    icon: FAQ_ICONS.returns,
  },
  {
    question: 'Can I get the suit tailored to my exact measurements?',
    answer: 'Yes. LuxeMia Boutique offers a Made to Measure (UDesign) bespoke tailoring service for $25 above the product price. With this service, you can customize: (1) Neckline — round neck, deep U-neck, square neck, or sweetheart. (2) Sleeve style — full sleeve, 3/4 sleeve, half sleeve, sleeveless, or cap sleeve. (3) Bottom style — churidar, salwar, semi patiala, or straight pant/palazzo. After placing your order, submit your exact measurements through My Account → My Orders. Our master tailors with decades of ethnic wear experience will craft your garment to your specifications. Made to Measure adds 5 business days to the dispatch timeline.',
    category: 'sizing',
    icon: FAQ_ICONS.sizing,
  },
  {
    question: 'What jewelry and accessories go best with an Anarkali suit?',
    answer: 'Anarkali suits pair beautifully with: (1) A statement maang tikka and long chandelier earrings — this is the classic Anarkali jewelry combination. (2) Skip a heavy necklace since the high fitted bodice of an Anarkali provides enough visual interest at the neckline. (3) Add bangles or a delicate bracelet stack. (4) For footwear, kolhapuris or embroidered juttis complement the flared silhouette perfectly. (5) Drape the dupatta gracefully over one shoulder or across both arms. (6) A metallic kamarbandh (belt) around the waist adds structure and a modern touch. Choose gold-toned jewelry for warm-colored Anarkalis (red, orange, maroon) and silver/pearl jewelry for cool tones (blue, green, pastels).',
    category: 'styling',
    icon: FAQ_ICONS.styling,
  },
];

const MENSWEAR_FAQS: FAQEntry[] = [
  {
    question: 'What is the difference between a sherwani, a Jodhpuri suit, and a bandhgala?',
    answer: 'A sherwani is a long, coat-like outer garment that extends to the knees or below, worn over a churidar (fitted trousers). It is the most formal and traditional Indian menswear choice for grooms and wedding guests. A Jodhpuri suit (also called bandhgala) is a shorter, structured jacket with a mandarin collar that fastens at the neck with buttons or decorative closures. It is typically paired with fitted trousers and offers a more streamlined, modern silhouette. A bandhgala is technically the same as a Jodhpuri suit — the terms are often used interchangeably. Sherwanis are best for the main wedding ceremony, while Jodhpuri/bandhgala suits work beautifully for receptions, engagements, and cocktail events.',
    category: 'general',
    icon: FAQ_ICONS.general,
  },
  {
    question: 'How do I choose the right sherwani size?',
    answer: 'For sherwanis, measure your chest at the fullest point, your shoulder width from seam to seam, and your height. LuxeMia Boutique sherwanis are available in standard sizes (38-48) that correspond to chest measurements in inches. The sherwani should fit comfortably over a thin kurta — do not size down to accommodate layering. The length should fall at or just below the knee. Sleeve length should end at the wrist bone. If you fall between sizes, choose the larger size and have it tailored locally. For the best fit, opt for our Made to Measure service where we customize the garment to your exact chest, shoulder, sleeve, and length measurements for an additional $25.',
    category: 'sizing',
    icon: FAQ_ICONS.sizing,
  },
  {
    question: 'Which fabric is best for a groom wedding sherwani?',
    answer: 'For a groom wedding sherwani, pure silk and brocade are the premier choices. Silk sherwanis offer a natural luster and regal drape that photograph beautifully under wedding lighting. Brocade fabric with gold or silver zari weaving creates a ceremonial, ornate look perfect for the main wedding ceremony. For pre-wedding events like mehndi and haldi, cotton silk sherwanis are lighter, more breathable, and comfortable for daytime outdoor events. Jacquard sherwanis offer a sophisticated woven pattern without heavy embellishment — ideal for receptions and engagement parties. Art silk provides an affordable alternative to pure silk with a similar aesthetic, suitable for groomsmen and guests.',
    category: 'fabric',
    icon: FAQ_ICONS.fabric,
  },
  {
    question: 'How should I care for my sherwani after the wedding?',
    answer: 'Always dry clean your sherwani — never machine wash or hand wash. After the event, have it professionally dry cleaned as soon as possible to remove any stains, perspiration, or food residue. For storage: (1) Store on a padded, broad-shouldered hanger to maintain the jacket structure. (2) Use a breathable garment bag — never plastic, which traps moisture and can cause mildew. (3) Keep in a cool, dry place away from direct sunlight to prevent fabric fading. (4) Add cedar blocks or neem leaves as natural moth repellents. (5) Air out the sherwani for a few hours before storing it long-term. (6) If the sherwani has heavy embroidery, stuff the sleeves and body with acid-free tissue paper to prevent creasing.',
    category: 'care',
    icon: FAQ_ICONS.care,
  },
  {
    question: 'How long does it take to deliver a sherwani to the USA?',
    answer: 'Sherwani delivery to the USA takes 3-5 business days via DHL Express or 7-10 business days via standard shipping. Readymade and Semi-Stitched sherwanis are dispatched within 3-5 business days from our quality inspection center in India. Ready to Wear (fully stitched) sherwanis take 5-7 business days for dispatch. Made to Measure (bespoke) sherwanis take 7-10 business days for tailoring and dispatch. We recommend ordering groom sherwanis at least 4-6 weeks before the wedding date to allow ample time for delivery and any last-minute adjustments. Shipping is a flat $25 with FREE shipping on orders over $350 to the USA, Canada, and Australia.',
    category: 'shipping',
    icon: FAQ_ICONS.shipping,
  },
  {
    question: 'What should the groom wear with a sherwani?',
    answer: 'A groom sherwani ensemble includes several key elements: (1) The sherwani itself — in a ceremonial color like deep maroon, ivory, navy, or gold. (2) A churidar or tailored trousers in a matching or complementary shade. (3) A dupatta or stole draped over one shoulder or across both — often in silk or velvet with embroidered edges. (4) A safa (turban) or pagri in matching or contrast fabric with a sarpech (turban ornament). (5) Mojaris or embroidered juttis in gold or matching leather. (6) A brooch or lapel pin on the sherwani for a regal finishing touch. Many grooms also add a kantha (necklace) or pocket watch for additional ceremony detail. LuxeMia Boutique offers coordinating stole and accessory recommendations with each sherwani.',
    category: 'styling',
    icon: FAQ_ICONS.styling,
  },
  {
    question: 'Can I return a sherwani if it does not fit properly?',
    answer: 'All sales are final. LuxeMia Boutique does not accept returns or exchanges for sherwanis or any other products for any reason, including fit issues. We strongly recommend using our Made to Measure service for sherwanis, which ensures a perfect custom fit based on your exact measurements. Alternatively, choose Semi-Stitched sizing, which allows a local tailor to make adjustments easily. Before ordering, review our detailed Size Guide carefully and contact our customer service team via WhatsApp at +1 (215) 341-9990 if you have any sizing questions. For genuine shipping damage, a mandatory unboxing video is required, and claims must be filed within 48 hours of delivery.',
    category: 'returns',
    icon: FAQ_ICONS.returns,
  },
  {
    question: 'What footwear goes best with a sherwani or Jodhpuri suit?',
    answer: 'The traditional and best footwear choice for sherwanis and Jodhpuri suits is the jutti or mojari — a closed-toe, flat or low-heeled shoe with intricate embroidery, often in gold, silver, or matching leather. For groom sherwanis, gold or copper-toned mojaris are the classic choice. For a more modern look, patent leather formal shoes in black or brown can work with Jodhpuri and bandhgala suits. Ensure the shoe color complements the sherwani embroidery tone — warm zari work pairs with gold footwear, while silver zari pairs with silver or pewter-toned mojaris. Whatever style you choose, make sure the shoes are broken in before the event — new traditional footwear can cause blisters during long wedding ceremonies.',
    category: 'styling',
    icon: FAQ_ICONS.styling,
  },
  {
    question: 'How do I differentiate between a formal sherwani and an Indo-Western sherwani?',
    answer: 'A traditional (formal) sherwani has a straight, knee-length or below-knee cut with a mandarin collar, front button or hook closure, and is worn with a churidar (fitted, gathered trousers at the ankle). It features traditional embroidery like zardozi, resham thread work, or stone embellishments. An Indo-Western sherwani has a modern, fusion silhouette — it may feature asymmetrical hemlines, collarless or lapel-style necklines, Western-style button closures, and is often paired with straight trousers or even denim-like fitted pants rather than churidars. Indo-Western sherwanis suit receptions, cocktail parties, and modern wedding functions, while traditional sherwanis are appropriate for the main wedding ceremony, pheras, and religious events.',
    category: 'general',
    icon: FAQ_ICONS.general,
  },
  {
    question: 'What colors are trending for groom sherwanis this season?',
    answer: 'This season, the top trending colors for groom sherwanis are: (1) Ivory and off-white — timeless, elegant, and photograph beautifully in all lighting. Often paired with gold embroidery. (2) Deep maroon and wine — the classic Indian groom color, rich and regal for evening ceremonies. (3) Midnight blue and navy — modern, sophisticated, and universally flattering. (4) Sage green and mint — fresh, nature-inspired tones trending for spring and daytime weddings. (5) Dusty rose and blush — romantic, soft tones for modern grooms seeking something unique. (6) Classic black — failsafe for receptions and evening events. The embroidery color matters too — gold zari work complements warm tones (maroon, ivory, gold), while silver or white thread work elevates cool tones (navy, grey, pastels).',
    category: 'styling',
    icon: FAQ_ICONS.styling,
  },
];

const OTHER_FAQS: FAQEntry[] = [
  {
    question: 'What sizes are available?',
    answer: 'LuxeMia Boutique offers sizes XS through XXL, plus custom sizing. XS fits a 32" bust, S fits 34", M fits 36", L fits 38", XL fits 40", and XXL fits 44". We also offer complimentary Semi-Stitched sizing, which allows easy local alteration. For a perfect custom fit, choose our Made to Measure (UDesign) service.',
    category: 'sizing',
    icon: FAQ_ICONS.sizing,
  },
  {
    question: 'What is the delivery time?',
    answer: 'Readymade items are dispatched within 3-5 business days. Custom/alteration orders are dispatched within 5-7 business days. Made to Measure orders take 7-10 business days. Delivery takes 3-5 business days via DHL Express, or 7-10 business days via standard shipping.',
    category: 'shipping',
    icon: FAQ_ICONS.shipping,
  },
  {
    question: 'How should I care for this garment?',
    answer: 'We recommend professional dry cleaning for all ethnic wear. Store in a cool, dry place wrapped in muslin cloth. Never iron directly on embroidery or embellishments. Fold with tissue paper between layers to prevent snagging.',
    category: 'care',
    icon: FAQ_ICONS.care,
  },
  {
    question: 'Can I return or exchange if it does not fit?',
    answer: 'All sales are final. LuxeMia Boutique does not accept returns or exchanges for any reason, including sizing issues. We recommend using our Size Guide and contacting us before ordering if you have any fit questions. The only exception is genuine shipping damage, which requires a mandatory unboxing video and must be reported within 48 hours.',
    category: 'returns',
    icon: FAQ_ICONS.returns,
  },
  {
    question: 'Is custom tailoring available?',
    answer: 'Yes. LuxeMia Boutique offers three tailoring options: Semi-Stitched (included free, with open side seams for easy alteration), Ready to Wear (+$15, fully stitched to standard measurements), and Made to Measure (+$25, bespoke with 200+ style combinations for neckline, sleeve, and bottom).',
    category: 'general',
    icon: FAQ_ICONS.general,
  },
  {
    question: 'What is the shipping cost?',
    answer: 'Shipping is a flat $25 to the USA, Canada, and Australia. FREE shipping is available on all orders over $350. All orders ship with full tracking. DHL Express delivers in 3-5 business days, while standard shipping takes 7-10 business days.',
    category: 'shipping',
    icon: FAQ_ICONS.shipping,
  },
  {
    question: 'How do I style this piece for a wedding?',
    answer: 'For a wedding, pair your ethnic garment with statement jewelry — jhumkas, a maang tikka, and bangles for women; a pocket square and lapel pin for men. Wear comfortable block heels or embroidered juttis. Drape the dupatta elegantly and carry a small embellished clutch for a complete festive look.',
    category: 'styling',
    icon: FAQ_ICONS.styling,
  },
  {
    question: 'What fabric is this made from?',
    answer: 'LuxeMia Boutique garments are crafted from premium fabrics sourced directly from India\'s finest textile centers — Surat (embroidery & synthetics), Varanasi (Banarasi silk & brocade), and Jaipur (prints & gota patti). Each piece undergoes thorough quality inspection before shipping.',
    category: 'fabric',
    icon: FAQ_ICONS.fabric,
  },
];

// ─── Category Filter Labels ─────────────────────────────────────────────────

const CATEGORY_LABELS: Record<FAQEntry['category'], string> = {
  sizing: 'Sizing',
  fabric: 'Fabric & Care',
  shipping: 'Shipping',
  care: 'Care',
  styling: 'Styling',
  returns: 'Returns',
  general: 'General',
};

// ─── Component ──────────────────────────────────────────────────────────────

export const ProductFAQBlock = ({ productName, productType, fabric, price }: ProductFAQBlockProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeFilter, setActiveFilter] = useState<FAQEntry['category'] | 'all'>('all');

  const category = classifyProduct(productType);

  const faqs = useMemo(() => {
    const baseFaqs: FAQEntry[] = (() => {
      switch (category) {
        case 'lehenga': return LEHENGA_FAQS;
        case 'saree': return SAREE_FAQS;
        case 'suit': return SUIT_FAQS;
        case 'menswear': return MENSWEAR_FAQS;
        default: return OTHER_FAQS;
      }
    })();

    // Personalize FAQ answers with product name, fabric, and price
    return baseFaqs.map((faq) => {
      let personalizedAnswer = faq.answer;
      if (productName) {
        personalizedAnswer = personalizedAnswer.replace(/this garment|this piece|the product/gi, productName);
      }
      if (fabric && faq.category === 'fabric') {
        personalizedAnswer = personalizedAnswer.replace(/premium fabric/gi, `${fabric} fabric`);
      }
      if (price && faq.category === 'shipping') {
        personalizedAnswer = personalizedAnswer.replace(/\$350/g, '$350');
      }
      return { ...faq, answer: personalizedAnswer };
    });
  }, [category, productName, fabric, price]);

  const filteredFaqs = useMemo(() => {
    if (activeFilter === 'all') return faqs;
    return faqs.filter((faq) => faq.category === activeFilter);
  }, [faqs, activeFilter]);

  const availableCategories = useMemo(() => {
    const cats = new Set<FAQEntry['category']>();
    faqs.forEach((faq) => cats.add(faq.category));
    return Array.from(cats);
  }, [faqs]);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Generate FAQPage schema markup
  const faqSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  }, [faqs]);

  return (
    <section
      className="py-12 border-t border-border"
      data-ai-semantic="faq-block"
      aria-label={`Frequently asked questions about ${productName}`}
    >
      {/* FAQPage Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="text-xl lg:text-2xl font-serif">Frequently Asked Questions</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Everything you need to know about the {productName}. Can&apos;t find your answer?{' '}
          <a
            href="https://wa.me/12153419990?text=Hi%20LuxeMia Boutique%2C%20I%20have%20a%20question%20about%20a%20product"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            Chat with our stylist
          </a>
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => { setActiveFilter('all'); setOpenIndex(0); }}
          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
            activeFilter === 'all'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-border hover:border-primary/50'
          }`}
        >
          All ({faqs.length})
        </button>
        {availableCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveFilter(cat); setOpenIndex(0); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors inline-flex items-center gap-1.5 ${
              activeFilter === cat
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary/50'
            }`}
          >
            {FAQ_ICONS[cat]}
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={`${faq.category}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="border border-border rounded-sm overflow-hidden"
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-secondary/30 transition-colors"
                aria-expanded={openIndex === index}
              >
                <span className="text-primary mt-0.5 flex-shrink-0">{faq.icon}</span>
                <span className="flex-1 text-sm font-medium text-foreground" itemProp="name">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 mt-0.5 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <div className="px-4 pb-4 pt-0 ml-7">
                      <p
                        className="text-sm text-muted-foreground leading-relaxed"
                        itemProp="text"
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Note */}
      <div className="mt-6 p-4 bg-secondary/30 border border-border rounded-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Quality Guaranteed:</strong> Every LuxeMia Boutique garment undergoes
            a thorough multi-point quality inspection before shipping. We check stitching, embroidery integrity,
            fabric quality, color accuracy, and measurements to ensure you receive exactly what you ordered.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProductFAQBlock;
