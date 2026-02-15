import {
  standardSizes,
  calcMetalPrice,
  calcAcrylicPrice,
  metalOptions,
  addOns,
  getShippingCost,
} from "@/lib/pricing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import type { WizardState, MaterialChoice } from "./types";

interface Props {
  state: WizardState;
  onBack: () => void;
}

function getMaterialLabel(m: MaterialChoice): string {
  if (m === "acrylic") return "Acrylic Print";
  if (m === "metal-designer") return 'Metal Designer (.040")';
  return 'Metal Museum (.080")';
}

function getMetalIdx(m: MaterialChoice, doubleSided: boolean): number {
  if (m === "metal-designer") return doubleSided ? 1 : 0;
  return doubleSided ? 3 : 2;
}

const StepReview = ({ state, onBack }: Props) => {
  const isBundle = !!state.selectedBundle;
  const size = standardSizes[state.sizeIdx];
  const imageUrl = state.uploadedFile || state.image?.url || "";
  const backUrl = state.backUploadedFile || state.backImage?.url;

  const isMetal = state.material.startsWith("metal");
  const metalIdx = isMetal ? getMetalIdx(state.material, state.doubleSided) : 0;

  // Bundle pricing
  if (isBundle && state.selectedBundle) {
    const bundle = state.selectedBundle;
    const shipping = getShippingCost(
      Math.max(...bundle.prints.map((p) => p.w)),
      Math.max(...bundle.prints.map((p) => p.h))
    );

    let addOnTotal = 0;
    if (state.roundedCorners) addOnTotal += addOns.roundedCorners;
    if (state.standOff !== "none") {
      const unit = state.standOff === "silver" ? addOns.standOffSilver : addOns.standOffBlack;
      addOnTotal += unit * state.standOffQty;
    }

    const total = bundle.salePrice + shipping.cost + addOnTotal;

    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Your Bundle
          </h2>
          <p className="text-muted-foreground font-body mt-3 tracking-wide">
            {bundle.name} — {bundle.description}
          </p>
        </div>

        {/* Bundle image previews */}
        <div className="flex flex-wrap justify-center gap-3">
          {state.bundleSlots.map((slot, i) => {
            const imgSrc = slot.uploadedFile || slot.image?.url;
            return (
              <div key={i} className="text-center">
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-primary/30 shadow-lg">
                  {imgSrc ? (
                    <img src={imgSrc} alt={`Print ${i + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground text-xs">
                      {i + 1}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Price breakdown */}
        <Card className="bg-card border-border">
          <div className="p-6 space-y-3">
            <div className="flex justify-between font-body text-sm text-muted-foreground">
              <span>{bundle.name}</span>
              <span>${bundle.salePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-body text-[11px] text-muted-foreground/60">
              <span>Regular price</span>
              <span className="line-through">${bundle.originalPrice.toFixed(2)}</span>
            </div>
            {state.roundedCorners && (
              <div className="flex justify-between font-body text-sm text-muted-foreground">
                <span>Rounded Corners</span>
                <span>${addOns.roundedCorners.toFixed(2)}</span>
              </div>
            )}
            {state.standOff !== "none" && (
              <div className="flex justify-between font-body text-sm text-muted-foreground">
                <span>Stand-offs ({state.standOff}) × {state.standOffQty}</span>
                <span>${((state.standOff === "silver" ? addOns.standOffSilver : addOns.standOffBlack) * state.standOffQty).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-body text-sm text-muted-foreground">
              <span>Shipping — {shipping.label}</span>
              <span>${shipping.cost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-body text-xl font-bold text-foreground border-t border-border pt-4 mt-2">
              <span>Total</span>
              <span className="text-gradient-gold">${total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack} className="font-body gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2 h-14 px-10 text-sm tracking-[0.15em]">
            <ShoppingBag className="w-4 h-4" /> PLACE ORDER
          </Button>
        </div>
      </div>
    );
  }

  // Standard single-print review
  const printPrice = isMetal
    ? calcMetalPrice(size.w, size.h, metalOptions[metalIdx])
    : calcAcrylicPrice(size.w, size.h);

  const shipping = getShippingCost(size.w, size.h);

  let addOnTotal = 0;
  if (state.roundedCorners) addOnTotal += addOns.roundedCorners;
  if (state.standOff !== "none") {
    const unit = state.standOff === "silver" ? addOns.standOffSilver : addOns.standOffBlack;
    addOnTotal += unit * state.standOffQty;
  }

  const cogs = printPrice / 2;
  const metalSurcharge = isMetal && state.standOff !== "none"
    ? Math.ceil(cogs * addOns.metalStandOffSurcharge)
    : 0;

  const displayPrintPrice = printPrice + metalSurcharge;
  const total = printPrice + shipping.cost + addOnTotal + metalSurcharge;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Your Commission
        </h2>
        <p className="text-muted-foreground font-body mt-3 tracking-wide">
          Review your bespoke print before placing your order.
        </p>
      </div>

      {/* Visual preview */}
      <div className="flex justify-center gap-6">
        <div className="text-center">
          <div className="w-48 h-36 rounded-lg overflow-hidden border border-primary/30 shadow-xl">
            <img src={imageUrl} alt="Front" className="w-full h-full object-cover" />
          </div>
          {state.doubleSided && <p className="text-[10px] text-primary font-body mt-2 font-semibold">FRONT</p>}
        </div>
        {state.doubleSided && backUrl && (
          <div className="text-center">
            <div className="w-48 h-36 rounded-lg overflow-hidden border border-border shadow-xl">
              <img src={backUrl} alt="Back" className="w-full h-full object-cover" />
            </div>
            <p className="text-[10px] text-muted-foreground font-body mt-2 font-semibold">BACK</p>
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <Card className="bg-card border-border">
        <div className="p-6 space-y-3">
          <div className="flex justify-between font-body text-sm text-muted-foreground">
            <span>{getMaterialLabel(state.material)}{state.doubleSided ? " (Double-Sided)" : ""} — {size.label}</span>
            <span>${displayPrintPrice.toFixed(2)}</span>
          </div>
          {state.roundedCorners && (
            <div className="flex justify-between font-body text-sm text-muted-foreground">
              <span>Rounded Corners</span>
              <span>${addOns.roundedCorners.toFixed(2)}</span>
            </div>
          )}
          {state.standOff !== "none" && (
            <div className="flex justify-between font-body text-sm text-muted-foreground">
              <span>Stand-offs ({state.standOff}) × {state.standOffQty}</span>
              <span>${((state.standOff === "silver" ? addOns.standOffSilver : addOns.standOffBlack) * state.standOffQty).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-body text-sm text-muted-foreground">
            <span>Shipping — {shipping.label}</span>
            <span>${shipping.cost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-body text-xl font-bold text-foreground border-t border-border pt-4 mt-2">
            <span>Total</span>
            <span className="text-gradient-gold">${total.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="font-body gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2 h-14 px-10 text-sm tracking-[0.15em]">
          <ShoppingBag className="w-4 h-4" /> PLACE ORDER
        </Button>
      </div>
    </div>
  );
};

export default StepReview;
