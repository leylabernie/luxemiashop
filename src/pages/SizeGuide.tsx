import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ruler, Info, FileText } from "lucide-react";
import MeasurementForm from "@/components/measurements/MeasurementForm";

const SizeGuide = () => {
  const lehengaSizes = [
    { size: "XS", bust: "32", waist: "26", hips: "35", length: "40" },
    { size: "S", bust: "34", waist: "28", hips: "37", length: "40" },
    { size: "M", bust: "36", waist: "30", hips: "39", length: "41" },
    { size: "L", bust: "38", waist: "32", hips: "41", length: "41" },
    { size: "XL", bust: "40", waist: "34", hips: "43", length: "42" },
    { size: "XXL", bust: "42", waist: "36", hips: "45", length: "42" },
  ];

  const blouseSizes = [
    { size: "32", bust: "32", underBust: "28", shoulderWidth: "13", sleeveLength: "6" },
    { size: "34", bust: "34", underBust: "30", shoulderWidth: "13.5", sleeveLength: "6" },
    { size: "36", bust: "36", underBust: "32", shoulderWidth: "14", sleeveLength: "6.5" },
    { size: "38", bust: "38", underBust: "34", shoulderWidth: "14.5", sleeveLength: "6.5" },
    { size: "40", bust: "40", underBust: "36", shoulderWidth: "15", sleeveLength: "7" },
    { size: "42", bust: "42", underBust: "38", shoulderWidth: "15.5", sleeveLength: "7" },
  ];

  const sareeSizes = [
    { type: "Standard Saree", length: "5.5 meters", width: "45 inches", blousePiece: "0.8 meters" },
    { type: "Bridal Saree", length: "6 meters", width: "47 inches", blousePiece: "1 meter" },
    { type: "Petite Saree", length: "5 meters", width: "44 inches", blousePiece: "0.8 meters" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Size Guide — LuxeMia"
        description="Find your perfect fit with the LuxeMia size guide. Measurements for lehengas, sarees, salwar suits, and blouses with US and UK conversions."
        canonical="https://luxemia.shop/size-guide"
      />
      <Header />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6"
            >
              <Ruler className="w-4 h-4" />
              <span className="text-sm font-medium">Find Your Perfect Fit</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6"
            >
              Size Guide
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto"
            >
              All measurements are in inches unless specified. For the best fit, 
              we recommend taking your measurements while wearing undergarments.
            </motion.p>
          </div>
        </section>

        {/* How to Measure */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl text-foreground mb-6 text-center">
                How to Take Your Measurements
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card rounded-lg p-4 border border-border text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-semibold text-primary">1</span>
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Bust</h3>
                  <p className="text-muted-foreground text-sm">Measure around the fullest part of your bust</p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-semibold text-primary">2</span>
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Waist</h3>
                  <p className="text-muted-foreground text-sm">Measure at the narrowest point of your natural waist</p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-semibold text-primary">3</span>
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Hips</h3>
                  <p className="text-muted-foreground text-sm">Measure around the fullest part of your hips</p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-semibold text-primary">4</span>
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Length</h3>
                  <p className="text-muted-foreground text-sm">Measure from waist to desired hem length</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Size Charts */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="lehenga" className="max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="lehenga">Lehengas & Suits</TabsTrigger>
                <TabsTrigger value="blouse">Blouses</TabsTrigger>
                <TabsTrigger value="saree">Sarees</TabsTrigger>
              </TabsList>

              <TabsContent value="lehenga">
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Size</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Bust (in)</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Waist (in)</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Hips (in)</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Length (in)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {lehengaSizes.map((row) => (
                          <tr key={row.size} className="hover:bg-secondary/20">
                            <td className="px-6 py-4 text-sm font-medium text-foreground">{row.size}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{row.bust}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{row.waist}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{row.hips}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{row.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="blouse">
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Size</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Bust (in)</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Under Bust (in)</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Shoulder (in)</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Sleeve (in)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {blouseSizes.map((row) => (
                          <tr key={row.size} className="hover:bg-secondary/20">
                            <td className="px-6 py-4 text-sm font-medium text-foreground">{row.size}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{row.bust}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{row.underBust}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{row.shoulderWidth}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{row.sleeveLength}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="saree">
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Type</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Length</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Width</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Blouse Piece</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {sareeSizes.map((row) => (
                          <tr key={row.type} className="hover:bg-secondary/20">
                            <td className="px-6 py-4 text-sm font-medium text-foreground">{row.type}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{row.length}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{row.width}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{row.blousePiece}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Measurement Submission Form */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Submit Your Measurements</span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                  Custom Measurement Form
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  For custom-made garments, please submit your measurements using the form below. 
                  We recommend having a professional tailor take your measurements for the best fit.
                </p>
              </motion.div>

              <MeasurementForm />
            </div>
          </div>
        </section>

        {/* Custom Sizing Info */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Need Help?</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">
                Questions About Measurements?
              </h2>
              <p className="text-muted-foreground mb-6">
                Our styling team is here to help. Contact us for personalized fitting advice or 
                if you need assistance with your measurements. Custom orders typically take 2-3 
                weeks additional production time.
              </p>
              <p className="text-muted-foreground text-sm">
                Email: <span className="text-primary">customfitting@luxemia.com</span> | 
                Phone: <span className="text-primary">+1 (213) 555-1234</span>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SizeGuide;
