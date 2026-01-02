import { useState } from 'react';
import { Ruler, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface SizeGuideModalProps {
  category?: string;
}

const lehengaSizes = [
  { size: 'S', bust: '32-34', waist: '26-28', hips: '36-38', length: '42' },
  { size: 'M', bust: '34-36', waist: '28-30', hips: '38-40', length: '42' },
  { size: 'L', bust: '36-38', waist: '30-32', hips: '40-42', length: '43' },
  { size: 'XL', bust: '38-40', waist: '32-34', hips: '42-44', length: '43' },
  { size: 'XXL', bust: '40-42', waist: '34-36', hips: '44-46', length: '44' },
];

const suitSizes = [
  { size: 'S', bust: '32-34', waist: '26-28', hips: '36-38', kameezLength: '40', sleeveLength: '22' },
  { size: 'M', bust: '34-36', waist: '28-30', hips: '38-40', kameezLength: '41', sleeveLength: '22.5' },
  { size: 'L', bust: '36-38', waist: '30-32', hips: '40-42', kameezLength: '42', sleeveLength: '23' },
  { size: 'XL', bust: '38-40', waist: '32-34', hips: '42-44', kameezLength: '43', sleeveLength: '23.5' },
  { size: 'XXL', bust: '40-42', waist: '34-36', hips: '44-46', kameezLength: '44', sleeveLength: '24' },
];

const menswearSizes = [
  { size: 'S', chest: '36-38', waist: '30-32', shoulder: '16.5', length: '28' },
  { size: 'M', chest: '38-40', waist: '32-34', shoulder: '17', length: '29' },
  { size: 'L', chest: '40-42', waist: '34-36', shoulder: '17.5', length: '30' },
  { size: 'XL', chest: '42-44', waist: '36-38', shoulder: '18', length: '31' },
  { size: 'XXL', chest: '44-46', waist: '38-40', shoulder: '18.5', length: '32' },
];

export const SizeGuideModal = ({ category = 'lehenga' }: SizeGuideModalProps) => {
  const [open, setOpen] = useState(false);

  const getDefaultTab = () => {
    if (category?.toLowerCase().includes('saree')) return 'sarees';
    if (category?.toLowerCase().includes('suit') || category?.toLowerCase().includes('sharara') || category?.toLowerCase().includes('anarkali')) return 'suits';
    if (category?.toLowerCase().includes('men') || category?.toLowerCase().includes('sherwani') || category?.toLowerCase().includes('kurta')) return 'menswear';
    return 'lehengas';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto font-normal underline underline-offset-4">
          <Ruler className="h-4 w-4 mr-1" />
          Size Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Size Guide</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={getDefaultTab()} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="lehengas">Lehengas</TabsTrigger>
            <TabsTrigger value="sarees">Sarees</TabsTrigger>
            <TabsTrigger value="suits">Suits</TabsTrigger>
            <TabsTrigger value="menswear">Menswear</TabsTrigger>
          </TabsList>

          <TabsContent value="lehengas" className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Lehenga & Choli Size Chart</h3>
              <p className="text-sm text-muted-foreground">All measurements are in inches</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium">Size</th>
                      <th className="text-left py-3 px-2 font-medium">Bust</th>
                      <th className="text-left py-3 px-2 font-medium">Waist</th>
                      <th className="text-left py-3 px-2 font-medium">Hips</th>
                      <th className="text-left py-3 px-2 font-medium">Lehenga Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lehengaSizes.map((row) => (
                      <tr key={row.size} className="border-b border-border/50">
                        <td className="py-3 px-2 font-medium">{row.size}</td>
                        <td className="py-3 px-2 text-muted-foreground">{row.bust}"</td>
                        <td className="py-3 px-2 text-muted-foreground">{row.waist}"</td>
                        <td className="py-3 px-2 text-muted-foreground">{row.hips}"</td>
                        <td className="py-3 px-2 text-muted-foreground">{row.length}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-card/50 border border-border/50 rounded-sm p-4 space-y-3">
                <h4 className="font-medium">Fitting Recommendations</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• For a perfect fit, measure over undergarments you plan to wear</li>
                  <li>• If between sizes, we recommend ordering the larger size</li>
                  <li>• Bridal lehengas: Order 4-6 weeks in advance for any alterations</li>
                  <li>• Choli typically comes semi-stitched for custom fitting</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sarees" className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Saree Sizing Information</h3>
              
              <div className="bg-card/50 border border-border/50 rounded-sm p-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Standard Saree (Unstitched)</h4>
                  <p className="text-sm text-muted-foreground">
                    Traditional sarees are one-size-fits-all. Each saree is approximately 5.5 meters (6 yards) 
                    with an additional 0.8 meter blouse piece. The saree draping adjusts to your body naturally.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Blouse Piece</h4>
                  <p className="text-sm text-muted-foreground">
                    Sarees come with an unstitched blouse piece (0.8m fabric). We recommend getting it 
                    tailored locally for the perfect fit. Alternatively, select a ready-to-wear blouse option.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Ready-to-Wear Sarees</h4>
                  <p className="text-sm text-muted-foreground">
                    Pre-stitched sarees are available in sizes S, M, L, XL. These feature a pre-pleated 
                    design that can be worn in minutes. Check individual product descriptions for sizing.
                  </p>
                </div>
              </div>

              <div className="bg-secondary/50 border border-border/50 rounded-sm p-4">
                <h4 className="font-medium mb-2">Pro Tip</h4>
                <p className="text-sm text-muted-foreground">
                  When getting your blouse stitched, share your exact measurements with your tailor:
                  bust, underbust, shoulder width, arm hole, blouse length, and sleeve length.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="suits" className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Salwar Suits & Sharara Size Chart</h3>
              <p className="text-sm text-muted-foreground">All measurements are in inches</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium">Size</th>
                      <th className="text-left py-3 px-2 font-medium">Bust</th>
                      <th className="text-left py-3 px-2 font-medium">Waist</th>
                      <th className="text-left py-3 px-2 font-medium">Hips</th>
                      <th className="text-left py-3 px-2 font-medium">Kameez</th>
                      <th className="text-left py-3 px-2 font-medium">Sleeve</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suitSizes.map((row) => (
                      <tr key={row.size} className="border-b border-border/50">
                        <td className="py-3 px-2 font-medium">{row.size}</td>
                        <td className="py-3 px-2 text-muted-foreground">{row.bust}"</td>
                        <td className="py-3 px-2 text-muted-foreground">{row.waist}"</td>
                        <td className="py-3 px-2 text-muted-foreground">{row.hips}"</td>
                        <td className="py-3 px-2 text-muted-foreground">{row.kameezLength}"</td>
                        <td className="py-3 px-2 text-muted-foreground">{row.sleeveLength}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-card/50 border border-border/50 rounded-sm p-4 space-y-3">
                <h4 className="font-medium">Fitting Recommendations</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Anarkalis: Consider sizing up if you prefer a flowy silhouette</li>
                  <li>• Sharara pants typically have elastic waistbands for comfort</li>
                  <li>• Most suits come semi-stitched with scope for alterations</li>
                  <li>• Dupatta length is standard at 2.25-2.5 meters</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="menswear" className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Men's Ethnic Wear Size Chart</h3>
              <p className="text-sm text-muted-foreground">All measurements are in inches</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium">Size</th>
                      <th className="text-left py-3 px-2 font-medium">Chest</th>
                      <th className="text-left py-3 px-2 font-medium">Waist</th>
                      <th className="text-left py-3 px-2 font-medium">Shoulder</th>
                      <th className="text-left py-3 px-2 font-medium">Kurta Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menswearSizes.map((row) => (
                      <tr key={row.size} className="border-b border-border/50">
                        <td className="py-3 px-2 font-medium">{row.size}</td>
                        <td className="py-3 px-2 text-muted-foreground">{row.chest}"</td>
                        <td className="py-3 px-2 text-muted-foreground">{row.waist}"</td>
                        <td className="py-3 px-2 text-muted-foreground">{row.shoulder}"</td>
                        <td className="py-3 px-2 text-muted-foreground">{row.length}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-card/50 border border-border/50 rounded-sm p-4 space-y-3">
                <h4 className="font-medium">Fitting Recommendations</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Sherwanis: Order your regular size for a fitted look</li>
                  <li>• Kurta Pajamas: Consider sizing up for a relaxed fit</li>
                  <li>• Indo-western pieces run true to size</li>
                  <li>• Churidar pants are stretchable for comfort</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-secondary/30 rounded-sm">
          <p className="text-sm text-center text-muted-foreground">
            Need help with sizing? Contact us at{' '}
            <a href="mailto:hello@luxemia.com" className="text-primary underline underline-offset-2">
              hello@luxemia.com
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
