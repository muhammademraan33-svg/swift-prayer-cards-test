import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Upload, ImagePlus, X } from "lucide-react";
import type { SelectedImage } from "./types";
import { searchArt, getCuratedArt, type NormalizedPhoto } from "@/lib/artApi";

interface Props {
  backImage: SelectedImage | null;
  backUploadedFile: string | null;
  upsellCost: number;
  onSelectBack: (img: SelectedImage) => void;
  onUploadBack: (dataUrl: string) => void;
  onRemoveBack: () => void;
}

const BackImagePicker = ({ backImage, backUploadedFile, upsellCost, onSelectBack, onUploadBack, onRemoveBack }: Props) => {
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<NormalizedPhoto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCurated = async () => {
      setLoading(true);
      try {
        setPhotos(await getCuratedArt(8));
      } catch { setPhotos([]); }
      finally { setLoading(false); }
    };
    loadCurated();
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      setPhotos(await searchArt(q, 8));
    } catch { setPhotos([]); }
    finally { setLoading(false); }
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUploadBack(reader.result as string);
    reader.readAsDataURL(file);
  };

  const backUrl = backUploadedFile || backImage?.url;

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

      {/* Upload + Search row */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5 px-2.5 py-1.5 border border-dashed border-border hover:border-primary/50 rounded cursor-pointer transition-colors text-[11px] shrink-0">
          <Upload className="w-3 h-3 text-primary" />
          <span className="font-body text-foreground">Upload</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
        <form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="flex gap-1.5 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search art..."
              className="pl-6 bg-secondary border-border text-foreground font-body text-[11px] h-7"
            />
          </div>
          <Button type="submit" size="sm" disabled={loading} className="bg-gradient-gold text-primary-foreground font-body hover:opacity-90 h-7 w-7 p-0">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
          </Button>
        </form>
      </div>

      {/* Photo grid */}
      {loading && <Loader2 className="w-4 h-4 animate-spin text-primary mx-auto" />}
      {photos.length > 0 && !loading && (
        <div className="grid grid-cols-4 gap-1.5">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`aspect-[4/3] rounded overflow-hidden cursor-pointer border-2 transition-all ${
                backImage?.url === photo.large ? "border-primary ring-1 ring-primary" : "border-transparent hover:border-primary/40"
              }`}
              onClick={() => onSelectBack({ url: photo.large, photographer: photo.artist, alt: photo.alt })}
            >
              <img src={photo.medium} alt={photo.alt} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BackImagePicker;
