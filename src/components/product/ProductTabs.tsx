import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ruler, Shirt, Sparkles, Droplets } from 'lucide-react';

interface ProductTabsProps {
  description?: string;
  productType?: string;
}

export const ProductTabs = ({ description, productType }: ProductTabsProps) => {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border rounded-none">
        <TabsTrigger 
          value="details" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-4 text-sm uppercase tracking-wide"
        >
          Details
        </TabsTrigger>
        <TabsTrigger 
          value="material" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-4 text-sm uppercase tracking-wide"
        >
          Material & Care
        </TabsTrigger>
        <TabsTrigger 
          value="sizing" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-4 text-sm uppercase tracking-wide"
        >
          Size Guide
        </TabsTrigger>
        <TabsTrigger 
          value="shipping" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-4 text-sm uppercase tracking-wide"
        >
          Shipping
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="pt-6">
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <p className="leading-relaxed">
            {description || 
              `This piece showcases India's rich textile traditions. Made with care using time-honored techniques, each garment brings together cultural design and modern styling for a look that stands out.\n            }
          </p>
          <ul className="mt-4 space-y-2">
            <li>Made with care and attention to detail</li>
            <li>Traditional weaving and embroidery techniques</li>
            <li>Beautiful design details</li>
            <li>Comfortable and elegant silhouette</li>
          </ul>
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
                  Hand-embroidered with thread work, sequins, and traditional motifs
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
            Need help? Contact our styling experts for personalized size recommendations.
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
