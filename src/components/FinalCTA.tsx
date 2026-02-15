import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="py-28 md:py-36 px-6 bg-secondary/30">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase text-primary font-body mb-4">
          Begin Your Commission
        </p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
          Elevate Your Space <br className="hidden sm:block" />
          <span className="text-gradient-gold italic">With a Masterpiece</span>
        </h2>
        <p className="text-foreground/50 font-body mb-10 max-w-lg mx-auto leading-relaxed tracking-wide">
          Submit any photograph and our artisans will craft a museum-grade
          piece tailored to your vision. Complimentary shipping on orders
          over $150.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            className="bg-gradient-gold text-primary-foreground font-body font-semibold tracking-[0.2em] hover:opacity-90 px-12 h-14 text-xs gap-2"
            onClick={() =>
              document
                .getElementById("shop-by-size")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            EXPLORE COLLECTION <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-foreground/15 text-foreground font-body tracking-[0.2em] hover:bg-foreground/5 px-12 h-14 text-xs"
            onClick={() =>
              document
                .getElementById("calculator")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            COMMISSION A PIECE
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
