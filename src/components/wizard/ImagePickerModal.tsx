import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import type { SelectedImage } from "./types";

interface Props {
  open: boolean;
  slotIndex: number;
  onClose: () => void;
  onSelectImage: (slotIndex: number, image: SelectedImage) => void;
  onUploadImage: (slotIndex: number, dataUrl: string) => void;
}

const ImagePickerModal = ({ open, slotIndex, onClose, onSelectImage, onUploadImage }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUploadImage(slotIndex, reader.result as string);
      onClose();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Choose Image — Print {slotIndex + 2}
          </DialogTitle>
        </DialogHeader>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

        <div className="flex flex-col items-center gap-4 py-6">
          <label className="flex flex-col items-center gap-3 w-full px-6 py-8 border-2 border-dashed border-primary/40 hover:border-primary rounded-xl cursor-pointer transition-all bg-primary/5 hover:bg-primary/10 group">
            <Upload className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-body text-sm font-semibold text-foreground">Upload Your Photo</span>
            <span className="font-body text-xs text-muted-foreground">JPG, PNG, TIFF</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePickerModal;
