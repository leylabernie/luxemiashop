import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Timer } from 'lucide-react';

const SALE_END = new Date();
SALE_END.setHours(SALE_END.getHours() + 47, 59, 59, 0);

const pad = (n: number) => String(n).padStart(2, '0');

const getTimeLeft = () => {
  const diff = Math.max(0, SALE_END.getTime() - Date.now());
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { hours, minutes, seconds, done: diff === 0 };
};

const FlashSaleBanner = () => {
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (time.done) return null;

  return (
    <div className="bg-foreground text-background py-4 lg:py-5">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium tracking-wide uppercase">
              Spring Sale — Up to 30% Off
            </span>
          </div>

          <div className="flex items-center gap-1.5" aria-label="Sale countdown timer">
            {[
              { value: pad(time.hours), label: 'hrs' },
              { value: pad(time.minutes), label: 'min' },
              { value: pad(time.seconds), label: 'sec' },
            ].map((unit, i) => (
              <span key={unit.label} className="flex items-center gap-1">
                {i > 0 && <span className="text-background/50 font-bold">:</span>}
                <span className="inline-flex flex-col items-center">
                  <span
                    data-testid={`countdown-${unit.label}`}
                    className="font-mono text-lg font-bold leading-none tabular-nums"
                  >
                    {unit.value}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-background/60">{unit.label}</span>
                </span>
              </span>
            ))}
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
