import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Upload, RotateCw } from "lucide-react";
import { standardSizes, calcMetalPrice, metalOptions } from "@/lib/pricing";
import type { SelectedImage, MaterialChoice } from "./types";

interface Props {
  frontImage: string;
  backImage: SelectedImage | null;
  backUploadedFile: string | null;
  doubleSided: boolean;
  material: MaterialChoice;
  sizeIdx: number;
  onToggleDouble: (v: boolean) => void;
  onSelectBack: (img: SelectedImage) => void;
  onUploadBack: (dataUrl: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepUpsell = ({ frontImage, backImage, backUploadedFile, doubleSided, material, sizeIdx, onToggleDouble, onUploadBack, onNext, onBack }: Props) => {
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

      {/* Simple visual showing the concept */}
      <div className="flex items-center justify-center gap-4 py-4">
        <div className="text-center">
          <div className="w-28 h-20 sm:w-36 sm:h-28 rounded-lg overflow-hidden border border-primary/30 shadow-lg">
            <img src={frontImage} alt="Front" className="w-full h-full object-cover" />
          </div>
          <p className="text-xs text-primary font-body mt-1.5 font-semibold tracking-wider uppercase">Front</p>
        </div>
        <RotateCw className="w-5 h-5 text-primary shrink-0" />
        <div className="text-center">
          {backUrl ? (
            <div className="w-28 h-20 sm:w-36 sm:h-28 rounded-lg overflow-hidden border border-primary/30 shadow-lg">
              <img src={backUrl} alt="Back" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-28 h-20 sm:w-36 sm:h-28 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-secondary/50">
              <p className="text-xs text-muted-foreground font-body">Your 2nd image</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground font-body mt-1.5 font-semibold tracking-wider uppercase">Back</p>
        </div>
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

      {/* Upload only — shown after opting in */}
      {(doubleSided || backUrl) && !backUrl && (
        <div className="flex justify-center">
          <label className="flex flex-col items-center gap-3 px-8 py-6 border-2 border-dashed border-primary/40 hover:border-primary rounded-xl cursor-pointer transition-all bg-primary/5 hover:bg-primary/10 group">
            <Upload className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-body text-sm font-semibold text-foreground">Upload Your Back Image</span>
            <span className="font-body text-xs text-muted-foreground">JPG, PNG, TIFF</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      )}

      {(doubleSided || backUrl) && backUrl && (
        <div className="flex justify-center">
          <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border hover:border-primary/50 rounded-lg cursor-pointer transition-colors text-sm">
            <Upload className="w-4 h-4 text-primary" />
            <span className="font-body text-foreground">Change Back Image</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="font-body gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={onNext}
          disabled={doubleSided && !backUrl}
          className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2"
        >
          Finishing Options <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepUpsell;
