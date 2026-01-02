export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  image: string;
  readTime: number;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'ultimate-guide-bridal-lehenga-selection',
    title: 'The Ultimate Guide to Choosing Your Perfect Bridal Lehenga',
    excerpt: 'Discover how to select the ideal bridal lehenga that complements your body type, skin tone, and wedding theme. Expert tips from leading designers.',
    content: `
      <h2>Understanding Your Body Type</h2>
      <p>Choosing the perfect bridal lehenga starts with understanding your body shape. Whether you're pear-shaped, apple-shaped, hourglass, or rectangle, there's a lehenga silhouette that will flatter your figure beautifully.</p>
      
      <h3>For Pear-Shaped Bodies</h3>
      <p>If you have wider hips and a smaller bust, opt for A-line lehengas with detailed work on the blouse. This draws attention upward while the flared skirt balances your proportions. Consider heavily embroidered dupattas to add volume to your upper body.</p>
      
      <h3>For Apple-Shaped Bodies</h3>
      <p>Empire waist lehengas work wonderfully for apple-shaped brides. The high waistline creates an elongated silhouette while the flowing skirt gracefully skims over the midsection. Choose darker colors for the lehenga and lighter shades for the dupatta.</p>
      
      <h2>Selecting the Right Fabric</h2>
      <p>The fabric of your bridal lehenga affects both comfort and appearance. Here's what you need to know:</p>
      
      <h3>Velvet</h3>
      <p>Perfect for winter weddings, velvet lehengas exude royal elegance. They photograph beautifully and add a luxurious dimension to your bridal look. Our Maharani Velvet collection features exquisite hand-embroidered pieces.</p>
      
      <h3>Silk</h3>
      <p>Traditional and timeless, silk lehengas are ideal for any season. They drape beautifully and are lightweight despite their rich appearance. Consider raw silk for a more contemporary look or Banarasi silk for traditional ceremonies.</p>
      
      <h3>Georgette and Chiffon</h3>
      <p>These lightweight fabrics are perfect for summer weddings. They flow gracefully and are incredibly comfortable for long ceremonies. Layer them for a fuller look without the weight.</p>
      
      <h2>Color Selection Based on Skin Tone</h2>
      <p>While red remains the traditional choice, modern brides are experimenting with various colors. Here's how to choose based on your skin tone:</p>
      
      <h3>Fair Skin</h3>
      <p>Jewel tones like emerald green, royal blue, and deep burgundy look stunning. Pastels also work beautifully, especially blush pink and powder blue.</p>
      
      <h3>Medium Skin</h3>
      <p>You have the widest range of options! From traditional reds and oranges to contemporary colors like mustard, coral, and wine, most colors will complement your skin tone.</p>
      
      <h3>Dusky Skin</h3>
      <p>Embrace rich, vibrant colors like gold, orange, coral, and hot pink. These colors create a beautiful contrast and make your complexion glow.</p>
      
      <h2>Budget Considerations</h2>
      <p>Bridal lehengas range from ₹50,000 to several lakhs. Set a realistic budget before you start shopping. Remember, the cost depends on:</p>
      <ul>
        <li>Type and quality of fabric</li>
        <li>Complexity of embroidery and embellishments</li>
        <li>Designer label</li>
        <li>Customization requirements</li>
      </ul>
      
      <h2>Timeline for Shopping</h2>
      <p>Start your bridal lehenga shopping at least 4-6 months before your wedding. This allows time for:</p>
      <ul>
        <li>Exploring different options and styles</li>
        <li>Customization and alterations</li>
        <li>Multiple fittings</li>
        <li>Any last-minute adjustments</li>
      </ul>
      
      <h2>Final Tips</h2>
      <p>Trust your instincts – you'll know when you've found "the one." Take photos during trials to see how the lehenga looks in different lighting. And most importantly, choose something that makes you feel confident and beautiful on your special day.</p>
    `,
    author: 'Priya Sharma',
    publishedAt: '2024-12-15',
    updatedAt: '2024-12-20',
    category: 'Bridal Guide',
    tags: ['bridal lehenga', 'wedding shopping', 'bridal fashion', 'lehenga guide'],
    image: '/og/og-lehengas.jpg',
    readTime: 8
  },
  {
    id: '2',
    slug: 'saree-draping-styles-every-occasion',
    title: '12 Elegant Saree Draping Styles for Every Occasion',
    excerpt: 'Master the art of saree draping with these stunning styles that range from traditional Nivi to contemporary pre-stitched options.',
    content: `
      <h2>The Classic Nivi Style</h2>
      <p>The Nivi drape, originating from Andhra Pradesh, is the most popular saree draping style in India. It's elegant, versatile, and suitable for almost any occasion. The pleats are tucked at the front, and the pallu flows gracefully over the shoulder.</p>
      
      <h3>How to Achieve the Perfect Nivi Drape</h3>
      <p>Start by tucking the plain end of the saree into your petticoat at the right hip. Wrap it around once, then make 5-7 pleats and tuck them at the center front. Take the remaining fabric, drape it over your left shoulder, and pin it in place.</p>
      
      <h2>Gujarati Style</h2>
      <p>This beautiful draping style brings the pallu to the front, showcasing the intricate work. It's perfect for festive occasions and creates a stunning silhouette.</p>
      
      <h2>Bengali Style</h2>
      <p>Known for its distinctive pleated drape without pins, the Bengali style is ideal for red and white traditional sarees. The pallu is brought over both shoulders for a royal appearance.</p>
      
      <h2>Maharashtrian Nauvari</h2>
      <p>This nine-yard saree style is draped like a dhoti, perfect for traditional ceremonies. It allows for easy movement and represents Marathi heritage beautifully.</p>
      
      <h2>Seedha Pallu (Front Pallu)</h2>
      <p>Popular in Rajasthan and Gujarat, this style places the pallu in front, creating a distinctive look that shows off elaborate borders and embroidery.</p>
      
      <h2>Modern Mermaid Style</h2>
      <p>For contemporary events, the mermaid drape creates a fitted silhouette. The pleats are smaller and tucked tightly, with the pallu pinned to fall gracefully.</p>
      
      <h2>Butterfly Style</h2>
      <p>This style creates a dramatic effect by pleating the pallu like butterfly wings. It's perfect for cocktail parties and modern events.</p>
      
      <h2>Lehenga Style</h2>
      <p>Drape your saree to look like a lehenga by creating elaborate pleats and spreading them in a circular fashion. Ideal for wedding receptions.</p>
      
      <h2>Pant Style</h2>
      <p>A fusion approach where the saree is draped over pants instead of a petticoat. Modern, chic, and perfect for professional settings.</p>
      
      <h2>Belted Style</h2>
      <p>Add a statement belt over your traditionally draped saree for a contemporary twist. Choose metallic or embroidered belts for maximum impact.</p>
      
      <h2>Cape Style</h2>
      <p>Create a cape effect with your pallu for red carpet-worthy looks. This style works beautifully with lightweight georgette and chiffon sarees.</p>
      
      <h2>One-Shoulder Style</h2>
      <p>Pin your pallu to create an asymmetric, one-shoulder look. Perfect for cocktail parties and modern celebrations.</p>
      
      <h2>Tips for Perfect Draping</h2>
      <ul>
        <li>Always iron your saree before draping</li>
        <li>Use a well-fitted petticoat with a strong drawstring</li>
        <li>Keep safety pins and saree pins handy</li>
        <li>Practice before the event</li>
        <li>Consider professional draping for special occasions</li>
      </ul>
    `,
    author: 'Anjali Mehta',
    publishedAt: '2024-12-10',
    updatedAt: '2024-12-18',
    category: 'Styling Tips',
    tags: ['saree draping', 'styling tips', 'saree fashion', 'traditional wear'],
    image: '/og/og-sarees.jpg',
    readTime: 6
  },
  {
    id: '3',
    slug: 'indian-wedding-trends-2025',
    title: 'Indian Wedding Fashion Trends to Watch in 2025',
    excerpt: 'From sustainable fashion to tech-integrated outfits, discover the wedding trends that will define Indian celebrations in 2025.',
    content: `
      <h2>Sustainable and Eco-Friendly Fashion</h2>
      <p>2025 marks a significant shift towards sustainable wedding fashion. Brides are increasingly choosing eco-friendly fabrics, vintage pieces, and outfits that can be repurposed. Natural dyes, organic silks, and handloom fabrics are taking center stage.</p>
      
      <h3>The Rise of Heirloom Fashion</h3>
      <p>More brides are incorporating family heirlooms into their wedding looks. Whether it's grandmother's antique jewelry or mother's wedding saree reimagined, the emotional value adds immeasurable worth to the ensemble.</p>
      
      <h2>Non-Traditional Colors</h2>
      <p>While red remains beloved, 2025 sees an explosion of unconventional bridal colors:</p>
      <ul>
        <li><strong>Ivory and Off-White:</strong> For modern, minimalist brides</li>
        <li><strong>Lavender and Lilac:</strong> Soft, romantic choices</li>
        <li><strong>Emerald Green:</strong> Rich and regal</li>
        <li><strong>Dusty Rose:</strong> Subtle and sophisticated</li>
        <li><strong>Midnight Blue:</strong> Bold and contemporary</li>
      </ul>
      
      <h2>Maximalist Embroidery</h2>
      <p>3D embroidery, appliqué work, and heavy zardozi are dominating bridal fashion. Designers are pushing boundaries with intricate floral motifs, baroque patterns, and sculptural elements that transform outfits into wearable art.</p>
      
      <h2>The Return of Vintage Silhouettes</h2>
      <p>1970s-inspired silhouettes are making a comeback. Think bell sleeves, high necklines, and retro-inspired blouse cuts. Vintage Benarasi sarees and traditional Lucknowi work are being reimagined for the modern bride.</p>
      
      <h2>Convertible Outfits</h2>
      <p>Practical yet glamorous, convertible outfits allow brides to transform their look throughout the day. Detachable trails, reversible dupattas, and modular blouses offer versatility without compromising on style.</p>
      
      <h2>Statement Sleeves</h2>
      <p>Sleeves are having a major moment:</p>
      <ul>
        <li>Bishop sleeves for drama</li>
        <li>Cape sleeves for elegance</li>
        <li>Puff sleeves for vintage charm</li>
        <li>Bell sleeves for retro appeal</li>
        <li>Off-shoulder for contemporary glamour</li>
      </ul>
      
      <h2>Minimal Jewelry, Maximum Impact</h2>
      <p>Less is more in 2025. Brides are choosing fewer but more impactful jewelry pieces. A single statement necklace, dramatic earrings, or an heirloom maang tikka takes precedence over layered jewelry.</p>
      
      <h2>Tech-Integrated Fashion</h2>
      <p>LED-embedded dupattas, temperature-regulating fabrics, and QR codes woven into outfit details are among the innovative trends emerging. Technology meets tradition in exciting new ways.</p>
      
      <h2>Groom Fashion Revolution</h2>
      <p>Grooms are stepping up their fashion game with:</p>
      <ul>
        <li>Colored sherwanis in pastels and jewel tones</li>
        <li>Indo-western fusion outfits</li>
        <li>Coordinated couple looks</li>
        <li>Statement accessories like brooches and pocket squares</li>
      </ul>
      
      <h2>Sustainable Accessories</h2>
      <p>From biodegradable floral jewelry for mehendi to upcycled metal accessories, sustainable options are available for every wedding event. Brides are also choosing lab-grown diamonds and ethical gemstones.</p>
    `,
    author: 'Rahul Khanna',
    publishedAt: '2024-12-05',
    updatedAt: '2024-12-22',
    category: 'Wedding Trends',
    tags: ['wedding trends', '2025 fashion', 'bridal trends', 'sustainable fashion'],
    image: '/og/og-suits.jpg',
    readTime: 7
  },
  {
    id: '4',
    slug: 'accessorize-indian-ethnic-wear',
    title: 'How to Accessorize Indian Ethnic Wear Like a Pro',
    excerpt: 'Complete your ethnic ensemble with the perfect accessories. From traditional jewelry to contemporary additions, learn the art of accessorizing.',
    content: `
      <h2>Understanding the Art of Accessorizing</h2>
      <p>The right accessories can elevate a simple outfit to extraordinary heights, while wrong choices can overwhelm even the most beautiful ensemble. The key is balance, proportion, and harmony.</p>
      
      <h2>Jewelry Guidelines by Outfit Type</h2>
      
      <h3>For Sarees</h3>
      <p>Let the saree's neckline guide your jewelry choice:</p>
      <ul>
        <li><strong>Deep necklines:</strong> Long necklaces or layered chains</li>
        <li><strong>High necklines:</strong> Statement earrings, skip the necklace</li>
        <li><strong>Sweetheart necklines:</strong> Chokers or short necklaces</li>
      </ul>
      
      <h3>For Lehengas</h3>
      <p>Bridal lehengas call for statement jewelry, but follow the "one statement piece" rule. If your lehenga is heavily embroidered, opt for elegant but subtle jewelry. For simpler lehengas, go bold with your accessories.</p>
      
      <h3>For Salwar Suits</h3>
      <p>The dupatta styling affects your jewelry visibility. For draped dupattas, earrings become the focal point. For pinned dupattas, necklaces get their moment to shine.</p>
      
      <h2>Essential Jewelry Pieces</h2>
      
      <h3>Maang Tikka</h3>
      <p>The centerpiece of Indian bridal jewelry. Choose the size based on your forehead width and hairstyle. Mathapatti styles are trending for brides wanting maximum impact.</p>
      
      <h3>Chandbalis</h3>
      <p>These moon-shaped earrings complement almost every face shape. They're versatile enough for weddings and festive occasions alike.</p>
      
      <h3>Jhumkas</h3>
      <p>The quintessential Indian earring, jhumkas come in various sizes and styles. Small jhumkas for casual wear, elaborate ones for celebrations.</p>
      
      <h3>Statement Rings</h3>
      <p>Stack them or wear a single statement piece. Cocktail rings add instant glamour to any ethnic outfit.</p>
      
      <h2>The Art of Layering</h2>
      <p>Layering necklaces and bangles requires skill:</p>
      <ul>
        <li>Vary the lengths for necklace layering</li>
        <li>Mix metals thoughtfully</li>
        <li>Combine different textures and sizes for bangles</li>
        <li>Keep one layer as the focal point</li>
      </ul>
      
      <h2>Bags and Clutches</h2>
      <p>Complete your look with the right bag:</p>
      <ul>
        <li><strong>Potli bags:</strong> Traditional and practical</li>
        <li><strong>Box clutches:</strong> Elegant and modern</li>
        <li><strong>Embroidered clutches:</strong> Adds texture to simple outfits</li>
        <li><strong>Metallic clutches:</strong> Versatile for any color palette</li>
      </ul>
      
      <h2>Footwear Choices</h2>
      <p>Your feet deserve attention too:</p>
      <ul>
        <li><strong>Juttis:</strong> Comfortable and traditional</li>
        <li><strong>Stilettos:</strong> For lehengas and modern looks</li>
        <li><strong>Block heels:</strong> Practical for long ceremonies</li>
        <li><strong>Kolhapuris:</strong> Casual ethnic occasions</li>
      </ul>
      
      <h2>Hair Accessories</h2>
      <p>Don't forget your hair:</p>
      <ul>
        <li>Fresh flowers for a traditional touch</li>
        <li>Decorative pins and combs</li>
        <li>Hair chains (juda pins)</li>
        <li>Embellished headbands for modern looks</li>
      </ul>
    `,
    author: 'Meera Patel',
    publishedAt: '2024-11-28',
    updatedAt: '2024-12-15',
    category: 'Styling Tips',
    tags: ['accessories', 'jewelry', 'styling tips', 'ethnic fashion'],
    image: '/og/og-menswear.jpg',
    readTime: 5
  },
  {
    id: '5',
    slug: 'caring-for-silk-sarees',
    title: 'Expert Tips for Caring for Your Precious Silk Sarees',
    excerpt: 'Learn professional techniques to maintain, store, and preserve your silk sarees for generations. Keep your investment looking pristine.',
    content: `
      <h2>Understanding Silk Fabric</h2>
      <p>Silk is a natural protein fiber known for its lustrous appearance and smooth texture. However, it requires special care to maintain its beauty. Different types of silk – Mulberry, Tussar, Muga, and Eri – have slightly different care requirements.</p>
      
      <h2>Washing Guidelines</h2>
      
      <h3>When to Dry Clean</h3>
      <p>Always dry clean:</p>
      <ul>
        <li>Heavily embroidered sarees</li>
        <li>Zari work sarees</li>
        <li>Antique or vintage pieces</li>
        <li>Sarees with delicate embellishments</li>
      </ul>
      
      <h3>Hand Washing at Home</h3>
      <p>For plain silk sarees without heavy work:</p>
      <ol>
        <li>Fill a basin with cold water</li>
        <li>Add a few drops of mild liquid detergent</li>
        <li>Submerge the saree and gently swish</li>
        <li>Never wring or twist</li>
        <li>Rinse thoroughly with cold water</li>
        <li>Add a tablespoon of vinegar in the final rinse to maintain luster</li>
      </ol>
      
      <h2>Drying Techniques</h2>
      <p>Never machine dry or hang silk sarees in direct sunlight. Instead:</p>
      <ul>
        <li>Lay flat on a clean white towel</li>
        <li>Roll the towel to absorb excess water</li>
        <li>Dry in shade on a clean, flat surface</li>
        <li>Iron while slightly damp for best results</li>
      </ul>
      
      <h2>Ironing Tips</h2>
      <p>Silk requires careful ironing:</p>
      <ul>
        <li>Use the silk setting on your iron</li>
        <li>Iron on the reverse side</li>
        <li>Place a muslin cloth between iron and fabric</li>
        <li>Never use steam on zari work</li>
        <li>Iron pallu and borders with extra care</li>
      </ul>
      
      <h2>Storage Solutions</h2>
      
      <h3>Folding Techniques</h3>
      <p>Proper folding prevents permanent creases:</p>
      <ul>
        <li>Fold along the length first</li>
        <li>Keep zari portions facing outward</li>
        <li>Change fold lines every few months</li>
        <li>Never fold on embroidered areas</li>
      </ul>
      
      <h3>Wrapping Materials</h3>
      <p>Choose the right wrapping:</p>
      <ul>
        <li><strong>Muslin cloth:</strong> Best for most silk sarees</li>
        <li><strong>Acid-free tissue paper:</strong> For antique pieces</li>
        <li><strong>Cotton covers:</strong> For regular storage</li>
        <li><strong>Never use plastic:</strong> It traps moisture and causes yellowing</li>
      </ul>
      
      <h2>Protecting Against Damage</h2>
      
      <h3>Moth Prevention</h3>
      <ul>
        <li>Use neem leaves in your wardrobe</li>
        <li>Place dried lavender sachets</li>
        <li>Add silica gel packets to absorb moisture</li>
        <li>Air your sarees every few months</li>
      </ul>
      
      <h3>Preventing Color Fading</h3>
      <ul>
        <li>Store away from direct light</li>
        <li>Keep in temperature-controlled spaces</li>
        <li>Avoid humidity exposure</li>
        <li>Separate dark and light colored sarees</li>
      </ul>
      
      <h2>Handling Stains</h2>
      <p>Address stains immediately:</p>
      <ul>
        <li><strong>Oil stains:</strong> Sprinkle talcum powder, leave overnight, brush off</li>
        <li><strong>Food stains:</strong> Blot with cold water, take for professional cleaning</li>
        <li><strong>Sweat stains:</strong> Dab with diluted vinegar solution</li>
        <li><strong>Makeup stains:</strong> Professional cleaning recommended</li>
      </ul>
      
      <h2>When to Seek Professional Help</h2>
      <p>Take your sarees to specialists for:</p>
      <ul>
        <li>Stubborn stains</li>
        <li>Zari re-polishing</li>
        <li>Tear repairs</li>
        <li>Restoration of antique pieces</li>
      </ul>
    `,
    author: 'Lakshmi Iyer',
    publishedAt: '2024-11-20',
    updatedAt: '2024-12-10',
    category: 'Care Guide',
    tags: ['silk care', 'saree maintenance', 'fabric care', 'storage tips'],
    image: '/og/og-sarees.jpg',
    readTime: 6
  }
];

export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

export const getRelatedPosts = (currentPost: BlogPost, limit: number = 3): BlogPost[] => {
  return blogPosts
    .filter(post => post.id !== currentPost.id)
    .filter(post => 
      post.category === currentPost.category || 
      post.tags.some(tag => currentPost.tags.includes(tag))
    )
    .slice(0, limit);
};
