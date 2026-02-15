import { standardSizes, addOns, recommendStandOffs } from "@/lib/pricing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Info, Check } from "lucide-react";
import type { StandOffChoice } from "./types";

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
  const recommended = recommendStandOffs(size.w, size.h);

  const standOptions: { id: StandOffChoice; label: string; desc: string; price: string }[] = [
    { id: "none", label: "No Mounting", desc: "Print only — use your own hardware", price: "Included" },
    { id: "silver", label: "Silver Stand-Offs", desc: "Polished chrome — floats print 1\" from wall", price: `$${addOns.standOffSilver.toFixed(2)} each` },
    { id: "black", label: "Black Stand-Offs", desc: "Matte black — sleek modern look", price: `$${addOns.standOffBlack.toFixed(2)} each` },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Finishing Touches
        </h2>
        <p className="text-muted-foreground font-body mt-3 tracking-wide">
          Select your mounting hardware and corner finish.
        </p>
      </div>

      {/* Stand-offs */}
      <div className="space-y-4">
        <h3 className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-primary">
          Wall Mounting
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {standOptions.map((opt) => (
            <Card
              key={opt.id}
              className={`p-5 cursor-pointer transition-all ${
                standOff === opt.id ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/40"
              }`}
              onClick={() => {
                onStandOff(opt.id);
                if (opt.id !== "none") onStandOffQty(recommended);
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-display font-semibold text-foreground">{opt.label}</h4>
                {standOff === opt.id && <Check className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground font-body mb-2">{opt.desc}</p>
              <p className="text-sm font-display font-bold text-primary">{opt.price}</p>
            </Card>
          ))}
        </div>

        {standOff !== "none" && (
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
              <Info className="w-3 h-3 text-primary" />
              Recommended: {recommended} stand-offs for {size.label}
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-foreground font-body text-sm">Quantity:</Label>
              <Input
                type="number"
                min={4}
                max={20}
                value={standOffQty}
                onChange={(e) => onStandOffQty(Math.max(4, Number(e.target.value)))}
                className="bg-secondary border-border text-foreground font-body w-20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Rounded corners */}
      <div className="space-y-4">
        <h3 className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-primary">
          Corner Finish
        </h3>
        <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-4">
          <Checkbox id="rounded" checked={roundedCorners} onCheckedChange={(v) => onRoundedCorners(!!v)} />
          <Label htmlFor="rounded" className="font-body text-foreground cursor-pointer flex-1">
            Rounded Corners
            <span className="text-xs text-muted-foreground ml-2">(+${addOns.roundedCorners.toFixed(2)})</span>
          </Label>
        </div>
      </div>

      <div className="flex justify-between pt-4">
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
