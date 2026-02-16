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
      img.onload = () => {
        onUpload(dataUrl, img.naturalWidth, img.naturalHeight);
        // Auto-advance to next step after upload
        setTimeout(() => onNext(), 300);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  const hasSelection = !!image || !!uploadedFile;

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8 min-h-[400px]">
      {/* Hero upload area */}
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

      {hasSelection && (
        <p className="text-xs text-muted-foreground font-body text-center animate-pulse">
          Loading preview...
        </p>
      )}
    </div>
  );
};

export default StepArt;
