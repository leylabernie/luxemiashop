import type { ComboPageConfig } from '@/components/combo/ComboPage';

/**
 * 25 programmatic SEO combo pages targeting high-intent long-tail queries.
 *
 * Pattern 1: [color]-lehenga-for-[occasion] (10 pages)
 * Pattern 2: [silhouette]-for-[relationship] (8 pages)
 * Pattern 3: [fabric]-saree-for-[event] (7 pages)
 *
 * Each page has:
 *   - Unique SEO metadata (title, description, h1)
 *   - Product filter config (category + color/fabric/occasion/role/style filters)
 *   - Unique guide content (2-3 sections of ~200 words each)
 *   - 3-4 FAQs
 *   - 5-6 internal links to related blog posts and occasion pages
 *
 * Per SEO research 2026-07-15: Andaaz Fashion proves these programmatic
 * combo pages rank for "[color] lehenga for [occasion]" type queries.
 * With 613 products, LuxeMia has enough catalog depth to populate these
 * pages with real filtered results.
 */

export const comboPages: ComboPageConfig[] = [
  // ═══ PATTERN 1: Color × Lehenga × Occasion (10 pages) ═══

  {
    slug: 'maroon-lehenga-for-wedding-guest',
    title: 'Maroon Lehenga for Wedding Guest — Ready-to-Ship Styles | LuxeMia',
    metaDescription: 'Shop maroon lehengas for Indian wedding guests. Ready-to-ship styles from $200-$500 with free shipping to USA, Canada & Australia. Maroon is rich, photogenic and not bridal red — perfect for wedding guests.',
    h1: 'Maroon Lehenga for Wedding Guest',
    heroSubtitle: 'Maroon is the perfect wedding guest color — rich, photogenic, and distinct from bridal red. Shop ready-to-ship maroon lehengas from $200-500 with free shipping to USA, Canada & Australia on orders over $350.',
    breadcrumb: 'Maroon Lehenga for Wedding Guest',
    category: 'lehengas',
    filters: {
      colors: ['maroon', 'wine', 'burgundy'],
      occasions: ['wedding guest', 'wedding-guest', 'sangeet', 'reception'],
    },
    guideSections: [
      {
        heading: 'Why Maroon is the Perfect Wedding Guest Color',
        paragraphs: [
          'Maroon is the safest and most photogenic color choice for an Indian wedding guest. It is rich enough to look festive, dark enough to flatter every skin tone, and crucially — it is visually distinct from bridal red. Wearing all-red to an Indian wedding is considered a faux pas because red is the traditional bridal color, especially for North Indian Hindu weddings. Maroon, wine, and burgundy are all perfectly acceptable because they read as "deep jewel tone" rather than "bride."',
          'Maroon also photographs beautifully under both daylight and the warm tungsten lighting typical of sangeet and reception venues. Gold zari and mirror embellishments pop against the deep background, making maroon lehengas especially photogenic. If you are attending an Indian wedding for the first time and want a color that is guaranteed to look elegant and appropriate, maroon is our top recommendation.',
        ],
      },
      {
        heading: 'What to Look for in a Maroon Wedding Guest Lehenga',
        paragraphs: [
          'For a wedding guest lehenga, choose a silhouette that is dance-friendly — you will be on the dance floor at the sangeet and reception. A-line lehengas with 2-3 meters of flare are ideal; circular skirts with 4-6 meters of flare are too heavy for hours of dancing. Look for fabrics like georgette, velvet, or art silk that drape well and photograph richly. Avoid raw silk — it is stiff and unforgiving in photos.',
          'Embellishment should be concentrated at the hem and yoke, not all over. Heavy zardozi across the entire lehenga adds visual weight and gets uncomfortable after 4 hours. Mirror work, sequins, and zari at the borders give you the festive look without the bulk. Pair with a 3/4 sleeve choli (not a crop top) for wedding-guest appropriateness, and drape the dupatta over one shoulder — not both, which adds bulk.',
          'At LuxeMia, all our maroon wedding guest lehengas are available in Made to Measure at no extra cost. We custom-stitch to your exact measurements, with 5-7 business day dispatch and 7-10 day shipping to the USA, Canada, and Australia. Free shipping on orders over $350.',
        ],
      },
    ],
    faqs: [
      { question: 'Is maroon appropriate for an Indian wedding guest?', answer: 'Yes, maroon is one of the most appropriate wedding guest colors. It is rich and festive, and crucially distinct from bridal red. Avoid wearing all-red (the traditional bridal color), but maroon, wine, and burgundy are perfectly acceptable.' },
      { question: 'How much does a maroon wedding guest lehenga cost?', answer: 'Budget $200-$500 for a quality maroon wedding guest lehenga. Cheaper options ($80-$150) often use lower-quality fabrics that photograph poorly. More expensive options ($500+) are usually overkill for a guest — that territory is for bridal outfits.' },
      { question: 'When should I order my maroon lehenga?', answer: 'Order at least 4-6 weeks before the wedding date. Indian ethnic wear ships from India — even ready-to-ship items take 10-14 days door-to-door, and custom-stitched items take 3-4 weeks. At LuxeMia, ready-to-wear dispatches in 3-5 business days and Made to Measure in 5-7 business days.' },
    ],
    relatedLinks: [
      { label: 'What to Wear to an Indian Wedding as a Non-Indian Guest — Complete Guide', url: '/blog/what-to-wear-indian-wedding-non-indian-guest' },
      { label: 'Indian Wedding Dress Guide 2026', url: '/blog/indian-wedding-dress-complete-guide' },
      { label: 'Shop All Wedding Guest Outfits', url: '/collections/wedding-guest-outfits' },
      { label: 'Shop All Lehengas', url: '/lehengas' },
      { label: 'Indian to US Clothing Size Conversion Guide', url: '/blog/indian-to-us-clothing-size-conversion-guide' },
    ],
  },

  {
    slug: 'emerald-green-lehenga-for-wedding-guest',
    title: 'Emerald Green Lehenga for Wedding Guest — Shop Ready-to-Ship | LuxeMia',
    metaDescription: 'Shop emerald green lehengas for Indian wedding guests. Rich jewel tone, photogenic, and perfect for sangeet and reception. Ready-to-ship from $200-$500 with free shipping to USA, Canada & Australia.',
    h1: 'Emerald Green Lehenga for Wedding Guest',
    heroSubtitle: 'Emerald green is a striking wedding guest color — rich, photogenic, and pairs beautifully with gold jewelry. Shop ready-to-ship emerald green lehengas from $200-500 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Emerald Green Lehenga for Wedding Guest',
    category: 'lehengas',
    filters: {
      colors: ['green', 'emerald', 'forest green'],
      occasions: ['wedding guest', 'wedding-guest', 'sangeet', 'reception'],
    },
    guideSections: [
      {
        heading: 'Why Emerald Green Works for Wedding Guests',
        paragraphs: [
          'Emerald green is one of the most photogenic colors for an Indian wedding guest. It is a jewel tone that photographs richly under both daylight and warm evening lighting, and it pairs beautifully with gold jewelry — the traditional Indian wedding accessory. Unlike red (which is reserved for the bride), green is completely safe for guests and reads as festive without crossing into bridal territory.',
          'Green also has cultural significance in Indian weddings — it is associated with fertility, growth, and new beginnings, making it an auspicious color to wear to a celebration of marriage. In South Indian weddings, green is particularly traditional; in North Indian weddings, it is a modern favorite. An emerald green lehenga with gold zari work is a timeless choice that you can re-wear to multiple weddings.',
        ],
      },
      {
        heading: 'Styling Your Emerald Green Wedding Guest Lehenga',
        paragraphs: [
          'Pair emerald green with gold jewelry — kundan necklaces, gold jhumka earrings, and gold bangles. The warm gold tones complement the cool green beautifully. For a dupatta, choose a contrasting color like maroon, pink, or gold to add visual interest. Drape the dupatta over one shoulder (not both) to avoid adding bulk.',
          'For footwear, choose gold or emerald embellished flats — you will be dancing for hours. Avoid heels. For makeup, gold eyeshadow and a nude lip complement the green without competing. A small green or gold bindi completes the look. Budget $40-$120 for jewelry and $30-$80 for footwear.',
          'At LuxeMia, our emerald green lehengas are available in Made to Measure at no extra cost. Order at least 4-6 weeks before the wedding for custom stitching. Free shipping on orders over $350 to the USA, Canada, and Australia.',
        ],
      },
    ],
    faqs: [
      { question: 'Is emerald green appropriate for an Indian wedding guest?', answer: 'Yes, emerald green is an excellent wedding guest color. It is rich, photogenic, and pairs beautifully with gold jewelry. Unlike red, green is not reserved for the bride and is completely safe for guests.' },
      { question: 'What jewelry goes with an emerald green lehenga?', answer: 'Gold jewelry is the classic pairing — kundan necklaces, gold jhumka earrings, and gold bangles. The warm gold tones complement the cool green beautifully. Avoid silver jewelry with emerald green; it clashes.' },
      { question: 'How much does an emerald green wedding guest lehenga cost?', answer: 'Budget $200-$500 for a quality emerald green wedding guest lehenga. The sweet spot for a beautiful, photogenic outfit you can re-wear is $250-$400.' },
    ],
    relatedLinks: [
      { label: 'What to Wear to an Indian Wedding as a Non-Indian Guest', url: '/blog/what-to-wear-indian-wedding-non-indian-guest' },
      { label: 'Indian Wedding Dress Guide 2026', url: '/blog/indian-wedding-dress-complete-guide' },
      { label: 'Shop All Wedding Guest Outfits', url: '/collections/wedding-guest-outfits' },
      { label: 'Shop All Lehengas', url: '/lehengas' },
    ],
  },

  {
    slug: 'royal-blue-lehenga-for-wedding-guest',
    title: 'Royal Blue Lehenga for Wedding Guest — Ready-to-Ship Styles | LuxeMia',
    metaDescription: 'Shop royal blue lehengas for Indian wedding guests. Striking jewel tone, photogenic, and perfect for sangeet and reception. Ready-to-ship from $200-$500 with free shipping to USA, Canada & Australia.',
    h1: 'Royal Blue Lehenga for Wedding Guest',
    heroSubtitle: 'Royal blue is a striking wedding guest color — bold, photogenic, and stands out in a sea of reds and pinks. Shop ready-to-ship royal blue lehengas from $200-500 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Royal Blue Lehenga for Wedding Guest',
    category: 'lehengas',
    filters: {
      colors: ['blue', 'royal blue', 'navy', 'sapphire'],
      occasions: ['wedding guest', 'wedding-guest', 'sangeet', 'reception'],
    },
    guideSections: [
      {
        heading: 'Why Royal Blue is a Wedding Guest Standout',
        paragraphs: [
          'Royal blue is one of the boldest and most photogenic colors for an Indian wedding guest. It stands out in a sea of reds, pinks, and maroons, making it a memorable choice for sangeet and reception events. Royal blue also flatters every skin tone — from fair to deep — and pairs beautifully with both silver and gold jewelry.',
          'For Indian diaspora weddings in the USA, Canada, and Australia, royal blue has become increasingly popular as a modern alternative to traditional reds and maroons. It photographs beautifully under the warm lighting of evening events and looks striking against gold or silver embellishments. If you want to make a statement without crossing into bridal territory, royal blue is an excellent choice.',
        ],
      },
      {
        heading: 'Styling Your Royal Blue Wedding Guest Lehenga',
        paragraphs: [
          'Royal blue pairs with both gold and silver jewelry. Gold gives a traditional, warm look; silver gives a modern, cool look. For a sangeet, choose silver mirror work and silver jewelry for a fresh, modern aesthetic. For a reception, gold zari and kundan jewelry gives a richer, more traditional look.',
          'For a dupatta, choose a contrasting color like yellow, orange, or pink to add visual interest. Royal blue with a yellow or orange dupatta is a classic Indian color combination. Drape over one shoulder. For footwear, choose silver or gold embellished flats. Avoid black footwear with royal blue.',
          'At LuxeMia, our royal blue lehengas are available with Made to Measure at no extra cost. Order 4-6 weeks before the wedding for custom stitching. Free shipping on orders over $350.',
        ],
      },
    ],
    faqs: [
      { question: 'Is royal blue appropriate for an Indian wedding?', answer: 'Yes, royal blue is an excellent wedding guest color. It is bold, photogenic, and completely appropriate — not reserved for the bride. It is especially popular for sangeet and reception events.' },
      { question: 'What jewelry goes with a royal blue lehenga?', answer: 'Both gold and silver work with royal blue. Gold gives a traditional, warm look; silver gives a modern, cool look. For sangeet, silver is fresher; for reception, gold is richer.' },
      { question: 'What color dupatta goes with a royal blue lehenga?', answer: 'Contrasting colors work best — yellow, orange, or pink create a vibrant Indian color combination. Avoid matching the dupatta to the lehenga exactly; the contrast is what makes the look interesting.' },
    ],
    relatedLinks: [
      { label: 'What to Wear to an Indian Wedding as a Non-Indian Guest', url: '/blog/what-to-wear-indian-wedding-non-indian-guest' },
      { label: 'Shop All Wedding Guest Outfits', url: '/collections/wedding-guest-outfits' },
      { label: 'Shop All Lehengas', url: '/lehengas' },
      { label: 'Indian Wedding Dress Guide 2026', url: '/blog/indian-wedding-dress-complete-guide' },
    ],
  },

  {
    slug: 'pink-lehenga-for-wedding-guest',
    title: 'Pink Lehenga for Wedding Guest — From Blush to Fuchsia | LuxeMia',
    metaDescription: 'Shop pink lehengas for Indian wedding guests. From soft blush pink to bold fuchsia, ready-to-ship from $180-$450. Free shipping to USA, Canada & Australia on orders over $350.',
    h1: 'Pink Lehenga for Wedding Guest',
    heroSubtitle: 'Pink is the most versatile wedding guest color — from soft blush to bold fuchsia. Shop ready-to-ship pink lehengas from $180-450 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Pink Lehenga for Wedding Guest',
    category: 'lehengas',
    filters: {
      colors: ['pink', 'fuchsia', 'magenta', 'blush', 'rose'],
      occasions: ['wedding guest', 'wedding-guest', 'sangeet', 'reception'],
    },
    guideSections: [
      {
        heading: 'Pink for Wedding Guests — From Blush to Fuchsia',
        paragraphs: [
          'Pink is the most versatile color for an Indian wedding guest. The spectrum runs from soft blush pink (subtle, romantic, daytime-appropriate) to bold fuchsia and magenta (vibrant, photogenic, perfect for sangeet and reception). Pink is also culturally appropriate — it symbolizes joy, femininity, and celebration in Indian culture, and it is not reserved for the bride (unlike red).',
          'For a daytime mehendi or haldi event, choose blush pink or dusty rose — soft, romantic, and photogenic in natural light. For an evening sangeet or reception, choose fuchsia or magenta — bold, vibrant, and photogenic under warm lighting. Rani pink (hot magenta) is the most popular shade for wedding guests because it pops in photos and flatters every skin tone.',
        ],
      },
      {
        heading: 'Styling Your Pink Wedding Guest Lehenga',
        paragraphs: [
          'Pink pairs beautifully with gold jewelry — the warm gold tones complement the cool pink. For blush pink, choose delicate gold jewelry (thin necklaces, small jhumkas). For fuchsia or magenta, choose bolder gold jewelry (statement kundan necklaces, large jhumkas). Silver jewelry also works with pink, especially for a modern look.',
          'For a dupatta, choose a contrasting color — green, gold, or orange create beautiful color combinations with pink. Avoid matching the dupatta to the lehenga. Drape over one shoulder. For footwear, gold or nude embellished flats work best. Avoid black or dark footwear with pink.',
          'At LuxeMia, our pink lehengas are available in Made to Measure at no extra cost. We ship to the USA, Canada, and Australia with free shipping on orders over $350. Order 4-6 weeks before the wedding for custom stitching.',
        ],
      },
    ],
    faqs: [
      { question: 'Is pink appropriate for an Indian wedding guest?', answer: 'Yes, pink is one of the most popular and appropriate wedding guest colors. From blush to fuchsia, pink symbolizes joy and celebration. Rani pink (hot magenta) is especially popular for sangeet and reception.' },
      { question: 'Can I wear pink to an Indian wedding if the bride is wearing pink?', answer: 'If the bride has announced she is wearing pink (some modern brides choose pastel pink instead of red), choose a different color. Otherwise, pink is completely safe for guests. When in doubt, ask the bride or her family.' },
      { question: 'What shade of pink is best for an Indian wedding guest?', answer: 'For daytime events (mehendi, haldi), choose blush pink or dusty rose. For evening events (sangeet, reception), choose fuchsia or rani pink (hot magenta). The bolder the better for evening — pink photographs best when it is saturated.' },
    ],
    relatedLinks: [
      { label: 'What to Wear to an Indian Wedding as a Non-Indian Guest', url: '/blog/what-to-wear-indian-wedding-non-indian-guest' },
      { label: 'Shop All Wedding Guest Outfits', url: '/collections/wedding-guest-outfits' },
      { label: 'Shop All Lehengas', url: '/lehengas' },
      { label: 'Mehendi Outfit Ideas by Role', url: '/blog/mehendi-outfit-by-role' },
    ],
  },

  {
    slug: 'purple-lehenga-for-wedding-guest',
    title: 'Purple Lehenga for Wedding Guest — Royal & Photogenic | LuxeMia',
    metaDescription: 'Shop purple lehengas for Indian wedding guests. From deep eggplant to soft lavender, ready-to-ship from $200-$500. Free shipping to USA, Canada & Australia on orders over $350.',
    h1: 'Purple Lehenga for Wedding Guest',
    heroSubtitle: 'Purple is a royal, photogenic wedding guest color — from deep eggplant to soft lavender. Shop ready-to-ship purple lehengas from $200-500 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Purple Lehenga for Wedding Guest',
    category: 'lehengas',
    filters: {
      colors: ['purple', 'lavender', 'lilac', 'plum', 'violet'],
      occasions: ['wedding guest', 'wedding-guest', 'sangeet', 'reception'],
    },
    guideSections: [
      {
        heading: 'Why Purple is a Royal Wedding Guest Choice',
        paragraphs: [
          'Purple has long been associated with royalty in Indian culture — historically, purple dye was rare and expensive, making it a color reserved for royalty and the elite. Today, purple remains a sophisticated, regal choice for an Indian wedding guest. It photographs beautifully, flatters most skin tones, and stands out from the more common reds, pinks, and maroons.',
          'Deep eggplant purple is the most photogenic shade for evening events — it reads as rich and jewel-toned under warm lighting. Lavender and lilac are softer, more modern choices for daytime events. Purple also pairs beautifully with gold jewelry, which complements the cool tone of the purple.',
        ],
      },
      {
        heading: 'Styling Your Purple Wedding Guest Lehenga',
        paragraphs: [
          'Purple pairs best with gold jewelry — kundan necklaces, gold jhumkas, and gold bangles. The warm gold tones complement the cool purple beautifully. Silver jewelry also works, especially with lavender or lilac. Avoid mixing gold and silver; choose one metal and stick with it.',
          'For a dupatta, choose gold or a contrasting color like pink, yellow, or green. Deep purple with a gold dupatta is a classic regal look. Drape over one shoulder. For footwear, gold or purple embellished flats work best. For makeup, purple or plum eyeshadow complements the lehenga without competing.',
          'At LuxeMia, our purple lehengas are available in Made to Measure at no extra cost. We ship to the USA, Canada, and Australia with free shipping on orders over $350. Order 4-6 weeks before the wedding.',
        ],
      },
    ],
    faqs: [
      { question: 'Is purple appropriate for an Indian wedding guest?', answer: 'Yes, purple is an excellent wedding guest color. It is royal, photogenic, and completely appropriate. Deep eggplant purple is best for evening events; lavender and lilac work for daytime.' },
      { question: 'What jewelry goes with a purple lehenga?', answer: 'Gold jewelry is the classic pairing — kundan necklaces, gold jhumkas, and gold bangles. The warm gold tones complement the cool purple. Silver also works, especially with lavender or lilac.' },
      { question: 'Is purple too bold for an Indian wedding?', answer: 'No, purple is a sophisticated, regal choice. Deep eggplant purple is one of the most photogenic colors for evening events. It is bold without being inappropriate — it reads as elegant rather than attention-seeking.' },
    ],
    relatedLinks: [
      { label: 'What to Wear to an Indian Wedding as a Non-Indian Guest', url: '/blog/what-to-wear-indian-wedding-non-indian-guest' },
      { label: 'Shop All Wedding Guest Outfits', url: '/collections/wedding-guest-outfits' },
      { label: 'Shop All Lehengas', url: '/lehengas' },
      { label: 'Indian Wedding Dress Guide 2026', url: '/blog/indian-wedding-dress-complete-guide' },
    ],
  },

  {
    slug: 'wine-lehenga-for-wedding-guest',
    title: 'Wine Lehenga for Wedding Guest — Sophisticated & Safe | LuxeMia',
    metaDescription: 'Shop wine lehengas for Indian wedding guests. Deep, sophisticated, and distinct from bridal red. Ready-to-ship from $200-$500 with free shipping to USA, Canada & Australia.',
    h1: 'Wine Lehenga for Wedding Guest',
    heroSubtitle: 'Wine is a sophisticated wedding guest color — deep, elegant, and safely distinct from bridal red. Shop ready-to-ship wine lehengas from $200-500 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Wine Lehenga for Wedding Guest',
    category: 'lehengas',
    filters: {
      colors: ['wine', 'burgundy', 'maroon', 'plum'],
      occasions: ['wedding guest', 'wedding-guest', 'sangeet', 'reception'],
    },
    guideSections: [
      {
        heading: 'Why Wine is a Sophisticated Wedding Guest Choice',
        paragraphs: [
          'Wine (a deep red-purple) is one of the most sophisticated color choices for an Indian wedding guest. It is darker and more nuanced than maroon, with a richness that photographs beautifully under evening lighting. Like maroon and burgundy, wine is safely distinct from bridal red — it reads as "deep jewel tone" rather than "bride."',
          'Wine is also a versatile color that flatters most skin tones. It is particularly striking on medium to deep skin tones, where the richness of the color complements the warmth of the skin. For fair skin tones, wine provides a beautiful contrast that photographs elegantly. Wine is also a color that works across all seasons — it is rich enough for winter weddings and deep enough for summer evening events.',
        ],
      },
      {
        heading: 'Styling Your Wine Wedding Guest Lehenga',
        paragraphs: [
          'Wine pairs beautifully with gold jewelry — the warm gold tones bring out the richness of the wine color. Kundan necklaces, gold jhumkas, and gold bangles are all excellent choices. For a modern look, rose gold jewelry also complements wine beautifully. Avoid silver jewelry with wine; it clashes.',
          'For a dupatta, choose gold or a contrasting color like pink, peach, or ivory. Wine with a gold dupatta is a classic, regal look. Drape over one shoulder. For footwear, gold or wine embellished flats. For makeup, a wine or berry lip complements the lehenga beautifully.',
          'At LuxeMia, our wine lehengas are available in Made to Measure at no extra cost. We ship to the USA, Canada, and Australia with free shipping on orders over $350. Order 4-6 weeks before the wedding for custom stitching.',
        ],
      },
    ],
    faqs: [
      { question: 'Is wine appropriate for an Indian wedding guest?', answer: 'Yes, wine is an excellent wedding guest color. It is sophisticated, photogenic, and safely distinct from bridal red. Wine is darker and more nuanced than maroon, with a richness that photographs beautifully.' },
      { question: 'What is the difference between wine and maroon?', answer: 'Wine has more purple undertones, while maroon has more brown undertones. Both are deep, dark reds that are appropriate for wedding guests. Wine is slightly more sophisticated and modern; maroon is slightly more traditional.' },
      { question: 'What jewelry goes with a wine lehenga?', answer: 'Gold jewelry is the classic pairing — kundan necklaces, gold jhumkas, and gold bangles. Rose gold also complements wine beautifully. Avoid silver jewelry with wine; it clashes.' },
    ],
    relatedLinks: [
      { label: 'What to Wear to an Indian Wedding as a Non-Indian Guest', url: '/blog/what-to-wear-indian-wedding-non-indian-guest' },
      { label: 'Shop All Wedding Guest Outfits', url: '/collections/wedding-guest-outfits' },
      { label: 'Shop All Lehengas', url: '/lehengas' },
      { label: 'Indian Wedding Dress Guide 2026', url: '/blog/indian-wedding-dress-complete-guide' },
    ],
  },

  {
    slug: 'navy-blue-lehenga-for-wedding-guest',
    title: 'Navy Blue Lehenga for Wedding Guest — Elegant & Modern | LuxeMia',
    metaDescription: 'Shop navy blue lehengas for Indian wedding guests. Deep, elegant, and modern. Ready-to-ship from $200-$500 with free shipping to USA, Canada & Australia on orders over $350.',
    h1: 'Navy Blue Lehenga for Wedding Guest',
    heroSubtitle: 'Navy blue is an elegant, modern wedding guest color — deep, sophisticated, and photogenic. Shop ready-to-ship navy blue lehengas from $200-500 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Navy Blue Lehenga for Wedding Guest',
    category: 'lehengas',
    filters: {
      colors: ['navy', 'navy blue', 'blue', 'sapphire'],
      occasions: ['wedding guest', 'wedding-guest', 'sangeet', 'reception'],
    },
    guideSections: [
      {
        heading: 'Why Navy Blue is an Elegant Wedding Guest Choice',
        paragraphs: [
          'Navy blue is the most elegant and modern of the blue family for an Indian wedding guest. Deeper and more sophisticated than royal blue, navy photographs beautifully under evening lighting and pairs with both gold and silver jewelry. It is a versatile color that works for all seasons and all wedding events.',
          'Navy blue also has the advantage of being unusual — most wedding guests choose reds, pinks, maroons, or greens. A navy blue lehenga stands out in a crowd without being flashy. It reads as confident and sophisticated, especially when paired with silver or white gold jewelry. For a winter wedding (November-February), navy blue is particularly appropriate — it complements the cool weather palette.',
        ],
      },
      {
        heading: 'Styling Your Navy Blue Wedding Guest Lehenga',
        paragraphs: [
          'Navy blue pairs with both gold and silver jewelry. Silver or white gold gives a modern, cool look that complements the navy beautifully. Gold gives a warmer, more traditional look. For a winter wedding, silver is the more seasonal choice. For a summer wedding, gold adds warmth.',
          'For a dupatta, choose silver, white, or a contrasting color like pink, peach, or ivory. Navy with a silver or white dupatta is a classic, elegant look. Drape over one shoulder. For footwear, silver or navy embellished flats. For makeup, silver or champagne eyeshadow complements the navy.',
          'At LuxeMia, our navy blue lehengas are available in Made to Measure at no extra cost. We ship to the USA, Canada, and Australia with free shipping on orders over $350. Order 4-6 weeks before the wedding.',
        ],
      },
    ],
    faqs: [
      { question: 'Is navy blue appropriate for an Indian wedding?', answer: 'Yes, navy blue is an elegant and modern wedding guest color. It is deeper and more sophisticated than royal blue, and it pairs beautifully with both gold and silver jewelry. It is especially appropriate for winter weddings.' },
      { question: 'Is navy blue too dark for an Indian wedding?', answer: 'No, navy blue is deep but not inappropriately dark. Unlike black (which is considered inauspicious), navy blue is a rich, jewel-toned color that is completely acceptable. It photographs beautifully under evening lighting.' },
      { question: 'What jewelry goes with a navy blue lehenga?', answer: 'Both gold and silver work with navy blue. Silver or white gold gives a modern, cool look. Gold gives a warmer, more traditional look. For winter weddings, silver is more seasonal; for summer, gold adds warmth.' },
    ],
    relatedLinks: [
      { label: 'What to Wear to an Indian Wedding as a Non-Indian Guest', url: '/blog/what-to-wear-indian-wedding-non-indian-guest' },
      { label: 'Shop All Wedding Guest Outfits', url: '/collections/wedding-guest-outfits' },
      { label: 'Shop All Lehengas', url: '/lehengas' },
      { label: 'Indian Wedding Dress Guide 2026', url: '/blog/indian-wedding-dress-complete-guide' },
    ],
  },

  {
    slug: 'maroon-lehenga-for-reception',
    title: 'Maroon Lehenga for Reception — Elegant & Photogenic | LuxeMia',
    metaDescription: 'Shop maroon lehengas for Indian wedding receptions. Rich, photogenic, and perfect for evening events. Ready-to-ship from $200-$500 with free shipping to USA, Canada & Australia.',
    h1: 'Maroon Lehenga for Reception',
    heroSubtitle: 'Maroon is an elegant choice for a wedding reception — rich, photogenic, and perfect for evening events. Shop ready-to-ship maroon lehengas from $200-500 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Maroon Lehenga for Reception',
    category: 'lehengas',
    filters: {
      colors: ['maroon', 'wine', 'burgundy'],
      occasions: ['reception', 'party', 'evening'],
    },
    guideSections: [
      {
        heading: 'Why Maroon is Perfect for a Wedding Reception',
        paragraphs: [
          'The reception is the most flexible Indian wedding event in terms of dress code — it is an evening cocktail-style party, and the dress code is "festive formal." Maroon is an ideal reception color because it is rich enough for an evening event, photogenic under reception lighting, and elegant without being overly bridal.',
          'For a reception, you can go more glamorous than for the wedding ceremony itself. Heavier embellishment, richer fabrics like velvet, and statement jewelry all work for a reception. A maroon velvet lehenga with gold zari is a timeless reception choice that photographs beautifully. Pair with a statement kundan necklace and gold jhumkas.',
        ],
      },
      {
        heading: 'Reception Lehenga vs Wedding Ceremony Lehenga',
        paragraphs: [
          'The key difference between a reception lehenga and a wedding ceremony lehenga is formality. The wedding ceremony is the most formal event — silk sarees, heavily embroidered lehengas, traditional jewelry. The reception is slightly less formal but more glamorous — you can be more fashion-forward, more experimental, more modern.',
          'For a maroon reception lehenga, choose a contemporary silhouette — an A-line skirt with a stylish choli (boat neck, off-shoulder, or 3/4 sleeve), or an indo-western fusion look. Velvet, georgette, and raw silk all work for reception. Avoid the heaviest bridal zardozi — it looks overdressed for a reception. Mirror work, sequins, and zari are all appropriate.',
          'At LuxeMia, our maroon reception lehengas are available in Made to Measure at no extra cost. Order 4-6 weeks before the wedding. Free shipping on orders over $350 to the USA, Canada, and Australia.',
        ],
      },
    ],
    faqs: [
      { question: 'Can I wear maroon to a wedding reception?', answer: 'Yes, maroon is an excellent reception color. It is rich enough for an evening event, photogenic under reception lighting, and elegant. For a reception, you can go more glamorous than for the wedding ceremony itself.' },
      { question: 'What is the difference between a reception lehenga and a wedding ceremony lehenga?', answer: 'The reception is slightly less formal but more glamorous. You can be more fashion-forward and experimental. Contemporary silhouettes, modern choli styles, and indo-western fusion all work for a reception. The ceremony calls for more traditional, formal attire.' },
      { question: 'What fabric is best for a maroon reception lehenga?', answer: 'Velvet is perfect for cool-weather receptions (Nov-Feb) — it photographs richly under evening lighting. Georgette and raw silk work for all seasons. Avoid the heaviest bridal zardozi embroidery; it looks overdressed for a reception.' },
    ],
    relatedLinks: [
      { label: 'What to Wear to an Indian Wedding as a Non-Indian Guest', url: '/blog/what-to-wear-indian-wedding-non-indian-guest' },
      { label: 'Shop All Wedding Guest Outfits', url: '/collections/wedding-guest-outfits' },
      { label: 'Shop All Lehengas', url: '/lehengas' },
      { label: 'Indian Wedding Dress Guide 2026', url: '/blog/indian-wedding-dress-complete-guide' },
    ],
  },

  {
    slug: 'black-lehenga-for-wedding-guest',
    title: 'Black Lehenga for Wedding Guest — Bold & Modern | LuxeMia',
    metaDescription: 'Shop black lehengas for Indian wedding guests. Bold, modern, and photogenic. Check invitation first — some weddings welcome black, others consider it inauspicious. Ready-to-ship from $250-500.',
    h1: 'Black Lehenga for Wedding Guest',
    heroSubtitle: 'Black is a bold, modern wedding guest choice — but check the invitation first. Some modern weddings welcome black; traditional weddings consider it inauspicious. Shop ready-to-ship black lehengas from $250-500.',
    breadcrumb: 'Black Lehenga for Wedding Guest',
    category: 'lehengas',
    filters: {
      colors: ['black'],
      occasions: ['wedding guest', 'wedding-guest', 'reception', 'cocktail'],
    },
    guideSections: [
      {
        heading: 'Is Black Appropriate for an Indian Wedding?',
        paragraphs: [
          'Black is the most controversial color for an Indian wedding guest. Traditionally, black is considered inauspicious in Hindu culture — it is associated with mourning and negative energy. For traditional Hindu weddings, especially religious ceremonies, black should be avoided. However, modern Indian weddings — especially cocktail nights, sangeet, and reception events — increasingly welcome black as a chic, modern color choice.',
          'The rule of thumb: if the wedding invitation specifies a "black tie" or "cocktail" dress code, black is welcome. If the wedding is a traditional religious ceremony, avoid black. When in doubt, ask the bride or groom family. If you cannot ask, choose a different color — there are plenty of elegant alternatives like navy, maroon, wine, or deep purple that give a similar sophisticated look without the cultural issue.',
        ],
      },
      {
        heading: 'How to Style a Black Lehenga (If the Wedding Welcomes It)',
        paragraphs: [
          'If you have confirmed that black is welcome, a black lehenga can be a stunning, modern choice. Pair with heavy gold or kundan jewelry — the warm metals pop beautifully against the black. Gold zari embroidery on black is the classic Indian "cocktail sari" look, elegant and photogenic. Avoid silver jewelry with black; it can look stark.',
          'For a dupatta, choose gold, ivory, or a bright contrasting color like fuchsia or emerald green. Black with a gold dupatta is a timeless, regal look. Drape over one shoulder. For footwear, gold or black embellished flats. For makeup, a bold red or berry lip complements the black beautifully. Avoid all-black everything — the contrasting dupatta and jewelry are what make the look work.',
          'At LuxeMia, our black lehengas feature heavy gold zari and sequin work that makes them appropriate for cocktail-style wedding events. Available in Made to Measure at no extra cost. Free shipping on orders over $350 to the USA, Canada, and Australia.',
        ],
      },
    ],
    faqs: [
      { question: 'Can I wear black to an Indian wedding?', answer: 'It depends. For traditional Hindu wedding ceremonies, avoid black — it is considered inauspicious. For modern cocktail nights, sangeet, or reception events with a "black tie" dress code, black is welcome. When in doubt, ask the bride or groom family, or choose a different color.' },
      { question: 'What jewelry goes with a black lehenga?', answer: 'Gold or kundan jewelry is the classic pairing — the warm metals pop beautifully against the black. Gold zari embroidery on black is the classic Indian cocktail look. Avoid silver jewelry with black; it can look stark.' },
      { question: 'Is a black lehenga too bold for a wedding guest?', answer: 'For a cocktail or reception event that welcomes black, a black lehenga with heavy gold embellishment is a stunning, modern choice. It is bold but not inappropriate — as long as the invitation welcomes black. For a traditional ceremony, choose a different color.' },
    ],
    relatedLinks: [
      { label: 'What to Wear to an Indian Wedding as a Non-Indian Guest', url: '/blog/what-to-wear-indian-wedding-non-indian-guest' },
      { label: 'Shop All Wedding Guest Outfits', url: '/collections/wedding-guest-outfits' },
      { label: 'Shop All Lehengas', url: '/lehengas' },
      { label: 'Indian Wedding Dress Guide 2026', url: '/blog/indian-wedding-dress-complete-guide' },
    ],
  },

  {
    slug: 'pastel-lehenga-for-wedding-guest',
    title: 'Pastel Lehenga for Wedding Guest — Soft & Modern | LuxeMia',
    metaDescription: 'Shop pastel lehengas for Indian wedding guests. Soft blush, mint, lavender, and peach — modern, romantic, and photogenic. Ready-to-ship from $180-450 with free shipping to USA, Canada & Australia.',
    h1: 'Pastel Lehenga for Wedding Guest',
    heroSubtitle: 'Pastels are a modern, romantic wedding guest choice — soft blush, mint, lavender, and peach. Shop ready-to-ship pastel lehengas from $180-450 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Pastel Lehenga for Wedding Guest',
    category: 'lehengas',
    filters: {
      colors: ['pastel', 'blush', 'mint', 'peach', 'lavender', 'ivory', 'soft pink', 'pale'],
      occasions: ['wedding guest', 'wedding-guest', 'daytime', 'sangeet'],
    },
    guideSections: [
      {
        heading: 'Why Pastels are a Modern Wedding Guest Choice',
        paragraphs: [
          'Pastel lehengas have become increasingly popular for Indian wedding guests, especially for daytime events like mehendi and haldi, and for modern, fashion-forward weddings. Soft blush pink, mint green, lavender, peach, and ivory are all popular pastel choices. Pastels photograph beautifully in natural daylight and give a soft, romantic, modern look.',
          'Pastels are especially appropriate for spring and summer weddings (March-September), when the lighter colors complement the season. They are also a good choice for destination weddings and beach weddings, where the soft colors complement the natural surroundings. For evening events, pastels can look washed out under warm lighting — choose jewel tones instead.',
        ],
      },
      {
        heading: 'Styling Your Pastel Wedding Guest Lehenga',
        paragraphs: [
          'Pastels pair beautifully with delicate gold jewelry — thin necklaces, small jhumkas, and fine bangles. Avoid heavy, chunky jewelry; it overwhelms the soft pastel. For a dupatta, choose a slightly darker shade of the same color or a contrasting pastel. Drape over one shoulder.',
          'For footwear, gold or nude embellished flats. For makeup, keep it soft and natural — nude lips, soft pink blush, and subtle gold eyeshadow. Avoid bold lip colors; they compete with the pastel. A small floral maang tikka or fresh flower in the hair complements the romantic pastel look.',
          'At LuxeMia, our pastel lehengas are available in Made to Measure at no extra cost. We ship to the USA, Canada, and Australia with free shipping on orders over $350. Order 4-6 weeks before the wedding. Pastels are especially popular for spring and summer weddings — order early as they sell out by March.',
        ],
      },
    ],
    faqs: [
      { question: 'Are pastels appropriate for an Indian wedding?', answer: 'Yes, pastels are a modern, romantic wedding guest choice. They are especially appropriate for daytime events (mehendi, haldi) and spring/summer weddings. For evening events, choose jewel tones instead — pastels can look washed out under warm lighting.' },
      { question: 'What jewelry goes with a pastel lehenga?', answer: 'Delicate gold jewelry — thin necklaces, small jhumkas, fine bangles. Avoid heavy, chunky jewelry; it overwhelms the soft pastel. A small floral maang tikka or fresh flower in the hair complements the romantic look.' },
      { question: 'What pastel colors work for Indian weddings?', answer: 'Soft blush pink, mint green, lavender, peach, and ivory are all popular. For daytime events, all pastels work. For spring/summer weddings, pastels complement the season. Avoid pastels for evening events — they can look washed out.' },
    ],
    relatedLinks: [
      { label: 'What to Wear to an Indian Wedding as a Non-Indian Guest', url: '/blog/what-to-wear-indian-wedding-non-indian-guest' },
      { label: 'Mehendi Outfit Ideas by Role', url: '/blog/mehendi-outfit-by-role' },
      { label: 'Shop All Wedding Guest Outfits', url: '/collections/wedding-guest-outfits' },
      { label: 'Shop All Lehengas', url: '/lehengas' },
    ],
  },

  // ═══ PATTERN 2: Silhouette × Relationship (8 pages) ═══

  {
    slug: 'anarkali-suit-for-mother-of-bride',
    title: 'Anarkali Suit for Mother of Bride — Elegant & Comfortable | LuxeMia',
    metaDescription: 'Shop anarkali suits for the mother of the bride. Elegant, traditional, and comfortable for long wedding events. Ready-to-ship from $200-500 with free shipping to USA, Canada & Australia.',
    h1: 'Anarkali Suit for Mother of Bride',
    heroSubtitle: 'The mother of the bride needs an outfit that is elegant, traditional, and comfortable for long wedding events. Shop anarkali suits from $200-500 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Anarkali Suit for Mother of Bride',
    category: 'suits',
    filters: {
      styles: ['anarkali'],
      titleKeywords: ['anarkali'],
    },
    guideSections: [
      {
        heading: 'Why Anarkali Suits are Perfect for the Mother of the Bride',
        paragraphs: [
          'The mother of the bride has a special role at an Indian wedding — she is hosting, receiving guests, and in photos throughout the multi-day celebration. Her outfit needs to be elegant, traditional, and comfortable enough for 6-8 hour events. The anarkali suit is the perfect choice: it is graceful, flattering for all body types, and comfortable for long events.',
          'An anarkali suit has a fitted bodice that flows into a long, flared skirt — it is essentially a floor-length A-line dress over churidar pants. This silhouette is forgiving for all body types (especially flattering for plus-size women and older women), easy to wear (no draping like a saree), and traditionally elegant. For the mother of the bride, a silk or heavily embroidered anarkali in a rich color (maroon, deep green, royal blue, wine) is the ideal choice.',
        ],
      },
      {
        heading: 'Styling the Mother of the Bride Anarkali',
        paragraphs: [
          'For the mother of the bride, choose rich, sophisticated colors — maroon, deep green, royal blue, wine, or deep purple. Avoid pastels (too youthful) and avoid black (inauspicious). Heavy zari embroidery, kundan work, or sequin embellishment is appropriate — the mother of the bride should look regal and elegant.',
          'Pair with statement gold jewelry — a kundan necklace set, gold jhumka earrings, and gold bangles. A maang tikka (forehead ornament) is traditional for the mother of the bride. For footwear, comfortable embellished flats — you will be standing for hours. For the dupatta, drape over one shoulder or pin across the chest for modesty.',
          'At LuxeMia, we offer Made to Measure on every anarkali at no extra cost — essential for the mother of the bride, who needs a perfect fit. We custom-stitch to your exact measurements with 5-7 business day dispatch and 7-10 day shipping to the USA, Canada, and Australia. Free shipping on orders over $350.',
        ],
      },
    ],
    faqs: [
      { question: 'What should the mother of the bride wear to an Indian wedding?', answer: 'An anarkali suit, silk saree, or heavily embroidered salwar kameez in a rich color (maroon, deep green, royal blue, wine). The outfit should be elegant, traditional, and comfortable for 6-8 hour events. Heavy zari or kundan embellishment is appropriate.' },
      { question: 'What color should the mother of the bride wear?', answer: 'Rich, sophisticated colors — maroon, deep green, royal blue, wine, or deep purple. Avoid pastels (too youthful) and black (inauspicious). The mother of the bride should look regal and elegant.' },
      { question: 'How much does a mother of the bride anarkali cost?', answer: 'Budget $200-$500 for a quality mother of the bride anarkali. Heavily embroidered silk anarkalis with zari or kundan work are at the higher end. At LuxeMia, Made to Measure is included at no extra cost.' },
    ],
    relatedLinks: [
      { label: 'Indian Wedding Dress Guide 2026', url: '/blog/indian-wedding-dress-complete-guide' },
      { label: 'Plus Size Indian Ethnic Wear Guide', url: '/blog/plus-size-indian-ethnic-wear-guide' },
      { label: 'Shop All Anarkali Suits', url: '/suits' },
      { label: 'Indian to US Clothing Size Conversion Guide', url: '/blog/indian-to-us-clothing-size-conversion-guide' },
    ],
  },

  {
    slug: 'lehenga-for-bridesmaid',
    title: 'Lehenga for Bridesmaid — Coordinated & Photogenic | LuxeMia',
    metaDescription: 'Shop lehengas for bridesmaids. Coordinated, photogenic, and dance-friendly for sangeet and reception. Ready-to-ship from $180-450 with free shipping to USA, Canada & Australia.',
    h1: 'Lehenga for Bridesmaid',
    heroSubtitle: 'Bridesmaid lehengas need to be coordinated, photogenic, and dance-friendly. Shop ready-to-ship bridesmaid lehengas from $180-450 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Lehenga for Bridesmaid',
    category: 'lehengas',
    filters: {
      roles: ['bridesmaid'],
      occasions: ['wedding guest', 'wedding-guest', 'sangeet', 'reception'],
      titleKeywords: ['bridesmaid'],
    },
    guideSections: [
      {
        heading: 'What Makes a Great Bridesmaid Lehenga',
        paragraphs: [
          'A bridesmaid lehenga has three jobs: it should coordinate with the bride outfit (without matching it), it should be photogenic in group photos, and it should be comfortable enough for hours of dancing at the sangeet. The best bridesmaid lehengas are lighter weight than bridal lehengas (you can dance for 4+ hours without your back hurting), in colors that complement the bride outfit, and in dance-friendly fabrics like georgette or chiffon.',
          'Coordinated bridesmaid looks are trending — all bridesmaids in the same color (yellow for mehendi, jewel tones for sangeet, pastels for daytime events). Some brides choose an ombre effect — each bridesmaid in a different shade of the same color (e.g., peach, coral, burnt orange, deep orange). Both approaches photograph beautifully. The key is coordination without exact matching — the bride should stand out.',
        ],
      },
      {
        heading: 'Bridesmaid Lehenga Color and Fabric Guide',
        paragraphs: [
          'For a mehendi bridesmaid, choose yellow, orange, or green — the traditional mehendi colors. For a sangeet bridesmaid, choose jewel tones (emerald, sapphire, ruby, plum) that photograph beautifully under evening lighting. For a reception bridesmaid, coordinate with the bride reception outfit color. Avoid red — it is reserved for the bride.',
          'For fabric, choose georgette, chiffon, or art silk — lightweight, dance-friendly, and photogenic. Avoid heavy velvet (too hot for dancing) and raw silk (too stiff). A-line silhouettes with 2-3 meters of flare are ideal; circular skirts with 4-6 meters are too heavy for hours of dancing.',
          'At LuxeMia, we offer Made to Measure on every lehenga at no extra cost — essential for bridesmaids who need a coordinated look with consistent fit. We custom-stitch to each bridesmaid measurements. Order 6-8 weeks before the wedding for the full bridal party. Free shipping on orders over $350.',
        ],
      },
    ],
    faqs: [
      { question: 'What color should a bridesmaid wear?', answer: 'Coordinate with the bride. For mehendi: yellow, orange, or green. For sangeet: jewel tones (emerald, sapphire, ruby). For reception: coordinate with bride outfit. Avoid red — it is reserved for the bride. The bride should stand out from the bridesmaids.' },
      { question: 'How much does a bridesmaid lehenga cost?', answer: 'Budget $180-$450 per bridesmaid. Coordinated looks with matching embellishment are at the higher end. At LuxeMia, Made to Measure is included at no extra cost — essential for consistent fit across the bridal party.' },
      { question: 'What fabric is best for a bridesmaid lehenga?', answer: 'Georgette, chiffon, or art silk — lightweight, dance-friendly, and photogenic. Avoid heavy velvet (too hot for dancing) and raw silk (too stiff). A-line silhouettes with 2-3 meters of flare are ideal for hours of dancing.' },
    ],
    relatedLinks: [
      { label: 'Mehendi Outfit Ideas by Role', url: '/blog/mehendi-outfit-by-role' },
      { label: 'Shop All Wedding Guest Outfits', url: '/collections/wedding-guest-outfits' },
      { label: 'Shop All Lehengas', url: '/lehengas' },
      { label: 'Indian Wedding Dress Guide 2026', url: '/blog/indian-wedding-dress-complete-guide' },
    ],
  },

  {
    slug: 'anarkali-suit-for-wedding-guest',
    title: 'Anarkali Suit for Wedding Guest — Easiest Indian Outfit | LuxeMia',
    metaDescription: 'Shop anarkali suits for wedding guests. The easiest Indian outfit for first-timers — slips on like a dress, no draping. Ready-to-ship from $150-400 with free shipping to USA, Canada & Australia.',
    h1: 'Anarkali Suit for Wedding Guest',
    heroSubtitle: 'The anarkali suit is the easiest Indian outfit for wedding guests — slips on like a dress, no draping or pinning required. Shop ready-to-ship anarkalis from $150-400 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Anarkali Suit for Wedding Guest',
    category: 'suits',
    filters: {
      styles: ['anarkali'],
      titleKeywords: ['anarkali'],
    },
    guideSections: [
      {
        heading: 'Why the Anarkali is the Best Choice for Wedding Guests',
        paragraphs: [
          'If you are attending an Indian wedding and you are not sure what to wear, the anarkali suit is your safest bet. It is the easiest Indian outfit to wear — it slips on like a dress, no draping or pinning required. It is flattering for all body types. It is comfortable for long events. And it is appropriate for every wedding event — mehendi, sangeet, wedding ceremony, and reception.',
          'The anarkali suit consists of a long, flowy tunic (the anarkali) over fitted pants (churidar), with a matching scarf (dupatta). The fitted bodice and flared skirt create an A-line silhouette that skims over the stomach and hips — flattering for every body type, including plus-size. For first-time Indian wedding guests, the anarkali is much easier than a saree (which requires draping skills) and more comfortable than a lehenga (which has a heavy skirt).',
        ],
      },
      {
        heading: 'Choosing the Right Anarkali for Each Wedding Event',
        paragraphs: [
          'For a mehendi (daytime, casual), choose a cotton or georgette anarkali in bright colors — yellow, orange, pink, or green. Light embellishment is ideal. Budget $120-$280. For a sangeet (evening, dance-focused), choose a georgette or net anarkali with sequin or mirror work in jewel tones — emerald, sapphire, magenta. Budget $180-$400. For the wedding ceremony (most formal), choose a silk or heavily embroidered anarkali in rich colors — maroon, deep green, royal blue. Budget $200-$450. For a reception (cocktail-style), choose a designer anarkali in a contemporary color — wine, navy, plum. Budget $200-$500.',
          'Pair with gold or kundan jewelry — jhumka earrings, a statement necklace, and bangles. For footwear, embellished flats — you will be standing for hours. For the dupatta, drape over one shoulder or pin across the chest for modesty at religious ceremonies.',
          'At LuxeMia, all our anarkali suits are available in Made to Measure at no extra cost. We custom-stitch to your exact measurements. Order 4-6 weeks before the wedding. Free shipping on orders over $350 to the USA, Canada, and Australia.',
        ],
      },
    ],
    faqs: [
      { question: 'Is an anarkali suit appropriate for an Indian wedding?', answer: 'Yes, the anarkali is one of the most appropriate and versatile Indian wedding outfits. It works for every event — mehendi, sangeet, wedding ceremony, and reception. It is the easiest Indian outfit for first-time wedding guests.' },
      { question: 'How is an anarkali different from a lehenga?', answer: 'An anarkali is a single-piece tunic (with pants underneath) — it slips on like a dress. A lehenga is a separate skirt + blouse + dupatta — three pieces that must be coordinated. Anarkalis are easier to wear and more comfortable for long events. Lehengas are more photogenic and formal.' },
      { question: 'How much does an anarkali suit cost for a wedding guest?', answer: 'Budget $150-$400 for a quality anarkali. Daytime mehendi anarkalis are at the lower end ($120-$280). Formal wedding ceremony anarkalis with heavy embroidery are at the higher end ($200-$500). At LuxeMia, Made to Measure is included at no extra cost.' },
    ],
    relatedLinks: [
      { label: 'What to Wear to an Indian Wedding as a Non-Indian Guest', url: '/blog/what-to-wear-indian-wedding-non-indian-guest' },
      { label: 'Lehenga vs Sharara vs Anarkali Comparison', url: '/blog/lehenga-vs-sharara-vs-anarkali-comparison' },
      { label: 'Shop All Suits', url: '/suits' },
      { label: 'Shop All Wedding Guest Outfits', url: '/collections/wedding-guest-outfits' },
    ],
  },

  {
    slug: 'saree-for-mother-of-bride',
    title: 'Saree for Mother of Bride — Traditional & Elegant | LuxeMia',
    metaDescription: 'Shop sarees for the mother of the bride. Silk, Banarasi, and Kanchipuram — traditional, elegant, and appropriate for wedding ceremonies. Ready-to-ship from $150-500 with free shipping to USA, Canada & Australia.',
    h1: 'Saree for Mother of Bride',
    heroSubtitle: 'The mother of the bride traditionally wears a silk saree for the wedding ceremony — elegant, timeless, and culturally appropriate. Shop ready-to-ship sarees from $150-500 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Saree for Mother of Bride',
    category: 'sarees',
    filters: {
      fabrics: ['silk', 'banarasi', 'kanjivaram', 'kanchipuram'],
      titleKeywords: ['silk', 'banarasi', 'kanjivaram', 'wedding'],
    },
    guideSections: [
      {
        heading: 'Why Silk Sarees are Traditional for the Mother of the Bride',
        paragraphs: [
          'For an Indian wedding ceremony, the mother of the bride traditionally wears a silk saree — Banarasi silk for North Indian weddings, Kanchipuram silk for South Indian weddings. Silk is the most auspicious fabric for Hindu religious ceremonies, and a silk saree signals respect for the tradition and the importance of the occasion. The mother of the bride in a silk saree is a timeless, elegant look that photographs beautifully.',
          'A silk saree is also practical for the mother of the bride — it is comfortable for long ceremonies (6-8 hours), it drapes gracefully over any body type, and it can be passed down as a family heirloom. A well-maintained Kanchipuram silk saree can be passed down through three generations, making it a meaningful investment. For the mother of the bride, a silk saree in a rich color (maroon, deep green, royal blue, gold) is the ideal choice.',
        ],
      },
      {
        heading: 'Choosing the Right Silk Saree for the Mother of the Bride',
        paragraphs: [
          'For a North Indian wedding, choose a Banarasi silk saree — handwoven in Varanasi with gold or silver zari borders. Maroon, deep red, or gold Banarasi is the most traditional choice for the mother of the bride. Budget $200-$500. For a South Indian wedding, choose a Kanchipuram silk saree — handwoven in Tamil Nadu with pure zari borders. Maroon, deep green, or royal blue Kanchipuram is traditional. Budget $250-$500.',
          'Pair with a custom-stitched blouse (essential for sarees — the blouse must fit perfectly). Choose gold or kundan jewelry — a statement necklace, jhumka earrings, and gold bangles. A maang tikka is traditional for the mother of the bride. For footwear, comfortable embellished flats — you will be standing for hours.',
          'At LuxeMia, all our silk sarees come with a custom-stitched blouse at no extra cost (Made to Measure). We ship to the USA, Canada, and Australia with free shipping on orders over $350. Order 4-6 weeks before the wedding for custom blouse stitching.',
        ],
      },
    ],
    faqs: [
      { question: 'What should the mother of the bride wear to an Indian wedding?', answer: 'A silk saree is the traditional choice for the mother of the bride. Banarasi silk for North Indian weddings, Kanchipuram silk for South Indian weddings. Rich colors like maroon, deep green, royal blue, or gold. Pair with gold or kundan jewelry.' },
      { question: 'How much does a mother of the bride saree cost?', answer: 'Budget $200-$500 for a quality silk saree. Handwoven Banarasi or Kanchipuram silk with real zari is at the higher end. At LuxeMia, a custom-stitched blouse is included at no extra cost.' },
      { question: 'What color saree should the mother of the bride wear?', answer: 'Rich, traditional colors — maroon, deep green, royal blue, gold, or wine. Avoid pastels (too youthful) and black (inauspicious). The mother of the bride should look regal and elegant.' },
    ],
    relatedLinks: [
      { label: 'Indian Wedding Dress Guide 2026', url: '/blog/indian-wedding-dress-complete-guide' },
      { label: 'Shop All Sarees', url: '/sarees' },
      { label: 'Indian to US Clothing Size Conversion Guide', url: '/blog/indian-to-us-clothing-size-conversion-guide' },
      { label: 'Plus Size Indian Ethnic Wear Guide', url: '/blog/plus-size-indian-ethnic-wear-guide' },
    ],
  },

  {
    slug: 'lehenga-for-mother-of-bride',
    title: 'Lehenga for Mother of Bride — Regal & Comfortable | LuxeMia',
    metaDescription: 'Shop lehengas for the mother of the bride. Regal, elegant, and comfortable for long wedding events. Ready-to-ship from $250-600 with free shipping to USA, Canada & Australia.',
    h1: 'Lehenga for Mother of Bride',
    heroSubtitle: 'A lehenga for the mother of the bride should be regal, elegant, and comfortable for long wedding events. Shop ready-to-ship lehengas from $250-600 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Lehenga for Mother of Bride',
    category: 'lehengas',
    filters: {
      colors: ['maroon', 'wine', 'deep green', 'royal blue', 'gold', 'burgundy'],
    },
    guideSections: [
      {
        heading: 'Why a Lehenga Works for the Mother of the Bride',
        paragraphs: [
          'While the silk saree is the most traditional choice for the mother of the bride, a lehenga is an increasingly popular modern alternative. A lehenga is easier to wear than a saree (no draping required), more photogenic than a salwar kameez, and regal enough for the mother of the bride role. For mothers who are not comfortable draping a saree, or who want a more structured, statement look, a lehenga is an excellent choice.',
          'The key to a mother of the bride lehenga is choosing a sophisticated, age-appropriate silhouette. Avoid crop-top cholis (too youthful) — choose a longer choli that ends at the waist, with 3/4 sleeves. A-line skirts with 2-3 meters of flare are ideal; circular skirts with 4-6 meters are too youthful. Rich colors (maroon, deep green, royal blue, wine, gold) and heavy zari or kundan embroidery give the regal look appropriate for the mother of the bride.',
        ],
      },
      {
        heading: 'Styling the Mother of the Bride Lehenga',
        paragraphs: [
          'Choose rich, sophisticated colors — maroon, deep green, royal blue, wine, gold, or burgundy. Avoid pastels (too youthful), black (inauspicious), and red (reserved for the bride). Heavy zari, kundan, or sequin embellishment is appropriate — the mother of the bride should look regal. Velvet fabric is perfect for winter weddings; silk or georgette for summer.',
          'Pair with a 3/4 sleeve choli (not a crop top), statement gold or kundan jewelry (necklace set, jhumkas, bangles, maang tikka), and the dupatta draped over one shoulder or pinned across the chest for modesty. For footwear, comfortable embellished flats — you will be standing for hours.',
          'At LuxeMia, we offer Made to Measure on every lehenga at no extra cost — essential for the mother of the bride, who needs a perfect, comfortable fit. We custom-stitch to your exact measurements with 5-7 business day dispatch. Free shipping on orders over $350 to the USA, Canada, and Australia.',
        ],
      },
    ],
    faqs: [
      { question: 'Can the mother of the bride wear a lehenga?', answer: 'Yes, a lehenga is an increasingly popular modern alternative to the traditional silk saree. Choose a sophisticated, age-appropriate silhouette — longer choli with 3/4 sleeves, A-line skirt with 2-3 meters of flare. Rich colors and heavy embellishment.' },
      { question: 'What color lehenga should the mother of the bride wear?', answer: 'Rich, sophisticated colors — maroon, deep green, royal blue, wine, gold, or burgundy. Avoid pastels (too youthful), black (inauspicious), and red (reserved for the bride).' },
      { question: 'How much does a mother of the bride lehenga cost?', answer: 'Budget $250-$600 for a quality mother of the bride lehenga. Heavily embroidered silk or velvet lehengas with zari or kundan work are at the higher end. At LuxeMia, Made to Measure is included at no extra cost.' },
    ],
    relatedLinks: [
      { label: 'Indian Wedding Dress Guide 2026', url: '/blog/indian-wedding-dress-complete-guide' },
      { label: 'Plus Size Indian Ethnic Wear Guide', url: '/blog/plus-size-indian-ethnic-wear-guide' },
      { label: 'Shop All Lehengas', url: '/lehengas' },
      { label: 'Indian to US Clothing Size Conversion Guide', url: '/blog/indian-to-us-clothing-size-conversion-guide' },
    ],
  },

  {
    slug: 'sherwani-for-groom',
    title: 'Sherwani for Groom — Traditional & Regal | LuxeMia',
    metaDescription: 'Shop sherwanis for the groom. Traditional, regal, and photogenic for the wedding ceremony. Ready-to-ship from $200-500 with free shipping to USA, Canada & Australia.',
    h1: 'Sherwani for Groom',
    heroSubtitle: 'The sherwani is the traditional wedding outfit for the Indian groom — regal, elegant, and photogenic. Shop ready-to-ship sherwanis from $200-500 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Sherwani for Groom',
    category: 'menswear',
    filters: {
      styles: ['sherwani'],
      titleKeywords: ['sherwani'],
    },
    guideSections: [
      {
        heading: 'Why the Sherwani is the Traditional Groom Outfit',
        paragraphs: [
          'The sherwani is the traditional wedding outfit for the Indian groom — a long, coat-like tunic worn over a kurta and churidar pants. It is the male equivalent of the bridal lehenga: regal, formal, and photogenic. For the wedding ceremony, the groom traditionally wears a sherwani in ivory, gold, maroon, or deep blue, with intricate embroidery and a dupatta draped over one shoulder.',
          'The sherwani has been the groom outfit of choice for centuries in North Indian weddings, and it has become the standard for Indian diaspora weddings worldwide. A well-fitted sherwani photographs beautifully, signals the importance of the occasion, and complements the bride lehenga or saree. For the reception, the groom may change into a more modern indo-western outfit, but for the wedding ceremony itself, the sherwani remains the gold standard.',
        ],
      },
      {
        heading: 'Choosing the Right Sherwani for the Groom',
        paragraphs: [
          'For the wedding ceremony, choose a sherwani in ivory, gold, maroon, or deep blue — the traditional groom colors. Ivory and gold are the most popular choices because they complement any bride color. Heavy zardozi or kundan embroidery on the chest and sleeves gives the regal look. Pair with a matching or contrasting dupatta draped over one shoulder, a turban (safa) in a coordinating color, and mojari (embellished flats).',
          'For the reception, the groom can choose a more modern indo-western sherwani — slimmer cut, contemporary colors (wine, navy, charcoal), and less heavy embroidery. Bandhgala jackets and indo-western suits are also popular reception choices. For the mehendi and haldi, a simpler kurta pajama is appropriate.',
          'At LuxeMia, we offer Made to Measure on every sherwani at no extra cost — essential for the groom, who needs a perfect fit. We custom-stitch to his exact measurements with 5-7 business day dispatch. Free shipping on orders over $350 to the USA, Canada, and Australia. Order 6-8 weeks before the wedding.',
        ],
      },
    ],
    faqs: [
      { question: 'What should the groom wear to an Indian wedding?', answer: 'A sherwani is the traditional wedding ceremony outfit for the Indian groom — a long, coat-like tunic worn over a kurta and churidar pants. Ivory, gold, maroon, or deep blue with heavy embroidery. For the reception, a more modern indo-western sherwani or bandhgala.' },
      { question: 'How much does a groom sherwani cost?', answer: 'Budget $200-$500 for a quality groom sherwani. Heavily embroidered sherwanis with zardozi or kundan work are at the higher end. At LuxeMia, Made to Measure is included at no extra cost.' },
      { question: 'What color sherwani should the groom wear?', answer: 'Ivory and gold are the most popular choices because they complement any bride color. Maroon and deep blue are also traditional. For the reception, contemporary colors like wine, navy, or charcoal work well.' },
    ],
    relatedLinks: [
      { label: 'Shop All Menswear', url: '/menswear' },
      { label: 'Indian Wedding Dress Guide 2026', url: '/blog/indian-wedding-dress-complete-guide' },
      { label: 'Indian Wedding Terms Glossary', url: '/blog/indian-wedding-terms-glossary-50-events-rituals-roles' },
    ],
  },

  {
    slug: 'kurta-for-groom-brother',
    title: 'Kurta for Groom Brother — Stylish & Comfortable | LuxeMia',
    metaDescription: 'Shop kurtas for the groom brother. Stylish, comfortable, and appropriate for all wedding events. Ready-to-ship from $80-250 with free shipping to USA, Canada & Australia.',
    h1: 'Kurta for Groom Brother',
    heroSubtitle: 'The groom brother needs an outfit that is stylish, comfortable, and coordinated with the wedding party. Shop ready-to-ship kurtas from $80-250 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Kurta for Groom Brother',
    category: 'menswear',
    filters: {
      styles: ['kurta'],
      titleKeywords: ['kurta'],
    },
    guideSections: [
      {
        heading: 'What the Groom Brother Should Wear',
        paragraphs: [
          'The groom brother (and the bride brother) has a special role at an Indian wedding — he is in the wedding party but not the center of attention. His outfit should be stylish, coordinated with the wedding party, and appropriate for each event. For most events, a kurta pajama or kurta with churidar is the perfect choice — comfortable, traditional, and easy to move in.',
          'For the mehendi and haldi (daytime, casual), a simple cotton or linen kurta in bright colors (yellow, orange, pink, green) is ideal. For the sangeet (evening, dance-focused), a silk or georgette kurta with light embellishment in jewel tones. For the wedding ceremony, a silk kurta with a Nehru jacket or a sherwani-style kurta. For the reception, an indo-western kurta or bandhgala jacket.',
        ],
      },
      {
        heading: 'Coordinating with the Groom and Wedding Party',
        paragraphs: [
          'The groom brother should coordinate with the groom and the rest of the wedding party without exactly matching. If the groom is wearing ivory, the brother can wear gold or beige. If the groom is wearing maroon, the brother can wear deep red or wine. The key is to be in the same color family but distinct enough to tell apart in photos.',
          'For footwear, mojari (embellished flats) or juti are traditional. For accessories, a contrasting dupatta draped over one shoulder, a turban (safa) in a coordinating color, and a watch. Avoid heavy jewelry — men Indian jewelry is minimal. A simple kada (bracelet) is the most traditional accessory.',
          'At LuxeMia, we offer Made to Measure on every kurta at no extra cost. We custom-stitch to his exact measurements with 5-7 business day dispatch. Free shipping on orders over $350 to the USA, Canada, and Australia. Order 4-6 weeks before the wedding.',
        ],
      },
    ],
    faqs: [
      { question: 'What should the groom brother wear to an Indian wedding?', answer: 'A kurta pajama or kurta with churidar is the perfect choice — comfortable, traditional, and coordinated. For mehendi/haldi: simple cotton kurta. For sangeet: silk kurta with embellishment. For wedding ceremony: silk kurta with Nehru jacket. For reception: indo-western kurta.' },
      { question: 'How much does a groom brother kurta cost?', answer: 'Budget $80-$250 for a quality kurta. Simple cotton kurtas are at the lower end; silk kurtas with embellishment are at the higher end. At LuxeMia, Made to Measure is included at no extra cost.' },
      { question: 'Should the groom brother match the groom?', answer: 'Coordinate but do not exactly match. If the groom is wearing ivory, the brother can wear gold or beige. The key is to be in the same color family but distinct enough to tell apart in photos.' },
    ],
    relatedLinks: [
      { label: 'Shop All Menswear', url: '/menswear' },
      { label: 'Indian Wedding Dress Guide 2026', url: '/blog/indian-wedding-dress-complete-guide' },
      { label: 'Mehendi Outfit Ideas by Role', url: '/blog/mehendi-outfit-by-role' },
    ],
  },

  {
    slug: 'sharara-for-bride-sister',
    title: 'Sharara for Bride Sister — Trendy & Photogenic | LuxeMia',
    metaDescription: 'Shop sharara sets for the bride sister. Trendy, photogenic, and dance-friendly for mehendi and sangeet. Ready-to-ship from $180-400 with free shipping to USA, Canada & Australia.',
    h1: 'Sharara for Bride Sister',
    heroSubtitle: 'The sharara is a trendy, photogenic choice for the bride sister — wide-flare pants with a short kurti, perfect for mehendi and sangeet dancing. Shop from $180-400 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Sharara for Bride Sister',
    category: 'suits',
    filters: {
      styles: ['sharara'],
      titleKeywords: ['sharara'],
    },
    guideSections: [
      {
        heading: 'Why the Sharara is Perfect for the Bride Sister',
        paragraphs: [
          'The sharara set — wide-flared pants with a short kurti and dupatta — is one of the trendiest Indian outfit silhouettes for 2026, and it is especially perfect for the bride sister. The wide-flare pants skim over the legs and create a flowing, photogenic silhouette. The short kurti is modern and flattering. And the outfit is incredibly comfortable for hours of dancing at the mehendi and sangeet.',
          'For the bride sister, the sharara is a way to stand out from the bridesmaids (who may be in matching anarkalis or lehengas) while still being coordinated and festive. Popular bride-sister sharara colors include fuchsia, magenta, royal blue, and orange — bold colors that contrast beautifully with the bride yellow or green mehendi outfit. The sharara photographs beautifully in group photos and is easy to dance in.',
        ],
      },
      {
        heading: 'Styling the Bride Sister Sharara',
        paragraphs: [
          'For a mehendi bride-sister look, choose a fuchsia or orange sharara with gota patti or mirror work. Pair with oxidized silver jewelry (the traditional mehendi accessory), floral gajra in the hair, and comfortable juti flats. For a sangeet bride-sister look, choose a royal blue or purple sharara with sequin work. Pair with kundan jewelry and embellished flats.',
          'For the dupatta, drape diagonally across the chest for a modern look, or over one shoulder for a traditional look. Avoid draping over both shoulders — it adds bulk. The wide-flare pants should have the flare starting at the hip (not the knee) for the most flattering silhouette.',
          'At LuxeMia, we offer Made to Measure on every sharara at no extra cost. We custom-stitch to your exact measurements with 5-7 business day dispatch. Free shipping on orders over $350 to the USA, Canada, and Australia. Order 4-6 weeks before the wedding.',
        ],
      },
    ],
    faqs: [
      { question: 'What is a sharara suit?', answer: 'A sharara is a set of wide-flared pants (the flare starts at the hip) worn with a short kurti and dupatta. It is one of the trendiest Indian silhouettes for 2026 — modern, photogenic, and comfortable for dancing. Perfect for mehendi and sangeet.' },
      { question: 'Can the bride sister wear a sharara?', answer: 'Yes, the sharara is a perfect choice for the bride sister. It is trendy, photogenic, and stands out from the bridesmaids. Popular colors include fuchsia, magenta, royal blue, and orange — bold colors that contrast with the bride outfit.' },
      { question: 'How much does a sharara cost?', answer: 'Budget $180-$400 for a quality sharara set. Heavily embroidered shararas with gota patti or mirror work are at the higher end. At LuxeMia, Made to Measure is included at no extra cost.' },
    ],
    relatedLinks: [
      { label: 'Mehendi Outfit Ideas by Role', url: '/blog/mehendi-outfit-by-role' },
      { label: 'Lehenga vs Sharara vs Anarkali Comparison', url: '/blog/lehenga-vs-sharara-vs-anarkali-comparison' },
      { label: 'Shop All Suits', url: '/suits' },
      { label: 'Shop All Wedding Guest Outfits', url: '/collections/wedding-guest-outfits' },
    ],
  },

  // ═══ PATTERN 3: Fabric × Saree × Event (7 pages) ═══

  {
    slug: 'georgette-saree-for-reception',
    title: 'Georgette Saree for Reception — Flowy & Glamorous | LuxeMia',
    metaDescription: 'Shop georgette sarees for wedding receptions. Flowy, glamorous, and easy to drape. Ready-to-ship from $150-400 with free shipping to USA, Canada & Australia.',
    h1: 'Georgette Saree for Reception',
    heroSubtitle: 'Georgette is the perfect reception saree fabric — flowy, glamorous, and easy to drape. Shop ready-to-ship georgette sarees from $150-400 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Georgette Saree for Reception',
    category: 'sarees',
    filters: {
      fabrics: ['georgette'],
      occasions: ['reception', 'party', 'evening'],
    },
    guideSections: [
      {
        heading: 'Why Georgette is the Best Reception Saree Fabric',
        paragraphs: [
          'Georgette is the ideal fabric for a reception saree. It is lightweight and flowy, which means it drapes beautifully and moves with you on the dance floor. It is sheer but not transparent (with the right lining), giving an elegant, glamorous look. It photographs beautifully under evening lighting. And it is easy to drape — much easier than stiff silks or heavy brocades.',
          'For a reception, you want a saree that is glamorous but comfortable enough for 4-6 hours of mingling, eating, and dancing. Georgette checks all the boxes. It is also a versatile fabric that takes embellishment well — sequin work, mirror work, and zari borders all look stunning on georgette. For a modern reception look, choose a georgette saree in a jewel tone (emerald, sapphire, wine) with heavy border work.',
        ],
      },
      {
        heading: 'Styling Your Georgette Reception Saree',
        paragraphs: [
          'Pair your georgette reception saree with a statement blouse — boat neck, V-neck, or 3/4 sleeve. The blouse should be custom-stitched for a perfect fit (essential for sarees). Choose a blouse color that contrasts with the saree — e.g., a gold blouse with a wine saree, or a silver blouse with a navy saree. Heavy blouse embellishment (sequins, zari) gives the glamorous reception look.',
          'For jewelry, choose statement pieces — a kundan or polki necklace set, chandelier earrings, and bangles. Avoid heavy necklaces if the saree has heavy border work; the necklace and border will compete. For footwear, embellished heels or wedges (receptions are usually indoor, so heels are OK). For the dupatta/pallu, drape over one shoulder for a modern look, or pin across for traditional.',
          'At LuxeMia, all our georgette sarees come with a custom-stitched blouse at no extra cost (Made to Measure). We ship to the USA, Canada, and Australia with free shipping on orders over $350. Order 4-6 weeks before the reception.',
        ],
      },
    ],
    faqs: [
      { question: 'Is georgette good for a reception saree?', answer: 'Yes, georgette is the ideal reception saree fabric. It is flowy, glamorous, easy to drape, and photographs beautifully under evening lighting. It takes embellishment well — sequin work, mirror work, and zari borders all look stunning on georgette.' },
      { question: 'How much does a georgette reception saree cost?', answer: 'Budget $150-$400 for a quality georgette saree. Heavily embellished georgette sarees with sequin or zari border work are at the higher end. At LuxeMia, a custom-stitched blouse is included at no extra cost.' },
      { question: 'What color georgette saree is best for a reception?', answer: 'Jewel tones — emerald, sapphire, wine, plum, navy — photograph beautifully under evening lighting. Avoid pastels for evening receptions; they can look washed out. Black is acceptable for receptions if the invitation welcomes it.' },
    ],
    relatedLinks: [
      { label: 'Shop All Sarees', url: '/sarees' },
      { label: 'What to Wear to an Indian Wedding as a Non-Indian Guest', url: '/blog/what-to-wear-indian-wedding-non-indian-guest' },
      { label: 'Indian Wedding Dress Guide 2026', url: '/blog/indian-wedding-dress-complete-guide' },
    ],
  },

  {
    slug: 'banarasi-silk-saree-for-wedding',
    title: 'Banarasi Silk Saree for Wedding — Traditional & Auspicious | LuxeMia',
    metaDescription: 'Shop Banarasi silk sarees for weddings. Handwoven in Varanasi with real zari — traditional, auspicious, and photogenic. Ready-to-ship from $200-500 with free shipping to USA, Canada & Australia.',
    h1: 'Banarasi Silk Saree for Wedding',
    heroSubtitle: 'A Banarasi silk saree is the most traditional and auspicious choice for an Indian wedding — handwoven in Varanasi with real zari. Shop from $200-500 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Banarasi Silk Saree for Wedding',
    category: 'sarees',
    filters: {
      fabrics: ['silk', 'banarasi'],
      titleKeywords: ['banarasi', 'silk'],
    },
    guideSections: [
      {
        heading: 'Why Banarasi Silk is the Most Auspicious Wedding Saree',
        paragraphs: [
          'The Banarasi silk saree is the most traditional and auspicious saree choice for an Indian wedding. Handwoven in Varanasi (Banaras) on the banks of the Ganges, Banarasi silk sarees have been the wedding saree of choice for North Indian brides and wedding guests for centuries. The pure silk fabric, real gold or silver zari borders, and intricate motifs (paisley, floral, geometric) make each Banarasi saree a work of art.',
          'Banarasi silk is also a meaningful investment — a well-maintained Banarasi saree can be passed down through three generations as a family heirloom. For a bride, a red Banarasi silk saree is the traditional choice for the wedding ceremony. For a wedding guest, a Banarasi in maroon, deep green, royal blue, or gold is an elegant, timeless choice that signals respect for the tradition.',
        ],
      },
      {
        heading: 'How to Spot an Authentic Banarasi Silk Saree',
        paragraphs: [
          'Authentic Banarasi silk sarees are handwoven in Varanasi and have a GI (Geographical Indication) tag certifying their origin. Look for: (1) pure silk fabric that feels crisp and slightly stiff, (2) real zari borders (gold or silver thread, not metallic synthetic), (3) intricate handwoven motifs on the pallu (the decorative end), and (4) a GI tag or certificate from the weaver.',
          'Avoid "Banarasi-style" or "Banarasi print" sarees — these are machine-made imitations that lack the quality and value of authentic handwoven Banarasi silk. At LuxeMia, we source our Banarasi silk sarees directly from weavers in Varanasi, and each comes with a certificate of authenticity.',
          'Pair with a custom-stitched blouse (essential for sarees), gold or kundan jewelry (necklace set, jhumkas, bangles), and a maang tikka. For footwear, embellished flats. At LuxeMia, all our Banarasi silk sarees come with a custom-stitched blouse at no extra cost. Free shipping on orders over $350 to the USA, Canada, and Australia.',
        ],
      },
    ],
    faqs: [
      { question: 'What is a Banarasi silk saree?', answer: 'A Banarasi silk saree is a handwoven silk saree made in Varanasi (Banaras), India. It is the most traditional and auspicious saree choice for an Indian wedding. Pure silk fabric, real zari borders, and intricate handwoven motifs make each Banarasi a work of art.' },
      { question: 'How much does a Banarasi silk saree cost?', answer: 'Budget $200-$500 for an authentic handwoven Banarasi silk saree. Real zari Banarasi with heavy motifs is at the higher end. Avoid "Banarasi-style" or "Banarasi print" sarees — these are machine-made imitations. At LuxeMia, a custom-stitched blouse is included.' },
      { question: 'How can I tell if a Banarasi saree is authentic?', answer: 'Look for: pure silk fabric that feels crisp, real zari borders (not metallic synthetic), intricate handwoven motifs on the pallu, and a GI (Geographical Indication) tag or certificate from the weaver. At LuxeMia, each Banarasi comes with a certificate of authenticity.' },
    ],
    relatedLinks: [
      { label: 'Shop All Sarees', url: '/sarees' },
      { label: 'Indian Wedding Dress Guide 2026', url: '/blog/indian-wedding-dress-complete-guide' },
      { label: 'Indian Wedding Terms Glossary', url: '/blog/indian-wedding-terms-glossary-50-events-rituals-roles' },
    ],
  },

  {
    slug: 'kanjivaram-saree-for-wedding',
    title: 'Kanjivaram Saree for Wedding — South Indian Bridal Silk | LuxeMia',
    metaDescription: 'Shop Kanjivaram silk sarees for weddings. Handwoven in Tamil Nadu with pure zari — the traditional South Indian bridal saree. Ready-to-ship from $200-500 with free shipping to USA, Canada & Australia.',
    h1: 'Kanjivaram Saree for Wedding',
    heroSubtitle: 'The Kanjivaram silk saree is the traditional South Indian bridal saree — handwoven in Tamil Nadu with pure zari. Shop from $200-500 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Kanjivaram Saree for Wedding',
    category: 'sarees',
    filters: {
      fabrics: ['silk', 'kanjivaram', 'kanchipuram'],
      titleKeywords: ['kanjivaram', 'kanchipuram', 'silk'],
    },
    guideSections: [
      {
        heading: 'Why Kanjivaram Silk is the South Indian Bridal Saree',
        paragraphs: [
          'The Kanjivaram silk saree (also spelled Kanchipuram) is the traditional bridal saree for South Indian weddings — Tamil, Telugu, Kannada, and Malayali. Handwoven in Kanchipuram, Tamil Nadu, these sarees are known for their pure silk fabric, real zari borders, and contrasting borders and pallus. A Kanjivaram silk saree is the South Indian equivalent of the Banarasi silk saree — the most auspicious and traditional wedding saree choice.',
          'For a South Indian bride, a red or maroon Kanjivaram silk saree with gold zari border is the traditional choice for the muhurtham (wedding ceremony). For wedding guests, a Kanjivaram in deep green, royal blue, or maroon is an elegant, traditional choice. Kanjivaram silk sarees are also meaningful investments — a well-maintained Kanjivaram can be passed down through three generations as a family heirloom.',
        ],
      },
      {
        heading: 'Identifying an Authentic Kanjivaram Saree',
        paragraphs: [
          'Authentic Kanjivaram silk sarees are handwoven in Kanchipuram, Tamil Nadu, and have a GI (Geographical Indication) tag. Look for: (1) pure mulberry silk fabric that feels heavy and crisp, (2) real zari borders (gold or silver thread), (3) contrasting border and pallu (a hallmark of Kanjivaram — the border and pallu are woven separately and attached), and (4) traditional motifs like temple borders, peacocks, and mango paisleys.',
          'Avoid "Kanjivaram-style" or "Kanjivaram print" sarees — these are machine-made imitations. A real Kanjivaram weighs 600-800 grams and has a distinctive rustle when you move. At LuxeMia, we source our Kanjivaram silk sarees directly from weavers in Kanchipuram, and each comes with a certificate of authenticity.',
          'Pair with a custom-stitched blouse, temple jewelry (the traditional South Indian bridal jewelry — gold necklaces with red or green stones), and a gajra (flower garland) in the hair. At LuxeMia, all our Kanjivaram sarees come with a custom-stitched blouse at no extra cost. Free shipping on orders over $350.',
        ],
      },
    ],
    faqs: [
      { question: 'What is a Kanjivaram saree?', answer: 'A Kanjivaram (or Kanchipuram) silk saree is a handwoven silk saree made in Kanchipuram, Tamil Nadu. It is the traditional bridal saree for South Indian weddings. Known for pure mulberry silk, real zari borders, and contrasting border and pallu. A real Kanjivaram weighs 600-800 grams.' },
      { question: 'How much does a Kanjivaram saree cost?', answer: 'Budget $200-$500 for an authentic handwoven Kanjivaram silk saree. Real zari Kanjivaram with traditional motifs is at the higher end. Avoid "Kanjivaram-style" or "Kanjivaram print" sarees — these are machine-made imitations. At LuxeMia, a custom-stitched blouse is included.' },
      { question: 'What is the difference between Kanjivaram and Banarasi silk?', answer: 'Kanjivaram is from Tamil Nadu (South India) and is the traditional South Indian bridal saree. Banarasi is from Varanasi (North India) and is the traditional North Indian bridal saree. Kanjivaram is known for contrasting borders and pallus; Banarasi is known for all-over motifs. Both are handwoven pure silk with real zari.' },
    ],
    relatedLinks: [
      { label: 'Shop All Sarees', url: '/sarees' },
      { label: 'Indian Wedding Dress Guide 2026', url: '/blog/indian-wedding-dress-complete-guide' },
      { label: 'Indian Wedding Terms Glossary', url: '/blog/indian-wedding-terms-glossary-50-events-rituals-roles' },
    ],
  },

  {
    slug: 'chiffon-saree-for-wedding-guest',
    title: 'Chiffon Saree for Wedding Guest — Light & Flowy | LuxeMia',
    metaDescription: 'Shop chiffon sarees for wedding guests. Lightweight, flowy, and easy to drape. Perfect for summer weddings and daytime events. Ready-to-ship from $120-300 with free shipping to USA, Canada & Australia.',
    h1: 'Chiffon Saree for Wedding Guest',
    heroSubtitle: 'Chiffon is the lightest, most flowy saree fabric — perfect for summer weddings and daytime events. Shop ready-to-ship chiffon sarees from $120-300 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Chiffon Saree for Wedding Guest',
    category: 'sarees',
    filters: {
      fabrics: ['chiffon'],
      occasions: ['wedding guest', 'wedding-guest', 'daytime'],
    },
    guideSections: [
      {
        heading: 'Why Chiffon is Perfect for Wedding Guests',
        paragraphs: [
          'Chiffon is the lightest and most flowy of all saree fabrics, making it the perfect choice for wedding guests — especially for summer weddings and daytime events. Chiffon sarees are easy to drape (much easier than stiff silks), comfortable for long events, and photogenic in natural daylight. They are also the most affordable silk-alternative fabric, making them a great choice for guests who want an elegant look without the investment of a Banarasi or Kanjivaram.',
          'For a daytime mehendi or haldi, a chiffon saree in bright colors (yellow, orange, pink, green) is ideal — the light fabric moves beautifully and the colors pop in natural light. For a summer outdoor wedding, chiffon is the most comfortable choice — it breathes well and does not trap heat like silk or velvet. For an evening reception, choose a chiffon saree with heavy border work or sequin embellishment for the glamorous look.',
        ],
      },
      {
        heading: 'Styling Your Chiffon Wedding Guest Saree',
        paragraphs: [
          'Pair your chiffon saree with a custom-stitched blouse (essential for sarees). For a modern look, choose a boat neck or 3/4 sleeve blouse in a contrasting color. For a traditional look, choose a matching blouse with elbow sleeves. The blouse should be fitted — chiffon sarees look best with a structured blouse that balances the flowy fabric.',
          'For jewelry, choose pieces that match the formality of the event. For a daytime mehendi, oxidized silver jewelry is traditional and complements the light chiffon. For an evening reception, gold or kundan jewelry is more appropriate. For footwear, embellished flats for daytime events; heels or wedges for evening receptions.',
          'At LuxeMia, all our chiffon sarees come with a custom-stitched blouse at no extra cost (Made to Measure). We ship to the USA, Canada, and Australia with free shipping on orders over $350. Order 4-6 weeks before the wedding.',
        ],
      },
    ],
    faqs: [
      { question: 'Is chiffon good for a wedding guest saree?', answer: 'Yes, chiffon is an excellent wedding guest saree fabric. It is lightweight, flowy, easy to drape, and photogenic in natural daylight. It is perfect for summer weddings and daytime events like mehendi and haldi.' },
      { question: 'How much does a chiffon saree cost?', answer: 'Budget $120-$300 for a quality chiffon saree. Chiffon is more affordable than silk, making it a great choice for guests who want an elegant look without the investment. At LuxeMia, a custom-stitched blouse is included at no extra cost.' },
      { question: 'What is the difference between chiffon and georgette?', answer: 'Chiffon is lighter and more sheer than georgette. Chiffon is best for daytime and summer events; georgette is better for evening and cooler weather. Both are flowy and easy to drape. Chiffon photographs best in natural light; georgette photographs best under evening lighting.' },
    ],
    relatedLinks: [
      { label: 'Shop All Sarees', url: '/sarees' },
      { label: 'What to Wear to an Indian Wedding as a Non-Indian Guest', url: '/blog/what-to-wear-indian-wedding-non-indian-guest' },
      { label: 'Mehendi Outfit Ideas by Role', url: '/blog/mehendi-outfit-by-role' },
    ],
  },

  {
    slug: 'silk-saree-for-festival',
    title: 'Silk Saree for Festival — Diwali, Navratri, Pongal | LuxeMia',
    metaDescription: 'Shop silk sarees for Indian festivals — Diwali, Navratri, Pongal, Onam. Traditional, auspicious, and photogenic. Ready-to-ship from $150-400 with free shipping to USA, Canada & Australia.',
    h1: 'Silk Saree for Festival',
    heroSubtitle: 'A silk saree is the most traditional and auspicious choice for Indian festivals — Diwali, Navratri, Pongal, Onam. Shop from $150-400 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Silk Saree for Festival',
    category: 'sarees',
    filters: {
      fabrics: ['silk'],
    },
    guideSections: [
      {
        heading: 'Why Silk Sarees are Traditional for Indian Festivals',
        paragraphs: [
          'Silk sarees are the most traditional and auspicious choice for Indian festivals. In Hindu culture, silk is considered the purest and most auspicious fabric — it is the preferred fabric for religious ceremonies, pujas, and festival celebrations. For Diwali, a silk saree in red, gold, or deep green is traditional. For Navratri, a silk saree in the day color (orange, red, royal blue, etc.) is auspicious. For Pongal and Onam (South Indian harvest festivals), a Kanjivaram silk saree is the traditional choice.',
          'Silk sarees also have practical advantages for festivals — they are comfortable for long puja ceremonies, they photograph beautifully against diyas and festival decorations, and they can be re-worn to multiple festivals over the years. A well-maintained silk saree is a meaningful investment that can be passed down through generations.',
        ],
      },
      {
        heading: 'Choosing the Right Silk Saree for Each Festival',
        paragraphs: [
          'For Diwali (October/November), choose a Banarasi or art silk saree in red, gold, deep green, or maroon — the auspicious Diwali colors. Heavy zari border work catches the Diwali diyas beautifully. Budget $150-$400. For Navratri (September/October), choose a silk saree in the day color — orange, white, red, royal blue, yellow, green, grey, purple, or peacock green. Mirror work is traditional for garba. Budget $150-$350.',
          'For Pongal (January, Tamil harvest festival), choose a Kanjivaram silk saree in maroon, deep green, or gold — the traditional Pongal colors. For Onam (August/September, Kerala harvest festival), choose a cream or off-white silk saree with gold border — the traditional Onam saree. For Durga Puja (September/October, Bengali festival), choose a red and white Banarasi saree — the traditional Durga Puja colors.',
          'At LuxeMia, all our silk sarees come with a custom-stitched blouse at no extra cost (Made to Measure). We ship to the USA, Canada, and Australia with free shipping on orders over $350. Order 4-6 weeks before the festival.',
        ],
      },
    ],
    faqs: [
      { question: 'Can I wear a silk saree to an Indian festival?', answer: 'Yes, a silk saree is the most traditional and auspicious choice for Indian festivals. Silk is considered the purest fabric in Hindu culture. For Diwali: red, gold, deep green. For Navratri: the day color. For Pongal: Kanjivaram in maroon or green. For Onam: cream with gold border.' },
      { question: 'How much does a festival silk saree cost?', answer: 'Budget $150-$400 for a quality festival silk saree. Art silk is at the lower end; pure Banarasi or Kanjivaram silk is at the higher end. At LuxeMia, a custom-stitched blouse is included at no extra cost.' },
      { question: 'What color silk saree should I wear for Diwali?', answer: 'Red, gold, deep green, maroon, royal blue, or orange — the auspicious Diwali colors representing prosperity, joy, and the goddess Lakshmi. Avoid black (inauspicious) and white (mourning color) for Diwali.' },
    ],
    relatedLinks: [
      { label: 'Diwali Outfit Ideas by Setting', url: '/blog/diwali-outfit-ideas-by-setting' },
      { label: 'Navratri 9 Day Color Guide 2026', url: '/blog/navratri-9-day-color-guide-2026' },
      { label: 'Shop All Sarees', url: '/sarees' },
      { label: 'Shop Diwali Outfits', url: '/collections/diwali-outfits' },
      { label: 'Shop Navratri Outfits', url: '/collections/navratri-outfits' },
    ],
  },

  {
    slug: 'organza-saree-for-engagement',
    title: 'Organza Saree for Engagement — Modern & Structured | LuxeMia',
    metaDescription: 'Shop organza sarees for engagement ceremonies. Modern, structured, and photogenic — perfect for the contemporary bride or guest. Ready-to-ship from $200-450 with free shipping to USA, Canada & Australia.',
    h1: 'Organza Saree for Engagement',
    heroSubtitle: 'Organza is a modern, structured saree fabric perfect for engagement ceremonies — crisp, photogenic, and contemporary. Shop from $200-450 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Organza Saree for Engagement',
    category: 'sarees',
    filters: {
      fabrics: ['organza'],
      occasions: ['engagement', 'reception', 'cocktail'],
    },
    guideSections: [
      {
        heading: 'Why Organza is Perfect for Engagement Ceremonies',
        paragraphs: [
          'Organza is a stiff, sheer fabric that holds its shape beautifully — making it perfect for the modern engagement ceremony look. Unlike flowy georgette or chiffon, organza creates a structured, architectural silhouette that photographs elegantly. It is also a contemporary fabric choice — popular with modern brides and wedding guests who want a fresh, fashion-forward look.',
          'The engagement ceremony is typically the most flexible Indian wedding event in terms of dress code — it is a celebration but not a religious ceremony. This makes it the perfect occasion for a modern, experimental outfit like an organza saree. Pair with a contemporary blouse design (boat neck, off-shoulder, or 3/4 sleeve), statement jewelry, and modern draping for a fashion-forward engagement look.',
        ],
      },
      {
        heading: 'Styling Your Organza Engagement Saree',
        paragraphs: [
          'Organza sarees look best with modern blouse designs — boat neck, off-shoulder, or 3/4 sleeve. Choose a blouse color that contrasts with the saree for a contemporary look. The blouse should be structured to balance the stiff organza fabric. Heavy blouse embellishment (sequins, embroidery) gives a glamorous engagement look.',
          'For jewelry, choose statement pieces — a choker necklace, chandelier earrings, and a maang tikka. Avoid heavy long necklaces; they compete with the structured organza. For footwear, heels or wedges (engagements are usually indoor). For the pallu, drape over one shoulder for a modern look, or pin in a contemporary style.',
          'Popular organza saree colors for engagements include pastel pink, mint green, ivory, and champagne for daytime events; deep jewel tones (emerald, sapphire, wine) for evening events. Floral print organza sarees are also trending for 2026 engagements. At LuxeMia, all our organza sarees come with a custom-stitched blouse at no extra cost. Free shipping on orders over $350.',
        ],
      },
    ],
    faqs: [
      { question: 'Is organza good for an engagement saree?', answer: 'Yes, organza is perfect for an engagement ceremony. It is modern, structured, and photogenic — ideal for the most flexible Indian wedding event. Pair with a contemporary blouse design and statement jewelry for a fashion-forward engagement look.' },
      { question: 'How much does an organza saree cost?', answer: 'Budget $200-$450 for a quality organza saree. Floral print organza and heavily embellished organza are at the higher end. At LuxeMia, a custom-stitched blouse is included at no extra cost.' },
      { question: 'What color organza saree is best for an engagement?', answer: 'For daytime engagements: pastel pink, mint green, ivory, or champagne. For evening engagements: deep jewel tones (emerald, sapphire, wine). Floral print organza sarees are trending for 2026 engagements.' },
    ],
    relatedLinks: [
      { label: 'Shop All Sarees', url: '/sarees' },
      { label: 'Indian Wedding Dress Guide 2026', url: '/blog/indian-wedding-dress-complete-guide' },
      { label: 'What to Wear to an Indian Wedding as a Non-Indian Guest', url: '/blog/what-to-wear-indian-wedding-non-indian-guest' },
    ],
  },

  {
    slug: 'georgette-saree-for-wedding-guest',
    title: 'Georgette Saree for Wedding Guest — Easy & Elegant | LuxeMia',
    metaDescription: 'Shop georgette sarees for wedding guests. Easy to drape, elegant, and photogenic. The perfect saree for first-time wearers. Ready-to-ship from $150-350 with free shipping to USA, Canada & Australia.',
    h1: 'Georgette Saree for Wedding Guest',
    heroSubtitle: 'Georgette is the easiest saree fabric to drape — perfect for first-time wedding guests. Flowy, elegant, and photogenic. Shop from $150-350 with free shipping to USA, Canada & Australia.',
    breadcrumb: 'Georgette Saree for Wedding Guest',
    category: 'sarees',
    filters: {
      fabrics: ['georgette'],
      occasions: ['wedding guest', 'wedding-guest', 'sangeet', 'reception'],
    },
    guideSections: [
      {
        heading: 'Why Georgette is the Best Saree for Wedding Guests',
        paragraphs: [
          'If you are attending an Indian wedding and want to wear a saree but have never draped one before, georgette is your best choice. Georgette is a lightweight, slightly stretchy fabric that drapes easily and stays in place — much easier than stiff silks or slippery chiffons. It forgives draping mistakes, holds pleats well with minimal pinning, and moves beautifully when you walk or dance.',
          'Georgette is also the most photogenic saree fabric for evening events — it has a subtle sheen that catches the light, and it photographs elegantly under warm reception lighting. For a first-time wedding guest, a georgette saree in a jewel tone (emerald, sapphire, wine, plum) with a contrasting blouse and statement jewelry is a safe, elegant, photogenic choice.',
        ],
      },
      {
        heading: 'Draping and Styling Your Georgette Wedding Guest Saree',
        paragraphs: [
          'Georgette sarees are draped in the standard Nivi style (the most common Indian saree drape). If you are a beginner, ask a friend to help you drape, or hire a local Indian beautician to help you get ready. The key steps: (1) wrap the saree around your waist, (2) make 5-7 pleats in the front, (3) drape the pallu (decorative end) over your left shoulder, (4) pin everything in place with safety pins. Georgette holds pleats well, so minimal pinning is needed.',
          'Pair with a custom-stitched blouse (essential for sarees — the blouse must fit perfectly). For a modern look, choose a boat neck or 3/4 sleeve blouse in a contrasting color. For jewelry, choose statement pieces — a kundan or polki necklace, jhumka earrings, and bangles. For footwear, embellished flats for daytime; heels for evening receptions.',
          'At LuxeMia, all our georgette sarees come with a custom-stitched blouse at no extra cost (Made to Measure). We ship to the USA, Canada, and Australia with free shipping on orders over $350. Order 4-6 weeks before the wedding. For complete draping instructions, see our <a href="/blog/what-to-wear-indian-wedding-non-indian-guest">non-Indian wedding guest guide</a>.',
        ],
      },
    ],
    faqs: [
      { question: 'Is georgette good for a wedding guest saree?', answer: 'Yes, georgette is the best saree fabric for wedding guests, especially first-timers. It drapes easily, stays in place, forgives draping mistakes, and photographs elegantly. It is much easier than stiff silks or slippery chiffons.' },
      { question: 'How much does a georgette wedding guest saree cost?', answer: 'Budget $150-$350 for a quality georgette saree. Heavily embellished georgette with sequin or zari border work is at the higher end. At LuxeMia, a custom-stitched blouse is included at no extra cost.' },
      { question: 'Is georgette easy to drape for beginners?', answer: 'Yes, georgette is the easiest saree fabric to drape. It is lightweight, slightly stretchy, and holds pleats well with minimal pinning. If you are a first-time saree wearer, georgette is your best choice. Ask a friend to help or hire a local Indian beautician.' },
    ],
    relatedLinks: [
      { label: 'What to Wear to an Indian Wedding as a Non-Indian Guest', url: '/blog/what-to-wear-indian-wedding-non-indian-guest' },
      { label: 'Shop All Sarees', url: '/sarees' },
      { label: 'Shop All Wedding Guest Outfits', url: '/collections/wedding-guest-outfits' },
      { label: 'Indian to US Clothing Size Conversion Guide', url: '/blog/indian-to-us-clothing-size-conversion-guide' },
    ],
  },
];
