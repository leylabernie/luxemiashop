import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ruler, Shirt, Sparkles, Droplets, Scissors, Info, CheckCircle2, Clock, Palette, PenTool } from 'lucide-react';

interface ProductTabsProps {
  description?: string;
  productType?: string;
  /** Whether this product supports stitching (controls Tailoring Services tab visibility) */
  isStitchable?: boolean;
}

// Product types that support stitching
const STITCHABLE_PRODUCT_TYPES = [
  'salwar kameez', 'salwar kameez suit', 'lehenga', 'lehenga choli', 'saree', 'sarees',
  'anarkali', 'sharara suit', 'pakistani suit', 'palazzo suit', 'gharara suit',
  'wedding suit',
];

const isStitchableType = (productType?: string): boolean => {
  if (!productType) return false;
  const lower = productType.toLowerCase();
  return STITCHABLE_PRODUCT_TYPES.some(t => lower.includes(t));
};

export const ProductTabs = ({ description, productType, isStitchable }: ProductTabsProps) => {
  const showTailoringTab = isStitchable ?? isStitchableType(productType);

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border rounded-none overflow-x-auto">
        <TabsTrigger 
          value="details" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-4 text-sm uppercase tracking-wide whitespace-nowrap"
        >
          Details
        </TabsTrigger>
        {showTailoringTab && (
          <TabsTrigger 
            value="tailoring" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-4 text-sm uppercase tracking-wide whitespace-nowrap"
          >
            Tailoring Services
          </TabsTrigger>
        )}
        <TabsTrigger 
          value="material" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-4 text-sm uppercase tracking-wide whitespace-nowrap"
        >
          Material & Care
        </TabsTrigger>
        <TabsTrigger 
          value="sizing" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-4 text-sm uppercase tracking-wide whitespace-nowrap"
        >
          Size Guide
        </TabsTrigger>
        <TabsTrigger 
          value="shipping" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-4 text-sm uppercase tracking-wide whitespace-nowrap"
        >
          Shipping
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="pt-6">
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <p className="leading-relaxed">
            {description || 
              "This piece showcases India's rich textile traditions. Each garment brings together classic design and modern styling for a look that stands out."
            }
          </p>
          <ul className="mt-4 space-y-2">
            <li>Made with care and attention to detail</li>
            <li>Quality construction and attention to detail</li>
            <li>Beautiful design details</li>
            <li>Comfortable and elegant silhouette</li>
          </ul>
        </div>
      </TabsContent>

      <TabsContent value="tailoring" className="pt-6">
        <div className="space-y-8">
          {/* Section Header */}
          <div className="flex items-center gap-2 text-foreground">
            <Scissors className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-serif font-medium">Tailoring Services</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            At LuxeMia, we offer three tailoring options so you can choose the level of customization that's right for you. Every stitched garment is finished by our master tailors with decades of experience in Indian ethnic wear.
          </p>

          {/* Semi Stitched */}
          <div className="border border-border rounded-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-medium text-foreground">Semi Stitched</h4>
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Included — No extra charge</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pre-constructed with adjustable side seams. The main body of the outfit is assembled, leaving the side seams open for easy alteration. Select your standard size (XS–XXL) for a near-perfect fit.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1.5 ml-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Ready to wear with minimal adjustments</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Side seams can be taken in or let out by any local tailor</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Fastest delivery — no tailoring lead time</span>
              </li>
            </ul>
          </div>

          {/* Ready to Wear */}
          <div className="border border-border rounded-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-medium text-foreground">Ready to Wear</h4>
              </div>
              <span className="text-sm font-medium text-foreground">+$15.00</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fully stitched to standard measurements matching the product image. Select your bust size (28"–52") and we'll tailor it completely — ready to wear right out of the box.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1.5 ml-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Complete stitching to your selected measurements</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Choose bottom style: Churidar, Salwar, Semi Patiala, or Straight Pant / Palazzo</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Additional 3 business days for tailoring</span>
              </li>
            </ul>
          </div>

          {/* Made to Measure */}
          <div className="border border-[#D4AF37]/30 bg-[#D4AF37]/5 rounded-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center">
                  <PenTool className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <h4 className="font-medium text-foreground">Made to Measure <span className="text-[#D4AF37] text-xs font-medium">(UDesign)</span></h4>
              </div>
              <span className="text-sm font-medium text-foreground">+$25.00</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our bespoke tailoring service with 200+ style combinations. Customize the neckline, sleeve style, and bottom style. Submit your exact measurements after placing the order for a perfect custom fit.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1.5 ml-1">
              <li className="flex items-start gap-2">
                <Palette className="h-3.5 w-3.5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Neckline:</strong> Round Neck, Deep U-Neck, Square Neck, or Sweetheart</span>
              </li>
              <li className="flex items-start gap-2">
                <Palette className="h-3.5 w-3.5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Sleeve Style:</strong> Full Sleeve, 3/4 Sleeve, Half Sleeve, Sleeveless, or Cap Sleeve</span>
              </li>
              <li className="flex items-start gap-2">
                <Palette className="h-3.5 w-3.5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Bottom Style:</strong> Churidar, Salwar, Semi Patiala, or Straight Pant / Palazzo</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span>Submit measurements after ordering via My Account → My Orders</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span>Additional 5 business days for bespoke tailoring</span>
              </li>
            </ul>
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-sm mt-2">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                You can submit your measurements after placing the order. Select Made to Measure, add to bag, complete your order, then go to <strong>My Account → My Orders</strong> to submit your measurements at your convenience.
              </p>
            </div>
          </div>

          {/* General tailoring note */}
          <div className="p-4 border border-primary/30 bg-primary/5 rounded-sm">
            <p className="text-sm text-foreground">
              <strong>Note:</strong> All tailoring is done by our experienced in-house team in India. Stitched items are non-returnable unless there is a manufacturing defect. We recommend checking measurements carefully or opting for Semi Stitched if you're unsure about sizing.
            </p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="material" className="pt-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Shirt className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Fabric Composition</h4>
                <p className="text-sm text-muted-foreground">
                  {productType === 'Saree' 
                    ? 'Silk with Zari work' 
                    : 'Quality fabric blend designed for comfort and elegance'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Embellishments</h4>
                <p className="text-sm text-muted-foreground">
                  Decorated with thread work, sequins, and traditional motifs
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Droplets className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Care Instructions</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Dry clean only recommended</li>
                  <li>• Store in a cool, dry place</li>
                  <li>• Avoid direct sunlight</li>
                  <li>• Iron on low heat if needed</li>
                  <li>• Handle embroidery with care</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="sizing" className="pt-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Ruler className="h-4 w-4" />
            <span>All measurements are in inches</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Size</th>
                  <th className="text-left py-3 px-4 font-medium">Bust</th>
                  <th className="text-left py-3 px-4 font-medium">Waist</th>
                  <th className="text-left py-3 px-4 font-medium">Hip</th>
                  <th className="text-left py-3 px-4 font-medium">Length</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">XS</td>
                  <td className="py-3 px-4">32</td>
                  <td className="py-3 px-4">26</td>
                  <td className="py-3 px-4">35</td>
                  <td className="py-3 px-4">54</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">S</td>
                  <td className="py-3 px-4">34</td>
                  <td className="py-3 px-4">28</td>
                  <td className="py-3 px-4">37</td>
                  <td className="py-3 px-4">54</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">M</td>
                  <td className="py-3 px-4">36</td>
                  <td className="py-3 px-4">30</td>
                  <td className="py-3 px-4">39</td>
                  <td className="py-3 px-4">55</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">L</td>
                  <td className="py-3 px-4">38</td>
                  <td className="py-3 px-4">32</td>
                  <td className="py-3 px-4">41</td>
                  <td className="py-3 px-4">55</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">XL</td>
                  <td className="py-3 px-4">40</td>
                  <td className="py-3 px-4">34</td>
                  <td className="py-3 px-4">43</td>
                  <td className="py-3 px-4">56</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            Need help? Contact our team for personalized size recommendations.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="shipping" className="pt-6">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-card rounded-sm">
              <h4 className="font-medium mb-2">Domestic Shipping (India)</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Free shipping on orders above ₹5,000</li>
                <li>• Standard delivery: 5-7 business days</li>
                <li>• Express delivery: 2-3 business days</li>
                <li>• Cash on Delivery available</li>
              </ul>
            </div>
            <div className="p-4 bg-card rounded-sm">
              <h4 className="font-medium mb-2">International Shipping</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Available to 50+ countries</li>
                <li>• Delivery: 10-15 business days</li>
                <li>• Customs duties may apply</li>
                <li>• Tracking provided</li>
              </ul>
            </div>
          </div>
          <div className="p-4 border border-primary/30 bg-primary/5 rounded-sm">
            <p className="text-sm">
              <strong>Note:</strong> All items are carefully packaged to ensure they reach you in perfect condition. 
              Each piece is wrapped in tissue paper and placed in our signature gift box.
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
