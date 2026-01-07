import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedProduct {
  source_id: string;
  source_url: string;
  category: string;
  title: string;
  description: string;
  price_inr: number;
  price_usd: number;
  original_price_inr: number;
  original_price_usd: number;
  image_url: string;
  image_urls: string[];
  fabric: string;
  color: string;
  work: string;
  occasion: string;
  tags: string[];
}

// Category URLs with min price filters and pages to scrape
const CATEGORY_URLS = [
  { 
    category: 'lehengas', 
    baseUrl: 'https://www.wholesalesalwar.com/retail/bridal-lehenga-choli',
    minPrice: 4000,
    pages: 4
  },
  { 
    category: 'suits', 
    baseUrl: 'https://www.wholesalesalwar.com/retail/salwar-kameez',
    minPrice: 1300,
    pages: 4
  },
  { 
    category: 'sarees', 
    baseUrl: 'https://www.wholesalesalwar.com/retail/designer-saree',
    minPrice: 1300,
    pages: 5
  },
  { 
    category: 'sarees', 
    baseUrl: 'https://www.wholesalesalwar.com/retail/wedding-saree',
    minPrice: 1300,
    pages: 3
  },
  { 
    category: 'menswear', 
    baseUrl: 'https://www.wholesalesalwar.com/retail/mens-kurta-pyjama',
    minPrice: 1300,
    pages: 4
  }
];

// Convert INR to USD with boutique markup
const convertPrice = (inrPrice: number): number => {
  const usdBase = inrPrice * 0.012;
  return Math.round(usdBase * 2.5);
};

// Generate boutique-style SEO description
const generateDescription = (title: string, fabric: string, color: string, work: string, category: string): string => {
  const descriptions: Record<string, string[]> = {
    lehengas: [
      `Experience the grandeur of traditional craftsmanship with this exquisite ${color} ${fabric} lehenga. Meticulously handcrafted with ${work}, this piece embodies the timeless elegance that defines bridal luxury.`,
      `Step into your fairy tale with this breathtaking ${color} lehenga crafted from premium ${fabric}. The intricate ${work} has been executed by master artisans, creating a masterpiece worthy of your most special moments.`
    ],
    sarees: [
      `Drape yourself in pure elegance with this stunning ${color} ${fabric} saree. The exquisite ${work} speaks to centuries of weaving tradition, perfect for the woman who appreciates timeless sophistication.`,
      `Embrace the poetry of Indian textiles with this magnificent ${color} saree. Woven from the finest ${fabric} and adorned with ${work}, it represents the pinnacle of artisanal excellence.`
    ],
    suits: [
      `Elevate your ethnic wardrobe with this graceful ${color} ${fabric} suit. The beautiful ${work} adds dimension and character, making it perfect for celebrations and special occasions.`,
      `Discover contemporary elegance in this refined ${color} suit crafted from premium ${fabric}. The ${work} creates an enchanting visual narrative that celebrates traditional artistry.`
    ],
    menswear: [
      `Make a distinguished impression with this sophisticated ${color} ${fabric} ensemble. The ${work} adds refined elegance, perfect for weddings and formal celebrations.`,
      `Command attention with this impeccably crafted ${color} kurta set. The premium ${fabric} and ${work} combine to create a look of distinguished elegance.`
    ]
  };
  
  const categoryDescriptions = descriptions[category] || descriptions.lehengas;
  return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
};

// Brand names to filter out
const BRAND_NAMES = [
  'jimmy choo', 'alizeh', 'aarohi', 'suhani', 'mariyam', 'kanchan', 
  'heeraman', 'tyohaar', 'haseena', 'kavita', 'gobuni', 'sakshi',
  'shalini', 'verona', 'fendy', 'giraffe', 'shruti'
];

// Clean title by removing brand names and codes
const cleanTitle = (title: string): string => {
  let cleaned = title;
  BRAND_NAMES.forEach(brand => {
    const regex = new RegExp(brand, 'gi');
    cleaned = cleaned.replace(regex, '');
  });
  // Remove product codes, volume numbers, etc.
  cleaned = cleaned.replace(/vol\.?\s*\d+/gi, '');
  cleaned = cleaned.replace(/\d{4,}/g, '');
  cleaned = cleaned.replace(/\([^)]*\)/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
};

// Generate boutique-style title
const generateBoutiqueTitle = (fabric: string, color: string, work: string, category: string): string => {
  const cleanFabric = cleanTitle(fabric);
  const cleanColor = cleanTitle(color);
  
  const categoryNames: Record<string, string> = {
    lehengas: 'Bridal Lehenga',
    sarees: 'Designer Saree', 
    suits: 'Embroidered Ensemble',
    menswear: 'Kurta Set'
  };
  
  const categoryName = categoryNames[category] || 'Designer Piece';
  
  // Create elegant title without brand names
  if (work && work !== 'Handwork') {
    return `${cleanColor} ${cleanFabric} ${work} ${categoryName}`;
  }
  return `${cleanColor} ${cleanFabric} ${categoryName}`;
};

// Extract product info from image URL (more reliable than title for scraped content)
const extractFromImageUrl = (imageUrl: string, category: string): { title: string; fabric: string; color: string; work: string; skip: boolean } => {
  const filename = imageUrl.split('/').pop() || '';
  
  // Check if this product should be skipped (wrong category in URL)
  // Use negative matching - skip products that clearly belong to other categories
  const skipPatterns: Record<string, string[]> = {
    sarees: ['Lehenga', 'Kurta', 'Pyjama', 'Sherwani'],
    lehengas: ['Saree', 'Kurta', 'Pyjama', 'Sherwani'],
    suits: ['Saree', 'Lehenga', 'Kurta', 'Pyjama', 'Sherwani'],
    menswear: ['Saree', 'Lehenga', 'Anarkali', 'Gown', 'Sharara']
  };
  
  const patterns = skipPatterns[category] || [];
  const shouldSkip = patterns.some(pattern => filename.includes(pattern));
  
  if (shouldSkip) {
    return { title: '', fabric: '', color: '', work: '', skip: true };
  }
  
  // Extract color from filename
  const colorPatterns = [
    'Navy-Blue', 'Wine', 'Black', 'Pink', 'Red', 'Green', 'Blue', 'Purple', 
    'Maroon', 'Beige', 'White', 'Gold', 'Peach', 'Rani', 'Cherry', 'Burgundy', 
    'Violet', 'Sea-Green', 'Off-White', 'Sky-Blue', 'Dusty-Pink', 'Coral', 'Sage',
    'Mint', 'Lavender', 'Teal', 'Orange', 'Cream', 'Rose', 'Ivory', 'Mustard',
    'Champagne', 'Turquoise', 'Emerald', 'Light-Blue', 'Multi-Color', 'Multi'
  ];
  
  let color = 'Multi';
  for (const c of colorPatterns) {
    if (filename.includes(c)) {
      color = c.replace(/-/g, ' ');
      break;
    }
  }
  
  // Extract fabric from filename
  const fabricPatterns = [
    'Net', 'Silk', 'Georgette', 'Chiffon', 'Cotton', 'Velvet', 'Satin', 
    'Organza', 'Crepe', 'Jacquard', 'Chinnon', 'Viscose', 'Vichitra',
    'Khadi', 'Tissue', 'Banarasi', 'Kanjivaram'
  ];
  
  let fabric = 'Premium Silk';
  for (const f of fabricPatterns) {
    if (filename.includes(f)) {
      fabric = f;
      break;
    }
  }
  
  // Extract work type from filename
  const workPatterns = [
    'Zari', 'Sequins', 'Embroidery', 'Heavy-Work', 'Thread', 'Kundan', 
    'Zardozi', 'Resham', 'Weaving', 'Woven', 'Mirror', 'Stone', 
    'Digital-Print', 'Brocade', 'Print'
  ];
  
  let work = 'Handwork';
  for (const w of workPatterns) {
    if (filename.includes(w)) {
      work = w.replace(/-/g, ' ');
      break;
    }
  }
  
  // Generate boutique title from extracted info
  const title = generateBoutiqueTitle(fabric, color, work, category);
  
  return { title, fabric, color, work, skip: false };
};

// Parse product from scraped markdown
const parseProducts = (markdown: string, category: string, minPrice: number): ScrapedProduct[] => {
  const products: ScrapedProduct[] = [];
  
  // Match product patterns: image URL, title, prices
  const productRegex = /\[\!\[(.*?)\]\((https:\/\/kesimg\.b-cdn\.net[^\)]+)\).*?\\\\?\s*([^\\]+?)\\\\?\s*INR\s*(\d+)\s*INR\s*(\d+)/gs;
  
  let match;
  while ((match = productRegex.exec(markdown)) !== null) {
    const [, altText, imageUrl, titleRaw, currentPriceStr, originalPriceStr] = match;
    
    const currentPrice = parseInt(currentPriceStr, 10);
    const originalPrice = parseInt(originalPriceStr, 10);
    
    // Skip products below min price
    if (currentPrice < minPrice) continue;
    
    // Extract details from image URL (more reliable)
    const extracted = extractFromImageUrl(imageUrl, category);
    
    // Skip products that don't match the category
    if (extracted.skip) {
      console.log(`Skipping wrong category product: ${imageUrl.split('/').pop()}`);
      continue;
    }
    
    const { title: boutiqueTitle, fabric, color, work } = extracted;
    
    // Generate source ID from image URL (unique per product)
    const imageHash = imageUrl.split('/').pop()?.replace(/\.[^.]+$/, '') || '';
    const sourceId = `${category}-${imageHash}`;
    
    // Generate multiple image URLs by looking for numbered variants
    // Many product images have variants like (1), (2), (3) etc
    const imageUrls: string[] = [imageUrl];
    const baseImageUrl = imageUrl.replace(/\(\d+\)\.(jpg|jpeg|png|webp)$/i, '');
    const ext = imageUrl.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '.jpg';
    
    // Add potential variant images (2), (3), (4)
    for (let i = 2; i <= 4; i++) {
      imageUrls.push(`${baseImageUrl}(${i})${ext}`);
    }
    
    products.push({
      source_id: sourceId,
      source_url: `https://www.wholesalesalwar.com/retail/${category}`,
      category,
      title: boutiqueTitle,
      description: generateDescription(boutiqueTitle, fabric, color, work, category),
      price_inr: currentPrice,
      price_usd: convertPrice(currentPrice),
      original_price_inr: originalPrice,
      original_price_usd: convertPrice(originalPrice),
      image_url: imageUrl,
      image_urls: imageUrls,
      fabric,
      color,
      work,
      occasion: category === 'lehengas' ? 'Bridal' : 'Festive',
      tags: ['new-arrival', category, color.toLowerCase(), fabric.toLowerCase(), work.toLowerCase()]
    });
  }
  
  return products;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting product sync...');
    
    let totalAdded = 0;
    let totalSkipped = 0;
    const errors: string[] = [];

    for (const { category, baseUrl, minPrice, pages } of CATEGORY_URLS) {
      console.log(`Scraping ${category} (${pages} pages)...`);
      
      let categoryProducts: ScrapedProduct[] = [];
      
      for (let page = 1; page <= pages; page++) {
        const url = page === 1 ? baseUrl : `${baseUrl}?page=${page}`;
        console.log(`  Page ${page}: ${url}`);
        
        try {
          // Scrape the page using Firecrawl
          const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${firecrawlApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url,
              formats: ['markdown'],
              onlyMainContent: true,
            }),
          });

          if (!response.ok) {
            console.error(`Failed to scrape ${category} page ${page}: ${response.status}`);
            continue;
          }

          const data = await response.json();
          const markdown = data.data?.markdown || data.markdown || '';
          
          if (!markdown) {
            console.log(`  No content on page ${page}, stopping pagination`);
            break;
          }

          // Parse products from markdown
          const products = parseProducts(markdown, category, minPrice);
          console.log(`  Found ${products.length} products on page ${page}`);
          
          if (products.length === 0) {
            console.log(`  No products above ${minPrice} INR on page ${page}, stopping pagination`);
            break;
          }
          
          categoryProducts = categoryProducts.concat(products);
          
          // Small delay between pages to be nice to the server
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (pageError) {
          console.error(`Error scraping page ${page}:`, pageError);
          continue;
        }
      }
      
      console.log(`Found ${categoryProducts.length} total products for ${category} above ${minPrice} INR`);

      // Insert products (upsert to avoid duplicates)
      for (const product of categoryProducts) {
        const { error } = await supabase
          .from('scraped_products')
          .upsert(product, { onConflict: 'source_id' });

        if (error) {
          console.error(`Error inserting product: ${error.message}`);
          totalSkipped++;
        } else {
          totalAdded++;
        }
      }
    }

    // Clean up old products (older than 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const { data: deletedProducts, error: deleteError } = await supabase
      .from('scraped_products')
      .delete()
      .lt('created_at', fourWeeksAgo.toISOString())
      .select('id');

    const deletedCount = deletedProducts?.length || 0;
    
    if (deleteError) {
      console.error('Error deleting old products:', deleteError);
      errors.push(`Error deleting old products: ${deleteError.message}`);
    } else {
      console.log(`Deleted ${deletedCount} products older than 4 weeks`);
    }

    console.log(`Sync complete: ${totalAdded} added, ${totalSkipped} skipped, ${deletedCount} deleted`);

    // Automatically sync ALL products to Shopify (reset + re-sync for SEO updates)
    let shopifySynced = 0;
    let shopifyFailed = 0;
    
    try {
      console.log('Auto-syncing ALL products to Shopify with SEO updates...');
      
      const syncResponse = await fetch(`${supabaseUrl}/functions/v1/sync-to-shopify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          resetSync: true,  // Always reset to update all products with latest SEO
          limit: 200 
        }),
      });
      
      if (syncResponse.ok) {
        const syncData = await syncResponse.json();
        shopifySynced = syncData.synced || 0;
        shopifyFailed = syncData.failed || 0;
        console.log(`Shopify sync: ${shopifySynced} synced, ${shopifyFailed} failed`);
      } else {
        const errorText = await syncResponse.text();
        console.error('Failed to auto-sync to Shopify:', errorText);
        errors.push(`Shopify sync failed: ${errorText}`);
      }
    } catch (shopifyError) {
      console.error('Error auto-syncing to Shopify:', shopifyError);
      errors.push(`Shopify sync error: ${shopifyError instanceof Error ? shopifyError.message : 'Unknown'}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        added: totalAdded,
        skipped: totalSkipped,
        deleted: deletedCount,
        shopifySynced,
        shopifyFailed,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in sync-products:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});