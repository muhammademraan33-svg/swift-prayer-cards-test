import { useState, useRef, useCallback } from "react";
import { standardSizes, calcMetalPrice, calcAcrylicPrice, metalOptions } from "@/lib/pricing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, RectangleHorizontal, RectangleVertical, Sparkles, Shield, Gem, Check, RotateCw, ZoomIn, ZoomOut, Move, Plus, X, Upload, AlertTriangle, Ruler } from "lucide-react";
import couchWall from "@/assets/couch-wall.jpg";
import shelfBackdrop from "@/assets/shelf-backdrop.jpg";
import acrylicImg from "@/assets/acrylic-print.jpg";
import metalImg from "@/assets/metal-print.jpg";
import metalMuseumImg from "@/assets/metal-museum-print.jpg";
import cornerLuxMetal from "@/assets/corner-lux-metal.jpg";
import cornerDesignerMetal from "@/assets/corner-designer-metal.jpg";
import cornerAcrylic from "@/assets/corner-acrylic.jpg";
import type { MaterialChoice, AdditionalPrint, SelectedImage } from "./types";
import { CUSTOM_SIZE_IDX } from "./types";
import { Input } from "@/components/ui/input";
import ImagePickerModal from "./ImagePickerModal";

interface Props {
  imageUrl: string;
  sizeIdx: number;
  customWidth: number;
  customHeight: number;
  quantity: number;
  material: MaterialChoice;
  additionalPrints: AdditionalPrint[];
  imageNaturalWidth: number;
  imageNaturalHeight: number;
  rotation: number;
  zoom: number;
  panX: number;
  panY: number;
  onSelect: (idx: number) => void;
  onCustomSize: (w: number, h: number) => void;
  onQuantity: (q: number) => void;
  onAdditionalPrints: (ap: AdditionalPrint[]) => void;
  onSelectMaterial: (m: MaterialChoice) => void;
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

const DESK_SHELF_MAX_IDX = 4;

const StepSize = ({ imageUrl, sizeIdx, customWidth, customHeight, quantity, material, additionalPrints, imageNaturalWidth, imageNaturalHeight, rotation, zoom, panX, panY, onSelect, onCustomSize, onQuantity, onAdditionalPrints, onSelectMaterial, onRotate, onZoom, onPan, onNext, onBack }: Props) => {
  const isCustom = sizeIdx === CUSTOM_SIZE_IDX;
  const selected = isCustom ? { label: `${customWidth}"×${customHeight}"`, w: customWidth, h: customHeight } : standardSizes[sizeIdx];
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);

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

  const requiredPxW = displayW * 300;
  const requiredPxH = displayH * 300;
  const hasImageDimensions = imageNaturalWidth > 0 && imageNaturalHeight > 0;
  const isLowQuality = hasImageDimensions && (imageNaturalWidth < requiredPxW * 0.75 || imageNaturalHeight < requiredPxH * 0.75);
  const effectiveDpi = hasImageDimensions ? Math.min(Math.round(imageNaturalWidth / displayW), Math.round(imageNaturalHeight / displayH)) : 0;

  const displayLabel = isSquare
    ? selected.label
    : orientation === "portrait"
      ? `${Math.min(selected.w, selected.h)}"×${Math.max(selected.w, selected.h)}"`
      : `${Math.max(selected.w, selected.h)}"×${Math.min(selected.w, selected.h)}"`;

  const isDesk = !isCustom && sizeIdx >= 0 && sizeIdx < DESK_SHELF_MAX_IDX;

  const getSlotImg = (idx: number) => {
    const ap = additionalPrints[idx];
    if (!ap) return "";
    return ap.uploadedFile || ap.image?.url || "";
  };

  const handleSlotSelect = (slotIndex: number, image: SelectedImage) => {
    const updated = [...additionalPrints];
    while (updated.length <= slotIndex) updated.push({ image: null, uploadedFile: null });
    updated[slotIndex] = { image, uploadedFile: null };
    onAdditionalPrints(updated);
  };

  const handleSlotUpload = (slotIndex: number, dataUrl: string) => {
    const updated = [...additionalPrints];
    while (updated.length <= slotIndex) updated.push({ image: null, uploadedFile: null });
    updated[slotIndex] = { image: null, uploadedFile: dataUrl };
    onAdditionalPrints(updated);
  };

  const totalPrice = (basePricePerUnit: number) => basePricePerUnit * quantity;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Choose Your Size</h2>
        <p className="text-muted-foreground font-body mt-1 tracking-wide text-sm">Drag to reposition your image within the frame.</p>
      </div>

      <ImagePickerModal
        open={pickerSlot !== null}
        slotIndex={pickerSlot ?? 0}
        onClose={() => setPickerSlot(null)}
        onSelectImage={handleSlotSelect}
        onUploadImage={handleSlotUpload}
      />

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

            if (quantity >= 2) {
              const totalPrints = quantity;
              const sceneW = Math.max(WALL_W, displayW * totalPrints * 1.3);

              return (
                <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ aspectRatio: containerAspect }}>
                  <img src={backdropImg} alt="Room backdrop" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute left-1/2 -translate-x-1/2 flex items-end gap-[2%]" style={{ bottom: isDesk ? "38%" : "30%" }}>
                    <div className="shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden shrink-0" style={{ width: `${Math.max((displayW / sceneW) * 100, 8)}vw`, maxWidth: `${(displayW / sceneW) * 720}px`, aspectRatio: `${printAspect}` }}>
                      <img src={imageUrl} alt="Print 1" className="w-full h-full object-cover" style={{ transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px) rotate(${rotation}deg)`, transformOrigin: "center center" }} />
                    </div>
                    {Array.from({ length: quantity - 1 }).map((_, idx) => {
                      const slotImg = getSlotImg(idx);
                      return (
                        <div key={idx} className="shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden shrink-0 bg-muted/50 cursor-pointer" style={{ width: `${Math.max((displayW / sceneW) * 100, 8)}vw`, maxWidth: `${(displayW / sceneW) * 720}px`, aspectRatio: `${printAspect}` }} onClick={() => setPickerSlot(idx)}>
                          {slotImg ? (
                            <img src={slotImg} alt={`Print ${idx + 2}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-1 hover:bg-muted/70 transition-colors">
                              <Plus className="w-5 h-5 text-muted-foreground" />
                              <span className="text-[9px] text-muted-foreground font-body">Print {idx + 2}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-card/80 backdrop-blur-sm border border-border rounded px-2.5 py-1">
                    <span className="text-sm font-body text-primary font-semibold">{displayLabel}</span>
                    <span className="text-[10px] text-muted-foreground font-body ml-1">× {quantity}</span>
                  </div>
                </div>
              );
            }

            return (
              <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ aspectRatio: containerAspect }}>
                <img src={backdropImg} alt="Room backdrop" className="absolute inset-0 w-full h-full object-cover" />
                <div
                  className={`absolute left-1/2 -translate-x-1/2 shadow-[0_4px_30px_rgba(0,0,0,0.3)] transition-all duration-500 ease-out overflow-hidden cursor-grab active:cursor-grabbing ${printTop ? '-translate-y-1/2' : ''}`}
                  style={{ width: `${printWPct}%`, paddingBottom: `${printWPct / printAspect}%`, height: 0, ...(printTop ? { top: printTop } : { bottom: printBottom }) }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                >
                  <img src={imageUrl} alt="Print preview" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" draggable={false} style={{ transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px) rotate(${rotation}deg)`, transformOrigin: "center center" }} />
                </div>
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <button onClick={(e) => { e.stopPropagation(); onZoom(Math.min(zoom + 0.25, 3)); onPan(0, 0); }} className="w-7 h-7 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Zoom in"><ZoomIn className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); onZoom(Math.max(zoom - 0.25, 1)); onPan(0, 0); }} className="w-7 h-7 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Zoom out"><ZoomOut className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); onRotate((rotation + 90) % 360); }} className="w-7 h-7 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Rotate 90°"><RotateCw className="w-4 h-4" /></button>
                  {(zoom > 1 || panX !== 0 || panY !== 0) && (
                    <button onClick={(e) => { e.stopPropagation(); onZoom(1); onPan(0, 0); }} className="w-7 h-7 bg-card/80 backdrop-blur-sm border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Reset"><Move className="w-4 h-4" /></button>
                  )}
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <div className="bg-card/80 backdrop-blur-sm border border-border rounded px-2.5 py-1">
                    <span className="text-sm font-body text-primary font-semibold">{displayLabel}</span>
                    <span className="text-[10px] text-muted-foreground font-body ml-1.5">{selected.w * selected.h} sq in</span>
                  </div>
                  {!isSquare && (
                    <div className="flex bg-card/80 backdrop-blur-sm border border-border rounded overflow-hidden">
                      <button onClick={() => setOrientation("landscape")} className={`p-1.5 transition-colors ${orientation === "landscape" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`} title="Landscape"><RectangleHorizontal className="w-4 h-4" /></button>
                      <button onClick={() => setOrientation("portrait")} className={`p-1.5 transition-colors ${orientation === "portrait" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`} title="Portrait"><RectangleVertical className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* RIGHT: Size + Material selection */}
        <div className="space-y-4">
          {sizeGroups.map((group) => {
            const items = standardSizes.slice(group.range[0], group.range[1]);
            const groupHasSelection = !isCustom && sizeIdx >= group.range[0] && sizeIdx < group.range[1];
            const isSmallGroup = group.range[1] <= 10;

            return (
              <div key={group.label}>
                <h3 className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-primary mb-1.5">{group.label}</h3>
                <div className="flex gap-1.5 flex-wrap">
                  {items.map((size, i) => {
                    const idx = group.range[0] + i;
                    const isSelected = idx === sizeIdx;
                    return (
                      <Card
                        key={idx}
                        className={`px-2.5 py-1.5 text-center cursor-pointer transition-all duration-200 shrink-0 ${isSelected ? "ring-2 ring-primary border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                        onClick={() => {
                          onSelect(idx);
                          if (idx >= 10) { onQuantity(1); onAdditionalPrints([]); }
                        }}
                      >
                        <p className="text-xs font-display font-bold text-foreground leading-tight whitespace-nowrap">{size.label}</p>
                      </Card>
                    );
                  })}
                </div>

                {/* Qty picker for small sizes */}
                {groupHasSelection && isSmallGroup && (
                  <div className="mt-2 flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-xs font-body text-foreground font-semibold whitespace-nowrap">{group.range[1] <= 4 ? "Great in sets!" : "Gallery wall?"}</span>
                    <span className="text-[10px] text-muted-foreground font-body hidden sm:inline">Qty:</span>
                    <div className="flex items-center gap-0.5 ml-auto">
                      {[1, 2, 3, 4, 5, 6].map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            onQuantity(q);
                            if (q >= 2) {
                              const current = [...additionalPrints];
                              while (current.length < q - 1) current.push({ image: null, uploadedFile: null });
                              onAdditionalPrints(current.slice(0, q - 1));
                            } else {
                              onAdditionalPrints([]);
                            }
                          }}
                          className={`w-7 h-7 rounded-md text-xs font-body font-bold transition-all ${quantity === q ? "bg-gradient-gold text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Per-print image slots */}
                {groupHasSelection && isSmallGroup && quantity >= 2 && (
                  <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {Array.from({ length: quantity - 1 }).map((_, idx) => {
                      const slotImg = getSlotImg(idx);
                      return (
                        <button key={idx} onClick={() => setPickerSlot(idx)} className="flex items-center gap-2 bg-card border border-border rounded-lg px-2.5 py-2 hover:border-primary/40 transition-colors text-left">
                          {slotImg ? (
                            <img src={slotImg} alt={`Print ${idx + 2}`} className="w-8 h-8 rounded object-cover border border-border shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded border-2 border-dashed border-primary/30 flex items-center justify-center bg-primary/5 shrink-0">
                              <Plus className="w-3.5 h-3.5 text-primary/50" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-[10px] font-body font-semibold text-foreground truncate">Print {idx + 2}</p>
                            <p className="text-[9px] text-muted-foreground font-body">{slotImg ? "Tap to change" : "Add image"}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Custom Size */}
          <div>
            <h3 className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-primary mb-1.5">Custom Size</h3>
            <div className="flex gap-1.5 items-center flex-wrap">
              <Card
                className={`px-2.5 py-1.5 text-center cursor-pointer transition-all duration-200 shrink-0 ${isCustom ? "ring-2 ring-primary border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                onClick={() => onSelect(CUSTOM_SIZE_IDX)}
              >
                <div className="flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-primary" />
                  <p className="text-xs font-display font-bold text-foreground leading-tight whitespace-nowrap">Custom</p>
                </div>
              </Card>
              {isCustom && (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    <Input type="number" min={4} max={96} value={customWidth} onChange={(e) => onCustomSize(Math.max(4, Math.min(96, Number(e.target.value) || 4)), customHeight)} className="w-16 h-7 text-xs text-center font-body" />
                    <span className="text-xs text-muted-foreground font-body">×</span>
                    <Input type="number" min={4} max={96} value={customHeight} onChange={(e) => onCustomSize(customWidth, Math.max(4, Math.min(96, Number(e.target.value) || 4)))} className="w-16 h-7 text-xs text-center font-body" />
                    <span className="text-xs text-muted-foreground font-body">inches</span>
                  </div>
                </div>
              )}
            </div>
          </div>

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

      {/* Material selection */}
      <div>
        <h3 className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-primary mb-2">Choose Your Medium</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {materialOpts.filter(m => m.id !== "acrylic").map((mat) => {
            const isSelected = material === mat.id;
            const size = selected;
            const unitPrice = mat.id === "metal-designer"
              ? calcMetalPrice(size.w, size.h, metalOptions[0])
              : calcMetalPrice(size.w, size.h, metalOptions[2]);
            const total = totalPrice(unitPrice);

            return (
              <Card key={mat.id} className={`overflow-hidden cursor-pointer transition-all duration-200 ${isSelected ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/40"}`} onClick={() => onSelectMaterial(mat.id)}>
                <div className="aspect-[16/9] relative overflow-hidden">
                  <img src={mat.img} alt={mat.label} className="w-full h-full object-cover" />
                  {isSelected && <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-primary-foreground" /></div>}
                  <div className="absolute bottom-1 left-1 w-10 h-10 rounded border border-border/50 overflow-hidden shadow-md"><img src={mat.cornerImg} alt={`${mat.label} corner detail`} className="w-full h-full object-cover" /></div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-center gap-1.5 text-primary">{mat.icon}<span className="text-sm font-display font-bold text-foreground">{mat.label}</span></div>
                  <p className="text-xs text-muted-foreground font-body text-center">{mat.subtitle}</p>
                  <ul className="mt-2 space-y-1">
                    {mat.benefits.map((b) => (<li key={b} className="flex items-start gap-1.5 text-xs text-muted-foreground font-body"><Check className="w-3.5 h-3.5 text-primary shrink-0 mt-[1px]" /><span>{b}</span></li>))}
                  </ul>
                  <p className="text-base font-display font-bold text-gradient-gold mt-2 text-center">
                    ${total}
                    {quantity > 1 && <span className="text-xs text-muted-foreground font-body ml-1">({quantity} prints)</span>}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Acrylic option */}
        {(() => {
          const mat = materialOpts.find(m => m.id === "acrylic")!;
          const isSelected = material === mat.id;
          const size = selected;
          const unitPrice = calcAcrylicPrice(size.w, size.h);
          const total = totalPrice(unitPrice);

          return (
            <Card className={`overflow-hidden cursor-pointer transition-all duration-200 ${isSelected ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/40"}`} onClick={() => onSelectMaterial(mat.id)}>
              <div className="grid grid-cols-[1fr_1.5fr]">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img src={mat.img} alt={mat.label} className="w-full h-full object-cover" />
                  {isSelected && <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-primary-foreground" /></div>}
                  <div className="absolute bottom-1 left-1 w-10 h-10 rounded border border-border/50 overflow-hidden shadow-md"><img src={mat.cornerImg} alt={`${mat.label} corner detail`} className="w-full h-full object-cover" /></div>
                </div>
                <div className="p-3 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 text-primary">{mat.icon}<span className="text-sm font-display font-bold text-foreground">{mat.label}</span></div>
                  <p className="text-xs text-muted-foreground font-body">{mat.subtitle}</p>
                  <ul className="mt-2 space-y-1">
                    {mat.benefits.map((b) => (<li key={b} className="flex items-start gap-1.5 text-xs text-muted-foreground font-body"><Check className="w-3.5 h-3.5 text-primary shrink-0 mt-[1px]" /><span>{b}</span></li>))}
                  </ul>
                  <p className="text-base font-display font-bold text-gradient-gold mt-2">
                    ${total}
                    {quantity > 1 && <span className="text-xs text-muted-foreground font-body ml-1">({quantity} prints)</span>}
                  </p>
                </div>
              </div>
            </Card>
          );
        })()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="font-body gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
        <Button onClick={onNext} className="bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 gap-2">
          {material.startsWith("metal") ? "Personalize" : "Finishing"} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepSize;
