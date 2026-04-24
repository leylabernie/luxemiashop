import { Link } from 'react-router-dom';

const SEOFooterContent = () => {
  return (
    <section className="bg-secondary/30 border-t border-border/50">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-xl lg:text-2xl mb-6 text-center">
            Shop Indian Ethnic Wear Online at LuxeMia
          </h2>
          
          <div className="prose prose-sm max-w-none text-muted-foreground font-light leading-relaxed">
            <p className="mb-6">
              Welcome to <strong className="text-foreground">LuxeMia</strong>, your premier destination for luxury Indian ethnic wear. 
              We bring you an exquisite collection of handcrafted <Link to="/sarees" className="text-foreground hover:text-primary transition-colors underline">designer sarees</Link>, 
              <Link to="/lehengas" className="text-foreground hover:text-primary transition-colors underline"> bridal lehengas</Link>, 
              and <Link to="/suits" className="text-foreground hover:text-primary transition-colors underline">anarkali suits</Link> that 
              blend timeless tradition with contemporary elegance.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="font-serif text-lg text-foreground mb-3">Wedding Sarees Collection</h3>
                <p>
                  Explore our curated range of <Link to="/sarees" className="text-foreground hover:text-primary transition-colors underline">wedding sarees</Link> including 
                  <strong className="text-foreground"> Banarasi silk sarees</strong>, 
                  Kanjivaram silk, and <strong className="text-foreground">Organza sarees with gota patti work</strong>. Each piece is crafted by skilled 
                  artisans using traditional weaving techniques. Perfect for <Link to="/indian-ethnic-wear-usa" className="text-foreground hover:text-primary transition-colors underline">NRIs in USA</Link> looking for authentic 
                  Indian wedding attire with <strong className="text-foreground">ready-to-ship</strong> convenience.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-foreground mb-3">Bridal Lehengas & Wedding Wear</h3>
                <p>
                  Find your dream <Link to="/lehengas" className="text-foreground hover:text-primary transition-colors underline">bridal lehenga</Link> in our extensive collection. 
                  From <strong className="text-foreground">traditional red bridal lehengas</strong> to <strong className="text-foreground">minimalist pastel lehengas</strong>, we offer 
                  <Link to="/lehengas" className="text-foreground hover:text-primary transition-colors underline"> designer lehenga choli</Link> sets 
                  with heavy embroidery and genuine zardozi. Ideal for <Link to="/indian-ethnic-wear-uk" className="text-foreground hover:text-primary transition-colors underline">UK weddings</Link> and 
                  <Link to="/indian-ethnic-wear-canada" className="text-foreground hover:text-primary transition-colors underline">Canadian celebrations</Link>.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="font-serif text-lg text-foreground mb-3">Reception & Party Wear</h3>
                <p>
                  Discover glamorous <Link to="/collections" className="text-foreground hover:text-primary transition-colors underline">reception outfits</Link> and 
                  <strong className="text-foreground"> Indo-western reception gowns</strong>. Our collection features sequined ensembles and 
                  <strong className="text-foreground">cocktail sarees</strong> perfect for wedding receptions and sangeet nights. 
                  Stand out with <strong className="text-foreground">minimalist bridesmaid dresses</strong> and statement pieces.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-foreground mb-3">Festive & Occasion Wear</h3>
                <p>
                  Celebrate in style with our <Link to="/collections" className="text-foreground hover:text-primary transition-colors underline">festive wear</Link> collection. 
                  Shop <strong className="text-foreground">Haldi outfits for NRI guests</strong> and vibrant ensembles for 
                  <strong className="text-foreground">Diwali, Navratri, and Karwa Chauth</strong>. From playful yellows to auspicious reds, 
                  find the perfect look for every Indian celebration.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="font-serif text-lg text-foreground mb-3">Suits & Salwar Kameez</h3>
                <p>
                  Discover elegant <Link to="/suits" className="text-foreground hover:text-primary transition-colors underline">anarkali suits</Link>, 
                  palazzo sets, and <strong className="text-foreground">sharara suits</strong> perfect for every occasion. 
                  Our collection features premium fabrics like pure georgette, chanderi silk, and velvet, 
                  adorned with delicate thread work, mirror work, and contemporary prints.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-foreground mb-3">Menswear Collection</h3>
                <p>
                  Complete your family's ethnic look with our <Link to="/menswear" className="text-foreground hover:text-primary transition-colors underline">men's ethnic wear</Link> collection. 
                  Shop <strong className="text-foreground">designer sherwanis</strong>, Indo-western kurtas, and Nehru jackets 
                  crafted from premium silk and cotton blends. Perfect for weddings, festivals, and celebrations.
                </p>
              </div>
            </div>

            <div className="text-center mt-8 pt-6 border-t border-border/50">
              <h3 className="font-serif text-lg text-foreground mb-3">Why Choose LuxeMia?</h3>
              <p>
                At LuxeMia, we are committed to preserving Indian textile heritage while delivering modern luxury. 
                Every piece in our collection is sourced directly from master craftsmen across India—from the silk weavers 
                of Varanasi to the embroidery artisans of Lucknow. We offer <strong className="text-foreground">worldwide shipping</strong>, 
                custom alterations, and dedicated styling assistance to ensure you find the perfect ensemble for every occasion. 
                <Link to="/brand-story" className="text-foreground hover:text-primary transition-colors underline"> Read our story</Link> and discover 
                the artisans behind our collections.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SEOFooterContent;
