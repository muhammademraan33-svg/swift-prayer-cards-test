import { Badge } from "@/components/ui/badge";
import { Upload, ImagePlus, X } from "lucide-react";
import type { SelectedImage } from "./types";

interface Props {
  backImage: SelectedImage | null;
  backUploadedFile: string | null;
  upsellCost: number;
  onSelectBack: (img: SelectedImage) => void;
  onUploadBack: (dataUrl: string) => void;
  onRemoveBack: () => void;
}

const BackImagePicker = ({ backImage, backUploadedFile, upsellCost, onUploadBack, onRemoveBack }: Props) => {
  const backUrl = backUploadedFile || backImage?.url;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUploadBack(reader.result as string);
    reader.readAsDataURL(file);
    
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="bg-card border border-primary/30 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImagePlus className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-display font-semibold text-foreground">Add Your 2nd Image</h4>
          <Badge className="bg-gradient-gold text-primary-foreground border-0 font-body text-[9px] px-1.5 py-0">
            +${upsellCost}
          </Badge>
        </div>
        {backUrl && (
          <button onClick={onRemoveBack} className="text-muted-foreground hover:text-foreground transition-colors" title="Remove">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Selected back image preview */}
      {backUrl && (
        <div className="flex items-center gap-3">
          <div className="w-20 h-14 rounded overflow-hidden border border-primary shrink-0">
            <img src={backUrl} alt="Back side" className="w-full h-full object-cover" />
          </div>
          <p className="text-xs text-muted-foreground font-body">
            This image will appear on the back of your metal print. Flip anytime for an instant room refresh.
          </p>
        </div>
      )}

      {/* Upload button */}
      <label className="flex items-center gap-1.5 px-2.5 py-1.5 border border-dashed border-border hover:border-primary/50 rounded cursor-pointer transition-colors text-[11px] w-fit">
        <Upload className="w-3 h-3 text-primary" />
        <span className="font-body text-foreground">{backUrl ? "Change Image" : "Upload Image"}</span>
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </label>
    </div>
  );
};

export default BackImagePicker;
