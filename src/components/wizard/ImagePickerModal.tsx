import { useState, useCallback, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Upload, X } from "lucide-react";
import { searchPhotos, getCuratedPhotos, type NormalizedPhoto } from "@/lib/artApi";
import type { SelectedImage } from "./types";

interface Props {
  open: boolean;
  slotIndex: number;
  onClose: () => void;
  onSelectImage: (slotIndex: number, image: SelectedImage) => void;
  onUploadImage: (slotIndex: number, dataUrl: string) => void;
}

const ImagePickerModal = ({ open, slotIndex, onClose, onSelectImage, onUploadImage }: Props) => {
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<NormalizedPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load curated on open
  useEffect(() => {
    if (open && photos.length === 0 && !searched) {
      setLoading(true);
      getCuratedPhotos(20, 1)
        .then(setPhotos)
        .catch(() => setPhotos([]))
        .finally(() => setLoading(false));
    }
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const results = await searchPhotos(q, 20, 1);
      setPhotos(results);
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleSelect = (photo: NormalizedPhoto) => {
    onSelectImage(slotIndex, {
      url: photo.large,
      photographer: photo.artist,
      alt: photo.alt,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Choose Image — Print {slotIndex + 2}
          </DialogTitle>
        </DialogHeader>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

        {/* Upload + Search row */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="shrink-0 gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            Upload
          </Button>
          <form
            className="flex-1 flex gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              doSearch(query);
            }}
          >
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stock images…"
              className="text-sm font-body"
            />
            <Button type="submit" size="icon" variant="outline" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </form>
        </div>

        {/* Results grid */}
        <div className="flex-1 overflow-y-auto min-h-0 mt-2">
          {loading && photos.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : photos.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8 font-body">No results found</p>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => handleSelect(photo)}
                  className="aspect-square rounded-md overflow-hidden border border-border hover:ring-2 hover:ring-primary transition-all"
                >
                  <img src={photo.medium} alt={photo.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePickerModal;
