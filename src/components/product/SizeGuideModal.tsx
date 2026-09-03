import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ruler } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SizeGuideModalProps {
  category?: string;
}

export const SizeGuideModal = ({ category }: SizeGuideModalProps) => {
  const [open, setOpen] = useState(false);
  const categoryLabel = category?.trim() || 'this product';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-0 font-normal text-primary underline underline-offset-4 hover:text-primary/80">
          <Ruler className="mr-1 h-4 w-4" />
          Size Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Check the Selected Product&apos;s Size Details</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-5 text-sm leading-6 text-muted-foreground">
          <p>
            LuxeMia does not apply one universal chart to every {categoryLabel.toLowerCase()} listing.
            Letter sizes, numeric sizes, finished-garment measurements, stitching status and available
            options can differ by product.
          </p>

          <ol className="list-decimal space-y-3 pl-5">
            <li>Record your current body measurements without adding or subtracting ease unless the selected listing tells you to do so.</li>
            <li>Compare them with the exact size and measurement information shown for the selected product and variant.</li>
            <li>Do not assume that a familiar size label, garment type or country conversion will fit the same way across products.</li>
          </ol>

          <div className="rounded-sm border border-border/50 bg-card/50 p-4">
            If the listing does not provide enough information, contact LuxeMia before ordering. A measurement
            comparison is planning guidance, not a fit guarantee, and tailoring is included only when the exact
            product and selected option expressly say so.
          </div>

          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/sizing-measurements-guide" onClick={() => setOpen(false)}>
              Open the Measurement Guide
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
