import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'video' | 'auto';
}

const LazyImage = ({
  src,
  alt,
  className,
  placeholderClassName,
  aspectRatio = 'auto',
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    video: 'aspect-video',
    auto: '',
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-card',
        aspectClasses[aspectRatio],
        className
      )}
    >
      {/* Shimmer Placeholder */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-r from-card via-muted to-card animate-pulse transition-opacity duration-500',
          isLoaded ? 'opacity-0' : 'opacity-100',
          placeholderClassName
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>

      {/* Actual Image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;