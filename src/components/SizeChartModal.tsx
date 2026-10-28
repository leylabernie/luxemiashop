import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface SizeChartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** No supplier-verified chart is supplied to this generic help surface. */
export const SizeChartModal = ({ open, onOpenChange }: SizeChartModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="font-serif text-2xl">Product-specific Size Guidance</DialogTitle>
        <DialogDescription>There is no universal stitching size chart for every design.</DialogDescription>
      </DialogHeader>
      <div className="mt-4 space-y-4 text-sm text-muted-foreground">
        <p>Use the selected product’s available sizes and any verified garment measurements or size chart in its listing. A letter, number or age label alone does not establish bust, waist, hip, shoulder or length measurements.</p>
        <p>Confirm whether measurements describe the body or the finished garment, and record whether the units are inches or centimetres. Do not substitute an adult chart for a child’s garment.</p>
        <p>If product-specific measurements are missing or you are between sizes, contact LuxeMia before ordering. Alteration availability and the measurements needed must be confirmed for the selected item.</p>
        <a href="/size-guide" className="inline-block text-primary underline underline-offset-2">How to compare product measurements</a>
      </div>
    </DialogContent>
  </Dialog>
);
