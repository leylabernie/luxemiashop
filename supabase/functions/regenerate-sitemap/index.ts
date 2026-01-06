import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Static pages configuration
const staticPages = [
  { loc: '/', changefreq: 'daily', priority: '1.0', title: 'Home' },
  { loc: '/collections', changefreq: 'daily', priority: '0.9', title: 'Collections' },
  { loc: '/lehengas', changefreq: 'daily', priority: '0.9', title: 'Lehengas' },
  { loc: '/sarees', changefreq: 'daily', priority: '0.9', title: 'Sarees' },
  { loc: '/suits', changefreq: 'daily', priority: '0.9', title: 'Suits' },
  { loc: '/menswear', changefreq: 'daily', priority: '0.9', title: 'Menswear' },
  { loc: '/jewelry', changefreq: 'daily', priority: '0.9', title: 'Jewelry' },
  { loc: '/lookbook', changefreq: 'weekly', priority: '0.7', title: 'Lookbook' },
  { loc: '/brand-story', changefreq: 'monthly', priority: '0.6', title: 'Brand Story' },
  { loc: '/collections/wedding-sarees', changefreq: 'weekly', priority: '0.8', title: 'Wedding Sarees' },
  { loc: '/collections/bridal-lehengas', changefreq: 'weekly', priority: '0.8', title: 'Bridal Lehengas' },
  { loc: '/collections/reception-outfits', changefreq: 'weekly', priority: '0.8', title: 'Reception Outfits' },
  { loc: '/collections/festive-wear', changefreq: 'weekly', priority: '0.8', title: 'Festive Wear' },
  { loc: '/artisans', changefreq: 'monthly', priority: '0.6', title: 'Artisans' },
  { loc: '/sustainability', changefreq: 'monthly', priority: '0.6', title: 'Sustainability' },
  { loc: '/virtual-tryon', changefreq: 'monthly', priority: '0.7', title: 'Virtual Try-On' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.5', title: 'Contact' },
  { loc: '/faq', changefreq: 'monthly', priority: '0.5', title: 'FAQ' },
  { loc: '/shipping', changefreq: 'monthly', priority: '0.4', title: 'Shipping' },
  { loc: '/returns', changefreq: 'monthly', priority: '0.4', title: 'Returns' },
  { loc: '/size-guide', changefreq: 'monthly', priority: '0.5', title: 'Size Guide' },
  { loc: '/care-guide', changefreq: 'monthly', priority: '0.5', title: 'Care Guide' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3', title: 'Privacy' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3', title: 'Terms' },
  { loc: '/sitemap', changefreq: 'weekly', priority: '0.4', title: 'Sitemap' },
]

// Local products from static data files
const localProductsData = [
  { handle: 'ethereal-pastel-pink-bridal-lehenga', title: 'Ethereal Pastel Pink Bridal Lehenga', category: 'lehengas', image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59570/Pastel-Pink-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10243(1).jpg' },
  { handle: 'royal-rani-pink-silk-bridal-lehenga', title: 'Royal Rani Pink Silk Bridal Lehenga', category: 'lehengas', image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59645/Rani-Pink-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-A(1).jpg' },
  { handle: 'classic-bridal-red-silk-lehenga', title: 'Classic Bridal Red Silk Lehenga', category: 'lehengas', image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59645/Red-Silk-Bridal-Wear-Heavy-Work-Bridal-Lehenga-Choli-2946-2946-B(1).jpg' },
  { handle: 'ivory-dreamscape-net-bridal-lehenga', title: 'Ivory Dreamscape Net Bridal Lehenga', category: 'lehengas', image: 'https://kesimg.b-cdn.net/images/650/2025y/December/59644/White-Heavy-Net-Bridal-Wear-Sequins-Embroidery-Work-Bridal-Lehenga-Choli-2941-2941(1).jpg' },
  { handle: 'grey-art-silk-groom-sherwani', title: 'Grey Art Silk Groom Sherwani', category: 'menswear', image: 'https://kesimg.b-cdn.net/images/650/2025y/October/59064/Grey-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4032(1).jpg' },
  { handle: 'purple-art-silk-groom-sherwani', title: 'Purple Art Silk Groom Sherwani', category: 'menswear', image: 'https://kesimg.b-cdn.net/images/650/2025y/October/59064/Purple-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4031(1).jpg' },
  { handle: 'teal-green-chinnon-silk-sharara-set', title: 'Teal Green Chinnon Silk Sharara Set', category: 'suits', image: '' },
  { handle: 'rust-orange-chinnon-silk-sharara-set', title: 'Rust Orange Chinnon Silk Sharara Set', category: 'suits', image: '' },
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
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

function generateImageTags(imageUrl: string, title: string): string {
  if (!imageUrl || imageUrl.startsWith('/') || !imageUrl.startsWith('http')) {
    return ''
  }
  return `
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:title>${escapeXml(title)}</image:title>
    </image:image>`
}

function generateProductHandle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Require admin authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has admin role
    const { data: roleData } = await authClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (!roleData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Starting sitemap regeneration...')

    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const baseUrl = 'https://www.luxemia.shop'
    const today = formatDate(new Date())

    // Fetch all active products from database
    const { data: scrapedProducts, error: fetchError } = await supabase
      .from('scraped_products')
      .select('title, category, image_url, image_urls, updated_at')
      .eq('is_active', true)
      .order('category')
      .order('title')

    if (fetchError) {
      console.error('Error fetching products:', fetchError)
      throw new Error(`Failed to fetch products: ${fetchError.message}`)
    }

    console.log(`Fetched ${scrapedProducts?.length || 0} products from database`)

    // Generate sitemap XML
    let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`

    // Add static pages
    for (const page of staticPages) {
      sitemapXml += `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
    }

    // Add local products
    for (const product of localProductsData) {
      const imageTag = product.image ? generateImageTags(product.image, product.title) : ''
      sitemapXml += `  <url>
    <loc>${baseUrl}/product/${product.handle}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>${imageTag}
  </url>
`
    }

    // Add scraped products from database
    if (scrapedProducts && scrapedProducts.length > 0) {
      for (const product of scrapedProducts) {
        const handle = generateProductHandle(product.title)
        const lastmod = product.updated_at ? formatDate(product.updated_at) : today
        const imageUrl = product.image_url || (product.image_urls && product.image_urls[0]) || ''
        const imageTag = imageUrl ? generateImageTags(imageUrl, product.title) : ''

        sitemapXml += `  <url>
    <loc>${baseUrl}/product/${handle}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>${imageTag}
  </url>
`
      }
    }

    sitemapXml += '</urlset>'

    const productCount = (scrapedProducts?.length || 0) + localProductsData.length
    const pageCount = staticPages.length

    console.log(`Generated sitemap with ${productCount} products and ${pageCount} pages`)

    // Update cache in database
    const { error: updateError } = await supabase
      .from('sitemap_cache')
      .update({
        sitemap_xml: sitemapXml,
        product_count: productCount,
        page_count: pageCount,
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .not('id', 'is', null) // Update all rows (should be just one)

    if (updateError) {
      console.error('Error updating cache:', updateError)
      // If update fails (no rows), try insert
      const { error: insertError } = await supabase
        .from('sitemap_cache')
        .insert({
          sitemap_xml: sitemapXml,
          product_count: productCount,
          page_count: pageCount,
        })

      if (insertError) {
        console.error('Error inserting cache:', insertError)
        throw new Error(`Failed to save sitemap: ${insertError.message}`)
      }
    }

    console.log('Sitemap regeneration complete!')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sitemap regenerated successfully',
        stats: {
          products: productCount,
          pages: pageCount,
          generatedAt: new Date().toISOString(),
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Sitemap regeneration failed:', errorMessage)
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})