import { useState, useCallback, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Camera, Upload, ArrowRight } from "lucide-react";
import type { SelectedImage } from "./types";
import { searchPhotos, getCuratedPhotos, type NormalizedPhoto } from "@/lib/artApi";

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
  const [photos, setPhotos] = useState<NormalizedPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeQuery, setActiveQuery] = useState<string | null>(null); // null = curated
  const sentinelRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    setActiveQuery(q);
    setPage(1);
    setHasMore(true);
    try {
      const results = await searchPhotos(q, 20, 1);
      setPhotos(results);
      if (results.length < 20) setHasMore(false);
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load curated on mount
  useEffect(() => {
    const loadCurated = async () => {
      setLoading(true);
      setActiveQuery(null);
      setPage(1);
      setHasMore(true);
      try {
        const results = await getCuratedPhotos(20, 1);
        setPhotos(results);
        if (results.length < 20) setHasMore(false);
      } catch {
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };
    loadCurated();
  }, []);

  // Load more
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const results = activeQuery
        ? await searchPhotos(activeQuery, 20, nextPage)
        : await getCuratedPhotos(20, nextPage);
      if (results.length < 20) setHasMore(false);
      setPhotos(prev => [...prev, ...results]);
      setPage(nextPage);
    } catch { /* ignore */ }
    finally { setLoadingMore(false); }
  }, [loadingMore, hasMore, page, activeQuery]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

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
    <div className="space-y-3">

      {/* Upload + Search row */}
      <div className="flex items-stretch gap-3 max-w-3xl mx-auto">
        <label className="flex-1 flex flex-col items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-primary/40 hover:border-primary rounded-lg cursor-pointer transition-all bg-primary/5 hover:bg-primary/10 group">
          <Upload className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-body text-sm font-semibold text-foreground">Upload Your Photo</span>
          <span className="font-body text-xs text-muted-foreground">JPG, PNG, TIFF</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>

        <div className="flex items-center">
          <span className="text-xs text-muted-foreground font-body tracking-[0.2em] uppercase">or</span>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-2">
          <form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="flex gap-1.5">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search millions of photos..."
                className="pl-8 bg-secondary border-border text-foreground font-body h-10 text-sm"
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 h-10 text-sm px-4">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground font-body">Browse our curated gallery below</p>
        </div>
      </div>

      {/* Genre tags */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {genres.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="border-border text-muted-foreground hover:border-primary hover:text-primary cursor-pointer transition-colors font-body tracking-wider text-xs py-0.5 px-2"
            onClick={() => { setQuery(tag); doSearch(tag); }}
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Initial loading */}
      {loading && photos.length === 0 && (
        <div className="text-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground font-body text-xs">Curating results...</p>
        </div>
      )}

      {/* Results — scrollable */}
      {photos.length > 0 && (
        <div className="max-h-[360px] overflow-y-auto rounded-lg scrollbar-none">
          <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5">
            {photos.map((photo) => (
              <Card
                key={photo.id}
                className={`overflow-hidden cursor-pointer transition-all duration-300 group ${
                  image?.url === photo.large ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/40"
                }`}
                onClick={() => onSelect({ url: photo.large, photographer: photo.artist, alt: photo.alt })}
              >
                <div className="aspect-square overflow-hidden">
                  <img src={photo.medium} alt={photo.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
              </Card>
            ))}
          </div>

          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-2">
              {loadingMore && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </div>
          )}
        </div>
      )}

      {!loading && !searched && photos.length === 0 && (
        <div className="text-center py-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Camera className="w-5 h-5 text-primary" />
          </div>
          <p className="text-muted-foreground font-body text-xs">Loading gallery...</p>
        </div>
      )}

      {!loading && searched && photos.length === 0 && (
        <p className="text-center text-muted-foreground font-body py-4 text-sm">No results found. Try a different term.</p>
      )}

      {/* Selected preview + continue */}
      {hasSelection && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border p-3">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <img src={previewUrl} alt="Selected" className="w-16 h-11 object-cover rounded" />
            <div className="flex-1">
              <p className="text-foreground font-display font-semibold text-sm">Your Artwork</p>
              {image && <p className="text-xs text-muted-foreground font-body">By {image.photographer}</p>}
              {uploadedFile && <p className="text-xs text-muted-foreground font-body">Your uploaded image</p>}
            </div>
            <Button onClick={onNext} className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2 h-10 px-6 text-sm">
              Choose Size <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <p className="text-center text-[10px] text-muted-foreground/50 font-body">
        Photos by <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Pexels</a> & <a href="https://pixabay.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Pixabay</a>
      </p>
    </div>
  );
};

export default StepArt;
