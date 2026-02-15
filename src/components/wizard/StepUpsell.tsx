import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Search, Loader2, Upload, RotateCw, ImagePlus, ZoomIn, ZoomOut, Move } from "lucide-react";
import { standardSizes, calcMetalPrice, metalOptions } from "@/lib/pricing";
import type { SelectedImage, MaterialChoice } from "./types";

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
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);

  // Pan/zoom for front
  const [frontZoom, setFrontZoom] = useState(1);
  const [frontPan, setFrontPan] = useState({ x: 0, y: 0 });
  const frontDragging = useRef(false);
  const frontDragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Pan/zoom for back
  const [backZoom, setBackZoom] = useState(1);
  const [backPan, setBackPan] = useState({ x: 0, y: 0 });
  const backDragging = useRef(false);
  const backDragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const makePointerHandlers = (
    dragging: React.MutableRefObject<boolean>,
    dragStart: React.MutableRefObject<{ x: number; y: number; panX: number; panY: number }>,
    pan: { x: number; y: number },
    setPan: (p: { x: number; y: number }) => void,
    zoom: number,
  ) => ({
    onPointerDown: (e: React.PointerEvent) => {
      dragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const maxPan = (zoom - 1) * 50;
      setPan({
        x: Math.max(-maxPan, Math.min(maxPan, dragStart.current.panX + dx)),
        y: Math.max(-maxPan, Math.min(maxPan, dragStart.current.panY + dy)),
      });
    },
    onPointerUp: () => { dragging.current = false; },
  });

  const frontHandlers = makePointerHandlers(frontDragging, frontDragStart, frontPan, setFrontPan, frontZoom);
  const backHandlers = makePointerHandlers(backDragging, backDragStart, backPan, setBackPan, backZoom);

  useEffect(() => {
    const loadCurated = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.pexels.com/v1/curated?per_page=12`, { headers: { Authorization: PEXELS_API_KEY } });
        const data = await res.json();
        setPhotos(data.photos || []);
      } catch { setPhotos([]); }
      finally { setLoading(false); }
    };
    loadCurated();
  }, []);

  const searchPhotos = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=12&orientation=landscape`, { headers: { Authorization: PEXELS_API_KEY } });
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch { setPhotos([]); }
    finally { setLoading(false); }
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { onUploadBack(reader.result as string); onToggleDouble(true); setBackZoom(1); setBackPan({ x: 0, y: 0 }); };
    reader.readAsDataURL(file);
  };

  const backUrl = backUploadedFile || backImage?.url;

  const size = standardSizes[sizeIdx];
  const singleIdx = material === "metal-designer" ? 0 : 2;
  const doubleIdx = material === "metal-designer" ? 1 : 3;
  const singlePrice = calcMetalPrice(size.w, size.h, metalOptions[singleIdx]);
  const doublePrice = calcMetalPrice(size.w, size.h, metalOptions[doubleIdx]);
  const upsellCost = doublePrice - singlePrice;

  const displayW = Math.max(size.w, size.h);
  const displayH = Math.min(size.w, size.h);

  const renderPreviewBox = (
    imgSrc: string,
    label: string,
    zoom: number,
    setZoom: (fn: (z: number) => number) => void,
    pan: { x: number; y: number },
    setPanState: (p: { x: number; y: number }) => void,
    handlers: ReturnType<typeof makePointerHandlers>,
    isPlaceholder?: boolean,
  ) => (
    <div className="flex-1 min-w-0 text-center">
      <div
        className="relative w-full overflow-hidden rounded-lg border-2 border-border bg-secondary cursor-grab active:cursor-grabbing"
        style={{ aspectRatio: `${displayW} / ${displayH}`, maxHeight: 200 }}
        {...handlers}
      >
        {isPlaceholder ? (
          <label className="w-full h-full flex items-center justify-center flex-col gap-1.5 cursor-pointer">
            <ImagePlus className="w-6 h-6 text-primary" />
            <p className="text-xs text-primary font-body font-semibold">Add Image</p>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
        ) : (
          <>
            <img
              src={imgSrc}
              alt={label}
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transformOrigin: "center center",
              }}
            />
            <div className="absolute top-1.5 right-1.5 flex flex-col gap-0.5">
              <button onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.min(z + 0.25, 3)); setPanState({ x: 0, y: 0 }); }} className="w-6 h-6 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <ZoomIn className="w-3 h-3" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.max(z - 0.25, 1)); setPanState({ x: 0, y: 0 }); }} className="w-6 h-6 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <ZoomOut className="w-3 h-3" />
              </button>
              {zoom > 1 && (
                <button onClick={(e) => { e.stopPropagation(); setZoom(() => 1); setPanState({ x: 0, y: 0 }); }} className="w-6 h-6 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Move className="w-3 h-3" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
      <p className="text-[10px] text-primary font-body mt-1.5 font-semibold tracking-wider uppercase">{label}</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Two Prints in One
        </h2>
        <p className="text-muted-foreground font-body mt-2 tracking-wide text-sm max-w-md mx-auto">
          Flip your metal print to reveal a completely different piece.
        </p>
      </div>

      {/* Side-by-side previews with pan/zoom */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-start gap-3 flex-nowrap">
          {renderPreviewBox(frontImage, "Front", frontZoom, setFrontZoom, frontPan, setFrontPan, frontHandlers)}
          <div className="flex items-center pt-12">
            <RotateCw className="w-5 h-5 text-primary shrink-0" />
          </div>
          {backUrl
            ? renderPreviewBox(backUrl, "Back", backZoom, setBackZoom, backPan, setBackPan, backHandlers)
            : renderPreviewBox("", "Back", 1, () => {}, { x: 0, y: 0 }, () => {}, {} as any, true)
          }
        </div>

        {/* Price CTA */}
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground font-body">
            Two prints for <span className="text-primary font-bold">${doublePrice}</span> total.
          </p>
          <div className="flex gap-2 mt-3 justify-center">
            <Button
              size="sm"
              variant={doubleSided ? "default" : "outline"}
              onClick={() => onToggleDouble(true)}
              className={doubleSided ? "bg-gradient-gold text-primary-foreground font-body text-xs hover:opacity-90" : "font-body text-xs"}
            >
              Yes, add 2nd side
            </Button>
            <Button
              size="sm"
              variant={!doubleSided ? "default" : "outline"}
              onClick={() => onToggleDouble(false)}
              className={!doubleSided ? "bg-secondary text-foreground font-body text-xs" : "font-body text-xs"}
            >
              No thanks
            </Button>
          </div>
        </div>
      </div>

      {/* Image picker */}
      {doubleSided && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-border hover:border-primary/50 rounded cursor-pointer transition-colors text-xs shrink-0">
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span className="font-body text-foreground">Upload Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
            <form onSubmit={(e) => { e.preventDefault(); searchPhotos(query); }} className="flex gap-1.5 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search free photos..."
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
                    backImage?.url === photo.src.large2x ? "border-primary ring-1 ring-primary" : "border-transparent hover:border-primary/40"
                  }`}
                  onClick={() => { onSelectBack({ url: photo.src.large2x, photographer: photo.photographer, alt: photo.alt }); onToggleDouble(true); setBackZoom(1); setBackPan({ x: 0, y: 0 }); }}
                >
                  <img src={photo.src.medium} alt={photo.alt} className="w-full h-full object-cover" loading="lazy" />
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
