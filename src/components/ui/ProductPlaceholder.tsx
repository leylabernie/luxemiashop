import { ImageIcon } from 'lucide-react';

interface ProductPlaceholderProps {
  className?: string;
  label?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'auto';
  size?: 'sm' | 'md' | 'lg';
}

const ProductPlaceholder = ({ 
  className = '', 
  label = 'Product Image',
  aspectRatio = 'portrait',
  size = 'md'
}: ProductPlaceholderProps) => {
  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    auto: '',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className={`flex flex-col items-center justify-center bg-card border-2 border-dashed border-border/50 w-full h-full ${aspectClasses[aspectRatio]} ${className}`}>
      <ImageIcon className={`${iconSizes[size]} text-foreground/30 mb-2`} />
      <span className={`${textSizes[size]} text-foreground/40 tracking-wide uppercase text-center px-2`}>{label}</span>
    </div>
  );
};

export default ProductPlaceholder;
