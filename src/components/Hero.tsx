import { Button } from "@/components/ui/button";
import { Star, Shield, Truck, Award, Clock } from "lucide-react";
import heroImg from "@/assets/hero-lifestyle.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-end pb-20 md:pb-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Museum-grade metal print displayed in luxury penthouse interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full">
        <div className="max-w-2xl">
          {/* Exclusivity badge */}
          <div className="flex items-center gap-1.5 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
            ))}
            <span className="text-xs font-body text-foreground/60 ml-2 tracking-wider">
              Trusted by 2,000+ collectors nationwide
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.02] mb-6 tracking-tight">
            <span className="text-foreground">Turn Any Room Into</span>
            <br />
            <span className="text-foreground">a </span>
            <span className="text-gradient-gold italic">Gallery</span>
            <span className="text-foreground"> — In Just 48 Hours</span>
          </h1>

          <p className="text-base md:text-lg text-foreground font-body font-light max-w-lg mb-10 leading-relaxed tracking-wide">
            Bespoke museum-grade metal & acrylic prints for America's most
            discerning homes. Each piece handcrafted to order.
          </p>

          {/* Delivery guarantee banner */}
          <div className="flex items-center gap-3 mb-8 bg-primary/10 border border-primary/20 rounded-lg px-5 py-3 w-fit backdrop-blur-sm">
            <Clock className="w-5 h-5 text-primary shrink-0" />
            <span className="font-display font-bold text-foreground text-sm md:text-base tracking-wide">
              Guaranteed Delivery in 48–72 Hours
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-14">
            <Button
              size="lg"
              className="bg-gradient-gold text-primary-foreground font-body font-semibold tracking-[0.2em] hover:opacity-90 px-12 h-14 text-xs"
              onClick={() =>
                document
                  .getElementById("wizard")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              CREATE YOUR PRINT
            </Button>
          </div>

          {/* Value props */}
          <div className="flex flex-wrap gap-8 text-xs font-body text-foreground uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-primary" />
              White-Glove Delivery
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-primary" />
              Lifetime Guarantee
            </span>
            <span className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-primary" />
              Handcrafted in USA
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
