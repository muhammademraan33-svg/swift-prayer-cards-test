import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductsSection from "@/components/ProductsSection";
import CardsSection from "@/components/CardsSection";
import PriceCalculator from "@/components/PriceCalculator";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div id="top" className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ProductsSection />
      <CardsSection />
      <PriceCalculator />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
