import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const FlashSaleBanner = () => {
  return (
    <div className="border-y border-border/60 bg-background/95 py-3 text-foreground lg:py-3.5">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-5">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <span className="font-medium">
              Fresh styles just added for weddings, festivals, parties, and family celebrations
            </span>
          </div>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <span className="text-xs text-muted-foreground">
            Sarees, lehengas, salwar suits, ready-to-wear sarees, and men's kurta sets
          </span>

          <Link
            to="/new-arrivals"
            data-testid="flash-sale-cta"
            className="text-xs font-medium uppercase tracking-[0.18em] underline underline-offset-4 transition-colors hover:text-primary"
          >
            Shop New Arrivals
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FlashSaleBanner;
