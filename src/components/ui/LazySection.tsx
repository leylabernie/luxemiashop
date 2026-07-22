import { useState, useEffect, useRef, type ReactNode } from 'react';

/**
 * LazySection — wraps a component and only renders it when it scrolls
 * into the viewport (IntersectionObserver). This removes framer-motion,
 * lucide-react, and other heavy dependencies from the initial bundle for
 * below-the-fold sections.
 *
 * PSI 2026-07-22: CustomerStories, SustainabilityBanner, LookbookTeaser,
 * ShopByCategory, ShopByOccasion, ServiceHighlights all import
 * framer-motion (~41KB gzip). By lazy-loading them with IntersectionObserver,
 * we remove ~41KB from the initial JS execution path, improving bootup-time
 * and reducing unused-javascript.
 */
interface LazySectionProps {
  children: ReactNode;
  /** IntersectionObserver rootMargin — default triggers ~100px before entering viewport */
  rootMargin?: string;
  /** Minimum height placeholder to reserve space and prevent CLS (default 200px) */
  placeholderHeight?: number;
  /** Optional className for the wrapper */
  className?: string;
}

const LazySection: React.FC<LazySectionProps> = ({
  children,
  rootMargin = '200px',
  placeholderHeight = 200,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If IntersectionObserver is not available, show immediately
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el); // Stop observing once visible
        }
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        minHeight: isVisible ? undefined : placeholderHeight,
        contentVisibility: isVisible ? 'visible' : 'auto',
        containIntrinsicSize: `${placeholderHeight}px`,
      }}
    >
      {isVisible ? children : null}
    </div>
  );
};

export default LazySection;
