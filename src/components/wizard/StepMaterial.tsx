import { standardSizes, calcMetalPrice, calcAcrylicPrice, metalOptions } from "@/lib/pricing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Check, RotateCw, Shield, Sparkles, Gem } from "lucide-react";
import type { MaterialChoice } from "./types";
import acrylicImg from "@/assets/acrylic-print.jpg";
import metalImg from "@/assets/metal-print.jpg";

interface Props {
  imageUrl: string;
  sizeIdx: number;
  material: MaterialChoice;
  onSelect: (m: MaterialChoice) => void;
  onNext: () => void;
  onBack: () => void;
}

const materials: { id: MaterialChoice; label: string; subtitle: string; img: string; features: string[]; icon: React.ReactNode; metalIdx?: number }[] = [
  {
    id: "acrylic",
    label: "Acrylic",
    subtitle: "Vivid & Luminous",
    img: acrylicImg,
    features: ["Face-mounted to 1/4\" acrylic", "Extraordinary depth & vibrancy", "UV-resistant archival inks", "Gallery-ready polished edges"],
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: "metal-designer",
    label: "Metal Designer",
    subtitle: '.040" — Lightweight Elegance',
    img: metalImg,
    features: ["Ultra-thin .040\" aluminum", "Dye-sublimation infused", "Scratch & fade resistant", "Lightweight — easy to hang"],
    icon: <Gem className="w-5 h-5" />,
    metalIdx: 0,
  },
  {
    id: "metal-museum",
    label: "Metal Museum",
    subtitle: '.080" — Heirloom Grade',
    img: metalImg,
    features: ["Heavy-gauge .080\" aluminum", "Museum-grade archival quality", "Superior color depth", "Rigid & substantial feel"],
    icon: <Shield className="w-5 h-5" />,
    metalIdx: 2,
  },
];

const StepMaterial = ({ imageUrl, sizeIdx, material, onSelect, onNext, onBack }: Props) => {
  const size = standardSizes[sizeIdx];

  const getPrice = (m: MaterialChoice) => {
    if (m === "acrylic") return calcAcrylicPrice(size.w, size.h);
    if (m === "metal-designer") return calcMetalPrice(size.w, size.h, metalOptions[0]);
    return calcMetalPrice(size.w, size.h, metalOptions[2]);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Choose Your Medium
        </h2>
        <p className="text-muted-foreground font-body mt-3 tracking-wide max-w-lg mx-auto">
          Each medium transforms your art differently. Metal prints can be double-sided — flip to change your look.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {materials.map((mat) => {
          const isSelected = material === mat.id;
          const price = getPrice(mat.id);
          const isMetal = mat.id.startsWith("metal");

          return (
            <Card
              key={mat.id}
              className={`overflow-hidden cursor-pointer transition-all duration-300 ${
                isSelected ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/40"
              }`}
              onClick={() => onSelect(mat.id)}
            >
              {/* Image preview */}
              <div className="aspect-[4/3] overflow-hidden relative">
                <img src={mat.img} alt={mat.label} className="w-full h-full object-cover" />
                {isSelected && (
                  <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                {isMetal && (
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-card/80 backdrop-blur-sm text-foreground border-0 font-body text-[10px] gap-1">
                      <RotateCw className="w-3 h-3" /> Flip for 2 looks
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  {mat.icon}
                  <h3 className="text-lg font-display font-bold text-foreground">{mat.label}</h3>
                </div>
                <p className="text-xs text-muted-foreground font-body">{mat.subtitle}</p>

                <ul className="space-y-1.5">
                  {mat.features.map((f) => (
                    <li key={f} className="text-xs font-body text-muted-foreground flex items-start gap-2">
                      <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="pt-2 border-t border-border">
                  <p className="text-xl font-display font-bold text-gradient-gold">${price}</p>
                  <p className="text-[10px] text-muted-foreground font-body">for {size.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Metal front/back illustration */}
      {material.startsWith("metal") && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex gap-4 items-center">
              <div className="text-center">
                <div className="w-32 h-24 rounded overflow-hidden border border-primary/30 shadow-lg">
                  <img src={imageUrl} alt="Front" className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] text-primary font-body mt-2 font-semibold">FRONT</p>
              </div>
              <RotateCw className="w-6 h-6 text-primary animate-pulse" />
              <div className="text-center">
                <div className="w-32 h-24 rounded overflow-hidden border border-border bg-secondary">
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-[10px] text-muted-foreground font-body">2nd Image</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground font-body mt-2 font-semibold">BACK</p>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-display font-semibold text-foreground mb-1">Two Prints in One</h4>
              <p className="text-sm text-muted-foreground font-body">
                Metal prints can be double-sided — display one image, then flip to reveal a completely different piece. 
                Change your room's mood in seconds.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="font-body gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2">
          {material.startsWith("metal") ? "Personalize" : "Finishing"} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepMaterial;
