import { useState } from "react";
import {
  standardSizes,
  calcMetalPrice,
  calcAcrylicPrice,
  metalOptions,
  addOns,
  getShippingCost,
} from "@/lib/pricing";
import { resolveSize } from "@/lib/sizeHelpers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, Plus, CreditCard, CheckCircle2 } from "lucide-react";
import type { WizardState, MaterialChoice, CartItem } from "./types";
import { useToast } from "@/hooks/use-toast";
import { getImageTransformStyle } from "@/lib/imageTransform";
import StripeCheckout from "@/components/StripeCheckout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const size = resolveSize(item.sizeIdx, item.customWidth, item.customHeight);
  const lines: LineItem[] = [];

  // Print (with quantity)
  const qty = item.quantity || 1;
  const printPrice = calcPrintPrice(item.material, size.w, size.h, item.doubleSided);
  lines.push({
    label: getMaterialLabel(item.material),
    detail: `${size.label}${item.doubleSided ? " — Double-Sided" : ""}${qty > 1 ? ` × ${qty}` : ""}`,
    amount: printPrice * qty,
  });
  // Additional prints in set are already accounted for by quantity multiplier above

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

function ItemBreakdown({ item, title, imageUrl, transform }: { item: CartItem | WizardState; title: string; imageUrl: string; transform?: { rotation: number; zoom: number; panX: number; panY: number } }) {
  const lines = getLineItems(item);
  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const transformStyle = transform ? getImageTransformStyle(transform) : undefined;

  return (
    <div className="space-y-2">
      {/* Header with image */}
      <div className="flex items-center gap-3">
        {imageUrl && (
          <div className="w-10 h-10 rounded overflow-hidden border border-border shrink-0 relative">
            <div className="absolute inset-0 overflow-hidden">
              <img 
                src={imageUrl} 
                alt="Print" 
                className="w-full h-full object-cover"
                style={transformStyle}
              />
            </div>
          </div>
        )}
        <p className="text-sm font-display font-bold text-foreground">{title}</p>
        <span className="ml-auto text-sm font-display font-bold text-foreground">${subtotal.toFixed(2)}</span>
      </div>

      {/* Line items */}
      <div className="ml-13 space-y-0.5">
        {lines.map((line, i) => (
          <div key={i} className="flex justify-between text-xs font-body">
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
  const [showCheckout, setShowCheckout] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

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

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentIntentId(paymentId);
    setShowCheckout(false);
    setShowConfirmation(true);
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    onCheckout();
  };

  const imageUrl = state.uploadedFile || state.image?.url || "";
  const backUrl = state.backUploadedFile || state.backImage?.url;
  const additionalPrints = state.additionalPrints || [];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Your Order
        </h2>
        <p className="text-muted-foreground font-body mt-1 tracking-wide text-sm">
          Review your print{allItems.length > 1 || state.quantity > 1 ? "s" : ""} before checkout.
        </p>
      </div>

      {/* Visual preview of current print */}
      <div className="flex justify-center gap-4 flex-wrap">
        <div className="text-center">
          <div className="w-36 h-28 rounded-lg overflow-hidden border border-primary/30 shadow-xl relative">
            <div className="absolute inset-0 overflow-hidden">
              <img 
                src={imageUrl} 
                alt="Front" 
                className="w-full h-full object-cover"
                style={getImageTransformStyle({ 
                  rotation: state.rotation, 
                  zoom: state.zoom, 
                  panX: state.panX, 
                  panY: state.panY 
                })}
              />
            </div>
          </div>
          {state.doubleSided && <p className="text-xs text-primary font-body mt-1 font-semibold">FRONT</p>}
        </div>
        {state.doubleSided && backUrl && (
          <div className="text-center">
            <div className="w-36 h-28 rounded-lg overflow-hidden border border-border shadow-xl">
              <img src={backUrl} alt="Back" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs text-muted-foreground font-body mt-1 font-semibold">BACK</p>
          </div>
        )}
        {additionalPrints.map((ap, idx) => {
          const apImg = ap.uploadedFile || ap.image?.url;
          if (!apImg) return null;
          return (
            <div key={idx} className="text-center">
              <div className="w-36 h-28 rounded-lg overflow-hidden border border-border shadow-xl relative">
                <div className="absolute inset-0 overflow-hidden">
                  <img 
                    src={apImg} 
                    alt={`Print ${idx + 2}`} 
                    className="w-full h-full object-cover"
                    style={getImageTransformStyle({ 
                      rotation: ap.rotation || 0, 
                      zoom: ap.zoom || 1, 
                      panX: ap.panX || 0, 
                      panY: ap.panY || 0 
                    })}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-1 font-semibold">Print {idx + 2}</p>
            </div>
          );
        })}
      </div>

      {/* Order summary with line items */}
      <Card className="bg-card border-border">
        <div className="p-5 space-y-4">
          {allItems.map(({ item, title, imageUrl: img }, i) => {
            // Get transform for current item
            const transform = 'rotation' in item ? {
              rotation: item.rotation || 0,
              zoom: item.zoom || 1,
              panX: item.panX || 0,
              panY: item.panY || 0,
            } : undefined;
            return (
            <div key={i}>
                <ItemBreakdown item={item} title={title} imageUrl={img} transform={transform} />
              {i < allItems.length - 1 && <div className="border-t border-border mt-4" />}
            </div>
            );
          })}

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
          <Button onClick={() => setShowCheckout(true)} className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2 h-14 px-10 text-sm tracking-[0.15em]">
            <CreditCard className="w-4 h-4" /> PAY NOW
          </Button>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>
              Total: ${grandTotal.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <StripeCheckout
            amount={grandTotal}
            items={allItems}
            orderDetails={{
              items: allItems,
              total: grandTotal,
              timestamp: new Date().toISOString(),
            }}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowCheckout(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Order Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={handleConfirmationClose}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <DialogTitle className="text-2xl">Order Confirmed!</DialogTitle>
            <DialogDescription className="text-base">
              Your payment of ${grandTotal.toFixed(2)} has been processed successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Payment ID: {paymentIntentId}
            </p>
            <p className="text-sm text-muted-foreground">
              We've received your order and will begin production shortly.
              You'll receive an email confirmation with tracking information.
            </p>
            <Button onClick={handleConfirmationClose} className="w-full bg-gradient-gold hover:opacity-90">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StepReview;
