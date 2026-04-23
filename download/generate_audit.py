import sys, os

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    PageBreak, KeepTogether, CondPageBreak
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ━━ Color Palette (auto-generated) ━━
ACCENT       = colors.HexColor('#5430c0')
TEXT_PRIMARY  = colors.HexColor('#191a1c')
TEXT_MUTED    = colors.HexColor('#848a90')
BG_SURFACE   = colors.HexColor('#d6dade')
BG_PAGE      = colors.HexColor('#eff1f2')

TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = BG_SURFACE

# Register fonts
pdfmetrics.registerFont(TTFont('LiberationSerif', '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSerif-Bold', '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Carlito-Bold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('LiberationSerif', normal='LiberationSerif', bold='LiberationSerif-Bold')
registerFontFamily('Carlito', normal='Carlito', bold='Carlito-Bold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

# ── Page Setup ──
PAGE_W, PAGE_H = A4
LEFT_MARGIN = 1.0 * inch
RIGHT_MARGIN = 1.0 * inch
TOP_MARGIN = 0.8 * inch
BOTTOM_MARGIN = 0.8 * inch
AVAILABLE_W = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN

# ── Styles ──
styles = getSampleStyleSheet()

h1_style = ParagraphStyle(
    'H1Custom', fontName='LiberationSerif', fontSize=20, leading=26,
    textColor=ACCENT, spaceBefore=18, spaceAfter=10, alignment=TA_LEFT
)
h2_style = ParagraphStyle(
    'H2Custom', fontName='LiberationSerif', fontSize=15, leading=20,
    textColor=TEXT_PRIMARY, spaceBefore=14, spaceAfter=8, alignment=TA_LEFT
)
h3_style = ParagraphStyle(
    'H3Custom', fontName='LiberationSerif', fontSize=12, leading=16,
    textColor=ACCENT, spaceBefore=10, spaceAfter=6, alignment=TA_LEFT
)
body_style = ParagraphStyle(
    'BodyCustom', fontName='LiberationSerif', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, spaceBefore=0, spaceAfter=6, alignment=TA_JUSTIFY
)
bullet_style = ParagraphStyle(
    'BulletCustom', fontName='LiberationSerif', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, spaceBefore=2, spaceAfter=4, alignment=TA_LEFT,
    leftIndent=20, bulletIndent=8, bulletFontSize=10.5
)
caption_style = ParagraphStyle(
    'CaptionCustom', fontName='LiberationSerif', fontSize=9, leading=13,
    textColor=TEXT_MUTED, spaceBefore=3, spaceAfter=6, alignment=TA_CENTER
)
header_cell_style = ParagraphStyle(
    'HeaderCell', fontName='LiberationSerif', fontSize=10, leading=14,
    textColor=colors.white, alignment=TA_CENTER
)
cell_style = ParagraphStyle(
    'CellStyle', fontName='LiberationSerif', fontSize=9.5, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK'
)
cell_center = ParagraphStyle(
    'CellCenter', fontName='LiberationSerif', fontSize=9.5, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER
)
callout_style = ParagraphStyle(
    'Callout', fontName='LiberationSerif', fontSize=11, leading=18,
    textColor=ACCENT, spaceBefore=6, spaceAfter=6, alignment=TA_LEFT,
    leftIndent=24, borderColor=ACCENT, borderWidth=2, borderPadding=8,
    backColor=colors.HexColor('#f3f0fa')
)

# ── Helper functions ──
def H1(text):
    return Paragraph(f'<b>{text}</b>', h1_style)

def H2(text):
    return Paragraph(f'<b>{text}</b>', h2_style)

def H3(text):
    return Paragraph(f'<b>{text}</b>', h3_style)

def P(text):
    return Paragraph(text, body_style)

def B(text):
    return Paragraph(text, bullet_style)

def Callout(text):
    return Paragraph(text, callout_style)

def make_table(headers, rows, col_ratios=None):
    """Create a styled table with headers and rows."""
    if col_ratios is None:
        col_ratios = [1.0 / len(headers)] * len(headers)
    col_widths = [r * AVAILABLE_W for r in col_ratios]
    
    data = [[Paragraph(f'<b>{h}</b>', header_cell_style) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), cell_style) for c in row])
    
    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

def severity_badge(sev):
    colors_map = {
        'CRITICAL': '#DC2626',
        'HIGH': '#EA580C', 
        'MEDIUM': '#D97706',
        'LOW': '#2563EB',
        'INFO': '#6B7280'
    }
    c = colors_map.get(sev, '#6B7280')
    return f'<font color="{c}"><b>[{sev}]</b></font>'

# ── Build Story ──
story = []

# ═══════════════════════════════════════════════════════
# SECTION 1: EXECUTIVE SUMMARY
# ═══════════════════════════════════════════════════════
story.append(H1('1. Executive Summary'))
story.append(Spacer(1, 6))

story.append(P(
    'This comprehensive audit evaluates luxemia.shop across seven critical dimensions: technical website architecture, '
    'search engine optimization (SEO), keyword strategy and metadata, backlink profile, Google/Bing/AI search visibility, '
    'Indian ethnic wear market positioning, and cultural resonance with the target NRI (Non-Resident Indian) audience. '
    'The audit was conducted on April 23, 2026, using live website scraping, search engine result analysis, competitive '
    'intelligence gathering, and cultural market expertise. The findings reveal a site with strong foundational SEO '
    'elements but significant gaps in indexation, backlink authority, keyword competitiveness, and cultural depth that '
    'are limiting its ability to rank and convert in the highly competitive Indian ethnic wear e-commerce space.'
))
story.append(Spacer(1, 6))

story.append(P(
    '<b>Overall Score: 42/100</b> - The site has a solid technical foundation with well-implemented structured data, '
    'meta tags, and schema markup, but critically lacks the off-page authority, content depth, indexation volume, and '
    'cultural specificity needed to compete with established players like Kalki Fashion, Aza Fashions, Utsav Fashion, '
    'and Andaaz Fashion who dominate the "buy Indian ethnic wear online USA" search landscape.'
))

story.append(Spacer(1, 12))
story.append(make_table(
    ['Audit Dimension', 'Score', 'Status'],
    [
        ['Technical Architecture', '68/100', 'Fair - Good foundation, critical canonical bug'],
        ['On-Page SEO & Meta Data', '55/100', 'Needs Work - Duplicate descriptions, generic keywords'],
        ['Keyword Strategy', '30/100', 'Weak - No long-tail targeting, missing ceremony keywords'],
        ['Backlink Profile', '5/100', 'Critical - Zero detected external backlinks'],
        ['Google/Bing Indexation', '25/100', 'Critical - Only ~4 pages indexed'],
        ['AI Search Optimization', '45/100', 'Below Average - Good FAQ schema, thin content depth'],
        ['Indian Cultural Positioning', '40/100', 'Weak - Missing ceremony-specific, regional depth'],
    ],
    [0.45, 0.15, 0.40]
))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 1: Audit Score Summary by Dimension', caption_style))

# ═══════════════════════════════════════════════════════
# SECTION 2: TECHNICAL ARCHITECTURE AUDIT
# ═══════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(H1('2. Technical Architecture Audit'))
story.append(Spacer(1, 6))

story.append(H2('2.1 Platform & Infrastructure'))
story.append(P(
    'LuxeMia.shop runs on a modern React-based SPA (Single Page Application) hosted on Vercel, connected to Shopify '
    'as the commerce backend via Shopify Storefront API. The site uses Supabase for additional data needs, TanStack Query '
    'for data fetching, and Framer Motion for animations. The CDN is served through Vercel Edge Network with Shopify CDN '
    'for product images (cdn.shopify.com). This architecture is technically sound for a headless commerce setup, but '
    'introduces SEO challenges typical of SPAs: client-side rendering can delay content availability for search bots, '
    'and the Lovable-to-GitHub-to-Vercel migration path may have left configuration artifacts.'
))

story.append(H2('2.2 Critical Technical Issues'))

story.append(H3(f'{severity_badge("CRITICAL")} Canonical URL Bug on Internal Pages'))
story.append(P(
    'The most damaging technical issue discovered is a canonical URL misconfiguration. On the /lehengas collection page, '
    'the initial HTML source contains <font color="#DC2626"><b>two canonical tags</b></font>: one pointing to the homepage '
    '(https://luxemia.shop/) and another correctly pointing to /lehengas. While React Helmet (data-rh="true") overrides '
    'with the correct canonical at runtime, the initial SSR HTML contains the homepage canonical. Google primarily processes '
    'the initial HTML response, which means Google may interpret the /lehengas page as a duplicate of the homepage and '
    'either de-index it or consolidate all ranking signals to the homepage URL. This same pattern was observed on the blog '
    'post pages. This bug alone could explain the extremely low indexation count of only ~4 pages.'
))

story.append(H3(f'{severity_badge("HIGH")} Cache-Control: no-store Header'))
story.append(P(
    'The homepage includes <font color="#EA580C"><b>&lt;meta http-equiv="Cache-Control" content="no-store"&gt;</b></font>, '
    'which instructs browsers and CDNs never to cache the page. This significantly impacts page load performance for returning '
    'visitors and may also affect how efficiently Googlebot can crawl and process the site. In a headless Shopify setup, the '
    'product content does not change frequently enough to warrant a complete no-store policy. A more balanced approach would '
    'use cache with revalidation (stale-while-revalidate), improving Core Web Vitals scores and crawl efficiency.'
))

story.append(H3(f'{severity_badge("MEDIUM")} Duplicate Meta Descriptions Across Pages'))
story.append(P(
    'The initial SSR HTML for internal pages (lehengas, blog posts) uses the same generic meta description as the homepage: '
    '"Shop luxury Indian ethnic wear at LuxeMia. Designer lehengas, silk sarees, salwar suits and more. Free shipping to '
    'USA and UK. Authentic Indian craftsmanship." While React Helmet injects page-specific descriptions at runtime, search '
    'engines often use the initial HTML response for snippet generation. Each page should have a unique, keyword-rich '
    'description in the initial server response to maximize click-through rates from search results and avoid being seen '
    'as duplicate content.'
))

story.append(H2('2.3 Positive Technical Elements'))
story.append(P(
    'Despite the issues above, the site has several well-implemented technical elements that form a strong foundation. '
    'Google Analytics (G-D1NN0TC3Y0) is properly installed, Google Search Console verification is in place '
    '(YkBw01UrNiQIlBg0FzSt7XjnWbNuMmbC4ux8eJGBEjY), the site uses proper hreflang-compatible lang="en" attribute, '
    'preconnect hints for Google Fonts are configured, and the URL structure is clean and semantic (/lehengas, /sarees, '
    '/suits, /menswear, /jewelry, /indowestern). The Playfair Display and Lora font pairing gives the site a luxury '
    'editorial feel appropriate for the brand positioning.'
))

# ═══════════════════════════════════════════════════════
# SECTION 3: SEO & META DATA ANALYSIS
# ═══════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(H1('3. SEO & Meta Data Analysis'))
story.append(Spacer(1, 6))

story.append(H2('3.1 Title Tags'))
story.append(P(
    'The title tags are reasonably well-crafted with primary keywords included. The homepage title "LuxeMia: Luxury Indian '
    'Ethnic Wear Online | Shop Bridal Lehengas & Wedding Sarees" is 70 characters, within the recommended 50-60 character '
    'range for full display in SERPs (slightly over). The lehengas page title "Lehengas: Designer Bridal & Wedding Lehengas '
    'Online | LuxeMia" follows a good category-first pattern. The blog post title "Indian Wedding Dress Guide 2026: Bridal '
    'Lehenga vs Saree (Expert Tips) | LuxeMia Blog" includes year and comparison keywords, which is excellent for capturing '
    'informational search intent. However, several improvements are needed: titles should include "USA" or "Free Shipping" '
    'for geographic targeting, and the brand name could be shortened to fit more keyword space.'
))

story.append(H2('3.2 Meta Keywords (Deprecated but Still Used)'))
story.append(P(
    'The meta keywords tag is identical across all pages: "indian ethnic wear, sarees online, designer lehengas, bridal '
    'lehenga, wedding sarees, anarkali suits, banarasi silk, luxury ethnic wear, indian wedding dress, buy sarees online, '
    'designer salwar kameez." While Google officially ignores meta keywords, Bing still references them as a signal. The '
    'problem is that every page uses the same generic set rather than page-specific keywords. The /lehengas page should '
    'focus on lehenga-specific terms (bridal lehenga online, designer lehenga choli, wedding lehenga USA), the /sarees '
    'page on saree-specific terms, and so on. This is a missed opportunity for Bing optimization.'
))

story.append(H2('3.3 Structured Data (Schema.org)'))
story.append(P(
    'The site implements an impressive array of structured data types, which is one of its strongest SEO assets. The '
    'homepage includes Organization, WebSite (with SearchAction), FAQPage, and ClothingStore schemas. The /lehengas page '
    'adds BreadcrumbList, a page-specific FAQPage, and ItemList with Product schemas including prices and availability. '
    'The blog post includes Article schema with author, datePublished, and dateModified. This rich structured data makes '
    'the site eligible for rich snippets, FAQ expandable results, and product listing enhancements in Google.'
))
story.append(Spacer(1, 6))
story.append(P(
    'However, there are inconsistencies in the structured data: the Organization schema appears in multiple conflicting '
    'versions across the same page (the initial SSR version lists sameAs as @luxemiashop while the React Helmet version '
    'lists @luxemia). The logo URL switches between /logo.png and /favicon.ico. These inconsistencies can confuse search '
    'engines and dilute the entity signals. A single, canonical Organization schema should be used consistently.'
))

story.append(H2('3.4 Open Graph & Twitter Cards'))
story.append(P(
    'Open Graph and Twitter Card meta tags are properly implemented on all audited pages. The homepage uses og:type="website" '
    'while the /lehengas page correctly uses og:type="collection". Blog posts should use og:type="article" (currently set to '
    'website). The og:image references exist but should be verified to ensure the images actually exist at those URLs '
    '(/og-image.jpg and /og/og-lehengas.jpg). Missing or broken OG images severely reduce social sharing click-through rates.'
))

# ═══════════════════════════════════════════════════════
# SECTION 4: KEYWORD & RANKING ANALYSIS
# ═══════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(H1('4. Keyword & Ranking Analysis'))
story.append(Spacer(1, 6))

story.append(H2('4.1 Current Keyword Visibility'))
story.append(P(
    'Based on our search analysis, LuxeMia.shop ranks only for its exact brand name "luxemia.shop" and the site: operator '
    'query. The site does NOT appear in the top 100 results for any of its target keywords including "indian ethnic wear," '
    '"buy sarees online USA," "bridal lehenga online," "designer lehenga choli," or "indian wedding dress." This is '
    'expected for a new domain with minimal backlink authority, but it highlights the enormous gap between current visibility '
    'and the commercial intent keywords that drive revenue in this niche.'
))

story.append(H2('4.2 Competitive Keyword Landscape'))
story.append(P(
    'The top 10 results for "buy indian ethnic wear online USA" are dominated by established players with strong domain '
    'authority. Kalki Fashion (kalkifashion.com), Aza Fashions (azafashions.com), Utsav Fashion (utsavfashion.com), and '
    'Lashkaraa (lashkaraa.com) all occupy the first page. These competitors have thousands of indexed pages, extensive '
    'backlink profiles, and years of content marketing investment. Competing head-on with these keywords would require '
    'significant resources. Instead, LuxeMia should pursue a long-tail keyword strategy targeting underserved niche queries.'
))
story.append(Spacer(1, 6))

story.append(make_table(
    ['Keyword Category', 'Example Keywords', 'Difficulty', 'Priority'],
    [
        ['Bridal Ceremony Specific', 'mehendi outfit ideas, sangeet lehenga USA, haldi ceremony dress', 'Low-Med', 'HIGH'],
        ['Regional Textile', 'banarasi silk saree online, kanjeevaram bridal USA, patola lehenga', 'Medium', 'HIGH'],
        ['NRI Wedding', 'indian wedding shopping from USA, NRI bridal lehenga guide', 'Low', 'HIGH'],
        ['Budget + Category', 'bridal lehenga under $300, affordable indian wedding dress USA', 'Low', 'MEDIUM'],
        ['Occasion + Location', 'diwali outfit delivery USA, navratri chaniya choli online', 'Low-Med', 'MEDIUM'],
        ['Style Comparison', 'anarkali vs lehenga for wedding, saree vs lehenga for reception', 'Low', 'MEDIUM'],
        ['Head Terms', 'indian ethnic wear, buy sarees online, bridal lehenga', 'Very High', 'LOW'],
    ],
    [0.20, 0.38, 0.14, 0.14]
))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 2: Recommended Keyword Strategy by Category', caption_style))

story.append(H2('4.3 Missing Keyword Opportunities'))
story.append(P(
    'The site is entirely missing keywords related to specific Indian wedding ceremonies, which represent enormous search '
    'demand among NRIs. The Indian wedding involves multiple events (Mehendi, Sangeet, Haldi, Cocktail, Reception) each '
    'requiring different outfits. NRIs searching for "what to wear to mehendi ceremony" or "sangeet dance outfit ideas" '
    'have high purchase intent but find almost no relevant results from LuxeMia. Similarly, festival-specific keywords '
    '(Diwali outfit, Navratri chaniya choli, Karva Chauth dress, Eid ethnic wear) are entirely absent from the content '
    'strategy. Regional textile keywords (Banarasi, Kanjeevaram, Chanderi, Patola, Bandhani) that signal authenticity to '
    'knowledgeable Indian buyers are also missing from both product descriptions and blog content.'
))

# ═══════════════════════════════════════════════════════
# SECTION 5: BACKLINK PROFILE
# ═══════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(H1('5. Backlink Profile & Off-Page Authority'))
story.append(Spacer(1, 6))

story.append(H2('5.1 Current Backlink Status'))
story.append(Callout(
    '<b>CRITICAL FINDING:</b> LuxeMia.shop has ZERO detected backlinks from any external authoritative domain. '
    'No mentions were found on fashion blogs, Indian wedding planning sites, NRI community forums, social bookmarking '
    'sites, news outlets, or influencer profiles. This is the single biggest factor limiting search visibility.'
))

story.append(P(
    'Backlinks remain the most important ranking factor for Google, especially in competitive e-commerce niches. '
    'Without any external sites vouching for LuxeMia through links, Google has no trust signals to rank the site '
    'above competitors who have accumulated thousands of backlinks over years. The domain authority is effectively '
    'near zero, making it impossible to rank for any commercially valuable keyword regardless of on-page optimization quality.'
))

story.append(H2('5.2 Backlink Acquisition Strategy'))
story.append(P(
    'Building a backlink profile from zero requires a systematic, multi-channel approach. The Indian ethnic wear niche '
    'offers unique link-building opportunities through cultural content, wedding planning resources, and NRI community '
    'engagement. Below is a prioritized action plan for acquiring the first 50-100 quality backlinks within 6 months.'
))
story.append(Spacer(1, 6))

story.append(make_table(
    ['Strategy', 'Target Sites', 'Expected Links', 'Timeline'],
    [
        ['Indian Wedding Blog Guest Posts', 'WedMeGood, ShaadiSaga, BrideBox', '10-15', 'Month 1-3'],
        ['NRI Community Features', 'Indian Express NRI, The American Bazaar', '5-8', 'Month 1-4'],
        ['Fashion Influencer Collaborations', 'Instagram fashion bloggers, YouTube stylists', '8-12', 'Month 2-6'],
        ['HARO / Journalist Outreach', 'WeddingWire, The Knot, Brides.com', '5-10', 'Month 1-6'],
        ['Resource Page Link Building', 'University Indian associations, temple websites', '10-15', 'Month 2-4'],
        ['Broken Link Building', 'Indian fashion blogs with dead links', '5-8', 'Month 3-6'],
        ['Digital PR / Press Releases', 'Fashion industry publications', '3-5', 'Month 1-2'],
        ['Pinterest Visual Marketing', 'Indian wedding boards, ethnic wear boards', '5-10', 'Ongoing'],
    ],
    [0.28, 0.30, 0.16, 0.16]
))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 3: Prioritized Backlink Acquisition Strategy', caption_style))

# ═══════════════════════════════════════════════════════
# SECTION 6: GOOGLE/BING/AI SEARCH
# ═══════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(H1('6. Google, Bing & AI Search Optimization'))
story.append(Spacer(1, 6))

story.append(H2('6.1 Google Indexation Status'))
story.append(P(
    'The site:luxemia.shop query returns only approximately 4 indexed pages: the homepage, a press page, and two blog '
    'posts. For an e-commerce site with multiple product categories (lehengas, sarees, suits, menswear, jewelry, '
    'indo-western) and potentially hundreds of individual product pages, this indexation count is critically low. '
    'The canonical URL bug identified in Section 2.2 is likely the primary cause, as Google may be consolidating '
    'internal pages into the homepage due to conflicting canonical signals. Additionally, the SPA architecture may '
    'be preventing Googlebot from discovering product pages if they are not properly linked in the sitemap or if '
    'client-side rendering delays content availability beyond Googlebot patience thresholds.'
))

story.append(H2('6.2 Bing Search Presence'))
story.append(P(
    'Bing optimization is often overlooked but represents a meaningful traffic source, particularly for NRI audiences '
    'who use Microsoft products (Edge browser, Windows search). The site includes bingbot-specific meta directives '
    '(meta name="bingbot" content="index, follow"), which is good practice. However, the site should be explicitly '
    'submitted to Bing Webmaster Tools, which provides free indexing and SEO analysis. Bing places more weight on '
    'meta keywords and social signals than Google, making it a potentially quicker win for a new domain. The same '
    'canonical and content issues affecting Google indexation will also impact Bing.'
))

story.append(H2('6.3 AI Search Optimization (GEO/AIO)'))
story.append(P(
    'AI search engines (Perplexity, ChatGPT Browse, Google SGE/AI Overviews, Bing Copilot) represent the fastest-growing '
    'source of commercial search traffic. These systems prioritize content that provides clear, structured answers to user '
    'questions. LuxeMia has a strong foundation for AI discoverability through its FAQPage schema markup, which provides '
    'directly consumable question-answer pairs. The blog content with comparison topics (lehenga vs saree) also aligns well '
    'with AI search patterns. However, significant improvements are needed to maximize AI search visibility.'
))
story.append(Spacer(1, 6))

story.append(P(
    '<b>Key AI Search Recommendations:</b> First, the site needs to create a dedicated llms.txt file at the root domain, '
    'which is an emerging standard for providing AI crawlers with a concise site summary and content guide. Second, every '
    'product page should include detailed material descriptions, craftsmanship stories, and regional textile heritage '
    'information, as AI engines prioritize content depth over keyword density. Third, the blog should publish comprehensive '
    'guides (2,000+ words) on topics like "Complete NRI Indian Wedding Planning Guide" and "How to Choose the Perfect '
    'Bridal Lehenga from Abroad" that AI engines will reference when answering user queries. Fourth, ensure all FAQ answers '
    'are factual, specific, and include relevant details rather than generic marketing language.'
))

# ═══════════════════════════════════════════════════════
# SECTION 7: INDIAN OUTFITS & CULTURAL AUDIT
# ═══════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(H1('7. Indian Outfits & Cultural Positioning Audit'))
story.append(Spacer(1, 6))

story.append(H2('7.1 Understanding the NRI Customer Mindset'))
story.append(P(
    'The primary target audience for LuxeMia is the NRI (Non-Resident Indian) community in the USA, UK, and Canada, '
    'particularly women aged 24-45 who are planning weddings, attending festivals, or building their ethnic wardrobe '
    'abroad. This audience has a unique psychology shaped by living between two cultures. They feel a deep emotional '
    'connection to Indian heritage and want authentic, high-quality ethnic wear, but they also expect the convenience '
    'and reliability of Western e-commerce (easy returns, clear sizing, fast shipping, responsive customer service). '
    'They often lack access to physical Indian boutiques and rely entirely on online shopping, making trust signals '
    '(reviews, detailed product descriptions, video content) absolutely critical for conversion.'
))

story.append(P(
    'The Indian wedding is not a single event but a multi-day celebration with 5-10 distinct ceremonies, each requiring '
    'different outfits. The Mehendi ceremony calls for colorful, comfortable outfits (often green or yellow). The Sangeet '
    'demands dance-friendly lehengas or anarkalis. The Haldi uses yellow/white outfits. The main wedding requires a '
    'heavy bridal lehenga or saree. The Reception calls for a glamorous gown or indo-western outfit. NRIs planning '
    'weddings from abroad desperately need guidance on what to wear for each ceremony, and LuxeMia is perfectly positioned '
    'to become this guide, but currently does not offer ceremony-specific collections or content.'
))

story.append(H2('7.2 Cultural Gaps in Current Positioning'))
story.append(Spacer(1, 6))
story.append(make_table(
    ['Cultural Element', 'Current Status', 'Impact', 'Recommendation'],
    [
        ['Ceremony-Specific Collections', 'Missing entirely', 'HIGH', 'Create Mehendi/Sangeet/Haldi/Bridal/Reception collections'],
        ['Festival Collections', 'Not visible', 'HIGH', 'Add Diwali, Navratri, Karva Chauth, Eid collections'],
        ['Regional Textile Focus', 'Generic "silk" only', 'MEDIUM', 'Highlight Banarasi, Kanjeevaram, Chanderi, Patola origins'],
        ['Custom Stitching Info', 'Mentioned in FAQ only', 'HIGH', 'Make custom sizing a prominent feature, not a footnote'],
        ['Ready-to-Ship Urgency', 'Not highlighted', 'MEDIUM', 'Add "Ready to Ship" badges and delivery countdowns'],
        ['Size Guide for NRIs', 'Not audited', 'CRITICAL', 'Create visual size guide comparing US/UK to Indian sizes'],
        ['Customer Reviews/Testimonials', 'Not visible on site', 'CRITICAL', 'Add product reviews, video testimonials from NRIs'],
        ['WhatsApp Styling Service', 'Mentioned in FAQ', 'MEDIUM', 'Make WhatsApp chat prominent on every page'],
        ['Jewelry Pairing Suggestions', 'Jewelry category exists', 'LOW', 'Cross-sell jewelry with outfit recommendations'],
        ['Men\'s Collection Depth', 'Menswear link exists', 'MEDIUM', 'Expand sherwani/kurta options for wedding couples'],
    ],
    [0.22, 0.18, 0.12, 0.38]
))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 4: Cultural Positioning Gap Analysis', caption_style))

story.append(H2('7.3 Price Positioning & Value Perception'))
story.append(P(
    'Current lehenga prices range from $154 to $289 USD, positioning LuxeMia in the mid-market segment. This is both '
    'an opportunity and a challenge. On one hand, this price point is significantly below luxury competitors like Aza '
    'Fashions ($500-5,000+) and Anita Dongre ($300-3,000+), making LuxeMia accessible to the broader NRI middle class. '
    'On the other hand, the "luxury" branding (LuxeMia, luxury ethnic wear messaging) creates a price-expectation mismatch '
    'that can hurt conversion. The site should either lean fully into the "affordable luxury" or "premium value" positioning '
    'with messaging that emphasizes "authentic Indian craftsmanship at accessible prices" rather than competing on luxury terms.'
))
story.append(P(
    'The "Free shipping on orders over $300" announcement bar is smart because it raises average order value, but most '
    'individual lehengas are under $300. Consider offering free shipping on all orders (absorbed into product pricing) or '
    'lowering the threshold to $200 to increase conversion. NRIs are highly sensitive to shipping costs for Indian clothing '
    'because they have been conditioned by competitors offering free or flat-rate shipping.'
))

story.append(H2('7.4 Brand Name Confusion Risk'))
story.append(P(
    'A significant branding issue exists: "Luxemia" is shared with luxemia.net (a Miami-based sneaker and streetwear store), '
    '@luxe.mia on Instagram (a Miami luxury consignment shop), and luxemia.store (unknown status). This creates brand '
    'confusion in search results and social media. When users search "luxemia," they see results for the Miami sneaker '
    'store alongside the Indian ethnic wear site, diluting brand recognition and potentially sending confused visitors to '
    'the wrong business. The social media handles are also inconsistent: the structured data references @luxemiashop, '
    '@luxemia, and @LuxeMia across different schemas. LuxeMia should immediately consolidate to a single, unique handle '
    'across all platforms (e.g., @shopluxemia or @luxemia.ethnic) and consider whether a brand name modification is needed '
    'to fully differentiate from the Miami entity.'
))

# ═══════════════════════════════════════════════════════
# SECTION 8: PRIORITIZED ACTION PLAN
# ═══════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(H1('8. Prioritized 90-Day Action Plan'))
story.append(Spacer(1, 6))

story.append(P(
    'Based on the findings of this audit, the following action plan is organized by priority and timeline. The most '
    'critical issues (canonical bug, backlink building, content expansion) should be addressed immediately, while '
    'longer-term initiatives (cultural content depth, AI optimization) can be developed over the 90-day period. Each '
    'action item is tagged with expected impact and effort level to help prioritize resource allocation.'
))
story.append(Spacer(1, 6))

story.append(make_table(
    ['Priority', 'Action Item', 'Impact', 'Effort', 'Timeline'],
    [
        ['P0', 'Fix canonical URL bug on all internal pages', 'Critical', 'Low', 'Day 1-3'],
        ['P0', 'Remove Cache-Control: no-store meta tag', 'High', 'Low', 'Day 1'],
        ['P0', 'Verify sitemap.xml exists and is submitted to GSC', 'High', 'Low', 'Day 1-2'],
        ['P1', 'Create unique meta descriptions for every page', 'High', 'Medium', 'Day 3-7'],
        ['P1', 'Consolidate social media handles across all platforms', 'Medium', 'Low', 'Day 3-5'],
        ['P1', 'Submit site to Bing Webmaster Tools', 'Medium', 'Low', 'Day 3'],
        ['P1', 'Fix conflicting Organization schema versions', 'Medium', 'Low', 'Day 5-7'],
        ['P2', 'Launch ceremony-specific collection pages', 'High', 'High', 'Day 7-21'],
        ['P2', 'Begin backlink outreach (guest posts, HARO, PR)', 'Critical', 'High', 'Day 7-30'],
        ['P2', 'Add customer reviews/testimonials to product pages', 'High', 'Medium', 'Day 7-14'],
        ['P2', 'Create comprehensive NRI size guide', 'High', 'Medium', 'Day 7-14'],
        ['P3', 'Publish 4 long-form blog guides (2000+ words each)', 'High', 'High', 'Day 14-60'],
        ['P3', 'Add llms.txt file for AI crawler optimization', 'Medium', 'Low', 'Day 14'],
        ['P3', 'Create festival-specific landing pages', 'Medium', 'Medium', 'Day 21-45'],
        ['P3', 'Implement Product schema on individual product pages', 'Medium', 'Medium', 'Day 21-30'],
        ['P4', 'Launch Pinterest marketing campaign', 'Medium', 'Medium', 'Day 30-60'],
        ['P4', 'Add regional textile heritage content to product pages', 'Medium', 'Medium', 'Day 30-60'],
        ['P4', 'Implement hreflang tags for international targeting', 'Low', 'Medium', 'Day 45-60'],
    ],
    [0.08, 0.42, 0.12, 0.12, 0.14]
))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 5: Prioritized 90-Day Action Plan', caption_style))

# ═══════════════════════════════════════════════════════
# SECTION 9: COMPETITIVE BENCHMARKING
# ═══════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(H1('9. Competitive Benchmarking'))
story.append(Spacer(1, 6))

story.append(P(
    'The Indian ethnic wear e-commerce market targeting the global NRI audience is highly competitive, with several '
    'well-established players dominating search results and brand recognition. Understanding the competitive landscape '
    'is essential for LuxeMia to identify gaps it can exploit and avoid head-on competition with better-funded incumbents. '
    'The following analysis compares LuxeMia against the top competitors identified in search results for primary keywords.'
))
story.append(Spacer(1, 6))

story.append(make_table(
    ['Competitor', 'Domain Authority', 'Indexed Pages', 'Backlinks', 'Price Range', 'Key Advantage'],
    [
        ['Kalki Fashion', 'High (est. 50+)', '10,000+', '5,000+', '$100-$5,000', 'Celebrity collaborations, custom tailoring'],
        ['Aza Fashions', 'High (est. 45+)', '5,000+', '3,000+', '$200-$5,000', 'Designer exclusives, physical stores'],
        ['Utsav Fashion', 'High (est. 50+)', '20,000+', '8,000+', '$50-$2,000', 'Largest catalog, budget-friendly options'],
        ['Lashkaraa', 'Medium (est. 35+)', '2,000+', '1,000+', '$100-$3,000', 'Strong Instagram presence, influencer marketing'],
        ['Andaaz Fashion', 'Medium (est. 30+)', '3,000+', '1,500+', '$80-$2,500', 'DIY crafting niche, extensive size range'],
        ['LuxeMia', 'Very Low (est. 5-10)', '~4', '~0', '$154-$289', 'Modern UX, FAQ schema, clean architecture'],
    ],
    [0.14, 0.14, 0.11, 0.11, 0.14, 0.28]
))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 6: Competitive Landscape Comparison', caption_style))

story.append(P(
    'The competitive analysis reveals that LuxeMia cannot compete on scale (product catalog size), authority (backlinks), '
    'or brand recognition at this stage. However, LuxeMia has a distinct advantage in its modern, clean website architecture '
    'and user experience, which feels more contemporary than many competitors whose sites look dated. The key strategic '
    'insight is to leverage this UX advantage combined with hyper-focused cultural content targeting specific NRI pain points '
    'that larger competitors overlook. Rather than trying to be everything to everyone (like Utsav Fashion), LuxeMia should '
    'own the niche of "curated Indian wedding outfits for NRIs" with ceremony-specific guidance, personal styling services, '
    'and a community-driven approach that larger competitors cannot replicate at scale.'
))

# ═══════════════════════════════════════════════════════
# SECTION 10: CONCLUSION
# ═══════════════════════════════════════════════════════
story.append(Spacer(1, 18))
story.append(H1('10. Conclusion & Strategic Outlook'))
story.append(Spacer(1, 6))

story.append(P(
    'LuxeMia.shop stands at a critical inflection point. The site has built a technically sound foundation with '
    'well-implemented structured data, clean architecture, and a modern user experience that feels premium. However, '
    'the near-zero backlink profile, critically low indexation, canonical URL bugs, and absence of cultural depth in '
    'content strategy mean that the site is essentially invisible to its target audience in organic search. The Indian '
    'ethnic wear NRI market is growing rapidly as diaspora communities increasingly shop online for authentic clothing, '
    'but LuxeMia is currently capturing none of this demand through search.'
))

story.append(P(
    'The path forward requires a dual strategy: first, fix the technical issues (canonical bug, meta descriptions, '
    'sitemap) to ensure Google can properly crawl and index all pages. Second, and more importantly, invest in a '
    'content-led growth strategy that combines deep cultural content (ceremony guides, regional textile stories, '
    'NRI wedding planning resources) with aggressive backlink building through guest posting, digital PR, and '
    'influencer collaborations. The 90-day action plan outlined in Section 8 provides a concrete roadmap for '
    'transitioning from near-zero visibility to meaningful organic traffic. With disciplined execution, LuxeMia can '
    'realistically achieve first-page rankings for 15-25 long-tail keywords within 6 months, generating a foundation '
    'of organic traffic that compounds over time.'
))

story.append(P(
    'The ultimate competitive advantage for LuxeMia lies not in competing with established players on their terms, '
    'but in outperforming them on cultural authenticity and NRI-specific value. No competitor currently offers a '
    'comprehensive "NRI Indian Wedding Outfit Concierge" experience that guides customers through every ceremony '
    'with personalized recommendations. By owning this niche through content, community, and cultural expertise, '
    'LuxeMia can build a defensible brand position that larger, more generic competitors will find difficult to replicate.'
))

# ── Build the PDF ──
output_path = '/home/z/my-project/download/LuxeMia_Shop_SEO_Cultural_Audit_Report.pdf'

doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    leftMargin=LEFT_MARGIN,
    rightMargin=RIGHT_MARGIN,
    topMargin=TOP_MARGIN,
    bottomMargin=BOTTOM_MARGIN,
    title='LuxeMia.shop SEO & Indian Cultural Audit Report',
    author='Z.ai',
    creator='Z.ai',
    subject='Comprehensive website audit for luxemia.shop covering SEO, keywords, backlinks, AI search optimization, and Indian cultural positioning'
)

doc.build(story)
print(f"PDF generated successfully: {output_path}")
