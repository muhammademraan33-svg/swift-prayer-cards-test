import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  metalOptions,
  calcMetalPrice,
  calcAcrylicPrice,
  getShippingCost,
  calcLuxpressShipping,
  calcOvernightShipping,
  addOns,
  standardSizes,
  recommendStandOffs,
  acrylicCostPerSqIn,
  acrylicMinCost,
  type ShippingSpeed,
} from "@/lib/pricing";
import { Info } from "lucide-react";

const PriceCalculator = () => {
  const [material, setMaterial] = useState<"metal" | "acrylic">("metal");
  const [metalIdx, setMetalIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState<number | "custom">(0);
  const [customW, setCustomW] = useState(24);
  const [customH, setCustomH] = useState(36);
  const [roundedCorners, setRoundedCorners] = useState(false);
  const [standOff, setStandOff] = useState<"none" | "silver" | "black">("none");
  const [standOffQty, setStandOffQty] = useState(4);
  const [shippingSpeed, setShippingSpeed] = useState<ShippingSpeed>("standard");
  const [selectedImage, setSelectedImage] = useState<{ url: string; photographer: string; alt: string } | null>(null);

  useEffect(() => {
    const sizeHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.sizeIdx !== undefined) setSizeIdx(detail.sizeIdx);
    };
    const imageHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.url) setSelectedImage({ url: detail.url, photographer: detail.photographer, alt: detail.alt });
    };
    window.addEventListener("select-size", sizeHandler);
    window.addEventListener("select-image", imageHandler);
    return () => {
      window.removeEventListener("select-size", sizeHandler);
      window.removeEventListener("select-image", imageHandler);
    };
  }, []);

  const isCustom = sizeIdx === "custom";
  const w = isCustom ? customW : standardSizes[sizeIdx as number].w;
  const h = isCustom ? customH : standardSizes[sizeIdx as number].h;
  const sizeLabel = isCustom ? `${w}"×${h}" (custom)` : standardSizes[sizeIdx as number].label;

  const recommended = recommendStandOffs(w, h);

  useEffect(() => {
    if (standOff !== "none") setStandOffQty(recommended);
  }, [w, h, recommended, standOff]);

  const printPrice =
    material === "metal"
      ? calcMetalPrice(w, h, metalOptions[metalIdx])
      : calcAcrylicPrice(w, h);

  const standardShipping = getShippingCost(w, h);

  const costPerSqIn = material === "metal" ? metalOptions[metalIdx].costPerSqIn : acrylicCostPerSqIn;
  const minCost = material === "metal" ? metalOptions[metalIdx].minCost : acrylicMinCost;

  const shippingCost =
    shippingSpeed === "overnight"
      ? calcOvernightShipping(w, h, costPerSqIn, minCost)
      : shippingSpeed === "luxpress"
        ? calcLuxpressShipping(standardShipping.cost)
        : standardShipping.cost;

  const shippingLabel =
    shippingSpeed === "overnight"
      ? "Overnight (24h)"
      : shippingSpeed === "luxpress"
        ? `LuXpress 47h (${standardShipping.label})`
        : `Standard 72h (${standardShipping.label})`;

  let addOnTotal = 0;
  if (roundedCorners) addOnTotal += addOns.roundedCorners;
  if (standOff !== "none") {
    const unitPrice = standOff === "silver" ? addOns.standOffSilver : addOns.standOffBlack;
    addOnTotal += unitPrice * standOffQty;
  }

  const metalSurcharge = material === "metal" && standOff !== "none"
    ? Math.ceil(printPrice * addOns.metalStandOffSurcharge)
    : 0;

  const total = printPrice + shippingCost + addOnTotal + metalSurcharge;

  return (
    <section id="calculator" className="py-28 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.4em] uppercase text-primary font-body mb-4">
            Bespoke Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            Commission Your Piece
          </h2>
          <p className="text-muted-foreground font-body mt-4 tracking-wide">
            Configure every detail and receive instant transparent pricing.
          </p>
        </div>

        {/* Image Preview */}
        {selectedImage && (
          <div className="mb-8">
            <div
              className="relative mx-auto bg-secondary/50 border border-border rounded overflow-hidden"
              style={{
                width: `${Math.min(w * 8, 600)}px`,
                aspectRatio: `${w} / ${h}`,
                maxWidth: "100%",
              }}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.alt || "Selected print"}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm px-3 py-2 flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-body">
                  📷 {selectedImage.photographer}
                </span>
                <span className="text-xs font-body font-semibold text-primary">
                  {sizeLabel}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="text-xs text-muted-foreground hover:text-primary font-body mt-2 block mx-auto"
            >
              Remove image
            </button>
          </div>
        )}

        <Card className="bg-card border-border">
          <CardContent className="p-8 space-y-8">
            {/* Material */}
            <div>
              <Label className="text-foreground font-body font-semibold tracking-[0.15em] uppercase text-xs mb-3 block">
                Material
              </Label>
              <RadioGroup
                value={material}
                onValueChange={(v) => setMaterial(v as "metal" | "acrylic")}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="metal" id="metal" />
                  <Label htmlFor="metal" className="font-body text-foreground cursor-pointer">Metal</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="acrylic" id="acrylic" />
                  <Label htmlFor="acrylic" className="font-body text-foreground cursor-pointer">Acrylic</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Metal type */}
            {material === "metal" && (
              <div>
                <Label className="text-foreground font-body font-semibold tracking-[0.15em] uppercase text-xs mb-3 block">
                  Metal Type
                </Label>
                <Select value={String(metalIdx)} onValueChange={(v) => setMetalIdx(Number(v))}>
                  <SelectTrigger className="bg-secondary border-border text-foreground font-body">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {metalOptions.map((opt, i) => (
                      <SelectItem key={i} value={String(i)}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Size */}
            <div>
              <Label className="text-foreground font-body font-semibold tracking-[0.15em] uppercase text-xs mb-3 block">
                Dimensions
              </Label>
              <Select value={String(sizeIdx)} onValueChange={(v) => setSizeIdx(v === "custom" ? "custom" : Number(v))}>
                <SelectTrigger className="bg-secondary border-border text-foreground font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {standardSizes.map((s, i) => (
                    <SelectItem key={i} value={String(i)}>{s.label}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Dimensions</SelectItem>
                </SelectContent>
              </Select>

              {isCustom && (
                <div className="flex gap-3 mt-3 items-center">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground font-body mb-1 block">Width (in)</Label>
                    <Input type="number" min={4} max={96} value={customW} onChange={(e) => setCustomW(Math.max(4, Math.min(96, Number(e.target.value))))} className="bg-secondary border-border text-foreground font-body" />
                  </div>
                  <span className="text-muted-foreground font-body mt-5">×</span>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground font-body mb-1 block">Height (in)</Label>
                    <Input type="number" min={4} max={96} value={customH} onChange={(e) => setCustomH(Math.max(4, Math.min(96, Number(e.target.value))))} className="bg-secondary border-border text-foreground font-body" />
                  </div>
                </div>
              )}
            </div>

            {/* Add-ons */}
            <div className="space-y-4">
              <Label className="text-foreground font-body font-semibold tracking-[0.15em] uppercase text-xs block">
                Finishing Options
              </Label>

              <div className="flex items-center gap-3">
                <Checkbox id="rounded" checked={roundedCorners} onCheckedChange={(v) => setRoundedCorners(!!v)} />
                <Label htmlFor="rounded" className="font-body text-foreground cursor-pointer">Rounded Corners (+$5.00)</Label>
              </div>

              <div>
                <Label className="text-foreground font-body text-sm mb-2 block">Stand-Off Mounting</Label>
                <RadioGroup value={standOff} onValueChange={(v) => { const val = v as "none" | "silver" | "black"; setStandOff(val); if (val !== "none") setStandOffQty(recommended); }} className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="none" id="so-none" />
                    <Label htmlFor="so-none" className="font-body text-foreground cursor-pointer">None</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="silver" id="so-silver" />
                    <Label htmlFor="so-silver" className="font-body text-foreground cursor-pointer">Silver</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="black" id="so-black" />
                    <Label htmlFor="so-black" className="font-body text-foreground cursor-pointer">Black</Label>
                  </div>
                </RadioGroup>

                {standOff !== "none" && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                      <Info className="w-3 h-3" />
                      <span>Recommended: {recommended} stand-offs for {w}"×{h}" (every 2–3 ft)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Label className="text-foreground font-body text-sm">Qty:</Label>
                      <Input type="number" min={4} max={20} value={standOffQty} onChange={(e) => setStandOffQty(Math.max(4, Number(e.target.value)))} className="bg-secondary border-border text-foreground font-body w-20" />
                    </div>
                    {material === "metal" && (
                      <p className="text-xs text-primary font-body flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        15% surcharge for metal stand-off mounting (+${metalSurcharge})
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Speed */}
            <div>
              <Label className="text-foreground font-body font-semibold tracking-[0.15em] uppercase text-xs mb-3 block">
                Delivery
              </Label>
              <RadioGroup value={shippingSpeed} onValueChange={(v) => setShippingSpeed(v as ShippingSpeed)} className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="standard" id="ship-standard" />
                  <Label htmlFor="ship-standard" className="font-body text-foreground cursor-pointer">Standard (72h)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="luxpress" id="ship-luxpress" />
                  <Label htmlFor="ship-luxpress" className="font-body text-foreground cursor-pointer">LuXpress (47h)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="overnight" id="ship-overnight" />
                  <Label htmlFor="ship-overnight" className="font-body text-foreground cursor-pointer">Overnight (24h)</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Price breakdown */}
            <div className="border-t border-border pt-6 space-y-3">
              <div className="flex justify-between font-body text-sm text-muted-foreground">
                <span>{material === "metal" ? metalOptions[metalIdx].label : "Acrylic"} — {sizeLabel}</span>
                <span>${printPrice.toFixed(2)}</span>
              </div>
              {roundedCorners && (
                <div className="flex justify-between font-body text-sm text-muted-foreground">
                  <span>Rounded Corners</span>
                  <span>${addOns.roundedCorners.toFixed(2)}</span>
                </div>
              )}
              {metalSurcharge > 0 && (
                <div className="flex justify-between font-body text-sm text-muted-foreground">
                  <span>Metal stand-off surcharge (15%)</span>
                  <span>${metalSurcharge.toFixed(2)}</span>
                </div>
              )}
              {standOff !== "none" && (
                <div className="flex justify-between font-body text-sm text-muted-foreground">
                  <span>Stand-offs ({standOff}) × {standOffQty}</span>
                  <span>${((standOff === "silver" ? addOns.standOffSilver : addOns.standOffBlack) * standOffQty).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-body text-sm text-muted-foreground">
                <span>Delivery — {shippingLabel}</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body text-lg font-bold text-foreground border-t border-border pt-3">
                <span>Total</span>
                <span className="text-gradient-gold">${total.toFixed(2)}</span>
              </div>
            </div>

            <Button className="w-full bg-gradient-gold text-primary-foreground font-body font-semibold tracking-[0.2em] hover:opacity-90 h-14 text-xs">
              PLACE ORDER
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PriceCalculator;
