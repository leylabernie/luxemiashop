import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  fabric: string;
  color: string;
  work: string;
  occasion: string;
  tags: string[];
}

// Category URLs with min price filters
const CATEGORY_URLS = [
  { 
    category: 'lehengas', 
    url: 'https://www.wholesalesalwar.com/retail/bridal-lehenga-choli',
    minPrice: 4000 
  },
  { 
    category: 'suits', 
    url: 'https://www.wholesalesalwar.com/retail/salwar-kameez',
    minPrice: 3000 
  },
  { 
    category: 'sarees', 
    url: 'https://www.wholesalesalwar.com/retail/saree',
    minPrice: 1200 
  },
  { 
    category: 'menswear', 
    url: 'https://www.wholesalesalwar.com/retail/mens-kurta-pyjama',
    minPrice: 1200 
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
    
    // Extract details from title
    const title = titleRaw.trim();
    
    // Parse fabric, color, work from title
    const fabricMatch = title.match(/(Net|Silk|Georgette|Chiffon|Cotton|Velvet|Satin|Organza|Crepe|Jacquard|Chinnon|Viscose|Jimmy Choo|Vichitra)/i);
    const colorMatch = title.match(/(Navy Blue|Wine|Black|Pink|Red|Green|Blue|Purple|Maroon|Beige|White|Gold|Peach|Rani|Rama|Cherry|Burgundy|Violet|Sea Green|Off White|Sky Blue|Dusty Pink|Coral|Sage)/i);
    const workMatch = title.match(/(Zari|Sequins|Embroidery|Heavy Work|Thread|Kundan|Zardozi|Resham)/gi);
    
    const fabric = fabricMatch ? fabricMatch[1] : 'Premium Fabric';
    const color = colorMatch ? colorMatch[1] : 'Multi';
    const work = workMatch ? workMatch.join(' & ') : 'Handwork';
    
    // Create boutique title
    const boutiqueTitle = `${color} ${fabric} ${category === 'lehengas' ? 'Bridal Lehenga' : category === 'sarees' ? 'Designer Saree' : category === 'suits' ? 'Embroidered Suit' : 'Kurta Set'}`;
    
    // Generate source ID from URL
    const sourceIdMatch = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
    const sourceId = `${category}-${sourceIdMatch}-${currentPrice}`;
    
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
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting product sync...');
    
    let totalAdded = 0;
    let totalSkipped = 0;
    const errors: string[] = [];

    for (const { category, url, minPrice } of CATEGORY_URLS) {
      console.log(`Scraping ${category} from ${url}...`);
      
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
          console.error(`Failed to scrape ${category}: ${response.status}`);
          errors.push(`Failed to scrape ${category}`);
          continue;
        }

        const data = await response.json();
        const markdown = data.data?.markdown || data.markdown || '';
        
        if (!markdown) {
          console.error(`No content returned for ${category}`);
          errors.push(`No content for ${category}`);
          continue;
        }

        // Parse products from markdown
        const products = parseProducts(markdown, category, minPrice);
        console.log(`Found ${products.length} products for ${category} above ${minPrice} INR`);

        // Insert new products (upsert to avoid duplicates)
        for (const product of products) {
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
      } catch (categoryError) {
        const errorMessage = categoryError instanceof Error ? categoryError.message : 'Unknown error';
        console.error(`Error processing ${category}:`, categoryError);
        errors.push(`Error processing ${category}: ${errorMessage}`);
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        added: totalAdded,
        skipped: totalSkipped,
        deleted: deletedCount,
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