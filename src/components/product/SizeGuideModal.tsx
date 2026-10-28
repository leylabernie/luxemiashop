import { useState } from 'react';
import { Ruler } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface SizeGuideModalProps {
  category?: string;
}

export const SizeGuideModal = ({ category = '' }: SizeGuideModalProps) => {
  const [open, setOpen] = useState(false);

  const getDefaultTab = () => {
    if (category?.toLowerCase().includes('saree')) return 'sarees';
    if (category?.toLowerCase().includes('suit') || category?.toLowerCase().includes('sharara') || category?.toLowerCase().includes('anarkali')) return 'suits';
    if (category?.toLowerCase().includes('men') || category?.toLowerCase().includes('sherwani') || category?.toLowerCase().includes('kurta')) return 'menswear';
    if (category?.toLowerCase().includes('lehenga')) return 'lehengas';
    return 'general';
  };
  const defaultTab = getDefaultTab();

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
          <DialogDescription>Fit varies by design. Use the selected product’s size options and verified measurements, not a universal chart.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="mt-4">
          <TabsList className={`grid w-full ${defaultTab === 'general' ? 'h-auto grid-cols-2 sm:grid-cols-5' : 'grid-cols-4'}`}>
            {defaultTab === 'general' && <TabsTrigger value="general">Fit guidance</TabsTrigger>}
            <TabsTrigger value="lehengas">Lehengas</TabsTrigger>
            <TabsTrigger value="sarees">Sarees</TabsTrigger>
            <TabsTrigger value="suits">Suits</TabsTrigger>
            <TabsTrigger value="menswear">Menswear</TabsTrigger>
          </TabsList>

          {defaultTab === 'general' && <TabsContent value="general" className="mt-6 space-y-4">
            <h3 className="font-medium text-lg">Product-specific Fit Guidance</h3>
            <p className="text-sm text-muted-foreground">Use only the size options and verified measurements for the selected product. Garment type, age labels and size names alone do not establish body measurements or fit.</p>
            <p className="text-sm text-muted-foreground">For sets, confirm the measurements of each included piece. Record your measurements and units, and check whether the listing refers to body or finished-garment measurements.</p>
            <p className="text-sm text-muted-foreground">If a product-specific chart or important measurement is missing, ask LuxeMia before ordering. Do not use another garment category’s chart as a substitute.</p>
          </TabsContent>}

          <TabsContent value="lehengas" className="mt-6 space-y-6">
            <h3 className="font-medium text-lg">Lehenga &amp; Choli Fit Guide</h3>
            <p className="text-sm text-muted-foreground">Lehenga and choli measurements vary by design. Size labels do not establish bust, waist, hip or garment-length measurements.</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Take measurements over the undergarments you plan to wear and note the desired skirt length with your planned shoes.</li>
              <li>• Compare your measurements with the exact listing’s verified garment measurements. If details are missing or you are between sizes, ask LuxeMia before ordering.</li>
              <li>• Check the listing for supplied construction, included pieces and available alteration options; a stitched or semi-stitched choli is not implied by the category.</li>
              <li>• Use the selected product and service’s processing estimate when planning for an event.</li>
            </ul>
          </TabsContent>

          <TabsContent value="sarees" className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Saree Sizing Information</h3>
              
              <div className="bg-card/50 border border-border/50 rounded-sm p-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Standard Saree (Unstitched)</h4>
                  <p className="text-sm text-muted-foreground">
                    Saree length, width and draping requirements vary by product. Use dimensions explicitly provided on the selected listing; if they are missing, confirm them before ordering. Do not assume one size will fit every wearer.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Blouse Piece</h4>
                  <p className="text-sm text-muted-foreground">
                    Check the listing’s included pieces: a saree may include blouse fabric, a stitched blouse, or neither. Blouse fabric does not mean a finished blouse or included stitching service. Confirm any needed dimensions and services for the selected product.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Ready-to-Wear Sarees</h4>
                  <p className="text-sm text-muted-foreground">
                    Use only the sizes offered for the selected ready-to-wear saree. Confirm its waistband, length and blouse fit from product-specific measurements; available sizes and construction differ by design.
                  </p>
                </div>
              </div>

              <div className="bg-secondary/50 border border-border/50 rounded-sm p-4">
                <h4 className="font-medium mb-2">Pro Tip</h4>
                <p className="text-sm text-muted-foreground">
                  For blouse fitting, useful measurements may include bust, underbust, shoulder width, armhole, blouse length and sleeve length. Ask which measurements are required for the selected blouse; this list is not a complete tailoring specification.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="suits" className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Salwar Suits, Sharara & Palazzo Fit Guide</h3>
              <p className="text-sm text-muted-foreground">
                Sizes and measurements vary by design. Use the sizes offered on this product page;
                a label such as XS, S or M does not confirm a specific bust or waist measurement.
              </p>
              <div className="bg-card/50 border border-border/50 rounded-sm p-4 space-y-3">
                <h4 className="font-medium">Confirm your fit before ordering</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Measure your bust, waist and hips, and note your preferred top and trouser lengths.</li>
                  <li>• Ask LuxeMia for the design-specific size chart or garment measurements, including XS when offered.</li>
                  <li>• Check the listing for ready-to-wear, semi-stitched or unstitched construction.</li>
                  <li>• Waistband style, sleeve length, dupatta dimensions and alteration options vary by product.</li>
                </ul>
                <a href="https://wa.me/12153419990" className="inline-block text-sm text-primary underline underline-offset-2">
                  Ask for sizing help on WhatsApp
                </a>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="menswear" className="mt-6 space-y-6">
            <h3 className="font-medium text-lg">Men’s Ethnic Wear Fit Guide</h3>
            <p className="text-sm text-muted-foreground">Kurta, sherwani and Indo-western sizing varies by design. Your usual size label does not confirm chest, waist, shoulder or garment-length measurements.</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Record your chest, waist and preferred garment length, then compare with verified measurements for the exact product.</li>
              <li>• Confirm whether any measurements describe the body or the finished garment, and whether they are in inches or centimetres.</li>
              <li>• Check the listing for fabric, waistband and construction details. Stretch, a relaxed fit or a particular size range is not guaranteed.</li>
              <li>• If measurements are missing or you are between sizes, ask LuxeMia before ordering rather than automatically sizing up or down.</li>
            </ul>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-secondary/30 rounded-sm">
          <p className="text-sm text-center text-muted-foreground">
            Need help with sizing? Contact us at{' '}
            <a href="mailto:hello@luxemia.shop" className="text-primary underline underline-offset-2">
              hello@luxemia.shop
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
