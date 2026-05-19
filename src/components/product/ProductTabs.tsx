import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  CheckCircle2, Ruler, Sparkles, Droplets, Clock, Palette, PenTool,
  Truck, RotateCcw, Gem, Heart, Info,
} from 'lucide-react';

// ─── Types ───
type Cat = 'lehenga' | 'saree' | 'suit' | 'menswear' | 'other';

interface KeyDetailRow { label: string; value: string; }

interface ProductTabsProps {
  shortIntro?: string;
  keyDetails?: KeyDetailRow[];
  designDetails?: string[];
  stylingNote?: string;
  stylingBullets?: string[];
  colorAdvice?: string;
  customization?: string[];
  care?: string[];
  description?: string;
  productType?: string;
  isStitchable?: boolean;
}

// ─── Helpers ───
const STITCHABLE = ['salwar kameez','salwar kameez suit','lehenga','lehenga choli','saree','sarees','anarkali','sharara suit','pakistani suit','palazzo suit','gharara suit','wedding suit'];
const isStitch = (pt?: string) => pt ? STITCHABLE.some(t => pt.toLowerCase().includes(t)) : false;

const classify = (pt?: string): Cat => {
  if (!pt) return 'other';
  const l = pt.toLowerCase();
  if (l.includes('lehenga')) return 'lehenga';
  if (l.includes('saree') || l.includes('sari')) return 'saree';
  const isSuit = l.includes('salwar')||l.includes('kameez')||l.includes('anarkali')||l.includes('sharara')||l.includes('pakistani')||l.includes('palazzo')||l.includes('gharara')||l.includes('suit')||l.includes('kurta')||l.includes('churidar');
  const isMens = l.includes('men')||l.includes('sherwani')||l.includes('achkan')||l.includes('jodhpuri')||l.includes('bandhgala');
  if (isSuit) return isMens ? 'menswear' : 'suit';
  if (isMens) return 'menswear';
  return 'other';
};

// ─── Compact Defaults ───
const DESIGN: Record<Cat, string[]> = {
  lehenga: ['Intricate embroidery with zari, zardozi, or resham thread work','Flared silhouette with structured can-can for volume','Complete 3-piece: lehenga, choli (blouse), and dupatta','Drawstring or zip waist closure for adjustable fit','Suited for bridal ceremonies, mehndi, sangeet, and reception'],
  saree: ['Traditional handloom weaving with intricate pallu work','Matching blouse piece included — ready for stitching','Lightweight fabric that pleats beautifully and stays in place','Versatile draping: Nivi, Bengali, Gujarati, or butterfly styles','Perfect for weddings, festivals, pooja, and formal gatherings'],
  suit: ['Coordinated salwar/kameez/dupatta set for a polished look','Available in semi-stitched, ready-to-wear, and made-to-measure','Comfortable fit with room for alteration — suits all body types','Intricate thread work, sequin detailing, or printed motifs','Versatile for casual outings, festivals, and formal occasions'],
  menswear: ['Premium fabrics: silk, jacquard, and brocade','Tailored or semi-stitched options for the perfect fit','Detailed embroidery and embellishments for ceremonial wear','Matching stole or dupatta included for a complete ensemble','Designed for weddings, engagements, and festive celebrations'],
  other: ['Quality construction using time-honored textile traditions','Beautiful design details celebrating India\'s rich heritage','Comfortable and elegant silhouette for a flattering fit','Handcrafted with attention to detail'],
};

const CARE: Record<Cat, string[]> = {
  lehenga: ['Dry clean only — embroidery and zari are delicate','Store in a muslin or cotton bag; avoid plastic','Fold with tissue paper between layers to prevent snagging','Do not wring or twist — lay flat to dry if spot cleaning','Iron on low heat from the reverse side','Air out after each wear to preserve fabric'],
  saree: ['Dry clean recommended for silk and embroidered sarees','Cotton silk: gentle hand wash in cold water with mild detergent','Never hang silk sarees — fold and store flat','Wrap in muslin cloth; refold every few months to prevent creasing','Iron on medium heat; always iron on the reverse side','Keep away from direct sunlight to prevent color fading'],
  suit: ['Dry clean silk, chanderi, and heavily embroidered suits','Cotton and rayon: gentle machine wash or hand wash in cold water','Wash dark and light colors separately','Do not tumble dry — hang in shade to dry naturally','Iron on medium heat; use a pressing cloth over embroidery','Store embellished suits folded with tissue to protect thread work'],
  menswear: ['Dry clean only for silk, brocade, and jacquard fabrics','Cotton silk blends: gentle hand wash in cold water','Store sherwanis on a padded hanger to maintain structure','Keep in a garment bag to protect embroidery from snagging','Iron on low heat from the reverse side','Air out after wearing before storing'],
  other: ['Dry clean recommended for embroidered or embellished items','Store in a cool, dry place away from direct sunlight','Iron on low heat; use a pressing cloth over decorative elements','Handle embroidery and zari work with care','Fold with tissue paper between layers to prevent snagging'],
};

const STYLE: Record<Cat, { note: string; bullets: string[]; colors: string }> = {
  lehenga: { note: 'Pair heavy bridal lehengas with statement jewelry. For a modern look, drape the dupatta as a cape.', bullets: ['Maang tikka + chandelier jhumkas for bridal ceremonies','Dupatta draped over one shoulder for freedom of movement','Match footwear to lehenga border — embroidered juttis or block heels','A kamarbandh (waist chain) adds definition and a royal touch'], colors: 'Red and maroon are timeless bridal choices. Pastels (mint, blush, lavender) are trending for receptions. Jewel tones photograph beautifully under evening lighting.' },
  saree: { note: 'The right drape and blouse transform your saree look. Keep jewelry proportional to the saree\'s weight.', bullets: ['Classic Nivi drape for timeless elegance; Bengali drape for bold statements','Statement blouse with elbow sleeves and deep back elevates any saree','Heavy silks → temple jewelry and jhumkas; georgettes → diamond or polki sets','Pin the pallu at the shoulder for polish; let it flow for grace'], colors: 'Reds and deep pinks for weddings. Jewel tones (emerald, navy) for receptions. Pastels for daytime. Gold and champagne transition day to night.' },
  suit: { note: 'Balance your jewelry with the outfit\'s embellishment level. Let one element be the focal point.', bullets: ['Anarkalis: statement maang tikka + chandelier earrings, skip the necklace','Straight-cut suits: pointed juttis or block heels; palazzos: kolhapuris','Dupatta over one shoulder for sleek look; pinned across chest for tradition','Belt your anarkali with a metallic kamarbandh for structure'], colors: 'Pastels (blush, mint, ivory) for daytime and engagements. Jewel tones (wine, navy, emerald) for evening. Brights for festive occasions.' },
  menswear: { note: 'A well-chosen stole and footwear complete the traditional ensemble. Less is more with men\'s accessories.', bullets: ['Sherwani: drape matching stole over one shoulder for ceremony','Mojaris or embroidered juttis in gold or matching tones','Add a brooch or pin on the sherwani lapel for polish','Safa (turban) in matching or contrast fabric for the groom'], colors: 'Ivory and gold are timeless for grooms. Deep maroon and navy for bold statements. Muted sage, grey, or powder blue for groomsmen. Black for evening receptions.' },
  other: { note: 'Pair with matching accessories and traditional footwear for a complete ethnic look.', bullets: ['Coordinate accessories with outfit color and embellishment level','Traditional juttis or mojaris complete the ethnic ensemble','A well-draped dupatta or stole adds instant polish'], colors: 'Jewel tones for evening events. Pastels for daytime. Gold and ivory are always elegant.' },
};

const EMB: Record<Cat, [string, string][]> = {
  lehenga: [['Zardozi','Metallic thread embroidery for bridal opulence'],['Resham','Silk thread work in vibrant color patterns'],['Mirror Work','Shisha embroidery reflecting light beautifully'],['Sequin & Stone','Sparkling accents for reception and party wear']],
  saree: [['Zari Border','Gold or silver woven border on pallu and edges'],['Brocade Weaving','Raised pattern weaving for a rich textured look'],['Thread Embroidery','Delicate resham or machine embroidery across the drape'],['Sequin & Bead','Embellishments for festive glamour']],
  suit: [['Thread Work','Resham or machine embroidery in traditional motifs'],['Print & Block','Hand block or digital prints for everyday elegance'],['Mirror & Sequin','Festive embellishments for party and wedding suits'],['Gota Patti','Rajasthani lace appliqué for a heritage finish']],
  menswear: [['Zari & Zardozi','Gold metallic thread work for regal ceremony wear'],['Jacquard Weave','Self-patterned weaving for subtle sophistication'],['Thread & Stone','Embroidery and stone accents on lapels and cuffs'],['Brocade Panels','Woven pattern panels on the front and sleeves']],
  other: [['Thread Work','Decorated with thread work and traditional motifs'],['Sequin & Embellishment','Carefully applied accents for a refined finish']],
};

// ─── Sub-components ───
const Bullets = ({ items, icon: I = CheckCircle2 }: { items: string[]; icon?: React.ElementType }) => (
  <ul className="space-y-2">{items.map((item, i) => (
    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
      <I className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
      <span>{item}</span>
    </li>
  ))}</ul>
);

const KVGrid = ({ rows }: { rows: KeyDetailRow[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
    {rows.map((r, i) => (
      <div key={i} className="flex justify-between sm:block border-b border-border/50 pb-1.5 sm:border-0 sm:pb-0">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{r.label}</span>
        <span className="text-sm text-foreground font-medium sm:font-normal">{r.value}</span>
      </div>
    ))}
  </div>
);

const TS = ({ id, icon: I, label, children }: { id: string; icon: React.ElementType; label: string; children: React.ReactNode }) => (
  <AccordionItem value={id} className="border-b border-border/50">
    <AccordionTrigger className="py-3 text-sm hover:no-underline">
      <div className="flex items-center gap-2"><I className="h-4 w-4 text-primary" /><span className="font-medium">{label}</span></div>
    </AccordionTrigger>
    <AccordionContent>{children}</AccordionContent>
  </AccordionItem>
);

const tabCls = "rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-4 sm:px-6 py-3 text-xs sm:text-sm uppercase tracking-wide whitespace-nowrap";

// ─── Main ───
export const ProductTabs = ({
  shortIntro, keyDetails, designDetails, stylingNote, stylingBullets, colorAdvice, customization, care,
  description, productType, isStitchable,
}: ProductTabsProps) => {
  const showTailoring = isStitchable ?? isStitch(productType);
  const cat = classify(productType);
  const design = designDetails ?? DESIGN[cat];
  const careItems = care ?? CARE[cat];
  const style = STYLE[cat];
  const intro = shortIntro ?? description ?? 'This piece showcases India\'s rich textile traditions, bringing together classic design and modern styling.';

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border rounded-none overflow-x-auto flex-nowrap">
        <TabsTrigger value="details" className={tabCls}>Details</TabsTrigger>
        {showTailoring && <TabsTrigger value="tailoring" className={tabCls}>Tailoring</TabsTrigger>}
        <TabsTrigger value="material" className={tabCls}>Material</TabsTrigger>
        <TabsTrigger value="styling" className={tabCls}>Styling</TabsTrigger>
        <TabsTrigger value="sizing" className={tabCls}>Size</TabsTrigger>
        <TabsTrigger value="shipping" className={tabCls}>Shipping</TabsTrigger>
      </TabsList>

      {/* ─── Details ─── */}
      <TabsContent value="details" className="pt-5">
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{intro}</p>
        <Accordion type="multiple" defaultValue={['design']} className="w-full">
          {keyDetails && keyDetails.length > 0 && <TS id="key" icon={Info} label="Key Details"><KVGrid rows={keyDetails} /></TS>}
          <TS id="design" icon={Sparkles} label="Design Features"><Bullets items={design} /></TS>
          {customization && customization.length > 0 && <TS id="custom" icon={Palette} label="Customization"><Bullets items={customization} /></TS>}
        </Accordion>
      </TabsContent>

      {/* ─── Tailoring ─── */}
      {showTailoring && (
        <TabsContent value="tailoring" className="pt-5">
          <Accordion type="multiple" defaultValue={['semi']} className="w-full">
            <TS id="semi" icon={CheckCircle2} label="Semi Stitched — Included">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Pre-constructed with adjustable side seams. Select XS–XXL.</p>
                <Bullets items={['Ready to wear with minimal adjustments','Side seams adjustable by any local tailor','Fastest delivery — no tailoring lead time']} />
              </div>
            </TS>
            <TS id="rtw" icon={Clock} label="Ready to Wear — +$15">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Fully stitched to standard measurements. Select bust size (28&quot;–52&quot;).</p>
                <Bullets items={['Complete stitching to selected measurements','Bottom: churidar, salwar, semi patiala, or straight/palazzo','Additional 3 business days']} />
              </div>
            </TS>
            <TS id="mtm" icon={PenTool} label="Made to Measure — +$25">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Bespoke with 200+ style combinations. Submit measurements after ordering.</p>
                <Bullets icon={Palette} items={['Neckline: round, deep U, square, or sweetheart','Sleeve: full, 3/4, half, sleeveless, or cap','Bottom: churidar, salwar, semi patiala, or straight/palazzo','Submit via My Account → My Orders after purchase','Additional 5 business days']} />
              </div>
            </TS>
          </Accordion>
          <div className="mt-4 p-3 border border-primary/30 bg-primary/5 rounded-sm">
            <p className="text-xs text-muted-foreground"><span className="text-foreground font-medium">Note:</span> Stitched items are non-returnable unless defective. Opt for Semi Stitched if unsure about sizing.</p>
          </div>
        </TabsContent>
      )}

      {/* ─── Material ─── */}
      <TabsContent value="material" className="pt-5">
        <Accordion type="multiple" defaultValue={['care','embel']} className="w-full">
          <TS id="care" icon={Droplets} label="Care Instructions"><Bullets items={careItems} /></TS>
          <TS id="embel" icon={Sparkles} label="Embellishments & Work">
            <div className="grid sm:grid-cols-2 gap-2">
              {EMB[cat].map(([title, desc], i) => (
                <div key={i} className="p-3 bg-card rounded-sm border border-border">
                  <p className="text-sm"><span className="text-foreground font-medium">{title}</span><span className="text-muted-foreground"> — {desc}</span></p>
                </div>
              ))}
            </div>
          </TS>
        </Accordion>
        <div className="mt-4 p-3 bg-card rounded-sm border border-border flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground"><span className="text-foreground font-medium">Sourced from India&apos;s finest textile hubs.</span> Each piece undergoes thorough quality inspection before shipping.</p>
        </div>
      </TabsContent>

      {/* ─── Styling ─── */}
      <TabsContent value="styling" className="pt-5">
        <Accordion type="multiple" defaultValue={['tips','colors']} className="w-full">
          <TS id="tips" icon={Gem} label="Styling Tips">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{stylingNote ?? style.note}</p>
              <Bullets items={stylingBullets ?? style.bullets} />
            </div>
          </TS>
          <TS id="colors" icon={Palette} label="Color Coordination">
            <p className="text-sm text-muted-foreground">{colorAdvice ?? style.colors}</p>
          </TS>
        </Accordion>
        <div className="mt-4 p-3 border border-primary/30 bg-primary/5 rounded-sm flex items-start gap-2">
          <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground"><span className="text-foreground font-medium">Complete the look:</span> Gold jewelry complements warm palettes; silver and diamond accents elevate cool tones.</p>
        </div>
      </TabsContent>

      {/* ─── Size Guide ─── */}
      <TabsContent value="sizing" className="pt-5">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Ruler className="h-4 w-4" /><span>All measurements are in inches</span></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left py-3 px-3 font-medium">Size</th><th className="text-left py-3 px-3 font-medium">Bust</th><th className="text-left py-3 px-3 font-medium">Waist</th><th className="text-left py-3 px-3 font-medium">Hip</th><th className="text-left py-3 px-3 font-medium">Length</th>
              </tr></thead>
              <tbody className="text-muted-foreground">
                {[{s:'XS',b:32,w:26,h:35,l:54},{s:'S',b:34,w:28,h:37,l:54},{s:'M',b:36,w:30,h:39,l:55},{s:'L',b:38,w:32,h:41,l:55},{s:'XL',b:40,w:34,h:43,l:56}].map(r => (
                  <tr key={r.s} className="border-b border-border/50">
                    <td className="py-3 px-3">{r.s}</td><td className="py-3 px-3">{r.b}</td><td className="py-3 px-3">{r.w}</td><td className="py-3 px-3">{r.h}</td><td className="py-3 px-3">{r.l}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">Need help? Contact our team for personalized size recommendations.</p>
        </div>
      </TabsContent>

      {/* ─── Shipping ─── */}
      <TabsContent value="shipping" className="pt-5">
        <Accordion type="multiple" defaultValue={['express','dispatch']} className="w-full">
          <TS id="express" icon={Truck} label="Express (DHL) — $25"><Bullets items={['Transit: 3–5 business days','Full tracking included','Insured delivery to your door','FREE on orders over $350']} /></TS>
          <TS id="standard" icon={Truck} label="Standard — $25"><Bullets items={['Transit: 7–10 business days','Tracking provided','FREE on orders over $350']} /></TS>
          <TS id="dispatch" icon={Clock} label="Dispatch Times"><Bullets items={['Ready-made / Semi Stitched: 3–5 business days','Ready to Wear: 5–7 business days','Made to Measure: 7–10 business days']} /></TS>
          <TS id="returns" icon={RotateCcw} label="Returns & Guarantee">
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-sm">
                <p className="text-xs text-amber-700 dark:text-amber-300"><span className="font-medium">All sales final.</span> Review sizing carefully before ordering. Contact us with any pre-purchase questions.</p>
              </div>
              <Bullets items={['Damage claims require an unboxing video','Submit claims within 48 hours of delivery','Include clear photos of damage with your claim']} />
            </div>
          </TS>
        </Accordion>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[{f:'🇺🇸',n:'United States',t:'3–10 days'},{f:'🇨🇦',n:'Canada',t:'5–10 days'},{f:'🇦🇺',n:'Australia',t:'5–12 days'}].map(d => (
            <div key={d.n} className="p-2 bg-card rounded-sm border border-border text-center">
              <p className="text-sm font-medium text-foreground">{d.f} {d.n}</p><p className="text-xs text-muted-foreground">{d.t}</p>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};
