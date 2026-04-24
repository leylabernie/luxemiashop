import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Crown, Users, Sparkles, Star, Feather, Zap, Diamond, Palette, ArrowRight, RotateCcw, Check } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';
import type { ShopifyProduct } from '@/lib/shopify';

type Answers = {
  occasion?: string;
  style?: string;
  colors?: string;
  budget?: string;
  silhouette?: string;
};

type Profile = {
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  gradient: string;
  primaryHref: string;
};

// Map silhouette answer → Shopify productType keywords
const SILHOUETTE_KEYWORDS: Record<string, string[]> = {
  lehenga: ['lehenga', 'bridal lehenga'],
  saree: ['saree'],
  suit: ['pakistani suit', 'salwar suit', 'sharara', 'anarkali', 'plazzo suit', 'wedding suit', 'sharara suit', 'co-ords', 'dresses', 'indian ethnic set'],
  indo: ['indo western', 'indo-western', 'fusion wear', 'fusion', 'dhoti pants', 'jumpsuit', 'cape set', 'coord set'],
};

// Budget → price range [min, max]
const BUDGET_RANGE: Record<string, [number, number]> = {
  low: [0, 200],
  mid: [200, 500],
  high: [500, 1000],
  luxury: [1000, 99999],
};

// Filter products by silhouette answer against productType
const filterBySilhouette = (products: ShopifyProduct[], silhouette: string): ShopifyProduct[] => {
  const keywords = SILHOUETTE_KEYWORDS[silhouette];
  if (!keywords) return products;
  if (silhouette === 'indo') {
    return products.filter(p => {
      const pt = (p.node.productType ?? '').toLowerCase();
      const tags = (p.node.tags ?? []).map(t => t.toLowerCase());
      const title = (p.node.title ?? '').toLowerCase();
      return keywords.some(k => pt.includes(k))
        || tags.some(t => t.includes('indo') || t.includes('fusion') || t.includes('western'))
        || title.includes('indo') || title.includes('fusion');
    });
  }
  return products.filter(p => {
    const pt = (p.node.productType ?? '').toLowerCase();
    return keywords.some(k => pt.includes(k));
  });
};

const filterByBudget = (products: ShopifyProduct[], budget: string): ShopifyProduct[] => {
  const range = BUDGET_RANGE[budget];
  if (!range) return products;
  return products.filter(p => {
    const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
    return price >= range[0] && price <= range[1];
  });
};

const STEPS = [
  {
    id: 'occasion',
    question: "What's the occasion?",
    subtitle: "Tell us what you're dressing for",
    options: [
      { value: 'bridal', icon: Crown, label: "I'm the Bride", desc: 'Dressing for my own wedding or pre-wedding events' },
      { value: 'guest', icon: Users, label: 'Wedding Guest', desc: 'Attending a friend or family wedding' },
      { value: 'festive', icon: Sparkles, label: 'Festive Occasion', desc: 'Diwali, Eid, Navratri, or religious celebration' },
      { value: 'party', icon: Star, label: 'Party / Reception', desc: 'Birthday, anniversary, or evening event' },
    ],
  },
  {
    id: 'style',
    question: "What's your style personality?",
    subtitle: 'Choose the aesthetic that feels most like you',
    options: [
      { value: 'traditional', icon: Diamond, label: 'Traditional & Regal', desc: 'Rich embroidery, classic silhouettes, timeless elegance' },
      { value: 'modern', icon: Feather, label: 'Modern & Minimalist', desc: 'Clean lines, understated luxury, contemporary details' },
      { value: 'bold', icon: Zap, label: 'Bold & Glamorous', desc: 'Statement pieces, maximum drama, showstopping presence' },
      { value: 'fusion', icon: Palette, label: 'Fusion & Indo-Western', desc: 'East meets West, modern silhouettes with Indian craft' },
    ],
  },
  {
    id: 'colors',
    question: 'Choose your colour story',
    subtitle: 'Which palette speaks to you most?',
    options: [
      { value: 'jewel', label: 'Jewel Tones', desc: 'Deep ruby, sapphire blue, emerald, regal purple', swatch: ['#9B2335', '#1B4B8A', '#1A5C38', '#5B2D8E'] },
      { value: 'pastel', label: 'Soft Pastels', desc: 'Blush pink, powder blue, lavender, mint, ivory', swatch: ['#F4A7B9', '#B8D4E8', '#C9B3D8', '#A8D5B5'] },
      { value: 'metallic', label: 'Rich Metallics', desc: 'Antique gold, rose gold, silver, champagne', swatch: ['#C9A84C', '#E8A87C', '#B8C0CC', '#C9A876'] },
      { value: 'bright', label: 'Bold & Bright', desc: 'Hot pink, electric blue, tangerine, cobalt', swatch: ['#E91E8C', '#1E7BC4', '#FF6B35', '#2B5CE6'] },
    ],
  },
  {
    id: 'budget',
    question: "What's your budget?",
    subtitle: 'We have beautiful pieces at every price point',
    options: [
      { value: 'low', label: 'Under $200', desc: 'Elegant everyday pieces and casual festive wear' },
      { value: 'mid', label: '$200 – $500', desc: 'Semi-formal embroidered outfits and occasion wear' },
      { value: 'high', label: '$500 – $1,000', desc: 'Designer pieces and semi-bridal collections' },
      { value: 'luxury', label: '$1,000+', desc: 'Bridal and couture-level handcrafted pieces' },
    ],
  },
  {
    id: 'silhouette',
    question: 'Which silhouette calls to you?',
    subtitle: 'Your favourite way to wear Indian fashion',
    options: [
      { value: 'lehenga', label: 'Flowing Lehenga', desc: 'Grand flared skirt with fitted blouse and dupatta' },
      { value: 'saree', label: 'Draped Saree', desc: 'Six yards of timeless, graceful Indian elegance' },
      { value: 'suit', label: 'Suit / Anarkali', desc: 'Long kameez with trousers — versatile and comfortable' },
      { value: 'indo', label: 'Indo-Western', desc: 'Contemporary silhouettes fused with Indian embellishment' },
    ],
  },
];

const getProfile = (answers: Answers): Profile => {
  const { occasion, style, silhouette } = answers;

  if (occasion === 'bridal') {
    if (style === 'fusion' || style === 'modern') {
      return {
        name: 'The Contemporary Bride',
        tagline: 'Modern luxe with Indian soul',
        description: "You love Indian craftsmanship but want a fresh, contemporary silhouette. Indo-Western bridal pieces and modern lehengas with clean embroidery are your perfect match.",
        emoji: '✨',
        gradient: 'from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-pink-950/30',
        primaryHref: '/indowestern',
      };
    }
    return {
      name: 'The Classic Bride',
      tagline: 'Regal, timeless, unforgettable',
      description: 'You were born for the grandeur of a classic bridal lehenga — rich zardozi work, flowing silhouettes, and jewel-toned fabrics that make every moment iconic.',
      emoji: '👑',
      gradient: 'from-rose-50 via-red-50 to-orange-50 dark:from-rose-950/30 dark:via-red-950/30 dark:to-orange-950/30',
      primaryHref: '/lehengas',
    };
  }

  if (occasion === 'festive') {
    return {
      name: 'The Festive Queen',
      tagline: 'Born to celebrate in colour',
      description: 'Festivals are your stage. You love vibrant colours, celebratory embroidery, and outfits that radiate joy. Salwar kameez, sharara sets, and festive lehengas are your signature.',
      emoji: '🎊',
      gradient: 'from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30',
      primaryHref: '/collections',
    };
  }

  if (occasion === 'party' || style === 'fusion') {
    return {
      name: 'The Style Fusion Icon',
      tagline: 'Where East meets effortlessly West',
      description: "You're drawn to contemporary Indo-Western pieces — structured jackets over lehengas, dhoti pants, cape sarees, and pieces that turn heads at any modern event.",
      emoji: '⚡',
      gradient: 'from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-violet-950/30',
      primaryHref: '/indowestern',
    };
  }

  if (silhouette === 'saree' || (style === 'modern' && silhouette !== 'lehenga')) {
    return {
      name: 'The Timeless Draper',
      tagline: 'Grace, poise, and six yards of perfection',
      description: 'The saree is your language. Whether Kanchipuram silk, Banarasi brocade, or designer georgette — you carry yourself with effortless grace and quiet confidence.',
      emoji: '🌸',
      gradient: 'from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-cyan-950/30',
      primaryHref: '/sarees',
    };
  }

  return {
    name: 'The Regal Wedding Guest',
    tagline: 'Every wedding needs a showstopper guest',
    description: "You know how to dress for someone else's big day without upstaging — bold enough to photograph beautifully, elegant enough to respect the occasion.",
    emoji: '💎',
    gradient: 'from-pink-50 via-fuchsia-50 to-purple-50 dark:from-pink-950/30 dark:via-fuchsia-950/30 dark:to-purple-950/30',
    primaryHref: '/lehengas',
  };
};

const TOTAL_STEPS = STEPS.length;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 60 : -60, opacity: 0 }),
};

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="aspect-[3/4] bg-muted rounded-sm mb-2" />
    <div className="h-3 bg-muted rounded w-1/2 mb-1.5" />
    <div className="h-3 bg-muted rounded w-3/4 mb-1.5" />
    <div className="h-3 bg-muted rounded w-1/3" />
  </div>
);

const StyleQuiz = () => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);

  // Pre-fetch ALL products as soon as quiz mounts (cached for result display)
  const { products: allProducts, isLoading: productsLoading } = useShopifyProducts();

  const current = STEPS[step];

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [current.id]: value };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (step < TOTAL_STEPS - 1) {
        setDirection(1);
        setStep(s => s + 1);
      } else {
        setShowResult(true);
      }
    }, 280);
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const handleReset = () => {
    setStep(0);
    setDirection(1);
    setAnswers({});
    setShowResult(false);
  };

  // Derive matched products from quiz answers
  const matchedProducts = useMemo(() => {
    if (!showResult || !answers.silhouette) return [];
    let filtered = filterBySilhouette(allProducts, answers.silhouette);
    if (answers.budget) {
      const byBudget = filterByBudget(filtered, answers.budget);
      // Fall back to all in silhouette category if budget filter is too narrow
      filtered = byBudget.length >= 4 ? byBudget : filtered;
    }
    // Keep only available products
    filtered = filtered.filter(p => p.node.variants.edges[0]?.node.availableForSale !== false);
    return filtered.slice(0, 8);
  }, [showResult, allProducts, answers.silhouette, answers.budget]);

  // Fallback products if silhouette category empty (show any in-stock items)
  const displayProducts = matchedProducts.length > 0
    ? matchedProducts
    : allProducts.filter(p => p.node.variants.edges[0]?.node.availableForSale !== false).slice(0, 8);

  const profile = showResult ? getProfile(answers) : null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Find Your Style — LuxeMia Style Quiz"
        description="Take LuxeMia's style quiz to discover your perfect Indian ethnic wear look. Get personalised outfit recommendations in 5 quick questions."
        canonical="https://luxemia.shop/style-quiz"
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-20">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Progress bar */}
              <div className="h-1 bg-muted">
                <motion.div
                  className="h-full bg-foreground"
                  animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>

              <div className="container mx-auto px-4 lg:px-8 max-w-3xl py-12">
                <div className="flex items-center justify-between mb-8">
                  <button
                    onClick={handleBack}
                    className={`text-sm text-muted-foreground hover:text-foreground transition-colors ${step === 0 ? 'invisible' : ''}`}
                  >
                    ← Back
                  </button>
                  <span className="text-xs tracking-widest uppercase text-muted-foreground">{step + 1} / {TOTAL_STEPS}</span>
                  <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Start over
                  </button>
                </div>

                {/* Step dots */}
                <div className="flex justify-center gap-2 mb-10">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all duration-300 ${
                        i < step ? 'w-4 h-2 bg-foreground' : i === step ? 'w-6 h-2 bg-foreground' : 'w-2 h-2 bg-muted'
                      }`}
                    />
                  ))}
                </div>

                <AnimatePresence custom={direction} mode="wait">
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="text-center mb-10">
                      <h1 className="text-3xl lg:text-4xl font-serif mb-3">{current.question}</h1>
                      <p className="text-muted-foreground">{current.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {current.options.map((opt) => {
                        const isSelected = answers[current.id as keyof Answers] === opt.value;
                        return (
                          <motion.button
                            key={opt.value}
                            onClick={() => handleSelect(opt.value)}
                            whileTap={{ scale: 0.98 }}
                            className={`relative text-left p-5 rounded-lg border-2 transition-all duration-200 ${
                              isSelected
                                ? 'border-foreground bg-foreground text-background'
                                : 'border-border bg-card hover:border-foreground/40'
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-background flex items-center justify-center">
                                <Check className="w-3 h-3 text-foreground" />
                              </span>
                            )}
                            {'swatch' in opt && (
                              <div className="flex gap-1 mb-3">
                                {(opt as any).swatch.map((c: string, i: number) => (
                                  <div key={i} className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                                ))}
                              </div>
                            )}
                            {'icon' in opt && (opt as any).icon && (
                              <div className={`mb-3 ${isSelected ? 'text-background' : 'text-primary'}`}>
                                {(() => { const Icon = (opt as any).icon; return <Icon className="w-5 h-5" />; })()}
                              </div>
                            )}
                            <p className={`font-semibold text-sm mb-1 ${isSelected ? 'text-background' : 'text-foreground'}`}>
                              {opt.label}
                            </p>
                            <p className={`text-xs leading-relaxed ${isSelected ? 'text-background/70' : 'text-muted-foreground'}`}>
                              {opt.desc}
                            </p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Profile Hero */}
              <section className={`py-16 lg:py-20 bg-gradient-to-b ${profile!.gradient}`}>
                <div className="container mx-auto px-4 lg:px-8 text-center max-w-2xl">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="text-6xl mb-6"
                  >
                    {profile!.emoji}
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3"
                  >
                    Your Style Profile
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-4xl lg:text-5xl font-serif mb-3"
                  >
                    {profile!.name}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg text-muted-foreground italic mb-4"
                  >
                    {profile!.tagline}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto"
                  >
                    {profile!.description}
                  </motion.p>
                </div>
              </section>

              {/* Matched Products */}
              <section className="py-14">
                <div className="container mx-auto px-4 lg:px-8">
                  <div className="text-center mb-10">
                    <h2 className="text-2xl lg:text-3xl font-serif mb-2">Outfits Matched For You</h2>
                    <p className="text-sm text-muted-foreground">
                      {answers.budget && BUDGET_RANGE[answers.budget]
                        ? `Filtered to your budget${BUDGET_RANGE[answers.budget][1] < 99999 ? ` · $${BUDGET_RANGE[answers.budget][0]}–$${BUDGET_RANGE[answers.budget][1]}` : ` · $${BUDGET_RANGE[answers.budget][0]}+`}`
                        : 'Selected from our collection'}
                    </p>
                  </div>

                  {productsLoading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                      {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                  ) : displayProducts.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                      {displayProducts.map((product, i) => (
                        <ProductCard key={product.node.id} product={product} index={i} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">Loading your matched pieces…</p>
                  )}

                  {/* CTA row */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
                    <Button asChild size="lg">
                      <Link to={profile!.primaryHref}>
                        See Full Collection
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" onClick={handleReset}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retake Quiz
                    </Button>
                  </div>

                  <p className="text-center text-xs text-muted-foreground mt-6">
                    Want expert help?{' '}
                    <Link to="/style-consultation" className="underline hover:text-foreground">
                      Book a free style consultation
                    </Link>{' '}
                    with our team.
                  </p>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default StyleQuiz;
