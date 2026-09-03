import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCcw, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import CatalogLoadError from '@/components/collections/CatalogLoadError';
import ProductCard from '@/components/ui/ProductCard';
import type { ShopifyProduct } from '@/lib/shopify';

type Answers = {
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

type QuizOption = {
  value: string;
  label: string;
  desc: string;
  icon?: LucideIcon;
  swatch?: string[];
};

type QuizStep = {
  id: keyof Answers;
  question: string;
  subtitle: string;
  options: QuizOption[];
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
    if (p.node.priceRange.minVariantPrice.currencyCode !== 'USD') return false;
    const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
    return price >= range[0] && price <= range[1];
  });
};

const STEPS: QuizStep[] = [
  {
    id: 'budget',
    question: 'Which USD price range should we use?',
    subtitle: 'This filters the current Shopify minimum product price; it does not assess quality or suitability.',
    options: [
      { value: 'low', label: 'Under $200 USD', desc: 'Minimum listed price from $0 through $200 USD' },
      { value: 'mid', label: '$200–$500 USD', desc: 'Minimum listed price from $200 through $500 USD' },
      { value: 'high', label: '$500–$1,000 USD', desc: 'Minimum listed price from $500 through $1,000 USD' },
      { value: 'luxury', label: '$1,000+ USD', desc: 'Minimum listed price at or above $1,000 USD' },
    ],
  },
  {
    id: 'silhouette',
    question: 'Which catalog type should we filter?',
    subtitle: 'The result uses Shopify product types and explicit catalog fields; verify every listing before ordering.',
    options: [
      { value: 'lehenga', label: 'Lehenga', desc: 'Filter product types containing a lehenga term' },
      { value: 'saree', label: 'Saree', desc: 'Filter product types containing a saree term' },
      { value: 'suit', label: 'Suit / Anarkali', desc: 'Filter product types containing a suit, sharara, or Anarkali term' },
      { value: 'indo', label: 'Indo-Western', desc: 'Filter explicit product types, tags, or titles containing Indo-Western or fusion terms' },
    ],
  },
];

const getProfile = (answers: Answers): Profile => {
  const resultBySilhouette: Record<string, { label: string; href: string }> = {
    lehenga: { label: 'Lehenga', href: '/lehengas' },
    saree: { label: 'Saree', href: '/sarees' },
    suit: { label: 'Suit and Anarkali', href: '/suits' },
    indo: { label: 'Indo-Western', href: '/indowestern' },
  };
  const result = resultBySilhouette[answers.silhouette || ''] || {
    label: 'Current Catalog',
    href: '/collections',
  };
  return {
    name: `${result.label} Catalog Result`,
    tagline: 'Live catalog filters applied',
    description: 'These results use only the selected silhouette filter, USD price range, and current availability fields. They do not verify fit, comfort, color accuracy, event suitability, construction, or included pieces; the selected product page controls.',
    emoji: '🔎',
    gradient: 'from-stone-50 via-rose-50 to-amber-50 dark:from-stone-950/30 dark:via-rose-950/30 dark:to-amber-950/30',
    primaryHref: result.href,
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
  const {
    products: allProducts,
    isLoading: productsLoading,
    error: productsError,
  } = useShopifyProducts();

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
      filtered = filterByBudget(filtered, answers.budget);
    }
    // Availability is positive evidence: require both the product flag and at
    // least one explicitly available variant.
    filtered = filtered.filter(p => (
      p.node.availableForSale === true
      && p.node.variants.edges.some((edge) => edge.node.availableForSale === true)
    ));
    return filtered.slice(0, 8);
  }, [showResult, allProducts, answers.silhouette, answers.budget]);

  const displayProducts = matchedProducts;

  const profile = showResult ? getProfile(answers) : null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Filter the Current Catalog — LuxeMia Browse Quiz"
        description="Use two catalog filters—USD price range and product type—then verify all product, fit, color, availability, and occasion details on the selected listing."
        canonical="https://luxemia.shop/style-quiz"
        noIndex={true}
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
                                {opt.swatch?.map((c, i) => (
                                  <div key={i} className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                                ))}
                              </div>
                            )}
                            {opt.icon && (
                              <div className={`mb-3 ${isSelected ? 'text-background' : 'text-primary'}`}>
                                <opt.icon className="w-5 h-5" />
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
                    Your Catalog Filter
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
                    <h2 className="text-2xl lg:text-3xl font-serif mb-2">Current Catalog Results</h2>
                    <p className="text-sm text-muted-foreground">
                      {answers.budget && BUDGET_RANGE[answers.budget]
                        ? `USD minimum price filter${BUDGET_RANGE[answers.budget][1] < 99999 ? ` · $${BUDGET_RANGE[answers.budget][0]}–$${BUDGET_RANGE[answers.budget][1]}` : ` · $${BUDGET_RANGE[answers.budget][0]}+`}`
                        : 'Current catalog records'}
                    </p>
                  </div>

                  {productsLoading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                      {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                  ) : productsError ? (
                    <CatalogLoadError retryHref="/style-quiz" />
                  ) : displayProducts.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                      {displayProducts.map((product, i) => (
                        <ProductCard key={product.node.id} product={product} index={i} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">No current products match both selected filters.</p>
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
                    Need listing-specific help?{' '}
                    <Link to="/contact" className="underline hover:text-foreground">
                      Contact LuxeMia for help
                    </Link>{' '}
                    before ordering.
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
