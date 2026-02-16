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
import { ArrowLeft, ShoppingBag, Plus } from "lucide-react";
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
  if (m === "metal-designer") return 'Lux Metal (.040")';
  return 'Designer Metal (.080")';
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

interface LineItem {
  label: string;
  detail?: string;
  amount: number;
}

function getLineItems(item: CartItem | WizardState): LineItem[] {
  const size = standardSizes[item.sizeIdx];
  const lines: LineItem[] = [];

  // Print
  const printPrice = calcPrintPrice(item.material, size.w, size.h, item.doubleSided);
  lines.push({
    label: getMaterialLabel(item.material),
    detail: `${size.label}${item.doubleSided ? " — Double-Sided" : ""}`,
    amount: printPrice,
  });

  // Companion print
  const companion = item.companionPrint;
  if (companion) {
    const companionSize = standardSizes[companion.sizeIdx];
    const companionPrice = calcPrintPrice(item.material, companionSize.w, companionSize.h, false);
    lines.push({
      label: "Companion Print",
      detail: `${getMaterialLabel(item.material)} — ${companionSize.label}`,
      amount: companionPrice,
    });
  }

  // Rounded corners
  if (item.roundedCorners) {
    lines.push({ label: "Rounded Corners", amount: addOns.roundedCorners });
  }

  // Stand-offs
  if (item.standOff !== "none") {
    const unitPrice = item.standOff === "silver" ? addOns.standOffSilver : addOns.standOffBlack;
    const total = unitPrice * item.standOffQty;
    lines.push({
      label: `Stand-Offs (${item.standOff === "silver" ? "Silver" : "Black"})`,
      detail: `${item.standOffQty} × $${unitPrice.toFixed(2)}`,
      amount: total,
    });
  }

  // Metal stand-off surcharge
  const isMetal = item.material.startsWith("metal");
  if (isMetal && item.standOff !== "none") {
    const cogs = printPrice / 2;
    const surcharge = Math.ceil(cogs * addOns.metalStandOffSurcharge);
    if (surcharge > 0) {
      lines.push({ label: "Mounting Surcharge", amount: surcharge });
    }
  }

  // Shipping
  const shipping = getShippingCost(size.w, size.h);
  lines.push({
    label: "Shipping",
    detail: `Standard — ${shipping.label}`,
    amount: shipping.cost,
  });

  return lines;
}

function ItemBreakdown({ item, title, imageUrl }: { item: CartItem | WizardState; title: string; imageUrl: string }) {
  const lines = getLineItems(item);
  const subtotal = lines.reduce((s, l) => s + l.amount, 0);

  return (
    <div className="space-y-2">
      {/* Header with image */}
      <div className="flex items-center gap-3">
        {imageUrl && (
          <div className="w-10 h-10 rounded overflow-hidden border border-border shrink-0">
            <img src={imageUrl} alt="Print" className="w-full h-full object-cover" />
          </div>
        )}
        <p className="text-sm font-display font-bold text-foreground">{title}</p>
        <span className="ml-auto text-sm font-display font-bold text-foreground">${subtotal.toFixed(2)}</span>
      </div>

      {/* Line items */}
      <div className="ml-13 space-y-0.5">
        {lines.map((line, i) => (
          <div key={i} className="flex justify-between text-[11px] font-body">
            <span className="text-muted-foreground">
              {line.label}
              {line.detail && <span className="text-muted-foreground/60 ml-1">({line.detail})</span>}
            </span>
            <span className="text-foreground font-medium">${line.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const StepReview = ({ state, onBack, onAddAnother, onCheckout }: Props) => {
  const { toast } = useToast();

  const allItems: { item: CartItem | WizardState; title: string; imageUrl: string }[] = [
    ...state.cart.map((item, i) => ({
      item,
      title: `Print ${i + 1}`,
      imageUrl: item.uploadedFile || (item as any).image?.url || "",
    })),
    {
      item: state,
      title: state.cart.length > 0 ? `Print ${state.cart.length + 1}` : "Your Print",
      imageUrl: state.uploadedFile || state.image?.url || "",
    },
  ];

  const grandTotal = allItems.reduce((sum, { item }) => {
    const lines = getLineItems(item);
    return sum + lines.reduce((s, l) => s + l.amount, 0);
  }, 0);

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
          Review your print{allItems.length > 1 || companion ? "s" : ""} before checkout.
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

      {/* Order summary with line items */}
      <Card className="bg-card border-border">
        <div className="p-5 space-y-4">
          {allItems.map(({ item, title, imageUrl: img }, i) => (
            <div key={i}>
              <ItemBreakdown item={item} title={title} imageUrl={img} />
              {i < allItems.length - 1 && <div className="border-t border-border mt-4" />}
            </div>
          ))}

          <div className="flex justify-between font-body text-xl font-bold text-foreground border-t border-border pt-4 mt-2">
            <span>Total ({allItems.length} {allItems.length === 1 ? "print" : "prints"})</span>
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
