import { useState, useRef, useCallback } from "react";
import { standardSizes, calcMetalPrice, calcAcrylicPrice, metalOptions, bundles } from "@/lib/pricing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, RectangleHorizontal, RectangleVertical, Sparkles, Shield, Gem, Check, RotateCw, ZoomIn, ZoomOut, Move, Package, Percent, ImagePlus, Upload, X } from "lucide-react";
import couchWall from "@/assets/couch-wall.jpg";
import shelfBackdrop from "@/assets/shelf-backdrop.jpg";
import acrylicImg from "@/assets/acrylic-print.jpg";
import metalImg from "@/assets/metal-print.jpg";
import metalMuseumImg from "@/assets/metal-museum-print.jpg";
import type { MaterialChoice, BundleSlot } from "./types";
import type { Bundle } from "@/lib/pricing";

interface Props {
  imageUrl: string;
  sizeIdx: number;
  material: MaterialChoice;
  onSelect: (idx: number) => void;
  onSelectMaterial: (m: MaterialChoice) => void;
  onNext: () => void;
  onBack: () => void;
  onSelectBundle: (bundle: Bundle) => void;
  // Bundle inline props
  selectedBundle: Bundle | null;
  bundleSlots: BundleSlot[];
  onUpdateSlot: (index: number, slot: BundleSlot) => void;
  onClearBundle: () => void;
}

const materialOpts: { id: MaterialChoice; label: string; subtitle: string; img: string; icon: React.ReactNode }[] = [
  { id: "metal-designer", label: "Metal Designer", subtitle: '.040" Lightweight', img: metalImg, icon: <Gem className="w-4 h-4" /> },
  { id: "metal-museum", label: "Metal Museum", subtitle: '.080" Heirloom', img: metalMuseumImg, icon: <Shield className="w-4 h-4" /> },
  { id: "acrylic", label: "Acrylic", subtitle: "Vivid & Luminous", img: acrylicImg, icon: <Sparkles className="w-4 h-4" /> },
];

const sizeGroups = [
  { label: "Desk & Shelf", range: [0, 4] as const },
  { label: "Wall Art", range: [4, 10] as const },
  { label: "Statement Pieces", range: [10, 16] as const },
  { label: "Grand Scale", range: [16, 21] as const },
];

const StepSize = ({ imageUrl, sizeIdx, material, onSelect, onSelectMaterial, onNext, onBack, onSelectBundle, selectedBundle, bundleSlots, onUpdateSlot, onClearBundle }: Props) => {
  const selected = standardSizes[sizeIdx];
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadSlotIdx, setUploadSlotIdx] = useState(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pan]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const maxPan = (zoom - 1) * 50;
    setPan({
      x: Math.max(-maxPan, Math.min(maxPan, dragStart.current.panX + dx)),
      y: Math.max(-maxPan, Math.min(maxPan, dragStart.current.panY + dy)),
    });
  }, [zoom]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const isSquare = selected.w === selected.h;
  const displayW = orientation === "portrait" ? Math.min(selected.w, selected.h) : Math.max(selected.w, selected.h);
  const displayH = orientation === "portrait" ? Math.max(selected.w, selected.h) : Math.min(selected.w, selected.h);

  const displayLabel = isSquare
    ? selected.label
    : orientation === "portrait"
      ? `${Math.min(selected.w, selected.h)}"×${Math.max(selected.w, selected.h)}"`
      : `${Math.max(selected.w, selected.h)}"×${Math.min(selected.w, selected.h)}"`;

  // Bundle helpers
  const isBundle = !!selectedBundle;
  const totalPrints = selectedBundle ? selectedBundle.prints.reduce((sum, p) => sum + p.qty, 0) : 0;
  const filledCount = bundleSlots.filter((s) => s.image || s.uploadedFile).length;

  // Get all bundle images for preview
  const bundleImages: string[] = isBundle
    ? bundleSlots.map((s) => s.uploadedFile || s.image?.url || "")
    : [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateSlot(uploadSlotIdx, { ...bundleSlots[uploadSlotIdx], image: null, uploadedFile: reader.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const triggerUpload = (slotIdx: number) => {
    setUploadSlotIdx(slotIdx);
    setTimeout(() => fileRef.current?.click(), 0);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          {isBundle ? selectedBundle!.name : "Choose Your Size"}
        </h2>
        <p className="text-muted-foreground font-body mt-1 tracking-wide text-sm">
          {isBundle
            ? `${filledCount} of ${totalPrints} images added — tap slots to add photos`
            : "Drag to reposition your image within the frame."}
        </p>
      </div>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

      {/* Wall/shelf backdrop with print(s) */}
      <div className="flex justify-center">
        {(() => {
          const isDesk = sizeIdx < 4;
          const backdropImg = isDesk ? shelfBackdrop : couchWall;
          const WALL_W = isDesk ? 24 : 96;
          const containerAspect = isDesk ? "3/4" : "16/9";
          const containerRatio = isDesk ? 3 / 4 : 16 / 9;

          if (isBundle && selectedBundle) {
            // Multi-print bundle preview
            const prints = selectedBundle.prints;
            // Calculate total arrangement width
            const allPrints: { w: number; h: number; imgSrc: string; orientation: "landscape" | "portrait" }[] = [];
            let slotI = 0;
            for (const p of prints) {
              for (let q = 0; q < p.qty; q++) {
                const imgSrc = bundleImages[slotI] || "";
                const orient = bundleSlots[slotI]?.orientation || "landscape";
                allPrints.push({ w: p.w, h: p.h, imgSrc, orientation: orient });
                slotI++;
              }
            }
            const gap = 2; // inches gap between prints
            const totalArrangementW = allPrints.reduce((sum, p) => sum + p.w, 0) + gap * (allPrints.length - 1);
            const sceneW = Math.max(WALL_W, totalArrangementW * 1.5);

            return (
              <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ maxWidth: 720, aspectRatio: containerAspect }}>
                <img src={backdropImg} alt="Room backdrop" className="absolute inset-0 w-full h-full object-cover" />
                {/* Centered arrangement of prints */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 flex items-end gap-[1%]"
                  style={{ top: isDesk ? undefined : "35%", bottom: isDesk ? "38%" : undefined, transform: `translateX(-50%)${!isDesk ? ' translateY(-50%)' : ''}` }}
                >
                  {allPrints.map((p, i) => {
                    const isPortrait = p.orientation === "portrait";
                    const dW = isPortrait && p.w !== p.h ? Math.min(p.w, p.h) : Math.max(p.w, p.h);
                    const dH = isPortrait && p.w !== p.h ? Math.max(p.w, p.h) : Math.min(p.w, p.h);
                    const pW = (dW / sceneW) * 100;
                    const pAspect = dW / dH;
                    return (
                      <div
                        key={i}
                        className="shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden bg-muted/50 shrink-0"
                        style={{
                          width: `${Math.max(pW, 8)}vw`,
                          maxWidth: `${(p.w / sceneW) * 720}px`,
                          aspectRatio: `${pAspect}`,
                        }}
                      >
                        {p.imgSrc ? (
                          <img src={p.imgSrc} alt={`Print ${i + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                            <ImagePlus className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Bundle label */}
                <div className="absolute bottom-2 left-2 bg-card/80 backdrop-blur-sm border border-border rounded px-2.5 py-1">
                  <span className="text-sm font-body text-primary font-semibold">{selectedBundle.name}</span>
                  <span className="text-[10px] text-muted-foreground font-body ml-1.5">{filledCount}/{totalPrints} images</span>
                </div>
              </div>
            );
          }

          // Single print preview
          const printWPct = Math.max((displayW / WALL_W) * 100, 10);
          const printAspect = displayW / displayH;
          const printBottom = isDesk ? "38%" : undefined;
          const printTop = isDesk ? undefined : "35%";

          return (
            <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ maxWidth: 720, aspectRatio: containerAspect }}>
              <img src={backdropImg} alt="Room backdrop" className="absolute inset-0 w-full h-full object-cover" />
              <div
                className={`absolute left-1/2 -translate-x-1/2 shadow-[0_4px_30px_rgba(0,0,0,0.3)] transition-all duration-500 ease-out overflow-hidden cursor-grab active:cursor-grabbing ${printTop ? '-translate-y-1/2' : ''}`}
                style={{
                  width: `${printWPct}%`,
                  paddingBottom: `${printWPct / printAspect}%`,
                  height: 0,
                  ...(printTop ? { top: printTop } : { bottom: printBottom }),
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <img
                  src={imageUrl}
                  alt="Print preview"
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                  draggable={false}
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                    transformOrigin: "center center",
                  }}
                />
              </div>
              {/* Zoom controls */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <button onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.min(z + 0.25, 3)); setPan({ x: 0, y: 0 }); }} className="w-7 h-7 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Zoom in">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.max(z - 0.25, 1)); setPan({ x: 0, y: 0 }); }} className="w-7 h-7 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Zoom out">
                  <ZoomOut className="w-4 h-4" />
                </button>
                {zoom > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); setZoom(1); setPan({ x: 0, y: 0 }); }} className="w-7 h-7 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Reset">
                    <Move className="w-4 h-4" />
                  </button>
                )}
              </div>
              {/* Size label + orientation toggle */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <div className="bg-card/80 backdrop-blur-sm border border-border rounded px-2.5 py-1">
                  <span className="text-sm font-body text-primary font-semibold">{displayLabel}</span>
                  <span className="text-[10px] text-muted-foreground font-body ml-1.5">{selected.w * selected.h} sq in</span>
                </div>
                {!isSquare && (
                  <div className="flex bg-card/80 backdrop-blur-sm border border-border rounded overflow-hidden">
                    <button onClick={() => setOrientation("landscape")} className={`p-1.5 transition-colors ${orientation === "landscape" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`} title="Landscape">
                      <RectangleHorizontal className="w-4 h-4" />
                    </button>
                    <button onClick={() => setOrientation("portrait")} className={`p-1.5 transition-colors ${orientation === "portrait" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`} title="Portrait">
                      <RectangleVertical className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Bundle image slots — shown when bundle is active */}
      {isBundle && selectedBundle && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-primary">
                {selectedBundle.name} — Add Your Images
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={onClearBundle} className="font-body text-[10px] h-7 gap-1 tracking-wider">
              <ArrowLeft className="w-3 h-3" /> Continue Shopping
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(() => {
              const slotData: { label: string; idx: number; w: number; h: number }[] = [];
              let i = 0;
              for (const p of selectedBundle.prints) {
                for (let q = 0; q < p.qty; q++) {
                  slotData.push({ label: `${p.w}"×${p.h}"`, idx: i, w: p.w, h: p.h });
                  i++;
                }
              }
              return slotData.map(({ label, idx, w, h }) => {
                const slot = bundleSlots[idx];
                const imgSrc = slot?.uploadedFile || slot?.image?.url;
                const hasImage = !!imgSrc;
                const isSquareSlot = w === h;
                const orient = slot?.orientation || "landscape";
                return (
                  <div key={idx} className="shrink-0 flex flex-col items-center gap-1">
                    <div
                      className={`w-20 h-20 rounded-lg border-2 overflow-hidden cursor-pointer transition-all relative ${
                        hasImage ? "border-primary/40" : "border-dashed border-border hover:border-primary/40"
                      }`}
                      onClick={() => !hasImage && triggerUpload(idx)}
                    >
                      {hasImage ? (
                        <>
                          <img src={imgSrc} alt={`Print ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            className="absolute top-0.5 right-0.5 w-4 h-4 bg-destructive rounded-full flex items-center justify-center"
                            onClick={(e) => { e.stopPropagation(); onUpdateSlot(idx, { image: null, uploadedFile: null, orientation: "landscape" }); }}
                          >
                            <X className="w-2.5 h-2.5 text-destructive-foreground" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-0.5">
                          <Upload className="w-4 h-4 text-muted-foreground" />
                          <span className="text-[8px] text-muted-foreground font-body">{label}</span>
                        </div>
                      )}
                    </div>
                    {/* Orientation toggle per slot */}
                    {!isSquareSlot && (
                      <div className="flex bg-card border border-border rounded overflow-hidden">
                        <button
                          onClick={() => onUpdateSlot(idx, { ...slot, orientation: "landscape" })}
                          className={`p-1 transition-colors ${orient === "landscape" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                          title="Landscape"
                        >
                          <RectangleHorizontal className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onUpdateSlot(idx, { ...slot, orientation: "portrait" })}
                          className={`p-1 transition-colors ${orient === "portrait" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                          title="Portrait"
                        >
                          <RectangleVertical className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-display font-bold text-gradient-gold">${selectedBundle.salePrice}</span>
            <span className="text-[10px] text-muted-foreground font-body line-through">${selectedBundle.originalPrice}</span>
            <Badge variant="outline" className="border-primary/30 text-primary text-[8px] uppercase tracking-wider px-1.5 py-0">
              <Percent className="w-2.5 h-2.5 mr-0.5" />{selectedBundle.discount} off
            </Badge>
          </div>
        </div>
      )}

      {/* Size selection — hidden when bundle is active */}
      {!isBundle && sizeGroups.map((group) => {
        const items = standardSizes.slice(group.range[0], group.range[1]);
        const groupHasSelected = sizeIdx >= group.range[0] && sizeIdx < group.range[1];

        // Find matching bundles for this group's selected size
        const matchingBundles = groupHasSelected && !isBundle
          ? bundles.filter((b) => b.prints.some((p) => p.w === selected.w && p.h === selected.h))
          : [];

        return (
          <div key={group.label}>
            <h3 className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-primary mb-1.5">
              {group.label}
            </h3>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {items.map((size, i) => {
                const idx = group.range[0] + i;
                const isSelected = idx === sizeIdx;
                return (
                  <Card
                    key={idx}
                    className={`px-2.5 py-1.5 text-center cursor-pointer transition-all duration-200 shrink-0 ${
                      isSelected
                        ? "ring-2 ring-primary border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                    onClick={() => onSelect(idx)}
                  >
                    <p className="text-[11px] font-display font-bold text-foreground leading-tight whitespace-nowrap">{size.label}</p>
                  </Card>
                );
              })}
            </div>
            {/* Inline bundle recommendations directly under the group */}
            {matchingBundles.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none mt-2">
                {matchingBundles.map((bundle) => (
                  <div
                    key={bundle.id}
                    className="shrink-0 flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 cursor-pointer hover:bg-primary/10 transition-all"
                    onClick={() => onSelectBundle(bundle)}
                  >
                    <Package className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-display font-bold text-foreground truncate">{bundle.name}</p>
                      <p className="text-[9px] text-muted-foreground font-body">{bundle.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-sm font-display font-bold text-gradient-gold">${bundle.salePrice}</span>
                      <Badge variant="outline" className="border-primary/30 text-primary text-[8px] px-1 py-0">
                        {bundle.discount}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Material selection */}
      {(
        <div>
          <h3 className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-primary mb-1.5">
            Choose Your Medium
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {materialOpts.map((mat) => {
              const isSelected = material === mat.id;
              const size = standardSizes[sizeIdx];
              const price = mat.id === "acrylic"
                ? calcAcrylicPrice(size.w, size.h)
                : mat.id === "metal-designer"
                  ? calcMetalPrice(size.w, size.h, metalOptions[0])
                  : calcMetalPrice(size.w, size.h, metalOptions[2]);
              return (
                <Card
                  key={mat.id}
                  className={`overflow-hidden cursor-pointer transition-all duration-200 ${
                    isSelected ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/40"
                  }`}
                  onClick={() => onSelectMaterial(mat.id)}
                >
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <img src={mat.img} alt={mat.label} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    {mat.id.startsWith("metal") && (() => {
                      const singleIdx = mat.id === "metal-designer" ? 0 : 2;
                      const doubleIdx = mat.id === "metal-designer" ? 1 : 3;
                      const upsellCost = calcMetalPrice(size.w, size.h, metalOptions[doubleIdx]) - calcMetalPrice(size.w, size.h, metalOptions[singleIdx]);
                      return (
                        <div className="absolute bottom-1 left-1 right-1">
                          <Badge className="bg-gradient-gold text-primary-foreground border-0 font-body text-[8px] gap-0.5 px-1.5 py-0.5">
                            <RotateCw className="w-2.5 h-2.5" /> Add 2nd image +${upsellCost}
                          </Badge>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-primary">
                      {mat.icon}
                      <span className="text-xs font-display font-bold text-foreground">{mat.label}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground font-body">{mat.subtitle}</p>
                    <p className="text-sm font-display font-bold text-gradient-gold mt-0.5">${price}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="font-body gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        {isBundle ? (
          <Button
            onClick={onNext}
            disabled={filledCount < totalPrints}
            className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2"
          >
            Finishing <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={onNext} className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2">
            {material.startsWith("metal") ? "Personalize" : "Finishing"} <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default StepSize;
