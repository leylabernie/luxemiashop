import { ImageIcon } from 'lucide-react';

interface ProductPlaceholderProps {
  className?: string;
  label?: string;
}

const ProductPlaceholder = ({ className = '', label = 'Product Image' }: ProductPlaceholderProps) => {
  return (
    <div className={`flex flex-col items-center justify-center bg-card border-2 border-dashed border-border/50 ${className}`}>
      <ImageIcon className="w-8 h-8 text-foreground/30 mb-2" />
      <span className="text-xs text-foreground/40 tracking-wide uppercase">{label}</span>
    </div>
  );
};

export default ProductPlaceholder;
