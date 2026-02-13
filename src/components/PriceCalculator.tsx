import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
  addOns,
  standardSizes,
} from "@/lib/pricing";

const PriceCalculator = () => {
  const [material, setMaterial] = useState<"metal" | "acrylic">("metal");
  const [metalIdx, setMetalIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [roundedCorners, setRoundedCorners] = useState(false);
  const [standOff, setStandOff] = useState<"none" | "silver" | "black">("none");
  const [standOffQty, setStandOffQty] = useState(4);

  const size = standardSizes[sizeIdx];
  const printPrice =
    material === "metal"
      ? calcMetalPrice(size.w, size.h, metalOptions[metalIdx])
      : calcAcrylicPrice(size.w, size.h);

  const shipping = getShippingCost(size.w, size.h);

  let addOnTotal = 0;
  if (roundedCorners) addOnTotal += addOns.roundedCorners;
  if (standOff === "silver") addOnTotal += addOns.standOffSilver * standOffQty;
  if (standOff === "black") addOnTotal += addOns.standOffBlack * standOffQty;

  const total = printPrice + shipping.cost + addOnTotal;

  return (
    <section id="calculator" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm tracking-[0.3em] uppercase text-primary font-body">
            Instant Quote
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3 text-foreground">
            Price Calculator
          </h2>
          <p className="text-muted-foreground font-body mt-4">
            Configure your custom print and see pricing instantly.
          </p>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-8 space-y-8">
            {/* Material */}
            <div>
              <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs mb-3 block">
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
                <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs mb-3 block">
                  Metal Type
                </Label>
                <Select
                  value={String(metalIdx)}
                  onValueChange={(v) => setMetalIdx(Number(v))}
                >
                  <SelectTrigger className="bg-secondary border-border text-foreground font-body">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {metalOptions.map((opt, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Size */}
            <div>
              <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs mb-3 block">
                Size
              </Label>
              <Select
                value={String(sizeIdx)}
                onValueChange={(v) => setSizeIdx(Number(v))}
              >
                <SelectTrigger className="bg-secondary border-border text-foreground font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {standardSizes.map((s, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add-ons */}
            <div className="space-y-4">
              <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs block">
                Add-Ons
              </Label>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="rounded"
                  checked={roundedCorners}
                  onCheckedChange={(v) => setRoundedCorners(!!v)}
                />
                <Label htmlFor="rounded" className="font-body text-foreground cursor-pointer">
                  Rounded Corners (+$5.00)
                </Label>
              </div>

              <div>
                <Label className="text-foreground font-body text-sm mb-2 block">
                  Stand-Off Mounting
                </Label>
                <RadioGroup
                  value={standOff}
                  onValueChange={(v) => setStandOff(v as "none" | "silver" | "black")}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="none" id="so-none" />
                    <Label htmlFor="so-none" className="font-body text-foreground cursor-pointer">None</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="silver" id="so-silver" />
                    <Label htmlFor="so-silver" className="font-body text-foreground cursor-pointer">
                      Silver ($2.50 ea)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="black" id="so-black" />
                    <Label htmlFor="so-black" className="font-body text-foreground cursor-pointer">
                      Black ($3.50 ea)
                    </Label>
                  </div>
                </RadioGroup>

                {standOff !== "none" && (
                  <div className="mt-3">
                    <Label className="text-foreground font-body text-sm mb-1 block">
                      Quantity of stand-offs
                    </Label>
                    <Select
                      value={String(standOffQty)}
                      onValueChange={(v) => setStandOffQty(Number(v))}
                    >
                      <SelectTrigger className="bg-secondary border-border text-foreground font-body w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 4, 6, 8, 10, 12].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="border-t border-border pt-6 space-y-3">
              <div className="flex justify-between font-body text-sm text-muted-foreground">
                <span>
                  {material === "metal" ? metalOptions[metalIdx].label : "Acrylic"} — {size.label}
                </span>
                <span>${printPrice.toFixed(2)}</span>
              </div>
              {roundedCorners && (
                <div className="flex justify-between font-body text-sm text-muted-foreground">
                  <span>Rounded Corners</span>
                  <span>${addOns.roundedCorners.toFixed(2)}</span>
                </div>
              )}
              {standOff !== "none" && (
                <div className="flex justify-between font-body text-sm text-muted-foreground">
                  <span>
                    Stand-Off ({standOff}) × {standOffQty}
                  </span>
                  <span>
                    $
                    {(
                      (standOff === "silver"
                        ? addOns.standOffSilver
                        : addOns.standOffBlack) * standOffQty
                    ).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-body text-sm text-muted-foreground">
                <span>Shipping ({shipping.label})</span>
                <span>
                  ${shipping.cost.toFixed(2)}
                  {shipping.note && (
                    <span className="text-xs ml-1">({shipping.note})</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between font-body text-lg font-bold text-foreground border-t border-border pt-3">
                <span>Total</span>
                <span className="text-gradient-gold">${total.toFixed(2)}</span>
              </div>
            </div>

            <Button className="w-full bg-gradient-gold text-primary-foreground font-body font-semibold tracking-wide hover:opacity-90">
              Request This Quote
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PriceCalculator;
