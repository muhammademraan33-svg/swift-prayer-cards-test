import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Image as ImageIcon,
  Loader2,
  ArrowRight,
  Camera,
} from "lucide-react";

const PEXELS_API_KEY = "X6x17AZ7r5kg7ViRIiE33JuEwA7RHF17EbdFYNXg5jqn5mNRg2EAvkwl";

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  photographer: string;
  alt: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
  };
}

const curatedQueries = [
  "Nature",
  "Architecture",
  "Family",
  "Travel",
  "Abstract",
  "Animals",
  "Flowers",
  "Sunset",
  "Ocean",
  "Mountains",
];

const ShopByImage = () => {
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PexelsPhoto | null>(null);

  const searchPhotos = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) return;
      setLoading(true);
      setSearched(true);
      setSelectedPhoto(null);

      try {
        const res = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=24&orientation=landscape`,
          {
            headers: { Authorization: PEXELS_API_KEY },
          }
        );
        const data = await res.json();
        setPhotos(data.photos || []);
      } catch (err) {
        console.error("Pexels search error:", err);
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchPhotos(query);
  };

  const selectAndGoToCalculator = (photo: PexelsPhoto) => {
    setSelectedPhoto(photo);
    // Pass photo to calculator
    window.dispatchEvent(
      new CustomEvent("select-image", {
        detail: { url: photo.src.large2x, photographer: photo.photographer, alt: photo.alt },
      })
    );
    const el = document.querySelector("#calculator");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="shop-by-image" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm tracking-[0.3em] uppercase text-primary font-body">
            Shop by Image
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3 text-foreground">
            Browse & Print Stunning Photos
          </h2>
          <p className="text-muted-foreground font-body mt-4 max-w-xl mx-auto">
            Explore millions of high-resolution photos from Pexels. Pick one and
            we'll print it on metal or acrylic for you.
          </p>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-3 max-w-xl mx-auto mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search photos... (e.g. sunset, mountains, wedding)"
              className="pl-10 bg-secondary border-border text-foreground font-body"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </form>

        {/* Quick tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {curatedQueries.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-border text-muted-foreground hover:border-primary hover:text-primary cursor-pointer transition-colors font-body"
              onClick={() => {
                setQuery(tag);
                searchPhotos(tag);
              }}
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Initial state */}
        {!searched && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground font-body">
              Search or pick a category above to browse photos
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground font-body">
              Searching photos...
            </p>
          </div>
        )}

        {/* Results grid */}
        {searched && !loading && photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card
                key={photo.id}
                className={`overflow-hidden cursor-pointer transition-all group ${
                  selectedPhoto?.id === photo.id
                    ? "ring-2 ring-primary border-primary"
                    : "border-border hover:border-primary/40"
                }`}
                onClick={() => selectAndGoToCalculator(photo)}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={photo.src.medium}
                    alt={photo.alt || "Photo"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground font-body truncate">
                    📷 {photo.photographer}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 font-body">
                    {photo.width}×{photo.height}px
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* No results */}
        {searched && !loading && photos.length === 0 && (
          <div className="text-center py-16">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-body">
              No photos found. Try a different search term.
            </p>
          </div>
        )}

        {/* Selected photo CTA */}
        {selectedPhoto && (
          <div className="mt-8 p-6 bg-card border border-primary/30 rounded-lg flex flex-col sm:flex-row items-center gap-6">
            <img
              src={selectedPhoto.src.medium}
              alt={selectedPhoto.alt || "Selected photo"}
              className="w-32 h-24 object-cover rounded"
            />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-foreground font-display font-semibold text-lg">
                Print this photo on metal or acrylic
              </p>
              <p className="text-sm text-muted-foreground font-body">
                By {selectedPhoto.photographer} •{" "}
                {selectedPhoto.width}×{selectedPhoto.height}px — high
                resolution
              </p>
            </div>
            <Button
              onClick={() => selectAndGoToCalculator(selectedPhoto)}
              className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2"
            >
              Configure & Price <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Pexels attribution */}
        <p className="text-center text-[10px] text-muted-foreground/50 font-body mt-8">
          Photos provided by{" "}
          <a
            href="https://www.pexels.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            Pexels
          </a>
        </p>
      </div>
    </section>
  );
};

export default ShopByImage;
