import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="Luxury metal print on wall" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="mb-6">
          <span className="inline-block text-sm tracking-[0.3em] uppercase text-primary font-body">
            Premium Metal & Acrylic
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 leading-tight">
          <span className="text-gradient-gold">Luxury</span>
          <br />
          <span className="text-foreground">Metal Prints</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground font-body font-light max-w-2xl mx-auto mb-4">
          Stunning metal eternity cards, business cards, invitations, prayer cards
          & custom prints. Crafted with precision, delivered with care.
        </p>

        <p className="text-primary font-body font-semibold tracking-wide text-sm mb-10">
          DELIVERED IN 48–72 HOURS
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-gradient-gold text-primary-foreground font-body font-semibold tracking-wide hover:opacity-90 transition-opacity px-8"
            onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
          >
            Explore Products
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary font-body tracking-wide hover:bg-primary hover:text-primary-foreground transition-colors px-8"
            onClick={() => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })}
          >
            Get a Quote
          </Button>
        </div>

        <div className="mt-16 animate-bounce">
          <ArrowDown className="w-5 h-5 text-primary mx-auto" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
