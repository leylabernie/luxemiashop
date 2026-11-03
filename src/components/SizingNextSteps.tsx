import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SizingNextSteps() {
  return (
    <aside className="mb-10 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-5 sm:p-6" aria-label="Sizing next steps">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Put your measurements to use</p>
      <h2 className="mb-2 text-xl font-display font-semibold text-foreground">Measure first, then check the exact product listing.</h2>
      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">Record your measurements with the worksheet. If a listing’s size or construction details are unclear, ask before ordering.</p>
      <div className="flex flex-col flex-wrap gap-3 sm:flex-row">
        <Button asChild><Link to="/sizing-measurements-guide" className="gap-2"><ArrowRight className="h-4 w-4" />Use the measurement worksheet</Link></Button>
        <Button variant="outline" asChild><Link to="/contact" className="gap-2"><MessageCircle className="h-4 w-4" />Ask a sizing question</Link></Button>
        <Button variant="outline" asChild><Link to="/ready-to-ship" className="gap-2"><ShoppingBag className="h-4 w-4" />Shop Ready-to-Ship Outfits</Link></Button>
      </div>
    </aside>
  );
}
