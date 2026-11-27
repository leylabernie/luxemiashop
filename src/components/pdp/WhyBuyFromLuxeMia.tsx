import { Truck, ShieldCheck, Scissors, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  RETURN_CLAIM_WINDOW,
} from '@/lib/returnPolicyCopy';
import { US_FREE_SHIPPING_THRESHOLD } from '@/config/shippingPolicy';

/**
 * Trust & guarantee highlights shown under Add to Bag on every product page.
 * All statements mirror the published shipping, returns and alteration policies;
 * delivery windows are estimates and the credit applies to eligible custom-stitched
 * blouses, cholis and suit tops only.
 */
export const WhyBuyFromLuxeMia = () => (
  <section
    className="space-y-2 rounded-sm border border-border/50 bg-card/50 p-4 text-xs"
    aria-labelledby="why-luxemia-heading"
  >
    <h3 id="why-luxemia-heading" className="font-medium text-foreground">
      Why Buy From LuxeMia?
    </h3>
    <ul className="space-y-2 text-muted-foreground">
      <li className="flex gap-2">
        <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
        <span>
          <strong className="text-foreground">Tracked delivery:</strong> Ready-to-Ship items arrive in 5–7 business
          days to the U.S. via DHL/FedEx (estimate, not guaranteed). Free U.S. standard shipping at ${US_FREE_SHIPPING_THRESHOLD}+.
        </span>
      </li>
      <li className="flex gap-2">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
        <span>
          <strong className="text-foreground">{RETURN_CLAIM_WINDOW} order protection:</strong> report damage or a defect
          within {RETURN_CLAIM_WINDOW} of delivery with 2–3 photos for a full refund or replacement. No unboxing video required.
        </span>
      </li>
      <li className="flex gap-2">
        <Scissors className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
        <span>
          <strong className="text-foreground">Fit allowance:</strong> eligible custom-stitched blouses, cholis and suit tops
          include a 2-inch internal seam allowance where construction permits, plus up to $20 USD Local Alteration Credit.
        </span>
      </li>
      <li className="flex gap-2">
        <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
        <span>
          <strong className="text-foreground">U.S. support:</strong> Philadelphia, PA ·{' '}
          <a href="tel:+12153419990" className="text-link underline">+1-215-341-9990</a>.{' '}
          <Link to="/returns" className="text-link underline">See terms</Link>.
        </span>
      </li>
    </ul>
  </section>
);
