import { useState, useRef, useCallback } from "react";
import { standardSizes, calcMetalPrice, calcAcrylicPrice, metalOptions } from "@/lib/pricing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, RectangleHorizontal, RectangleVertical, Sparkles, Shield, Gem, Check, RotateCw, ZoomIn, ZoomOut, Move, Plus, X, Upload, AlertTriangle } from "lucide-react";
import couchWall from "@/assets/couch-wall.jpg";
import shelfBackdrop from "@/assets/shelf-backdrop.jpg";
import acrylicImg from "@/assets/acrylic-print.jpg";
import metalImg from "@/assets/metal-print.jpg";
import metalMuseumImg from "@/assets/metal-museum-print.jpg";
import cornerLuxMetal from "@/assets/corner-lux-metal.jpg";
import cornerDesignerMetal from "@/assets/corner-designer-metal.jpg";
import cornerAcrylic from "@/assets/corner-acrylic.jpg";
import type { MaterialChoice, CompanionPrint } from "./types";

interface Props {
  imageUrl: string;
  sizeIdx: number;
  material: MaterialChoice;
  companionPrint: CompanionPrint | null;
  imageNaturalWidth: number;
  imageNaturalHeight: number;
  rotation: number;
  zoom: number;
  panX: number;
  panY: number;
  onSelect: (idx: number) => void;
  onSelectMaterial: (m: MaterialChoice) => void;
  onCompanionChange: (cp: CompanionPrint | null) => void;
  onRotate: (r: number) => void;
  onZoom: (z: number) => void;
  onPan: (x: number, y: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const materialOpts: { id: MaterialChoice; label: string; subtitle: string; img: string; cornerImg: string; icon: React.ReactNode; benefits: string[] }[] = [
  { id: "metal-designer", label: "Lux Metal", subtitle: '.040" Lightweight', img: metalImg, cornerImg: cornerLuxMetal, icon: <Gem className="w-4 h-4" />, benefits: ["Ultra-lightweight & easy to hang", "Scratch-resistant HD finish", "Best value for vibrant color"] },
  { id: "metal-museum", label: "Designer Metal", subtitle: '.080" Heirloom', img: metalMuseumImg, cornerImg: cornerDesignerMetal, icon: <Shield className="w-4 h-4" />, benefits: ["2× thicker for gallery-grade rigidity", "Zero warp guaranteed for life", "Museum archival pigments"] },
  { id: "acrylic", label: "Acrylic", subtitle: "Vivid & Luminous", img: acrylicImg, cornerImg: cornerAcrylic, icon: <Sparkles className="w-4 h-4" />, benefits: ["Backlit glow & glass-like depth", "Highest color saturation", "Stunning modern statement piece"] },
];

const sizeGroups = [
  { label: "Desk & Shelf", range: [0, 4] as const },
  { label: "Wall Art", range: [4, 10] as const },
  { label: "Statement Pieces", range: [10, 16] as const },
  { label: "Grand Scale", range: [16, 21] as const },
];

// Desk & shelf size indices
const DESK_SHELF_MAX_IDX = 4;

const StepSize = ({ imageUrl, sizeIdx, material, companionPrint, imageNaturalWidth, imageNaturalHeight, rotation, zoom, panX, panY, onSelect, onSelectMaterial, onCompanionChange, onRotate, onZoom, onPan, onNext, onBack }: Props) => {
  const selected = standardSizes[sizeIdx];
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const companionFileRef = useRef<HTMLInputElement>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, panX, panY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [panX, panY]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const maxPan = (zoom - 1) * 50;
    onPan(
      Math.max(-maxPan, Math.min(maxPan, dragStart.current.panX + dx)),
      Math.max(-maxPan, Math.min(maxPan, dragStart.current.panY + dy)),
    );
  }, [zoom, onPan]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const isSquare = selected.w === selected.h;
  const displayW = orientation === "portrait" ? Math.min(selected.w, selected.h) : Math.max(selected.w, selected.h);
  const displayH = orientation === "portrait" ? Math.max(selected.w, selected.h) : Math.min(selected.w, selected.h);

  // Image quality check at 300 DPI
  const requiredPxW = displayW * 300;
  const requiredPxH = displayH * 300;
  const hasImageDimensions = imageNaturalWidth > 0 && imageNaturalHeight > 0;
  const isLowQuality = hasImageDimensions && (imageNaturalWidth < requiredPxW * 0.75 || imageNaturalHeight < requiredPxH * 0.75);
  const actualDpi = hasImageDimensions
    ? Math.min(Math.round(imageNaturalWidth / displayW * (imageNaturalWidth >= imageNaturalHeight ? 1 : displayW / displayH)), Math.round(imageNaturalHeight / displayH * (imageNaturalHeight >= imageNaturalWidth ? 1 : displayH / displayW)))
    : 0;
  const effectiveDpi = hasImageDimensions ? Math.min(Math.round(imageNaturalWidth / displayW), Math.round(imageNaturalHeight / displayH)) : 0;

  const displayLabel = isSquare
    ? selected.label
    : orientation === "portrait"
      ? `${Math.min(selected.w, selected.h)}"×${Math.max(selected.w, selected.h)}"`
      : `${Math.max(selected.w, selected.h)}"×${Math.min(selected.w, selected.h)}"`;

  const isDesk = sizeIdx < DESK_SHELF_MAX_IDX;
  const hasCompanion = !!companionPrint;
  const companionImgSrc = companionPrint?.uploadedFile || companionPrint?.image?.url || "";

  const handleCompanionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onCompanionChange({
        image: null,
        uploadedFile: reader.result as string,
        sizeIdx: sizeIdx,
        orientation: "landscape",
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const addCompanion = () => {
    onCompanionChange({
      image: null,
      uploadedFile: null,
      sizeIdx: sizeIdx,
      orientation: "landscape",
    });
  };

  const removeCompanion = () => {
    onCompanionChange(null);
  };

  // Companion display dimensions
  const companionSize = companionPrint ? standardSizes[companionPrint.sizeIdx] : null;
  const companionDisplayW = companionSize
    ? (companionPrint?.orientation === "portrait" ? Math.min(companionSize.w, companionSize.h) : Math.max(companionSize.w, companionSize.h))
    : 0;
  const companionDisplayH = companionSize
    ? (companionPrint?.orientation === "portrait" ? Math.max(companionSize.w, companionSize.h) : Math.min(companionSize.w, companionSize.h))
    : 0;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Choose Your Size
        </h2>
        <p className="text-muted-foreground font-body mt-1 tracking-wide text-sm">
          Drag to reposition your image within the frame.
        </p>
      </div>

      {/* Hidden file input for companion */}
      <input ref={companionFileRef} type="file" accept="image/*" className="hidden" onChange={handleCompanionUpload} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: Preview */}
        <div className="flex justify-center md:sticky md:top-4 md:self-start max-h-[400px]">
          {(() => {
            const backdropImg = isDesk ? shelfBackdrop : couchWall;
            const WALL_W = isDesk ? 48 : 60;
            const containerAspect = "16/10";

            const printWPct = Math.max((displayW / WALL_W) * 100, 10);
            const printAspect = displayW / displayH;
            const printBottom = isDesk ? "38%" : undefined;
            const printTop = isDesk ? undefined : "35%";

            if (isDesk && hasCompanion) {
              const gap = 2;
              const totalW = displayW + companionDisplayW + gap;
              const sceneW = Math.max(WALL_W, totalW * 1.5);

              return (
                <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ aspectRatio: containerAspect }}>
                  <img src={backdropImg} alt="Room backdrop" className="absolute inset-0 w-full h-full object-cover" />
                  <div
                    className="absolute left-1/2 -translate-x-1/2 flex items-end gap-[2%]"
                    style={{ bottom: "38%" }}
                  >
                    <div
                      className="shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden shrink-0"
                      style={{
                        width: `${Math.max((displayW / sceneW) * 100, 8)}vw`,
                        maxWidth: `${(displayW / sceneW) * 720}px`,
                        aspectRatio: `${printAspect}`,
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt="Main print"
                        className="w-full h-full object-cover"
                        style={{
                          transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px) rotate(${rotation}deg)`,
                          transformOrigin: "center center",
                        }}
                      />
                    </div>
                    <div
                      className="shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden shrink-0 bg-muted/50"
                      style={{
                        width: `${Math.max((companionDisplayW / sceneW) * 100, 8)}vw`,
                        maxWidth: `${(companionDisplayW / sceneW) * 720}px`,
                        aspectRatio: `${companionDisplayW / companionDisplayH}`,
                      }}
                    >
                      {companionImgSrc ? (
                        <img src={companionImgSrc} alt="Companion print" className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted/70 transition-colors"
                          onClick={() => companionFileRef.current?.click()}
                        >
                          <Upload className="w-5 h-5 text-muted-foreground" />
                          <span className="text-[9px] text-muted-foreground font-body">Add image</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-card/80 backdrop-blur-sm border border-border rounded px-2.5 py-1">
                    <span className="text-sm font-body text-primary font-semibold">{displayLabel}</span>
                    <span className="text-[10px] text-muted-foreground font-body mx-1">+</span>
                    <span className="text-sm font-body text-primary font-semibold">
                      {companionSize && (companionPrint?.orientation === "portrait"
                        ? `${Math.min(companionSize.w, companionSize.h)}"×${Math.max(companionSize.w, companionSize.h)}"`
                        : companionSize?.label)}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ aspectRatio: containerAspect }}>
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
                      transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px) rotate(${rotation}deg)`,
                      transformOrigin: "center center",
                    }}
                  />
                </div>
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <button onClick={(e) => { e.stopPropagation(); onZoom(Math.min(zoom + 0.25, 3)); onPan(0, 0); }} className="w-7 h-7 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Zoom in">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onZoom(Math.max(zoom - 0.25, 1)); onPan(0, 0); }} className="w-7 h-7 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Zoom out">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onRotate((rotation + 90) % 360); }} className="w-7 h-7 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Rotate 90°">
                    <RotateCw className="w-4 h-4" />
                  </button>
                  {(zoom > 1 || panX !== 0 || panY !== 0) && (
                    <button onClick={(e) => { e.stopPropagation(); onZoom(1); onPan(0, 0); }} className="w-7 h-7 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Reset">
                      <Move className="w-4 h-4" />
                    </button>
                  )}
                </div>
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

        {/* RIGHT: Size + Material selection */}
        <div className="space-y-4">
          {/* Size selection */}
          {sizeGroups.map((group) => {
            const items = standardSizes.slice(group.range[0], group.range[1]);

            return (
              <div key={group.label}>
                <h3 className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-primary mb-1.5">
                  {group.label}
                </h3>
                <div className="flex gap-1.5 flex-wrap">
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
                        onClick={() => {
                          onSelect(idx);
                          if (idx >= DESK_SHELF_MAX_IDX && companionPrint) {
                            onCompanionChange(null);
                          }
                        }}
                      >
                        <p className="text-xs font-display font-bold text-foreground leading-tight whitespace-nowrap">{size.label}</p>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Bundle / Add Another prompt for smaller sizes */}
          {sizeIdx < 10 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-display font-bold text-foreground">
                  {sizeIdx < DESK_SHELF_MAX_IDX ? "Pair it — desk prints look great in sets!" : "Add a matching piece for a gallery wall"}
                </p>
                <p className="text-[10px] text-muted-foreground font-body mt-0.5">
                  {sizeIdx < DESK_SHELF_MAX_IDX
                    ? "Add a companion print at the same size right next to it."
                    : "Create a stunning arrangement with multiple sizes."}
                </p>
              </div>
              {sizeIdx < DESK_SHELF_MAX_IDX ? (
                !hasCompanion ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-primary/40 text-primary hover:bg-primary/10 gap-1.5"
                    onClick={addCompanion}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="text-xs font-body">Add Print</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 text-destructive hover:bg-destructive/10 gap-1"
                    onClick={removeCompanion}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span className="text-xs font-body">Remove</span>
                  </Button>
                )
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 border-primary/40 text-primary hover:bg-primary/10 gap-1.5"
                  onClick={addCompanion}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-xs font-body">Add Print</span>
                </Button>
              )}
            </div>
          )}

          {/* Low quality warning */}
          {isLowQuality && (
            <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 mt-3">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-body font-semibold text-destructive">Low Image Quality</p>
                <p className="text-xs font-body text-destructive/80">
                  Your image is {imageNaturalWidth}×{imageNaturalHeight}px (~{effectiveDpi} DPI at this size). For best results at {displayLabel}, we recommend at least {requiredPxW}×{requiredPxH}px (300 DPI).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-primary mb-2">
          Choose Your Medium
        </h3>
        {/* Metal options row */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {materialOpts.filter(m => m.id !== "acrylic").map((mat) => {
            const isSelected = material === mat.id;
            const size = standardSizes[sizeIdx];
            const price = mat.id === "metal-designer"
              ? calcMetalPrice(size.w, size.h, metalOptions[0])
              : calcMetalPrice(size.w, size.h, metalOptions[2]);

            const companionPrice = hasCompanion && companionSize
              ? (mat.id === "metal-designer"
                  ? calcMetalPrice(companionSize.w, companionSize.h, metalOptions[0])
                  : calcMetalPrice(companionSize.w, companionSize.h, metalOptions[2]))
              : 0;

            const totalPrice = price + companionPrice;

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
                  <div className="absolute bottom-1 left-1 w-10 h-10 rounded border border-border/50 overflow-hidden shadow-md">
                    <img src={mat.cornerImg} alt={`${mat.label} corner detail`} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-center gap-1.5 text-primary">
                    {mat.icon}
                    <span className="text-sm font-display font-bold text-foreground">{mat.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-body text-center">{mat.subtitle}</p>
                  <ul className="mt-2 space-y-1">
                    {mat.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-1.5 text-xs text-muted-foreground font-body">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-[1px]" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-base font-display font-bold text-gradient-gold mt-2 text-center">
                    ${totalPrice}
                    {hasCompanion && <span className="text-xs text-muted-foreground font-body ml-1">(2 prints)</span>}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
        {/* Acrylic option — full width */}
        {(() => {
          const mat = materialOpts.find(m => m.id === "acrylic")!;
          const isSelected = material === mat.id;
          const size = standardSizes[sizeIdx];
          const price = calcAcrylicPrice(size.w, size.h);
          const companionPrice = hasCompanion && companionSize ? calcAcrylicPrice(companionSize.w, companionSize.h) : 0;
          const totalPrice = price + companionPrice;

          return (
            <Card
              className={`overflow-hidden cursor-pointer transition-all duration-200 ${
                isSelected ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/40"
              }`}
              onClick={() => onSelectMaterial(mat.id)}
            >
              <div className="grid grid-cols-[1fr_1.5fr]">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img src={mat.img} alt={mat.label} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 w-10 h-10 rounded border border-border/50 overflow-hidden shadow-md">
                    <img src={mat.cornerImg} alt={`${mat.label} corner detail`} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="p-3 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 text-primary">
                    {mat.icon}
                    <span className="text-sm font-display font-bold text-foreground">{mat.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-body">{mat.subtitle}</p>
                  <ul className="mt-2 space-y-1">
                    {mat.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-1.5 text-xs text-muted-foreground font-body">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-[1px]" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-base font-display font-bold text-gradient-gold mt-2">
                    ${totalPrice}
                    {hasCompanion && <span className="text-xs text-muted-foreground font-body ml-1">(2 prints)</span>}
                  </p>
                </div>
              </div>
            </Card>
          );
        })()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="font-body gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2">
          {material.startsWith("metal") ? "Personalize" : "Finishing"} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepSize;
