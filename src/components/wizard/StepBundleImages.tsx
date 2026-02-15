import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, ImagePlus, Search, Upload, X, Check } from "lucide-react";
import type { Bundle } from "@/lib/pricing";
import type { BundleSlot, SelectedImage } from "./types";

const PEXELS_API_KEY = "X6x17AZ7r5kg7ViRIiE33JuEwA7RHF17EbdFYNXg5jqn5mNRg2EAvkwl";

interface PexelsPhoto {
  id: number;
  src: { medium: string; large: string };
  photographer: string;
  alt: string;
}

interface Props {
  bundle: Bundle;
  slots: BundleSlot[];
  onUpdateSlot: (index: number, slot: BundleSlot) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepBundleImages = ({ bundle, slots, onUpdateSlot, onNext, onBack }: Props) => {
  const [activeSlot, setActiveSlot] = useState(0);
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const totalPrints = bundle.prints.reduce((sum, p) => sum + p.qty, 0);
  const filledCount = slots.filter((s) => s.image || s.uploadedFile).length;
  const allFilled = filledCount === totalPrints;

  const searchPhotos = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=12`, {
        headers: { Authorization: PEXELS_API_KEY },
      });
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch { setPhotos([]); }
    setLoading(false);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateSlot(activeSlot, { image: null, uploadedFile: reader.result as string });
      // Auto-advance to next empty slot
      const nextEmpty = slots.findIndex((s, i) => i > activeSlot && !s.image && !s.uploadedFile);
      if (nextEmpty !== -1) setActiveSlot(nextEmpty);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPhoto = (photo: PexelsPhoto) => {
    onUpdateSlot(activeSlot, {
      image: { url: photo.src.large, photographer: photo.photographer, alt: photo.alt },
      uploadedFile: null,
    });
    // Auto-advance to next empty slot
    const nextEmpty = slots.findIndex((s, i) => i > activeSlot && !s.image && !s.uploadedFile);
    if (nextEmpty !== -1) setActiveSlot(nextEmpty);
  };

  // Build slot labels from bundle prints
  const slotLabels: { label: string; slotIdx: number }[] = [];
  let idx = 0;
  for (const p of bundle.prints) {
    for (let q = 0; q < p.qty; q++) {
      slotLabels.push({ label: `${p.w}"×${p.h}"`, slotIdx: idx });
      idx++;
    }
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          {bundle.name}
        </h2>
        <p className="text-muted-foreground font-body mt-1 tracking-wide text-sm">
          Add an image for each print — {filledCount} of {totalPrints} ready
        </p>
      </div>

      {/* Slot grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {slotLabels.map(({ label, slotIdx }) => {
          const slot = slots[slotIdx];
          const hasImage = slot?.image || slot?.uploadedFile;
          const isActive = slotIdx === activeSlot;
          const imgSrc = slot?.uploadedFile || slot?.image?.url;
          return (
            <Card
              key={slotIdx}
              className={`aspect-square cursor-pointer transition-all duration-200 overflow-hidden relative ${
                isActive
                  ? "ring-2 ring-primary border-primary"
                  : hasImage
                    ? "border-primary/40"
                    : "border-border border-dashed hover:border-primary/40"
              }`}
              onClick={() => setActiveSlot(slotIdx)}
            >
              {hasImage && imgSrc ? (
                <>
                  <img src={imgSrc} alt={`Print ${slotIdx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                  <button
                    className="absolute top-1 left-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center"
                    onClick={(e) => { e.stopPropagation(); onUpdateSlot(slotIdx, { image: null, uploadedFile: null }); }}
                  >
                    <X className="w-2.5 h-2.5 text-destructive-foreground" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                  <ImagePlus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground font-body">{label}</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Image source for active slot */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-primary">
            Image for Print {activeSlot + 1} ({slotLabels[activeSlot]?.label})
          </p>
          <Button
            variant="outline"
            size="sm"
            className="font-body text-[10px] h-7 gap-1"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-3 h-3" /> Upload
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </div>

        {/* Search */}
        <form
          onSubmit={(e) => { e.preventDefault(); searchPhotos(query); }}
          className="flex gap-2"
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search free images..."
            className="font-body text-sm h-9"
          />
          <Button type="submit" size="sm" variant="outline" className="h-9 gap-1 font-body text-xs" disabled={loading}>
            <Search className="w-3 h-3" /> {loading ? "..." : "Search"}
          </Button>
        </form>

        {/* Results */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="aspect-square rounded overflow-hidden cursor-pointer border border-border hover:border-primary/60 transition-all"
                onClick={() => handleSelectPhoto(photo)}
              >
                <img src={photo.src.medium} alt={photo.alt} className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="font-body gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!allFilled}
          className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2"
        >
          Review Order <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepBundleImages;
