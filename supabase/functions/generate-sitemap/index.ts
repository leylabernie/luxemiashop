import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapedProduct {
  id: string
  source_id: string
  title: string
  category: string
  image_url: string
  image_urls: string[] | null
  is_active: boolean
  updated_at: string
}

// Static pages configuration
const staticPages = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/collections', changefreq: 'daily', priority: '0.9' },
  { loc: '/lookbook', changefreq: 'weekly', priority: '0.7' },
  { loc: '/brand-story', changefreq: 'monthly', priority: '0.6' },
  { loc: '/lehengas', changefreq: 'daily', priority: '0.9' },
  { loc: '/sarees', changefreq: 'daily', priority: '0.9' },
  { loc: '/suits', changefreq: 'daily', priority: '0.9' },
  { loc: '/menswear', changefreq: 'daily', priority: '0.9' },
  { loc: '/jewelry', changefreq: 'daily', priority: '0.9' },
  { loc: '/new-arrivals', changefreq: 'daily', priority: '0.8' },
  { loc: '/collections/wedding-sarees', changefreq: 'weekly', priority: '0.8' },
  { loc: '/collections/bridal-lehengas', changefreq: 'weekly', priority: '0.8' },
  { loc: '/collections/reception-outfits', changefreq: 'weekly', priority: '0.8' },
  { loc: '/collections/festive-wear', changefreq: 'weekly', priority: '0.8' },
  { loc: '/artisans', changefreq: 'monthly', priority: '0.6' },
  { loc: '/sustainability', changefreq: 'monthly', priority: '0.6' },
  { loc: '/virtual-tryon', changefreq: 'monthly', priority: '0.7' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
  { loc: '/faq', changefreq: 'monthly', priority: '0.5' },
  { loc: '/shipping', changefreq: 'monthly', priority: '0.4' },
  { loc: '/returns', changefreq: 'monthly', priority: '0.4' },
  { loc: '/size-guide', changefreq: 'monthly', priority: '0.5' },
  { loc: '/care-guide', changefreq: 'monthly', priority: '0.5' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
  { loc: '/sitemap', changefreq: 'weekly', priority: '0.4' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.6' },
  { loc: '/press', changefreq: 'monthly', priority: '0.5' },
]

// Local products from the data files (handles and images)
const localProductsData = [
  // Bridal Lehengas
  { handle: 'ethereal-pastel-pink-bridal-lehenga', title: 'Ethereal Pastel Pink Bridal Lehenga', image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59570/Pastel-Pink-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10243(1).jpg', category: 'Bridal Lehengas' },
  { handle: 'royal-rani-pink-silk-bridal-lehenga', title: 'Royal Rani Pink Silk Bridal Lehenga', image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59645/Rani-Pink-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-A(1).jpg', category: 'Bridal Lehengas' },
  { handle: 'classic-bridal-red-silk-lehenga', title: 'Classic Bridal Red Silk Lehenga', image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59645/Red-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-B(1).jpg', category: 'Bridal Lehengas' },
  { handle: 'ivory-dreamscape-net-bridal-lehenga', title: 'Ivory Dreamscape Net Bridal Lehenga', image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59644/White-Heavy-Net-Bridal-Wear-Sequins-Embroidery-Work-Bridal-Lehenga-Choli-2941-2941(1).jpg', category: 'Bridal Lehengas' },
  { handle: 'lavender-mist-bridal-lehenga', title: 'Lavender Mist Bridal Lehenga', image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59570/Lavender-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10242(1).jpg', category: 'Bridal Lehengas' },
  { handle: 'metallic-silver-celebration-lehenga', title: 'Metallic Silver Celebration Lehenga', image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59570/Metalic-Silver-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10245(1).jpg', category: 'Bridal Lehengas' },
  // Wedding Lehengas
  { handle: 'burgundy-velvet-wedding-lehenga', title: 'Burgundy Velvet Wedding Lehenga', image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59625/Burgundy-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-A(1).jpg', category: 'Wedding Lehengas' },
  { handle: 'wine-romance-net-lehenga', title: 'Wine Romance Net Lehenga', image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59625/Wine-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-B(1).jpg', category: 'Wedding Lehengas' },
  { handle: 'emerald-forest-wedding-lehenga', title: 'Emerald Forest Wedding Lehenga', image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59625/Green-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-C(1).jpg', category: 'Wedding Lehengas' },
  { handle: 'royal-blue-celebration-lehenga', title: 'Royal Blue Celebration Lehenga', image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59625/Blue-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-D(1).jpg', category: 'Wedding Lehengas' },
  { handle: 'coral-sunset-net-lehenga', title: 'Coral Sunset Net Lehenga', image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59625/Coral-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-E(1).jpg', category: 'Wedding Lehengas' },
  { handle: 'powder-pink-wedding-lehenga', title: 'Powder Pink Wedding Lehenga', image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59625/Pink-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-F(1).jpg', category: 'Wedding Lehengas' },
]

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

function generateImageTags(images: string[], title: string, category: string): string {
  if (!images || images.length === 0) return ''
  
  return images.map(imageUrl => `
      <image:image>
        <image:loc>${escapeXml(imageUrl)}</image:loc>
        <image:title>${escapeXml(title)}</image:title>
        <image:caption>${escapeXml(`${title} - ${category} | Luxemia`)}</image:caption>
      </image:image>`).join('')
}

function generateProductUrl(
  baseUrl: string, 
  handle: string, 
  title: string, 
  images: string[], 
  category: string,
  lastmod?: string
): string {
  const imageTags = generateImageTags(images, title, category)
  const lastmodTag = lastmod ? `\n    <lastmod>${formatDate(lastmod)}</lastmod>` : ''
  
  return `
  <url>
    <loc>${baseUrl}/product/${escapeXml(handle)}</loc>${lastmodTag}
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>${imageTags}
  </url>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const baseUrl = 'https://luxemia.com'
    const today = formatDate(new Date())

    // Fetch scraped products from database
    const { data: scrapedProducts, error } = await supabase
      .from('scraped_products')
      .select('id, source_id, title, category, image_url, image_urls, is_active, updated_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
    }

    // Generate static pages XML
    const staticPagesXml = staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')

    // Generate local products XML with images
    const localProductsXml = localProductsData.map(product => 
      generateProductUrl(
        baseUrl, 
        product.handle, 
        product.title, 
        [product.image], 
        product.category,
        today
      )
    ).join('')

    // Generate scraped products XML with images
    const scrapedProductsXml = (scrapedProducts || []).map((product: ScrapedProduct) => {
      const images = product.image_urls && product.image_urls.length > 0 
        ? product.image_urls 
        : [product.image_url]
      
      return generateProductUrl(
        baseUrl,
        product.source_id,
        product.title,
        images,
        product.category,
        product.updated_at
      )
    }).join('')

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticPagesXml}
${localProductsXml}
${scrapedProductsXml}
</urlset>`

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
