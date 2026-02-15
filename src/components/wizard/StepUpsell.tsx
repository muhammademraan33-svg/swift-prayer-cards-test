import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Search, Loader2, Upload, RotateCw, X } from "lucide-react";
import type { SelectedImage } from "./types";

const PEXELS_API_KEY = "X6x17AZ7r5kg7ViRIiE33JuEwA7RHF17EbdFYNXg5jqn5mNRg2EAvkwl";

interface PexelsPhoto {
  id: number;
  photographer: string;
  alt: string;
  src: { large2x: string; medium: string };
}

interface Props {
  frontImage: string;
  backImage: SelectedImage | null;
  backUploadedFile: string | null;
  doubleSided: boolean;
  onToggleDouble: (v: boolean) => void;
  onSelectBack: (img: SelectedImage) => void;
  onUploadBack: (dataUrl: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepUpsell = ({ frontImage, backImage, backUploadedFile, doubleSided, onToggleDouble, onSelectBack, onUploadBack, onNext, onBack }: Props) => {
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);

  const searchPhotos = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=12&orientation=landscape`,
        { headers: { Authorization: PEXELS_API_KEY } }
      );
      const data = await res.json();
      setPhotos(data.photos || []);
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
    reader.onload = () => onUploadBack(reader.result as string);
    reader.readAsDataURL(file);
  };

  const backUrl = backUploadedFile || backImage?.url;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Double Your Art
        </h2>
        <p className="text-muted-foreground font-body mt-3 tracking-wide max-w-lg mx-auto">
          Your metal print can feature a second image on the back. Flip it anytime for an instant room refresh.
        </p>
      </div>

      {/* Front/back preview */}
      <div className="flex justify-center">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="w-36 h-28 rounded-lg overflow-hidden border-2 border-primary shadow-lg">
              <img src={frontImage} alt="Front" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs text-primary font-body mt-2 font-semibold tracking-wider">FRONT</p>
          </div>
          <RotateCw className="w-8 h-8 text-primary" />
          <div className="text-center">
            <div className={`w-36 h-28 rounded-lg overflow-hidden border-2 shadow-lg ${doubleSided && backUrl ? "border-primary" : "border-dashed border-border"}`}>
              {doubleSided && backUrl ? (
                <img src={backUrl} alt="Back" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <p className="text-[10px] text-muted-foreground font-body">Back Image</p>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-body mt-2 font-semibold tracking-wider">BACK</p>
          </div>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex justify-center gap-4">
        <Card
          className={`p-5 cursor-pointer text-center transition-all w-48 ${
            !doubleSided ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/40"
          }`}
          onClick={() => onToggleDouble(false)}
        >
          <p className="font-display font-bold text-foreground">Single-Sided</p>
          <p className="text-xs text-muted-foreground font-body mt-1">One stunning image</p>
        </Card>
        <Card
          className={`p-5 cursor-pointer text-center transition-all w-48 relative ${
            doubleSided ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/40"
          }`}
          onClick={() => onToggleDouble(true)}
        >
          <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-gold text-primary-foreground border-0 text-[9px] font-body">
            RECOMMENDED
          </Badge>
          <p className="font-display font-bold text-foreground">Double-Sided</p>
          <p className="text-xs text-muted-foreground font-body mt-1">Two looks in one</p>
        </Card>
      </div>

      {/* Back image selection */}
      {doubleSided && (
        <div className="space-y-4 bg-card border border-border rounded-lg p-6">
          <h3 className="font-display font-semibold text-foreground text-center">Select Your Back Image</h3>

          {/* Upload */}
          <div className="flex justify-center">
            <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border hover:border-primary/50 rounded cursor-pointer transition-colors text-sm">
              <Upload className="w-4 h-4 text-primary" />
              <span className="font-body text-foreground">Upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
          </div>

          {/* Search */}
          <form onSubmit={(e) => { e.preventDefault(); searchPhotos(query); }} className="flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search gallery..."
                className="pl-8 bg-secondary border-border text-foreground font-body text-sm h-9"
              />
            </div>
            <Button type="submit" size="sm" disabled={loading} className="bg-gradient-gold text-primary-foreground font-body hover:opacity-90">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
            </Button>
          </form>

          {loading && <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />}

          {photos.length > 0 && !loading && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`aspect-[4/3] rounded overflow-hidden cursor-pointer border-2 transition-all ${
                    backImage?.url === photo.src.large2x ? "border-primary" : "border-transparent hover:border-primary/40"
                  }`}
                  onClick={() => onSelectBack({ url: photo.src.large2x, photographer: photo.photographer, alt: photo.alt })}
                >
                  <img src={photo.src.medium} alt={photo.alt} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between pt-4">
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
