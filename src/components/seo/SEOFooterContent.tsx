import { Link } from 'react-router-dom';

const SEOFooterContent = () => {
  return (
    <section className="bg-secondary/30 border-t border-border/50">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-xl lg:text-2xl mb-6 text-center">
            Buy Indian Ethnic Wear Online at LuxeMia
          </h2>
          
          <div className="prose prose-sm max-w-none text-muted-foreground font-light leading-relaxed">
            <p className="mb-6">
              Welcome to <strong className="text-foreground">LuxeMia</strong>, your destination for affordable Indian ethnic wear online. 
              Buy <Link to="/sarees" className="text-foreground hover:text-primary transition-colors underline">sarees</Link>, 
              <Link to="/lehengas" className="text-foreground hover:text-primary transition-colors underline"> bridal lehengas</Link>, 
              <Link to="/suits" className="text-foreground hover:text-primary transition-colors underline">salwar kameez</Link>, and 
              <Link to="/jewelry" className="text-foreground hover:text-primary transition-colors underline">Indian jewelry</Link> that 
              blend timeless tradition with contemporary style at affordable prices.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="font-serif text-lg text-foreground mb-3">Buy Wedding Sarees Online</h3>
                <p>
                  Explore our curated range of <Link to="/sarees" className="text-foreground hover:text-primary transition-colors underline">wedding sarees online</Link> including 
                  <strong className="text-foreground"> Banarasi silk sarees</strong>, 
                  Kanjivaram silk, and <strong className="text-foreground">Organza sarees with gota patti work</strong>. Sourced from India's renowned textile hubs. Perfect for <Link to="/indian-ethnic-wear-usa" className="text-foreground hover:text-primary transition-colors underline">NRIs in USA</Link> looking for authentic 
                  Indian wedding attire with <strong className="text-foreground">ready-to-ship</strong> convenience.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-foreground mb-3">Buy Bridal Lehengas Online</h3>
                <p>
                  Find your dream <Link to="/lehengas" className="text-foreground hover:text-primary transition-colors underline">bridal lehenga online</Link> in our extensive collection. 
                  From <strong className="text-foreground">traditional red bridal lehengas</strong> to <strong className="text-foreground">minimalist pastel lehengas</strong>, we offer 
                  <Link to="/lehengas" className="text-foreground hover:text-primary transition-colors underline"> lehenga choli</Link> sets 
                  with beautiful embroidery and zardozi work. Ideal for <Link to="/indian-ethnic-wear-uk" className="text-foreground hover:text-primary transition-colors underline">UK weddings</Link> and 
                  <Link to="/indian-ethnic-wear-canada" className="text-foreground hover:text-primary transition-colors underline">Canadian celebrations</Link>.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="font-serif text-lg text-foreground mb-3">Buy Salwar Kameez Online</h3>
                <p>
                  Buy <Link to="/suits" className="text-foreground hover:text-primary transition-colors underline">salwar kameez online</Link> at affordable prices. 
                  Discover elegant <strong className="text-foreground">anarkali suits</strong>, 
                  palazzo sets, and <strong className="text-foreground">sharara suits</strong> perfect for every occasion. 
                  Our collection features quality fabrics like georgette, chanderi silk, and velvet, 
                  adorned with thread work, mirror work, and contemporary prints.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-foreground mb-3">Buy Indian Jewelry Online</h3>
                <p>
                  Shop <Link to="/jewelry" className="text-foreground hover:text-primary transition-colors underline">Indian jewelry online</Link> at LuxeMia. 
                  Discover <strong className="text-foreground">kundan necklace sets</strong>, bridal jewelry, 
                  <strong className="text-foreground"> jhumka earrings</strong>, bangles, and maang tikka. 
                  Perfect for weddings, festivals, and celebrations. Free worldwide shipping.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="font-serif text-lg text-foreground mb-3">Indo-Western Dresses & Fusion Outfits</h3>
                <p>
                  Buy <Link to="/indowestern" className="text-foreground hover:text-primary transition-colors underline">indo-western dresses online</Link> at LuxeMia. 
                  Shop fusion Indian outfits combining traditional embroidery with contemporary silhouettes — 
                  <strong className="text-foreground">coord sets</strong>, <strong className="text-foreground">cape sets</strong>, and 
                  <strong className="text-foreground">jumpsuits</strong> perfect for modern occasions.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-foreground mb-3">Reception & Party Wear</h3>
                <p>
                  Discover glamorous <Link to="/collections" className="text-foreground hover:text-primary transition-colors underline">reception outfits</Link> and 
                  <strong className="text-foreground"> Indo-western reception gowns</strong>. Our collection features sequined ensembles and 
                  <strong className="text-foreground">cocktail sarees</strong> perfect for wedding receptions and sangeet nights. 
                  Stand out with <strong className="text-foreground">minimalist bridesmaid dresses</strong> and statement pieces.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="font-serif text-lg text-foreground mb-3">Buy Sherwani & Menswear Online</h3>
                <p>
                  Complete your family's ethnic look with our <Link to="/menswear" className="text-foreground hover:text-primary transition-colors underline">men's ethnic wear</Link> collection. 
                  Buy <strong className="text-foreground">sherwanis online</strong>, kurta pajama sets, and Nehru jackets 
                  in quality silk and cotton blends. Perfect for weddings, festivals, and celebrations.
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

            <div className="text-center mt-8 pt-6 border-t border-border/50">
              <h3 className="font-serif text-lg text-foreground mb-3">Why Choose LuxeMia?</h3>
              <p>
                LuxeMia is the best Indian ethnic wear store online for affordable, stylish ethnic clothing. 
                Every piece in our collection is sourced from India's established textile suppliers and manufacturers. 
                We offer <strong className="text-foreground">free worldwide shipping</strong> to USA, UK, Canada, and 50+ countries, 
                custom sizing, and friendly styling assistance to help you find the perfect outfit for every occasion. 
                <Link to="/brand-story" className="text-foreground hover:text-primary transition-colors underline"> Read our story</Link> and discover 
                why thousands of customers trust LuxeMia for their Indian ethnic wear needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SEOFooterContent;
