import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, X, Sparkles, ChevronLeft, ChevronRight, Download, RefreshCw, Share2, Copy, Check } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sareeProducts } from "@/data/sareeProducts";
import { localProducts } from "@/data/localProducts";
import { suitProducts } from "@/data/suitProducts";
import { getOptimizedImage } from "@/lib/imageUtils";
import LazyImage from "@/components/ui/LazyImage";

type ProductCategory = "sarees" | "lehengas" | "suits";

interface Product {
  id: string;
  handle: string;
  title: string;
  price: string;
  images: string[];
  fabric: string;
  color: string;
}

const VirtualTryOn = () => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [category, setCategory] = useState<ProductCategory>("sarees");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get lehengas from localProducts (filter by category)
  const lehengaProducts: Product[] = useMemo(() => 
    localProducts.filter(p => 
      p.category.toLowerCase().includes('lehenga')
    ).map(p => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      price: p.price,
      images: p.images,
      fabric: p.fabric,
      color: p.color
    })), []);

  const suitProductsList: Product[] = useMemo(() => 
    suitProducts.map(p => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      price: p.price,
      images: p.images,
      fabric: p.fabric,
      color: p.color
    })), []);

  const sareeProductsList: Product[] = useMemo(() => 
    sareeProducts.map(p => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      price: p.price,
      images: p.images,
      fabric: p.fabric,
      color: p.color
    })), []);

  const currentProducts = useMemo(() => {
    switch (category) {
      case "lehengas": return lehengaProducts;
      case "suits": return suitProductsList;
      default: return sareeProductsList;
    }
  }, [category, lehengaProducts, suitProductsList, sareeProductsList]);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(currentProducts.length / itemsPerPage);
  
  const paginatedProducts = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return currentProducts.slice(start, start + itemsPerPage);
  }, [currentPage, currentProducts]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUserImage(event.target?.result as string);
      setResultImage(null);
    };
    reader.readAsDataURL(file);
  };

  const getCategoryLabel = (cat: ProductCategory): string => {
    switch (cat) {
      case "lehengas": return "lehenga";
      case "suits": return "suit";
      default: return "saree";
    }
  };

  const handleTryOn = async () => {
    if (!userImage || !selectedProduct) {
      toast.error(`Please upload your photo and select a ${getCategoryLabel(category)}`);
      return;
    }

    setIsProcessing(true);
    setResultImage(null);

    try {
      // Get high-res product image
      const productImageUrl = getOptimizedImage(selectedProduct.images[0], 'gallery');

      const { data, error } = await supabase.functions.invoke("virtual-tryon", {
        body: {
          userImage,
          garmentImage: productImageUrl,
          garmentTitle: selectedProduct.title,
          garmentType: getCategoryLabel(category)
        }
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResultImage(data.image);
      toast.success("Virtual try-on complete!");
    } catch (error) {
      console.error("Try-on error:", error);
      toast.error("Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `tryon-${selectedProduct?.handle || getCategoryLabel(category)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  const handleShare = async (platform: string) => {
    if (!resultImage || !selectedProduct) return;

    const shareText = `Check out how I look in this ${selectedProduct.title} from LuxeMia! ✨`;
    const shareUrl = `${window.location.origin}/product/${selectedProduct.handle}`;

    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
        break;
      case "pinterest":
        window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareText)}`, "_blank");
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank");
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          toast.success("Link copied to clipboard!");
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.error("Failed to copy link");
        }
        break;
    }
  };

  const handleReset = () => {
    setUserImage(null);
    setSelectedProduct(null);
    setResultImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCategoryChange = (newCategory: ProductCategory) => {
    setCategory(newCategory);
    setCurrentPage(0);
    setSelectedProduct(null);
    setResultImage(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <p className="text-xs tracking-[0.3em] text-muted-foreground mb-3">
              AI-POWERED
            </p>
            <h1 className="font-serif text-4xl md:text-5xl mb-4">Virtual Try-On</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Upload your photo and see how our beautiful ethnic wear would look on you. 
              Powered by AI for a realistic preview experience.
            </p>
          </motion.div>

          {/* Category Tabs */}
          <Tabs value={category} onValueChange={(v) => handleCategoryChange(v as ProductCategory)} className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="sarees">Sarees</TabsTrigger>
              <TabsTrigger value="lehengas">Lehengas</TabsTrigger>
              <TabsTrigger value="suits">Suits</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Upload & Select */}
            <div className="space-y-8">
              {/* Upload Section */}
              <Card className="p-6">
                <h2 className="font-serif text-xl mb-4 flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Your Photo
                </h2>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {!userImage ? (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-[3/4] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Upload your photo</p>
                      <p className="text-sm text-muted-foreground">
                        For best results, use a full-body photo
                      </p>
                    </div>
                  </motion.button>
                ) : (
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                    <img
                      src={userImage}
                      alt="Your photo"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => {
                        setUserImage(null);
                        setResultImage(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </Card>

              {/* Product Selection */}
              <Card className="p-6">
                <h2 className="font-serif text-xl mb-4">
                  Select a {category === "sarees" ? "Saree" : category === "lehengas" ? "Lehenga" : "Suit"}
                </h2>
                
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {paginatedProducts.map((product) => (
                    <motion.button
                      key={product.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedProduct(product);
                        setResultImage(null);
                      }}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedProduct?.id === product.id
                          ? "border-primary"
                          : "border-transparent hover:border-primary/30"
                      }`}
                    >
                      <LazyImage
                        src={getOptimizedImage(product.images[0], 'thumbnail')}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      {selectedProduct?.id === product.id && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Sparkles className="h-3 w-3 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage >= totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {selectedProduct && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-muted/50 rounded-lg"
                  >
                    <p className="font-medium text-sm">{selectedProduct.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedProduct.fabric} • {selectedProduct.color}
                    </p>
                  </motion.div>
                )}
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleTryOn}
                  disabled={!userImage || !selectedProduct || isProcessing}
                  className="flex-1 h-12"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Try On {category === "sarees" ? "Saree" : category === "lehengas" ? "Lehenga" : "Suit"}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleReset} className="h-12">
                  Reset
                </Button>
              </div>
            </div>

            {/* Right Column - Result */}
            <div>
              <Card className="p-6 h-full">
                <h2 className="font-serif text-xl mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Your Look
                </h2>

                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted/30 relative">
                  <AnimatePresence mode="wait">
                    {isProcessing ? (
                      <motion.div
                        key="processing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                      >
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                          <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium">Creating your look...</p>
                          <p className="text-sm text-muted-foreground">
                            Our AI is styling the {getCategoryLabel(category)} on you
                          </p>
                        </div>
                      </motion.div>
                    ) : resultImage ? (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full"
                      >
                        <img
                          src={resultImage}
                          alt="Virtual try-on result"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 right-4 flex gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="secondary">
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleShare("facebook")}>
                                Facebook
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare("twitter")}>
                                Twitter / X
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare("pinterest")}>
                                Pinterest
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
                                WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare("copy")}>
                                {copied ? (
                                  <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy Link
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleDownload}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
                      >
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Sparkles className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">
                          {!userImage && !selectedProduct
                            ? `Upload your photo and select a ${getCategoryLabel(category)} to see your virtual look`
                            : !userImage
                            ? "Upload your photo to continue"
                            : `Select a ${getCategoryLabel(category)} to try on`}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {resultImage && selectedProduct && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-muted/50 rounded-lg"
                  >
                    <p className="font-medium">{selectedProduct.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ${selectedProduct.price} USD
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                      asChild
                    >
                      <a href={`/product/${selectedProduct.handle}`}>
                        View Product Details
                      </a>
                    </Button>
                  </motion.div>
                )}
              </Card>
            </div>
          </div>

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 p-6 bg-muted/30 rounded-lg"
          >
            <h3 className="font-serif text-lg mb-4">Tips for Best Results</h3>
            <div className="grid sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="text-primary">1.</span>
                <p>Use a clear, well-lit full-body photo for the most realistic results</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">2.</span>
                <p>Stand in a neutral pose facing the camera directly</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">3.</span>
                <p>Wear fitted clothing so the AI can accurately drape the saree</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VirtualTryOn;
