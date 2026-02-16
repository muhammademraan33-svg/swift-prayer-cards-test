import { Upload, ArrowRight, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SelectedImage } from "./types";

interface Props {
  image: SelectedImage | null;
  uploadedFile: string | null;
  onSelect: (image: SelectedImage) => void;
  onUpload: (dataUrl: string, width: number, height: number) => void;
  onNext: () => void;
}

const StepArt = ({ image, uploadedFile, onUpload, onNext }: Props) => {
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => onUpload(dataUrl, img.naturalWidth, img.naturalHeight);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  const hasSelection = !!image || !!uploadedFile;
  const previewUrl = uploadedFile || image?.url;

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8">
      {/* Hero upload area */}
      {!hasSelection ? (
        <label className="flex flex-col items-center justify-center gap-4 w-full max-w-md px-10 py-16 border-2 border-dashed border-primary/40 hover:border-primary rounded-2xl cursor-pointer transition-all bg-primary/5 hover:bg-primary/10 group">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-xl text-foreground">Upload Your Photo</p>
            <p className="font-body text-sm text-muted-foreground mt-1">JPG, PNG, TIFF — any resolution</p>
            <p className="font-body text-xs text-muted-foreground/70 mt-3">
              Photos from modern phones (12MP+) produce stunning prints up to 48×96″
            </p>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-primary/30 shadow-lg">
            <img src={previewUrl} alt="Your upload" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-3 w-full">
            <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border hover:border-primary/50 rounded-lg cursor-pointer transition-colors text-sm flex-1 justify-center">
              <ImageIcon className="w-4 h-4 text-primary" />
              <span className="font-body text-foreground">Change Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
            <Button
              onClick={onNext}
              className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2 flex-1"
            >
              Choose Size <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Continue bar for selected state */}
      {hasSelection && (
        <p className="text-xs text-muted-foreground font-body text-center">
          Your image is ready. Choose your size and material next.
        </p>
      )}
    </div>
  );
};

export default StepArt;
