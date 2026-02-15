import { useState, useRef, useCallback } from "react";
import { standardSizes, calcMetalPrice, calcAcrylicPrice, metalOptions } from "@/lib/pricing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, RectangleHorizontal, RectangleVertical, Sparkles, Shield, Gem, Check, RotateCw, ZoomIn, ZoomOut, Move, Plus, X, Upload } from "lucide-react";
import couchWall from "@/assets/couch-wall.jpg";
import shelfBackdrop from "@/assets/shelf-backdrop.jpg";
import acrylicImg from "@/assets/acrylic-print.jpg";
import metalImg from "@/assets/metal-print.jpg";
import metalMuseumImg from "@/assets/metal-museum-print.jpg";
import type { MaterialChoice, CompanionPrint } from "./types";

interface Props {
  imageUrl: string;
  sizeIdx: number;
  material: MaterialChoice;
  companionPrints: CompanionPrint[];
  onSelect: (idx: number) => void;
  onSelectMaterial: (m: MaterialChoice) => void;
  onCompanionPrintsChange: (cps: CompanionPrint[]) => void;
  onNext: () => void;
  onBack: () => void;
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

const DESK_SHELF_MAX_IDX = 4;
const MAX_COMPANIONS = 5;

const StepSize = ({ imageUrl, sizeIdx, material, companionPrints, onSelect, onSelectMaterial, onCompanionPrintsChange, onNext, onBack }: Props) => {
  const selected = standardSizes[sizeIdx];
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const companionFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [activeUploadIdx, setActiveUploadIdx] = useState<number>(-1);

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

  const isDesk = sizeIdx < DESK_SHELF_MAX_IDX;

  const handleCompanionUpload = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (idx < companionPrints.length) {
        // Update existing companion
        const updated = [...companionPrints];
        updated[idx] = { ...updated[idx], uploadedFile: reader.result as string, image: null };
        onCompanionPrintsChange(updated);
      } else {
        // Add new companion
        onCompanionPrintsChange([...companionPrints, {
          image: null,
          uploadedFile: reader.result as string,
          sizeIdx: sizeIdx,
          orientation: "landscape",
        }]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const addCompanion = () => {
    if (companionPrints.length >= MAX_COMPANIONS) return;
    onCompanionPrintsChange([...companionPrints, {
      image: null,
      uploadedFile: null,
      sizeIdx: sizeIdx,
      orientation: "landscape",
    }]);
  };

  const removeCompanion = (idx: number) => {
    onCompanionPrintsChange(companionPrints.filter((_, i) => i !== idx));
  };

  // Calculate total companion price for material cards
  const calcCompanionTotalPrice = (matId: MaterialChoice) => {
    return companionPrints.reduce((sum, cp) => {
      const cs = standardSizes[cp.sizeIdx];
      const price = matId === "acrylic"
        ? calcAcrylicPrice(cs.w, cs.h)
        : matId === "metal-designer"
          ? calcMetalPrice(cs.w, cs.h, metalOptions[0])
          : calcMetalPrice(cs.w, cs.h, metalOptions[2]);
      return sum + price;
    }, 0);
  };

  // Build shelf slots: main print + companions + empty slots (up to 6 total)
  const totalSlots = isDesk ? Math.max(4, companionPrints.length + 2) : 0;
  const emptySlots = isDesk ? Math.max(0, totalSlots - 1 - companionPrints.length) : 0;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Choose Your Size
        </h2>
        <p className="text-muted-foreground font-body mt-1 tracking-wide text-sm">
          {isDesk ? "Tap empty slots to add matching prints for your display." : "Drag to reposition your image within the frame."}
        </p>
      </div>

      {/* Hidden file inputs */}
      {Array.from({ length: MAX_COMPANIONS + 1 }).map((_, i) => (
        <input
          key={`file-${i}`}
          ref={(el) => { companionFileRefs.current[i] = el; }}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleCompanionUpload(e, i)}
        />
      ))}

      {/* Wall/shelf backdrop with print(s) */}
      <div className="flex justify-center">
        {(() => {
          if (isDesk) {
            const WALL_W = 24;
            const containerAspect = "3/4";
            const mainSize = standardSizes[sizeIdx];
            const mainW = orientation === "portrait" ? Math.min(mainSize.w, mainSize.h) : Math.max(mainSize.w, mainSize.h);
            const mainH = orientation === "portrait" ? Math.max(mainSize.w, mainSize.h) : Math.min(mainSize.w, mainSize.h);

            // All prints (main + companions) arranged on shelf
            const allPrints: { w: number; h: number; imgSrc: string | null; isMain: boolean; companionIdx: number }[] = [
              { w: mainW, h: mainH, imgSrc: imageUrl, isMain: true, companionIdx: -1 },
            ];
            companionPrints.forEach((cp, i) => {
              const cs = standardSizes[cp.sizeIdx];
              const cpW = cp.orientation === "portrait" ? Math.min(cs.w, cs.h) : Math.max(cs.w, cs.h);
              const cpH = cp.orientation === "portrait" ? Math.max(cs.w, cs.h) : Math.min(cs.w, cs.h);
              allPrints.push({ w: cpW, h: cpH, imgSrc: cp.uploadedFile || cp.image?.url || null, isMain: false, companionIdx: i });
            });
            // Add empty slots
            for (let i = 0; i < emptySlots; i++) {
              const defaultSize = standardSizes[sizeIdx];
              const ew = orientation === "portrait" ? Math.min(defaultSize.w, defaultSize.h) : Math.max(defaultSize.w, defaultSize.h);
              const eh = orientation === "portrait" ? Math.max(defaultSize.w, defaultSize.h) : Math.min(defaultSize.w, defaultSize.h);
              allPrints.push({ w: ew, h: eh, imgSrc: null, isMain: false, companionIdx: companionPrints.length + i });
            }

            const gap = 1.5;
            const totalW = allPrints.reduce((s, p) => s + p.w, 0) + (allPrints.length - 1) * gap;
            const sceneW = Math.max(WALL_W, totalW * 1.3);

            return (
              <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ maxWidth: 720, aspectRatio: containerAspect }}>
                <img src={shelfBackdrop} alt="Shelf backdrop" className="absolute inset-0 w-full h-full object-cover" />
                <div
                  className="absolute left-1/2 -translate-x-1/2 flex items-end"
                  style={{ bottom: "38%", gap: `${(gap / sceneW) * 100}%` }}
                >
                  {allPrints.map((print, i) => {
                    const widthPct = Math.max((print.w / sceneW) * 720, 40);
                    const aspect = print.w / print.h;
                    const isEmptySlot = !print.isMain && !print.imgSrc && print.companionIdx >= companionPrints.length;

                    return (
                      <div
                        key={i}
                        className={`shrink-0 overflow-hidden transition-all duration-300 ${
                          print.isMain
                            ? "shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                            : print.imgSrc
                              ? "shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                              : "shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-dashed border-primary/30 rounded-sm"
                        }`}
                        style={{
                          width: `${widthPct}px`,
                          aspectRatio: `${aspect}`,
                        }}
                      >
                        {print.isMain ? (
                          <img
                            src={imageUrl}
                            alt="Main print"
                            className="w-full h-full object-cover"
                            style={{
                              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                              transformOrigin: "center center",
                            }}
                          />
                        ) : print.imgSrc ? (
                          <div className="relative w-full h-full group">
                            <img src={print.imgSrc} alt="Companion" className="w-full h-full object-cover" />
                            <button
                              className="absolute top-0.5 right-0.5 w-4 h-4 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeCompanion(print.companionIdx)}
                            >
                              <X className="w-2.5 h-2.5 text-destructive-foreground" />
                            </button>
                          </div>
                        ) : (
                          <div
                            className="w-full h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-card/30 hover:bg-card/50 transition-colors"
                            onClick={() => {
                              setActiveUploadIdx(companionPrints.length);
                              companionFileRefs.current[companionPrints.length]?.click();
                            }}
                          >
                            <Plus className="w-4 h-4 text-primary/50" />
                            <span className="text-[8px] text-primary/50 font-body">Add</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Label */}
                <div className="absolute bottom-2 left-2 bg-card/80 backdrop-blur-sm border border-border rounded px-2.5 py-1">
                  <span className="text-sm font-body text-primary font-semibold">{displayLabel}</span>
                  {companionPrints.length > 0 && (
                    <span className="text-[10px] text-muted-foreground font-body ml-1.5">
                      + {companionPrints.length} more
                    </span>
                  )}
                </div>
              </div>
            );
          }

          // Wall art — single print preview (unchanged)
          const WALL_W = 96;
          const printWPct = Math.max((displayW / WALL_W) * 100, 10);
          const printAspect = displayW / displayH;
          const printTop = "35%";

          return (
            <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ maxWidth: 720, aspectRatio: "16/9" }}>
              <img src={couchWall} alt="Room backdrop" className="absolute inset-0 w-full h-full object-cover" />
              <div
                className={`absolute left-1/2 -translate-x-1/2 shadow-[0_4px_30px_rgba(0,0,0,0.3)] transition-all duration-500 ease-out overflow-hidden cursor-grab active:cursor-grabbing -translate-y-1/2`}
                style={{
                  width: `${printWPct}%`,
                  paddingBottom: `${printWPct / printAspect}%`,
                  height: 0,
                  top: printTop,
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

      {/* Companion prints management — desk sizes only */}
      {isDesk && companionPrints.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-primary">
              Your Display ({1 + companionPrints.length} prints)
            </span>
          </div>
          {companionPrints.map((cp, i) => {
            const cpSize = standardSizes[cp.sizeIdx];
            const cpImgSrc = cp.uploadedFile || cp.image?.url;
            return (
              <div key={i} className="flex items-center gap-2 bg-card/50 rounded p-2">
                {cpImgSrc ? (
                  <div className="relative w-10 h-10 rounded border border-border overflow-hidden shrink-0">
                    <img src={cpImgSrc} alt="Companion" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <button
                    className="w-10 h-10 rounded border border-dashed border-primary/30 flex items-center justify-center shrink-0 hover:bg-primary/5 transition-colors"
                    onClick={() => companionFileRefs.current[i]?.click()}
                  >
                    <Upload className="w-3 h-3 text-primary/50" />
                  </button>
                )}
                {/* Size pills */}
                <div className="flex gap-1 flex-wrap flex-1">
                  {standardSizes.slice(0, DESK_SHELF_MAX_IDX).map((size, si) => (
                    <button
                      key={si}
                      className={`px-2 py-0.5 text-[10px] font-display font-bold rounded transition-colors ${
                        cp.sizeIdx === si
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-primary/10"
                      }`}
                      onClick={() => {
                        const updated = [...companionPrints];
                        updated[i] = { ...updated[i], sizeIdx: si };
                        onCompanionPrintsChange(updated);
                      }}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => removeCompanion(i)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
          {companionPrints.length < MAX_COMPANIONS && (
            <button
              onClick={addCompanion}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-primary/70 hover:text-primary transition-colors text-[10px] font-body font-semibold tracking-wider uppercase"
            >
              <Plus className="w-3 h-3" /> Add another print
            </button>
          )}
        </div>
      )}

      {/* Size selection */}
      {sizeGroups.map((group) => {
        const items = standardSizes.slice(group.range[0], group.range[1]);

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
                    onClick={() => {
                      onSelect(idx);
                      // Clear companions if moving to non-desk size
                      if (idx >= DESK_SHELF_MAX_IDX && companionPrints.length > 0) {
                        onCompanionPrintsChange([]);
                      }
                    }}
                  >
                    <p className="text-[11px] font-display font-bold text-foreground leading-tight whitespace-nowrap">{size.label}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Material selection */}
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

            const companionTotalPrice = calcCompanionTotalPrice(mat.id);
            const totalPrice = price + companionTotalPrice;
            const totalPrintCount = 1 + companionPrints.length;

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
                  <p className="text-sm font-display font-bold text-gradient-gold mt-0.5">
                    ${totalPrice}
                    {companionPrints.length > 0 && <span className="text-[9px] text-muted-foreground font-body ml-1">({totalPrintCount} prints)</span>}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
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
