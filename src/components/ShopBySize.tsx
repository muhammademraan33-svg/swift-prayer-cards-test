import { standardSizes, calcMetalPrice, metalOptions } from "@/lib/pricing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ShopBySize = () => {
  const scrollToCalculator = (sizeIdx: number) => {
    const el = document.querySelector("#calculator");
    el?.scrollIntoView({ behavior: "smooth" });
    window.dispatchEvent(
      new CustomEvent("select-size", { detail: { sizeIdx } })
    );
  };

  return (
    <section id="shop-by-size" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-[0.4em] uppercase text-primary font-body mb-4">
            The Collection
          </p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            Select Your Dimensions
          </h2>
          <p className="text-muted-foreground font-body mt-4 max-w-lg mx-auto tracking-wide">
            21 archival sizes — from intimate desk pieces to commanding
            statement walls. Each crafted to your exact specifications.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {standardSizes.map((size, idx) => {
            const price = calcMetalPrice(size.w, size.h, metalOptions[0]);
            return (
              <Card
                key={size.label}
                className="bg-card border-border hover:border-primary/50 transition-all duration-300 group cursor-pointer p-5 text-center"
                onClick={() => scrollToCalculator(idx)}
              >
                <p className="text-lg font-display font-bold text-foreground mb-1">
                  {size.label}
                </p>
                <p className="text-xs text-muted-foreground font-body mb-3">
                  {size.w * size.h} sq in
                </p>
                <p className="text-xl font-display font-bold text-primary">
                  ${price}
                </p>
                <p className="text-[10px] text-muted-foreground font-body mt-1">
                  from (.040" SS)
                </p>
                <div className="mt-3 flex items-center justify-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity font-body">
                  Configure <ArrowRight className="w-3 h-3" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ShopBySize;
