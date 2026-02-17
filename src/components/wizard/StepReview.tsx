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
import { ArrowLeft, ShoppingBag, Plus, CreditCard, CheckCircle2, Download, Loader2 } from "lucide-react";
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
  
  // Calculate price for main print
  const mainPrintPrice = calcPrintPrice(item.material, size.w, size.h, item.doubleSided);
  
  // Calculate prices for additional prints (may have different sizes)
  let totalPrice = mainPrintPrice;
  let detailParts: string[] = [];
  
  if (qty > 1 && 'additionalPrints' in item && item.additionalPrints) {
    // Main print
    detailParts.push(`Print 1: ${size.label}`);
    
    // Additional prints
    for (let i = 0; i < qty - 1 && i < item.additionalPrints.length; i++) {
      const ap = item.additionalPrints[i];
      const apSize = ap.sizeIdx !== undefined 
        ? resolveSize(ap.sizeIdx, ap.customWidth, ap.customHeight)
        : size;
      const apPrice = calcPrintPrice(item.material, apSize.w, apSize.h, item.doubleSided);
      totalPrice += apPrice;
      detailParts.push(`Print ${i + 2}: ${apSize.label}`);
    }
  } else {
    // Single print or all same size
    totalPrice = mainPrintPrice * qty;
    detailParts.push(`${size.label}${qty > 1 ? ` × ${qty}` : ""}`);
  }
  
  lines.push({
    label: getMaterialLabel(item.material),
    detail: `${detailParts.join(", ")}${item.doubleSided ? " — Double-Sided" : ""}`,
    amount: totalPrice,
  });

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
    const cogs = totalPrice / 2;
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

interface GeneratedPDF {
  filename: string;
  blob: Blob;
  url: string;
  printTitle: string;
  size: string;
}

const StepReview = ({ state, onBack, onAddAnother, onCheckout }: Props) => {
  const { toast } = useToast();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [generatedPDFs, setGeneratedPDFs] = useState<GeneratedPDF[]>([]);
  const [showPDFPreview, setShowPDFPreview] = useState(false);

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

  const handleGeneratePDFs = async () => {
    setIsGeneratingPDF(true);
    setGeneratedPDFs([]);
    try {
      const pdfs: GeneratedPDF[] = [];
      
      // Generate PDF for each print in the order - EACH FILE IS A SEPARATE PDF
      for (let i = 0; i < allItems.length; i++) {
        const { item, title } = allItems[i];
        const itemImageUrl = 'uploadedFile' in item ? item.uploadedFile : state.uploadedFile;
        const itemBackUrl = ('backUploadedFile' in item ? item.backUploadedFile : state.backUploadedFile) || 
                           ('backImage' in item && item.backImage ? item.backImage.url : state.backImage?.url);
        
        // Get base size dimensions
        const baseSize = resolveSize(item.sizeIdx, item.customWidth, item.customHeight);
        
        // Get transform data
        const transform = {
          rotation: ('rotation' in item ? item.rotation : state.rotation) || 0,
          zoom: ('zoom' in item ? item.zoom : state.zoom) || 1,
          panX: ('panX' in item ? item.panX : state.panX) || 0,
          panY: ('panY' in item ? item.panY : state.panY) || 0,
        };
        
        // If this is a multi-print set (quantity > 1), generate SEPARATE PDFs for each print
        const quantity = item.quantity || 1;
        for (let printIdx = 0; printIdx < quantity; printIdx++) {
          // For main print (printIdx === 0), use the main image
          // For additional prints (printIdx > 0), use their respective images
          let currentImageUrl = itemImageUrl;
          let currentBackUrl = itemBackUrl;
          let currentTransform = transform;
          
          // Get size for this SPECIFIC print (each print can have different size)
          let currentSize = baseSize;
          let printTitle = title;
          
          if (printIdx > 0 && 'additionalPrints' in item && item.additionalPrints) {
            const additionalPrint = item.additionalPrints[printIdx - 1];
            if (additionalPrint) {
              currentImageUrl = additionalPrint.uploadedFile || additionalPrint.image?.url;
              currentBackUrl = additionalPrint.backUploadedFile || additionalPrint.backImage?.url;
              currentTransform = {
                rotation: additionalPrint.rotation || 0,
                zoom: additionalPrint.zoom || 1,
                panX: additionalPrint.panX || 0,
                panY: additionalPrint.panY || 0,
              };
              // Use per-print size if available - EACH PRINT CAN HAVE DIFFERENT SIZE
              if (additionalPrint.sizeIdx !== undefined) {
                currentSize = resolveSize(additionalPrint.sizeIdx, additionalPrint.customWidth, additionalPrint.customHeight);
              }
              printTitle = `${title} - Print ${printIdx + 1}`;
            }
          }
          
          if (!currentImageUrl) {
            console.warn(`Skipping PDF generation for ${printTitle}: No image found`);
            continue;
          }
          
          // Prepare request body - EACH PDF IS GENERATED SEPARATELY
          const requestBody = {
            imageBase64: currentImageUrl,
            backImageBase64: item.doubleSided && currentBackUrl ? currentBackUrl : undefined,
            printDimensions: {
              width: currentSize.w,  // Use the specific size for this print
              height: currentSize.h,  // Use the specific size for this print
            },
            transform: currentTransform,
            backTransform: item.doubleSided && currentBackUrl ? currentTransform : undefined,
            includeBleed: true,
            includeCropMarks: true,
            filename: quantity > 1 
              ? `${title.replace(/\s+/g, '-')}-print-${printIdx + 1}-${currentSize.w}x${currentSize.h}-300dpi.pdf`
              : `${title.replace(/\s+/g, '-')}-${currentSize.w}x${currentSize.h}-300dpi.pdf`,
          };
          
          // Call PDF generation API - GENERATES ONE PDF PER PRINT
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
          const response = await fetch(`${apiUrl}/api/generate-pdf`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Failed to generate PDF for ${printTitle}`);
          }
          
          // Store the PDF blob for preview
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          
          pdfs.push({
            filename: requestBody.filename,
            blob,
            url,
            printTitle: printTitle,
            size: `${currentSize.w}" × ${currentSize.h}"`,
          });
          
          // Small delay between generations to avoid overwhelming the server
          if (i < allItems.length - 1 || printIdx < quantity - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      }
      
      if (pdfs.length === 0) {
        throw new Error('No PDFs were generated. Please check that all prints have images.');
      }
      
      setGeneratedPDFs(pdfs);
      setShowPDFPreview(true);
      
      toast({
        title: "PDFs generated successfully!",
        description: `Generated ${pdfs.length} print-ready PDF${pdfs.length > 1 ? 's' : ''}. Please review before downloading.`,
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "Error generating print files",
        description: error.message || "Please try again or contact support.",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadAllPDFs = () => {
    generatedPDFs.forEach((pdf, index) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = pdf.url;
        a.download = pdf.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 300); // Stagger downloads
    });
    
    // Clean up URLs after a delay
    setTimeout(() => {
      generatedPDFs.forEach(pdf => window.URL.revokeObjectURL(pdf.url));
      setGeneratedPDFs([]);
      setShowPDFPreview(false);
    }, generatedPDFs.length * 300 + 1000);
    
    toast({
      title: "Downloading PDFs...",
      description: `Downloading ${generatedPDFs.length} file${generatedPDFs.length > 1 ? 's' : ''}.`,
    });
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

      {/* Download Print Files Info */}
      <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground font-body mb-3">
          Download your print-ready files at 300 DPI with bleed margins and crop marks for professional printing.
        </p>
        <Button 
          variant="outline" 
          onClick={handleGeneratePDFs}
          disabled={isGeneratingPDF}
          className="font-body gap-2 border-primary/40 text-primary hover:bg-primary/10"
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Generating PDFs...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" /> Generate & Preview PDFs (300 DPI)
            </>
          )}
        </Button>
      </div>

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

      {/* PDF Preview & Approval Dialog */}
      <Dialog open={showPDFPreview} onOpenChange={setShowPDFPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Review Your Print-Ready PDFs</DialogTitle>
            <DialogDescription className="text-base">
              Please review each PDF file before downloading. Each file is generated at 300 DPI with bleed margins and crop marks.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {generatedPDFs.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-3 mb-4">
                <p className="text-sm font-body font-semibold text-foreground">
                  Generated {generatedPDFs.length} separate PDF file{generatedPDFs.length > 1 ? 's' : ''}:
                </p>
              </div>
            )}
            
            <div className="grid gap-4">
              {generatedPDFs.map((pdf, index) => (
                <div key={index} className="border border-border rounded-lg p-4 bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-body font-bold text-foreground mb-1">{pdf.printTitle}</h4>
                      <p className="text-sm text-muted-foreground font-body mb-2">
                        Size: {pdf.size} • 300 DPI • Print-Ready
                      </p>
                      <p className="text-xs text-muted-foreground font-body font-mono">
                        {pdf.filename}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <iframe
                        src={pdf.url}
                        className="w-48 h-64 border border-border rounded"
                        title={`Preview of ${pdf.filename}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = pdf.url;
                          a.download = pdf.filename;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }}
                        className="font-body text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" /> Download This PDF
          </Button>
        </div>
      </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
              <Button
                onClick={handleDownloadAllPDFs}
                className="flex-1 bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90"
              >
                <Download className="w-4 h-4 mr-2" /> Download All PDFs ({generatedPDFs.length})
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  generatedPDFs.forEach(pdf => window.URL.revokeObjectURL(pdf.url));
                  setGeneratedPDFs([]);
                  setShowPDFPreview(false);
                }}
                className="font-body"
              >
                Close
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground font-body text-center pt-2">
              Each PDF is generated separately at the exact size selected for that print.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StepReview;
