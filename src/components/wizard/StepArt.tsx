import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Camera, Upload, ArrowRight } from "lucide-react";
import type { SelectedImage } from "./types";

const PEXELS_API_KEY = "X6x17AZ7r5kg7ViRIiE33JuEwA7RHF17EbdFYNXg5jqn5mNRg2EAvkwl";

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  photographer: string;
  alt: string;
  src: { large2x: string; medium: string; small: string };
}

const genres = ["Fine Art", "Landscape", "Architecture", "Abstract", "Wildlife", "Botanical", "Aerial", "Ocean", "Portrait", "Cityscape"];

interface Props {
  image: SelectedImage | null;
  uploadedFile: string | null;
  onSelect: (image: SelectedImage) => void;
  onUpload: (dataUrl: string) => void;
  onNext: () => void;
}

const StepArt = ({ image, uploadedFile, onSelect, onUpload, onNext }: Props) => {
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchPhotos = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=20&orientation=landscape`,
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
    reader.onload = () => onUpload(reader.result as string);
    reader.readAsDataURL(file);
  };

  const hasSelection = !!image || !!uploadedFile;
  const previewUrl = uploadedFile || image?.url;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Select Your Artwork
        </h2>
        <p className="text-muted-foreground font-body mt-3 tracking-wide">
          Search our curated gallery or upload your own image.
        </p>
      </div>

      {/* Upload option */}
      <div className="flex justify-center">
        <label className="flex items-center gap-3 px-6 py-4 border-2 border-dashed border-border hover:border-primary/50 rounded-lg cursor-pointer transition-colors bg-card">
          <Upload className="w-5 h-5 text-primary" />
          <span className="font-body text-foreground">Upload Your Photo</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-body tracking-[0.2em] uppercase">or browse gallery</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Search */}
      <form onSubmit={(e) => { e.preventDefault(); searchPhotos(query); }} className="flex gap-3 max-w-xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search... (e.g. alpine, venetian, botanical)"
            className="pl-10 bg-secondary border-border text-foreground font-body"
          />
        </div>
        <Button type="submit" disabled={loading} className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      {/* Genre tags */}
      <div className="flex flex-wrap justify-center gap-2">
        {genres.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="border-border text-muted-foreground hover:border-primary hover:text-primary cursor-pointer transition-colors font-body tracking-wider text-[10px]"
            onClick={() => { setQuery(tag); searchPhotos(tag); }}
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground font-body">Curating results...</p>
        </div>
      )}

      {!loading && searched && photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <Card
              key={photo.id}
              className={`overflow-hidden cursor-pointer transition-all duration-300 group ${
                image?.url === photo.src.large2x ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/40"
              }`}
              onClick={() => onSelect({ url: photo.src.large2x, photographer: photo.photographer, alt: photo.alt })}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={photo.src.medium} alt={photo.alt || "Photo"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              </div>
              <div className="p-2">
                <p className="text-[10px] text-muted-foreground font-body truncate">📷 {photo.photographer}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && !searched && (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Camera className="w-7 h-7 text-primary" />
          </div>
          <p className="text-muted-foreground font-body">Search or select a genre above</p>
        </div>
      )}

      {!loading && searched && photos.length === 0 && (
        <p className="text-center text-muted-foreground font-body py-8">No results found. Try a different term.</p>
      )}

      {/* Selected preview + continue */}
      {hasSelection && (
        <div className="bg-card border border-primary/30 rounded-lg p-6 flex flex-col sm:flex-row items-center gap-6">
          <img src={previewUrl} alt="Selected" className="w-28 h-20 object-cover rounded" />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-foreground font-display font-semibold text-lg">Your Artwork</p>
            {image && <p className="text-sm text-muted-foreground font-body">By {image.photographer}</p>}
            {uploadedFile && <p className="text-sm text-muted-foreground font-body">Your uploaded image</p>}
          </div>
          <Button onClick={onNext} className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2">
            Choose Size <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      <p className="text-center text-[10px] text-muted-foreground/50 font-body">
        Gallery photos by <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Pexels</a>
      </p>
    </div>
  );
};

export default StepArt;
