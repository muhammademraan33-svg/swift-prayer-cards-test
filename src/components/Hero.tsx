import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/30" />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4a853\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      />

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
