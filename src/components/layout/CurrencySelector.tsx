import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const currencies = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];

const CurrencySelector = () => {
  const [selected, setSelected] = useState(currencies[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-xs tracking-editorial uppercase font-light hover:text-foreground/80 transition-colors focus:outline-none">
        {selected.code}
        <ChevronDown className="w-3 h-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px] bg-background border-border">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => setSelected(currency)}
            className={`text-sm font-light cursor-pointer ${
              selected.code === currency.code ? 'bg-card' : ''
            }`}
          >
            <span className="w-6">{currency.symbol}</span>
            <span>{currency.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelector;
