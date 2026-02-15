import { standardSizes, calcMetalPrice, metalOptions } from "@/lib/pricing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

interface Props {
  imageUrl: string;
  sizeIdx: number;
  onSelect: (idx: number) => void;
  onNext: () => void;
  onBack: () => void;
}

// Group sizes for visual comparison
const sizeGroups = [
  { label: "Desk & Shelf", range: [0, 4] as const },
  { label: "Wall Art", range: [4, 10] as const },
  { label: "Statement Pieces", range: [10, 16] as const },
  { label: "Grand Scale", range: [16, 21] as const },
];

const StepSize = ({ imageUrl, sizeIdx, onSelect, onNext, onBack }: Props) => {
  const selected = standardSizes[sizeIdx];
  const maxDim = 96; // largest dimension for scaling

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Choose Your Size
        </h2>
        <p className="text-muted-foreground font-body mt-3 tracking-wide">
          See how your art looks at every dimension. Tap any size to preview.
        </p>
      </div>

      {/* Live preview */}
      <div className="flex justify-center py-4">
        <div className="relative bg-secondary/30 border border-border rounded-lg p-8 flex items-center justify-center" style={{ width: "100%", maxWidth: 500, minHeight: 300 }}>
          {/* Scale indicator */}
          <div className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm border border-border rounded px-3 py-1">
            <span className="text-xs font-body text-primary font-semibold">{selected.label}</span>
          </div>
          <div
            className="overflow-hidden rounded shadow-2xl transition-all duration-500 ease-out"
            style={{
              width: `${(selected.w / maxDim) * 100}%`,
              aspectRatio: `${selected.w} / ${selected.h}`,
              maxHeight: 280,
            }}
          >
            <img src={imageUrl} alt="Print preview" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Size grid by category */}
      {sizeGroups.map((group) => (
        <div key={group.label}>
          <h3 className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-primary mb-3">
            {group.label}
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {standardSizes.slice(group.range[0], group.range[1]).map((size, i) => {
              const idx = group.range[0] + i;
              const isSelected = idx === sizeIdx;
              const price = calcMetalPrice(size.w, size.h, metalOptions[0]);
              return (
                <Card
                  key={idx}
                  className={`p-3 text-center cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "ring-2 ring-primary border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                  onClick={() => onSelect(idx)}
                >
                  {isSelected && <Check className="w-3 h-3 text-primary mx-auto mb-1" />}
                  <p className="text-sm font-display font-bold text-foreground">{size.label}</p>
                  <p className="text-[10px] text-muted-foreground font-body">{size.w * size.h} sq in</p>
                  <p className="text-sm font-display font-bold text-primary mt-1">from ${price}</p>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="font-body gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2">
          Choose Material <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepSize;
