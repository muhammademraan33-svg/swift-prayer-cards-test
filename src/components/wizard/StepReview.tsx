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
import { ArrowLeft, ShoppingBag, Plus, Trash2 } from "lucide-react";
import type { WizardState, MaterialChoice, CartItem } from "./types";
import { useToast } from "@/hooks/use-toast";

interface Props {
  state: WizardState;
  onBack: () => void;
  onAddAnother: () => void;
  onCheckout: () => void;
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

function calcPrintPrice(material: MaterialChoice, w: number, h: number, doubleSided: boolean): number {
  if (material === "acrylic") return calcAcrylicPrice(w, h);
  const idx = getMetalIdx(material, doubleSided);
  return calcMetalPrice(w, h, metalOptions[idx]);
}

function calcItemTotal(item: CartItem | WizardState): number {
  const size = standardSizes[item.sizeIdx];
  const isMetal = item.material.startsWith("metal");
  const printPrice = calcPrintPrice(item.material, size.w, size.h, item.doubleSided);

  const companion = item.companionPrint;
  const companionSize = companion ? standardSizes[companion.sizeIdx] : null;
  const companionPrice = companion && companionSize
    ? calcPrintPrice(item.material, companionSize.w, companionSize.h, false)
    : 0;

  const shipping = getShippingCost(size.w, size.h);

  let addOnTotal = 0;
  if (item.roundedCorners) addOnTotal += addOns.roundedCorners;
  if (item.standOff !== "none") {
    const unit = item.standOff === "silver" ? addOns.standOffSilver : addOns.standOffBlack;
    addOnTotal += unit * item.standOffQty;
  }

  const cogs = printPrice / 2;
  const metalSurcharge = isMetal && item.standOff !== "none"
    ? Math.ceil(cogs * addOns.metalStandOffSurcharge)
    : 0;

  return printPrice + companionPrice + shipping.cost + addOnTotal + metalSurcharge;
}

function ItemSummaryRow({ item, label }: { item: CartItem | WizardState; label: string }) {
  const size = standardSizes[item.sizeIdx];
  const imageUrl = item.uploadedFile || (item as any).image?.url || "";
  const total = calcItemTotal(item);

  return (
    <div className="flex items-center gap-3 py-2">
      {imageUrl && (
        <div className="w-12 h-12 rounded overflow-hidden border border-border shrink-0">
          <img src={imageUrl} alt="Print" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-display font-bold text-foreground truncate">
          {label}
        </p>
        <p className="text-[10px] text-muted-foreground font-body">
          {getMaterialLabel(item.material)} — {size.label}
          {item.doubleSided ? " (Double-Sided)" : ""}
          {item.companionPrint ? " + Companion" : ""}
        </p>
      </div>
      <span className="text-sm font-display font-bold text-foreground shrink-0">${total.toFixed(2)}</span>
    </div>
  );
}

const StepReview = ({ state, onBack, onAddAnother, onCheckout }: Props) => {
  const { toast } = useToast();
  const currentTotal = calcItemTotal(state);
  const cartTotal = state.cart.reduce((sum, item) => sum + calcItemTotal(item), 0);
  const grandTotal = cartTotal + currentTotal;
  const hasCartItems = state.cart.length > 0;

  const handleCheckout = () => {
    toast({
      title: "Order Submitted!",
      description: `Your order of $${grandTotal.toFixed(2)} has been received. We'll be in touch shortly.`,
    });
    onCheckout();
  };

  const imageUrl = state.uploadedFile || state.image?.url || "";
  const backUrl = state.backUploadedFile || state.backImage?.url;
  const companion = state.companionPrint;
  const companionImgSrc = companion?.uploadedFile || companion?.image?.url;
  const companionSize = companion ? standardSizes[companion.sizeIdx] : null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Your Order
        </h2>
        <p className="text-muted-foreground font-body mt-1 tracking-wide text-sm">
          Review your print{hasCartItems || companion ? "s" : ""} before checkout.
        </p>
      </div>

      {/* Visual preview of current print */}
      <div className="flex justify-center gap-4">
        <div className="text-center">
          <div className="w-36 h-28 rounded-lg overflow-hidden border border-primary/30 shadow-xl">
            <img src={imageUrl} alt="Front" className="w-full h-full object-cover" />
          </div>
          {state.doubleSided && <p className="text-[10px] text-primary font-body mt-1 font-semibold">FRONT</p>}
        </div>
        {state.doubleSided && backUrl && (
          <div className="text-center">
            <div className="w-36 h-28 rounded-lg overflow-hidden border border-border shadow-xl">
              <img src={backUrl} alt="Back" className="w-full h-full object-cover" />
            </div>
            <p className="text-[10px] text-muted-foreground font-body mt-1 font-semibold">BACK</p>
          </div>
        )}
        {companion && companionImgSrc && companionSize && (
          <div className="text-center">
            <div className="w-36 h-28 rounded-lg overflow-hidden border border-border shadow-xl">
              <img src={companionImgSrc} alt="Companion" className="w-full h-full object-cover" />
            </div>
            <p className="text-[10px] text-muted-foreground font-body mt-1 font-semibold">{companionSize.label}</p>
          </div>
        )}
      </div>

      {/* Order summary */}
      <Card className="bg-card border-border">
        <div className="p-4 space-y-1">
          {/* Previously added cart items */}
          {state.cart.map((item, i) => (
            <ItemSummaryRow key={i} item={item} label={`Print ${i + 1}`} />
          ))}
          {/* Current print */}
          <ItemSummaryRow
            item={state}
            label={hasCartItems ? `Print ${state.cart.length + 1}` : "Your Print"}
          />

          <div className="flex justify-between font-body text-xl font-bold text-foreground border-t border-border pt-3 mt-3">
            <span>Total ({state.cart.length + 1} {state.cart.length + 1 === 1 ? "print" : "prints"})</span>
            <span className="text-gradient-gold">${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="font-body gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onAddAnother} className="font-body gap-2 border-primary/40 text-primary hover:bg-primary/10">
            <Plus className="w-4 h-4" /> Add Another Print
          </Button>
          <Button onClick={handleCheckout} className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2 h-14 px-10 text-sm tracking-[0.15em]">
            <ShoppingBag className="w-4 h-4" /> CHECKOUT
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepReview;
