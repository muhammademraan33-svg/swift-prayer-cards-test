import { standardSizes, addOns, recommendStandOffs } from "@/lib/pricing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import type { StandOffChoice } from "./types";
import silverImg from "@/assets/standoff-silver.jpg";
import blackImg from "@/assets/standoff-black.jpg";

interface Props {
  sizeIdx: number;
  standOff: StandOffChoice;
  standOffQty: number;
  roundedCorners: boolean;
  onStandOff: (v: StandOffChoice) => void;
  onStandOffQty: (v: number) => void;
  onRoundedCorners: (v: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepMounting = ({ sizeIdx, standOff, standOffQty, roundedCorners, onStandOff, onStandOffQty, onRoundedCorners, onNext, onBack }: Props) => {
  const size = standardSizes[sizeIdx];
  const qty = recommendStandOffs(size.w, size.h);

  const standOptions: { id: StandOffChoice; label: string; desc: string; img?: string }[] = [
    { id: "none", label: "No Holes", desc: "Print only — mount your way" },
    { id: "silver", label: "Silver", desc: "Polished chrome float mount", img: silverImg },
    { id: "black", label: "Black", desc: "Matte black modern mount", img: blackImg },
  ];

  const totalPrice = standOff === "none"
    ? 0
    : standOff === "silver"
      ? qty * addOns.standOffSilver
      : qty * addOns.standOffBlack;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Finishing Touches
        </h2>
        <p className="text-muted-foreground font-body mt-2 tracking-wide text-sm">
          Select your mounting hardware and corner finish.
        </p>
      </div>

      {/* Stand-off options */}
      <div>
        <h3 className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-primary mb-2">
          Wall Mounting
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {standOptions.map((opt) => {
            const isSelected = standOff === opt.id;
            const optPrice = opt.id === "none" ? 0 : opt.id === "silver" ? qty * addOns.standOffSilver : qty * addOns.standOffBlack;
            return (
              <Card
                key={opt.id}
                className={`overflow-hidden cursor-pointer transition-all duration-200 ${
                  isSelected ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/40"
                }`}
                onClick={() => {
                  onStandOff(opt.id);
                  if (opt.id !== "none") onStandOffQty(qty);
                }}
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-secondary">
                  {opt.img ? (
                    <img src={opt.img} alt={opt.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl text-muted-foreground">✕</span>
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-2 text-center">
                  <p className="text-xs font-display font-bold text-foreground">{opt.label}</p>
                  <p className="text-[9px] text-muted-foreground font-body">{opt.desc}</p>
                  <p className="text-sm font-display font-bold text-gradient-gold mt-0.5">
                    {opt.id === "none" ? "Included" : `$${optPrice.toFixed(0)}`}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Rounded corners */}
      <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-4">
        <Checkbox id="rounded" checked={roundedCorners} onCheckedChange={(v) => onRoundedCorners(!!v)} />
        <Label htmlFor="rounded" className="font-body text-foreground cursor-pointer flex-1">
          Rounded Corners
          <span className="text-xs text-muted-foreground ml-2">(+${addOns.roundedCorners.toFixed(2)})</span>
        </Label>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="font-body gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2">
          Review Order <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepMounting;
