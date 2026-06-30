import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { motion } from 'framer-motion';
import { Ruler, Shirt, Scissors, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SizingMeasurementsGuide = () => {
  const [activeTab, setActiveTab] = useState<'blouse' | 'lehenga' | 'saree'>('blouse');

  const faqs = [
    {
      question: 'How do I measure blouse size for a saree?',
      answer: 'To measure your blouse size for a saree, wear a well-fitting bra and use a soft measuring tape. Measure your bust at the fullest part (around the nipples and shoulder blades), under-bust just below the bust line, shoulder width from edge to edge across the back, and blouse length from the shoulder down to where you want the blouse to end. Add 1-2 inches of ease to your actual bust measurement for a comfortable fit. Most Indian blouse sizes correspond to bust measurement in inches (32, 34, 36, 38, 40, 42, 44).'
    },
    {
      question: 'What is the standard blouse size chart in India?',
      answer: 'Standard Indian blouse sizes run from 32 to 48 in bust measurement. Size 32 = XS, 34 = S, 36 = M, 38 = L, 40 = XL, 42 = XXL, 44 = 3XL, 46 = 4XL, 48 = 5XL. The corresponding under-bust measurements are typically 2-4 inches less than the bust. Shoulder width ranges from 13 inches (size 32) to 16 inches (size 44).'
    },
    {
      question: 'How do I measure for a custom stitched lehenga choli?',
      answer: 'For a custom stitched lehenga choli, you need seven key measurements: bust, under-bust, waist, hips, shoulder width, blouse length, and skirt length (from waist to desired hem). Also measure armhole depth and sleeve length if you want sleeves. Submit these measurements in inches after checkout via our measurement form. Always measure over light clothing and have someone help you for accuracy.'
    },
    {
      question: 'What is the difference between ready-to-wear and made-to-measure lehenga sizing?',
      answer: 'Ready-to-wear lehengas come pre-stitched to standard sizes (32-48 bust) and ship within 5-7 business days. Made-to-measure lehengas are stitched to your exact body measurements and take 3-4 weeks to ship. Ready-to-wear is best for emergency shoppers who need fast delivery; made-to-measure is best for brides who want a perfect fit and have time to wait.'
    },
    {
      question: 'How accurate do my measurements need to be?',
      answer: 'Measurements should be accurate to the nearest half-inch. A 1-inch error in bust measurement can result in a blouse that is too tight or too loose. Always measure twice and use a soft, flexible measuring tape (not a metal one). If you are between sizes, size up rather than down — it is easier to take in a blouse than to let it out.'
    },
    {
      question: 'Can I order a lehenga if I do not know my exact measurements?',
      answer: 'Yes. Order the ready-to-wear option in your closest standard size based on your everyday blouse size. If the fit is not perfect, we offer one complimentary alteration on made-to-measure orders. You can also visit any local tailor to get measured — most tailors will measure you for free or for a small fee.'
    },
  ];

  const blouseMeasurements = [
    { measurement: 'Bust', howTo: 'Measure around the fullest part of your bust, keeping the tape parallel to the floor across your back', sizeGuide: 'This is your primary blouse size (e.g., 36 inches = size 36)', tip: 'Wear the bra you plan to wear with the saree' },
    { measurement: 'Under-bust', howTo: 'Measure directly under your bust, where the bra band sits', sizeGuide: 'Should be 2-4 inches less than your bust measurement', tip: 'Do not pull the tape too tight' },
    { measurement: 'Shoulder width', howTo: 'Measure from the edge of one shoulder to the other, across the back of your neck', sizeGuide: 'Typically 13-15.5 inches for sizes 32-42', tip: 'Have a friend help for accuracy' },
    { measurement: 'Blouse length', howTo: 'Measure from the nape of your neck (where the shoulder meets the neck) down to where you want the blouse to end', sizeGuide: 'Standard blouse length is 14-16 inches', tip: 'Crop blouses end above the navel; long blouses end at the waist' },
    { measurement: 'Armhole depth', howTo: 'Measure from the shoulder point down into the armpit', sizeGuide: 'Typically 7-9 inches for sizes 32-42', tip: 'This determines how the sleeve fits' },
    { measurement: 'Sleeve length', howTo: 'Measure from the shoulder point down the arm to the desired sleeve end', sizeGuide: 'Sleeveless = 0, cap = 3, short = 6, elbow = 14, full = 22 inches', tip: 'Specify if you want sleeves at all' },
    { measurement: 'Sleeve circumference', howTo: 'Measure around the arm at the point where the sleeve will end', sizeGuide: 'Typically 10-14 inches depending on arm size', tip: 'Add 1 inch for comfort' },
    { measurement: 'Front neck depth', howTo: 'Measure from the base of the throat down to the desired neckline point', sizeGuide: 'Standard = 7-9 inches; deep = 10-12 inches', tip: 'Specify sweetheart, V, boat, or round neck' },
    { measurement: 'Back neck depth', howTo: 'Measure from the nape of the neck down to the desired back neckline', sizeGuide: 'Standard = 3-5 inches; deep = 6-10 inches', tip: 'Tie-back, hook, or dori style?' },
  ];

  const lehengaMeasurements = [
    { measurement: 'Waist', howTo: 'Measure at the natural waist (the narrowest part of your torso, above the belly button)', sizeGuide: 'This is the skirt waistband size', tip: 'Do not measure over thick clothing' },
    { measurement: 'Hips', howTo: 'Measure around the fullest part of your hips (about 8 inches below the waist)', sizeGuide: 'Should be 6-10 inches more than waist', tip: 'Stand with feet together' },
    { measurement: 'Skirt length', howTo: 'Measure from the waist down to the desired hem length', sizeGuide: 'Standard = 40-42 inches; tall = 44-46 inches', tip: 'Add 1 inch for heel height' },
    { measurement: 'Skirt flare', howTo: 'Not a measurement — choose kali (panel) count: 8, 12, 16, 24, or 36', sizeGuide: 'More kalis = more flare. 36-kali is the most dramatic', tip: '36-kali is best for bridal entry' },
  ];

  const sareeMeasurements = [
    { measurement: 'Saree length', howTo: 'Standard saree = 5.5 meters; bridal saree = 6 meters; petite = 5 meters', sizeGuide: 'Most sarees come in standard 5.5m length', tip: 'No measurement needed — choose standard' },
    { measurement: 'Blouse piece', howTo: 'Most sarees include 0.8-1.0 meters of matching blouse fabric', sizeGuide: 'This is unstitched — you take it to a tailor', tip: 'Check the product description to confirm' },
    { measurement: 'Petticoat waist', howTo: 'Same as your natural waist measurement', sizeGuide: 'Order the petticoat in your waist size', tip: 'Match the petticoat color to the saree' },
  ];

  const measurements = activeTab === 'blouse' ? blouseMeasurements : activeTab === 'lehenga' ? lehengaMeasurements : sareeMeasurements;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="How to Measure Blouse Size for Saree — Step-by-Step Sizing Guide | Luxemia"
        description="Complete guide on how to measure blouse size for saree, lehenga choli, and custom stitched Indian ethnic wear. Step-by-step instructions, size charts, and measurement tips for the perfect fit. Free shipping over $350 to USA."
        canonical="https://luxemia.shop/sizing-measurements-guide"
        faqs={faqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6"
            >
              <Ruler className="w-4 h-4" />
              <span className="text-sm font-medium">Sizing & Custom Measurements Guide</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6"
            >
              How to Measure Blouse Size for Saree
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto"
            >
              Step-by-step instructions for measuring your bust, waist, and blouse length for the perfect
              Indian ethnic wear fit. Covers saree blouses, lehenga cholis, and custom stitched orders.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-3 mt-8"
            >
              <Badge variant="secondary" className="text-sm py-2 px-4">Free shipping over $350 to USA</Badge>
              <Badge variant="secondary" className="text-sm py-2 px-4">Ready-to-wear ships in 5-7 days</Badge>
              <Badge variant="secondary" className="text-sm py-2 px-4">Custom stitched in 3-4 weeks</Badge>
            </motion.div>
          </div>
        </section>

        {/* Why Sizing Matters */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-3xl text-foreground mb-6">
                Why Getting Your Blouse Size Right Matters
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                <p>
                  The single biggest reason shoppers abandon their cart on an Indian ethnic wear website is
                  fear that the blouse or lehenga will not fit. A saree can be draped loosely, a skirt can be
                  pinned at the waist, but a blouse that is even one inch too tight or too loose will ruin
                  the entire look — and there is rarely time to get it re-stitched before the wedding.
                </p>
                <p>
                  Whether you are a bride shopping for your wedding lehenga, a wedding guest looking for a
                  ready-to-wear saree, or an NRI family ordering from the USA without access to a local
                  Indian tailor, this guide will walk you through exactly how to measure yourself for the
                  perfect fit. Every measurement is in inches (the standard for Indian ethnic wear), and we
                  have included size charts, tips, and common mistakes to avoid.
                </p>
                <p>
                  Once you know your measurements, you can confidently order any of our{' '}
                  <Link to="/lehengas" className="text-primary underline hover:text-primary/80">ready-to-ship lehengas</Link>{' '}
                  or{' '}
                  <Link to="/sarees" className="text-primary underline hover:text-primary/80">designer sarees</Link>{' '}
                  knowing the fit will be right the first time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What You'll Need */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-3xl text-foreground mb-8 text-center">
                What You Will Need
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Scissors className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h3 className="font-medium text-foreground mb-2">Soft Measuring Tape</h3>
                    <p className="text-sm text-muted-foreground">
                      A flexible tailor's tape measure (not a metal hardware store tape). Available at any
                      pharmacy or craft store for under $3.
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Shirt className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h3 className="font-medium text-foreground mb-2">A Well-Fitting Bra</h3>
                    <p className="text-sm text-muted-foreground">
                      Wear the bra you plan to wear with the saree or lehenga. A padded or unpadded bra will
                      change your bust measurement by up to an inch.
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <AlertCircle className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h3 className="font-medium text-foreground mb-2">A Friend to Help</h3>
                    <p className="text-sm text-muted-foreground">
                      Measuring yourself is doable but error-prone. Having a friend or family member help
                      ensures the tape stays level and measurements are accurate.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Measurement Tabs */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-display text-3xl text-foreground mb-6 text-center">
                Step-by-Step Measurement Instructions
              </h2>
              <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
                Select the garment type you are measuring for. Each tab walks you through every measurement
                you need, what it means, and a pro tip for getting it right.
              </p>

              {/* Tab Buttons */}
              <div className="flex justify-center gap-2 mb-10 flex-wrap">
                <button
                  onClick={() => setActiveTab('blouse')}
                  className={`px-6 py-3 rounded-full font-medium transition-colors ${
                    activeTab === 'blouse'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/70'
                  }`}
                >
                  Saree Blouse (9 measurements)
                </button>
                <button
                  onClick={() => setActiveTab('lehenga')}
                  className={`px-6 py-3 rounded-full font-medium transition-colors ${
                    activeTab === 'lehenga'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/70'
                  }`}
                >
                  Lehenga Choli (4 measurements)
                </button>
                <button
                  onClick={() => setActiveTab('saree')}
                  className={`px-6 py-3 rounded-full font-medium transition-colors ${
                    activeTab === 'saree'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/70'
                  }`}
                >
                  Saree & Petticoat (3 measurements)
                </button>
              </div>

              {/* Measurement Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Measurement</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">How to Measure</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground hidden md:table-cell">Size Guide</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground hidden lg:table-cell">Pro Tip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((m, i) => (
                      <tr key={m.measurement} className={i % 2 === 0 ? 'bg-secondary/30' : ''}>
                        <td className="py-4 px-4 font-medium text-foreground align-top">{m.measurement}</td>
                        <td className="py-4 px-4 text-sm text-muted-foreground align-top">{m.howTo}</td>
                        <td className="py-4 px-4 text-sm text-muted-foreground align-top hidden md:table-cell">{m.sizeGuide}</td>
                        <td className="py-4 px-4 text-sm text-muted-foreground align-top hidden lg:table-cell italic">{m.tip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Standard Size Chart */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-3xl text-foreground mb-6 text-center">
                Standard Indian Blouse Size Chart (Inches)
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                If you already know your standard size, use this chart. All Luxemia ready-to-wear blouses
                and lehenga cholis follow these measurements.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border bg-primary/10">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Size</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Bust</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Under-bust</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Shoulder</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Blouse Length</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">US Equivalent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { size: '32', bust: '32', underBust: '28', shoulder: '13', length: '14', us: 'XS (0-2)' },
                      { size: '34', bust: '34', underBust: '30', shoulder: '13.5', length: '14.5', us: 'S (4-6)' },
                      { size: '36', bust: '36', underBust: '32', shoulder: '14', length: '15', us: 'M (8-10)' },
                      { size: '38', bust: '38', underBust: '34', shoulder: '14.5', length: '15.5', us: 'L (12-14)' },
                      { size: '40', bust: '40', underBust: '36', shoulder: '15', length: '16', us: 'XL (16-18)' },
                      { size: '42', bust: '42', underBust: '38', shoulder: '15.5', length: '16.5', us: 'XXL (20-22)' },
                      { size: '44', bust: '44', underBust: '40', shoulder: '16', length: '17', us: '3XL (24-26)' },
                      { size: '46', bust: '46', underBust: '42', shoulder: '16.5', length: '17.5', us: '4XL (28-30)' },
                      { size: '48', bust: '48', underBust: '44', shoulder: '17', length: '18', us: '5XL (32-34)' },
                    ].map((row, i) => (
                      <tr key={row.size} className={i % 2 === 0 ? 'bg-background' : 'bg-secondary/20'}>
                        <td className="py-3 px-4 font-medium text-foreground">{row.size}</td>
                        <td className="py-3 px-4 text-muted-foreground">{row.bust}"</td>
                        <td className="py-3 px-4 text-muted-foreground">{row.underBust}"</td>
                        <td className="py-3 px-4 text-muted-foreground">{row.shoulder}"</td>
                        <td className="py-3 px-4 text-muted-foreground">{row.length}"</td>
                        <td className="py-3 px-4 text-muted-foreground">{row.us}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-3xl text-foreground mb-8 text-center">
                Common Measurement Mistakes to Avoid
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <AlertCircle className="w-8 h-8 text-destructive mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">Measuring Over Thick Clothing</h3>
                    <p className="text-sm text-muted-foreground">
                      A sweater or padded bra can add 1-2 inches to your bust measurement. Always measure
                      over a thin bra or fitted top.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <AlertCircle className="w-8 h-8 text-destructive mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">Pulling the Tape Too Tight</h3>
                    <p className="text-sm text-muted-foreground">
                      The tape should sit flat against your body without digging in. If you can see the tape
                      indenting your skin, it is too tight. Add 1 inch of ease for comfort.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <AlertCircle className="w-8 h-8 text-destructive mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">Measuring Alone</h3>
                    <p className="text-sm text-muted-foreground">
                      Back measurements (shoulder width, back neck depth) are nearly impossible to take
                      accurately on yourself. Always ask a friend to help.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <AlertCircle className="w-8 h-8 text-destructive mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">Not Specifying Neckline & Sleeves</h3>
                    <p className="text-sm text-muted-foreground">
                      Even with perfect measurements, a blouse needs neckline and sleeve preferences.
                      Always specify sweetheart/V/boat neck and sleeveless/cap/elbow/full.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Ready-to-Wear vs Custom */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-3xl text-foreground mb-8 text-center">
                Ready-to-Wear vs Custom Stitched: Which Should You Choose?
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <CheckCircle2 className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-3">Choose Ready-to-Wear if:</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• You need the outfit within 2 weeks</li>
                      <li>• Your measurements fit standard sizes (32-48)</li>
                      <li>• You are a wedding guest, not the bride</li>
                      <li>• You live in the USA and need fast delivery</li>
                      <li>• You are between sizes and can size up</li>
                    </ul>
                    <p className="text-sm text-primary font-medium mt-4">Ships in 5-7 business days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <CheckCircle2 className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-3">Choose Custom Stitched if:</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• You are the bride or in the wedding party</li>
                      <li>• You have at least 4 weeks before the event</li>
                      <li>• Your measurements do not fit standard sizes</li>
                      <li>• You want a specific neckline or sleeve style</li>
                      <li>• You want a perfect, tailored fit</li>
                    </ul>
                    <p className="text-sm text-primary font-medium mt-4">Ships in 3-4 weeks</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-3xl text-foreground mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-b border-border pb-6">
                    <h3 className="font-semibold text-foreground mb-2 text-lg">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-4">
              Ready to Find Your Perfect Fit?
            </h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Shop our ready-to-ship lehengas, designer sarees, and bridal collections. Free shipping on
              orders over $350 to the USA, Canada, and Australia.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/lehengas"
                className="inline-flex items-center gap-2 bg-background text-foreground px-6 py-3 rounded-full font-medium hover:bg-background/90 transition-colors"
              >
                Shop Lehengas <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/sarees"
                className="inline-flex items-center gap-2 bg-background/20 text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-background/30 transition-colors border border-primary-foreground/30"
              >
                Shop Sarees <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/size-guide"
                className="inline-flex items-center gap-2 bg-background/20 text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-background/30 transition-colors border border-primary-foreground/30"
              >
                View Standard Size Guide <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SizingMeasurementsGuide;
