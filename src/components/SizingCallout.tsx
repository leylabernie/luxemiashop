import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SizingCalloutProps {
  heading?: string;
  text: string;
  label: string;
  href: string;
  ariaLabel: string;
}

/** Shopping callout used on the sizing guide pages; copy lives in data/sizingCalloutCopy.ts. */
export default function SizingCallout({ heading, text, label, href, ariaLabel }: SizingCalloutProps) {
  return (
    <aside className="no-print container mx-auto my-8 max-w-4xl px-4" aria-label={ariaLabel}>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
        <p className="mb-4 text-sm leading-relaxed text-foreground">
          {heading && <strong>{heading} </strong>}
          {text}
        </p>
        <Link to={href} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          {label} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
