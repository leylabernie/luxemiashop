import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const FlashSaleBanner = () => {
  return (
    <div className="bg-foreground text-background py-4 lg:py-5">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium tracking-wide uppercase">
              New Arrivals — Shop the Latest Collection
            </span>
          </div>

          <Link
            to="/new-arrivals"
            data-testid="flash-sale-cta"
            className="text-xs uppercase tracking-widest underline underline-offset-2 hover:text-background/80 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FlashSaleBanner;
