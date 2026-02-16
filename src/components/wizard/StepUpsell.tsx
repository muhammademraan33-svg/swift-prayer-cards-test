import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Search, Loader2, Upload, RotateCw } from "lucide-react";
import { standardSizes, calcMetalPrice, metalOptions } from "@/lib/pricing";
import type { SelectedImage, MaterialChoice } from "./types";
import { searchArt, getCuratedArt, type NormalizedPhoto } from "@/lib/artApi";

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

const StepUpsell = ({ frontImage, backImage, backUploadedFile, doubleSided, material, sizeIdx, onToggleDouble, onSelectBack, onUploadBack, onNext, onBack }: Props) => {
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<NormalizedPhoto[]>([]);
  const [loading, setLoading] = useState(false);

  const backUrl = backUploadedFile || backImage?.url;

  const size = standardSizes[sizeIdx];
  const singleIdx = material === "metal-designer" ? 0 : 2;
  const doubleIdx = material === "metal-designer" ? 1 : 3;
  const singlePrice = calcMetalPrice(size.w, size.h, metalOptions[singleIdx]);
  const doublePrice = calcMetalPrice(size.w, size.h, metalOptions[doubleIdx]);
  const upsellCost = doublePrice - singlePrice;

  useEffect(() => {
    const loadCurated = async () => {
      setLoading(true);
      try {
        setPhotos(await getCuratedArt(12));
      } catch { setPhotos([]); }
      finally { setLoading(false); }
    };
    loadCurated();
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      setPhotos(await searchArt(q, 12));
    } catch { setPhotos([]); }
    finally { setLoading(false); }
  }, []);

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
          <p className="text-[10px] text-primary font-body mt-1.5 font-semibold tracking-wider uppercase">Front</p>
        </div>
        <RotateCw className="w-5 h-5 text-primary shrink-0" />
        <div className="text-center">
          {backUrl ? (
            <div className="w-28 h-20 sm:w-36 sm:h-28 rounded-lg overflow-hidden border border-primary/30 shadow-lg">
              <img src={backUrl} alt="Back" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-28 h-20 sm:w-36 sm:h-28 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-secondary/50">
              <p className="text-[10px] text-muted-foreground font-body">Your 2nd image</p>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground font-body mt-1.5 font-semibold tracking-wider uppercase">Back</p>
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

      {/* Image picker — shown after opting in */}
      {(doubleSided || backUrl) && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-border hover:border-primary/50 rounded cursor-pointer transition-colors text-xs shrink-0">
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span className="font-body text-foreground">Upload Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
            <form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="flex gap-1.5 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search art..."
                  className="pl-7 bg-secondary border-border text-foreground font-body text-xs h-8"
                />
              </div>
              <Button type="submit" size="sm" disabled={loading} className="bg-gradient-gold text-primary-foreground font-body hover:opacity-90 h-8 w-8 p-0">
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
              </Button>
            </form>
          </div>

          {loading && <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />}

          {photos.length > 0 && !loading && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-1.5">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`aspect-[4/3] rounded overflow-hidden cursor-pointer border-2 transition-all ${
                    backImage?.url === photo.large ? "border-primary ring-1 ring-primary" : "border-transparent hover:border-primary/40"
                  }`}
                  onClick={() => { onSelectBack({ url: photo.large, photographer: photo.artist, alt: photo.alt }); onToggleDouble(true); }}
                >
                  <img src={photo.medium} alt={photo.alt} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          )}
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
