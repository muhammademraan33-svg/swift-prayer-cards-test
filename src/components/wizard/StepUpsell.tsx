import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Upload, RotateCw } from "lucide-react";
import { standardSizes, calcMetalPrice, metalOptions } from "@/lib/pricing";
import type { SelectedImage, MaterialChoice, AdditionalPrint } from "./types";

interface Props {
  frontImage: string;
  backImage: SelectedImage | null;
  backUploadedFile: string | null;
  doubleSided: boolean;
  material: MaterialChoice;
  sizeIdx: number;
  quantity: number;
  additionalPrints: AdditionalPrint[];
  onToggleDouble: (v: boolean) => void;
  onSelectBack: (img: SelectedImage) => void;
  onUploadBack: (dataUrl: string) => void;
  onAdditionalPrints: (ap: AdditionalPrint[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepUpsell = ({ frontImage, backImage, backUploadedFile, doubleSided, material, sizeIdx, quantity, additionalPrints, onToggleDouble, onUploadBack, onAdditionalPrints, onNext, onBack }: Props) => {
  const backUrl = backUploadedFile || backImage?.url;

  const size = standardSizes[sizeIdx];
  const singleIdx = material === "metal-designer" ? 0 : 2;
  const doubleIdx = material === "metal-designer" ? 1 : 3;
  const singlePrice = calcMetalPrice(size.w, size.h, metalOptions[singleIdx]);
  const doublePrice = calcMetalPrice(size.w, size.h, metalOptions[doubleIdx]);
  const upsellCost = doublePrice - singlePrice;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { onUploadBack(reader.result as string); onToggleDouble(true); };
    reader.readAsDataURL(file);
  };

  const handleAdditionalPrintBackUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const updated = [...additionalPrints];
      if (!updated[idx]) return;
      updated[idx] = { ...updated[idx], backUploadedFile: reader.result as string, backImage: null };
      onAdditionalPrints(updated);
      onToggleDouble(true);
    };
    reader.readAsDataURL(file);
  };

  // Check if all prints have back images when doubleSided is enabled
  const allPrintsHaveBackImages = doubleSided && (
    backUrl && 
    additionalPrints.every((ap, idx) => {
      const apImg = ap.uploadedFile || ap.image?.url;
      if (!apImg) return true; // Skip if print doesn't have front image yet
      return ap.backUploadedFile || ap.backImage?.url;
    })
  );

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Add a Second Side?
        </h2>
        <p className="text-muted-foreground font-body mt-2 tracking-wide text-sm max-w-md mx-auto">
          Metal prints can be flipped to show a different image on each side.
        </p>
      </div>

      {/* All prints listed with back-image upload */}
      <div className="space-y-3 max-w-md mx-auto">
        {/* Primary print */}
        <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card">
          <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-lg overflow-hidden border border-primary/30 shadow-md shrink-0">
            <img src={frontImage} alt="Print 1" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-bold text-foreground">Print 1</p>
            <p className="text-xs text-primary font-body font-semibold uppercase tracking-wider">Front</p>
          </div>
          <RotateCw className="w-4 h-4 text-primary shrink-0" />
          {backUrl ? (
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-16 h-12 sm:w-20 sm:h-16 rounded-lg overflow-hidden border border-primary/30 shadow-md">
                <img src={backUrl} alt="Back" className="w-full h-full object-cover" />
              </div>
              <label className="cursor-pointer text-primary hover:text-primary/80 transition-colors">
                <Upload className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-primary/40 hover:border-primary rounded-lg cursor-pointer transition-all bg-primary/5 hover:bg-primary/10 shrink-0">
              <Upload className="w-4 h-4 text-primary" />
              <span className="font-body text-xs font-semibold text-foreground">Upload Back</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
          )}
        </div>

        {/* Additional prints in set */}
        {quantity > 1 && additionalPrints.map((ap, idx) => {
          const apImg = ap.uploadedFile || ap.image?.url;
          if (!apImg) return null;
          const apBackUrl = ap.backUploadedFile || ap.backImage?.url;
          return (
            <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card">
              <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-lg overflow-hidden border border-border shadow-md shrink-0">
                <img src={apImg} alt={`Print ${idx + 2} front`} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-bold text-foreground">Print {idx + 2}</p>
                <p className="text-xs text-primary font-body font-semibold uppercase tracking-wider">Front</p>
              </div>
              <RotateCw className="w-4 h-4 text-primary shrink-0" />
              {apBackUrl ? (
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-16 h-12 sm:w-20 sm:h-16 rounded-lg overflow-hidden border border-primary/30 shadow-md">
                    <img src={apBackUrl} alt={`Print ${idx + 2} back`} className="w-full h-full object-cover" />
                  </div>
                  <label className="cursor-pointer text-primary hover:text-primary/80 transition-colors">
                    <Upload className="w-4 h-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAdditionalPrintBackUpload(idx, e)} />
                  </label>
                </div>
              ) : (
                <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-primary/40 hover:border-primary rounded-lg cursor-pointer transition-all bg-primary/5 hover:bg-primary/10 shrink-0">
                  <Upload className="w-4 h-4 text-primary" />
                  <span className="font-body text-xs font-semibold text-foreground">Upload Back</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAdditionalPrintBackUpload(idx, e)} />
                </label>
              )}
            </div>
          );
        })}
      </div>

      {/* Decision */}
      {!doubleSided && !backUrl && (
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground font-body">
            Add a second image for just <span className="text-primary font-bold">+${upsellCost}</span>
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => onToggleDouble(true)}
              className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90"
            >
              Yes, add 2nd side
            </Button>
            <Button
              variant="outline"
              onClick={onNext}
              className="font-body"
            >
              No thanks, continue
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="font-body gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={onNext}
          disabled={doubleSided && !allPrintsHaveBackImages}
          className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2"
        >
          Finishing Options <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepUpsell;
