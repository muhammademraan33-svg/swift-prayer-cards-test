import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  metalOptions,
  calcMetalPrice,
  calcAcrylicPrice,
  getShippingCost,
  addOns,
  standardSizes,
  cardPricing,
  recommendStandOffs,
} from "@/lib/pricing";
import { ArrowRight, ArrowLeft, Upload, CheckCircle2, Layers, Sparkles, Heart, Briefcase, Mail, BookOpen, Info } from "lucide-react";
import { Input } from "@/components/ui/input";

type ProductType = "metal" | "acrylic" | "cards";
type CardType = "eternity" | "business" | "invitation" | "prayer";

const STEPS = ["Product", "Options", "Upload", "Review"];

const cardTypes: { type: CardType; icon: typeof Heart; title: string; desc: string }[] = [
  { type: "eternity", icon: Heart, title: "Eternity Cards", desc: "Memorial & celebration of life keepsakes" },
  { type: "business", icon: Briefcase, title: "Business Cards", desc: "Premium metal business cards" },
  { type: "invitation", icon: Mail, title: "Invitations", desc: "Stunning metal event invitations" },
  { type: "prayer", icon: BookOpen, title: "Prayer Cards", desc: "Timeless memorial prayer cards" },
];

const PrintDesigner = () => {
  const [step, setStep] = useState(0);
  const [product, setProduct] = useState<ProductType | null>(null);
  const [cardType, setCardType] = useState<CardType>("eternity");
  const [metalIdx, setMetalIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState<number | "custom">(3);
  const [customW, setCustomW] = useState(24);
  const [customH, setCustomH] = useState(36);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [roundedCorners, setRoundedCorners] = useState(false);
  const [standOff, setStandOff] = useState<"none" | "silver" | "black">("none");
  const [standOffQty, setStandOffQty] = useState(4);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCustom = sizeIdx === "custom";
  const baseW = isCustom ? customW : standardSizes[sizeIdx as number].w;
  const baseH = isCustom ? customH : standardSizes[sizeIdx as number].h;
  const w = orientation === "portrait" ? baseW : baseH;
  const h = orientation === "portrait" ? baseH : baseW;

  // Auto-recommend stand-offs when size changes
  const recommended = recommendStandOffs(w, h);
  useEffect(() => {
    if (standOff !== "none") {
      setStandOffQty(recommended);
    }
  }, [w, h, recommended, standOff]);

  const getPrice = () => {
    if (product === "cards") return cardPricing.eternityCard.pack55;
    if (product === "metal") return calcMetalPrice(baseW, baseH, metalOptions[metalIdx]);
    return calcAcrylicPrice(baseW, baseH);
  };

  const getShipping = () => {
    if (product === "cards") return { cost: 10, label: "Standard", note: undefined };
    return getShippingCost(baseW, baseH);
  };

  const getAddOns = () => {
    let total = 0;
    if (product !== "cards" && roundedCorners) total += addOns.roundedCorners;
    if (product !== "cards" && standOff !== "none") {
      const unitPrice = standOff === "silver" ? addOns.standOffSilver : addOns.standOffBlack;
      total += unitPrice * standOffQty;
    }
    return total;
  };

  const getMetalSurcharge = () => {
    if (product === "metal" && standOff !== "none") {
      return Math.ceil(getPrice() * addOns.metalStandOffSurcharge);
    }
    return 0;
  };

  const price = getPrice();
  const shipping = getShipping();
  const addOnTotal = getAddOns();
  const metalSurcharge = getMetalSurcharge();
  const total = price + shipping.cost + addOnTotal + metalSurcharge;

  const canProceed = () => {
    if (step === 0) return product !== null;
    if (step === 1) return true;
    if (step === 2) return uploadedImage !== null;
    return true;
  };

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setUploadedImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const cardTypeLabel = cardTypes.find(c => c.type === cardType)?.title || "Eternity Cards";

  return (
    <section id="designer" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm tracking-[0.3em] uppercase text-primary font-body">
            Design Studio
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3 text-foreground">
            Start Designing
          </h2>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-body font-medium transition-all ${
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                    ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {i < step ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs">
                    {i + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-card border border-border rounded-xl p-8 md:p-12">

          {/* Step 1: Choose product */}
          {step === 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-display font-semibold text-foreground text-center mb-8">
                What would you like to create?
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {([
                  { type: "metal" as ProductType, icon: Layers, title: "Metal Print", desc: 'HD prints on brushed aluminum in .040" or .080" thickness' },
                  { type: "acrylic" as ProductType, icon: Sparkles, title: "Acrylic Print", desc: "Vibrant prints on crystal-clear acrylic with optional stand-offs" },
                  { type: "cards" as ProductType, icon: Heart, title: "Metal Cards", desc: "Premium metal cards — eternity, business, invitation, prayer" },
                ]).map((p) => (
                  <button
                    key={p.type}
                    onClick={() => { setProduct(p.type); if (p.type !== "cards") setStandOff("none"); }}
                    className={`group relative p-6 rounded-xl border-2 text-left transition-all ${
                      product === p.type
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-border hover:border-primary/40 bg-secondary/30"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
                      product === p.type ? "bg-primary/20" : "bg-secondary group-hover:bg-primary/10"
                    }`}>
                      <p.icon className={`w-5 h-5 transition-colors ${
                        product === p.type ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                      }`} />
                    </div>
                    <h4 className="font-display font-semibold text-lg text-foreground mb-1">{p.title}</h4>
                    <p className="text-sm text-muted-foreground font-body leading-relaxed">{p.desc}</p>
                    {product === p.type && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Size & Options */}
          {step === 1 && (
            <div className="space-y-8">
              <h3 className="text-2xl font-display font-semibold text-foreground text-center mb-8">
                {product === "cards" ? "Card Options" : "Size & Options"}
              </h3>

              {product === "cards" ? (
                <div className="space-y-6">
                  <div>
                    <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs mb-3 block">
                      Card Type
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {cardTypes.map((c) => (
                        <button
                          key={c.type}
                          onClick={() => setCardType(c.type)}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                            cardType === c.type
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40 bg-secondary/30"
                          }`}
                        >
                          <c.icon className={`w-5 h-5 shrink-0 ${
                            cardType === c.type ? "text-primary" : "text-muted-foreground"
                          }`} />
                          <div>
                            <p className="font-body font-medium text-foreground text-sm">{c.title}</p>
                            <p className="text-xs text-muted-foreground font-body">{c.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="inline-block bg-secondary/50 rounded-xl p-8 border border-border">
                      <p className="text-muted-foreground font-body mb-2">Set of 55 — {cardTypeLabel}</p>
                      <p className="text-4xl font-display font-bold text-gradient-gold">${cardPricing.eternityCard.pack55}</p>
                      <p className="text-sm text-muted-foreground font-body mt-2">+ $10 shipping</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {product === "metal" && (
                      <div>
                        <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs mb-3 block">
                          Metal Type
                        </Label>
                        <Select value={String(metalIdx)} onValueChange={(v) => setMetalIdx(Number(v))}>
                          <SelectTrigger className="bg-secondary border-border text-foreground font-body">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {metalOptions.map((opt, i) => (
                              <SelectItem key={i} value={String(i)}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs mb-3 block">
                        Size
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {standardSizes.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => setSizeIdx(i)}
                            className={`py-2 px-3 rounded-lg text-sm font-body font-medium border transition-all ${
                              sizeIdx === i
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                        <button
                          onClick={() => setSizeIdx("custom")}
                          className={`py-2 px-3 rounded-lg text-sm font-body font-medium border transition-all ${
                            isCustom
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          }`}
                        >
                          Custom
                        </button>
                      </div>
                      {isCustom && (
                        <div className="flex gap-3 mt-3 items-center">
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground font-body mb-1 block">Width (in)</Label>
                            <Input
                              type="number"
                              min={4}
                              max={96}
                              value={customW}
                              onChange={(e) => setCustomW(Math.max(4, Math.min(96, Number(e.target.value))))}
                              className="bg-secondary border-border text-foreground font-body"
                            />
                          </div>
                          <span className="text-muted-foreground font-body mt-5">×</span>
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground font-body mb-1 block">Height (in)</Label>
                            <Input
                              type="number"
                              min={4}
                              max={96}
                              value={customH}
                              onChange={(e) => setCustomH(Math.max(4, Math.min(96, Number(e.target.value))))}
                              className="bg-secondary border-border text-foreground font-body"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs mb-3 block">
                        Orientation
                      </Label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setOrientation("portrait")}
                          className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-lg border-2 transition-all ${
                            orientation === "portrait"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className={`w-8 h-12 rounded border-2 ${
                            orientation === "portrait" ? "border-primary" : "border-muted-foreground"
                          }`} />
                          <span className="text-sm font-body text-foreground">Portrait</span>
                        </button>
                        <button
                          onClick={() => setOrientation("landscape")}
                          className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-lg border-2 transition-all ${
                            orientation === "landscape"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className={`w-12 h-8 rounded border-2 ${
                            orientation === "landscape" ? "border-primary" : "border-muted-foreground"
                          }`} />
                          <span className="text-sm font-body text-foreground">Landscape</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right side: add-ons + preview */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-foreground font-body font-semibold tracking-wider uppercase text-xs block">
                        Add-Ons
                      </Label>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="flow-rounded"
                          checked={roundedCorners}
                          onCheckedChange={(v) => setRoundedCorners(!!v)}
                        />
                        <Label htmlFor="flow-rounded" className="font-body text-foreground cursor-pointer text-sm">
                          Rounded Corners (+$5.00)
                        </Label>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-foreground font-body text-sm block">Stand-Off Mounting</Label>
                        <RadioGroup
                          value={standOff}
                          onValueChange={(v) => {
                            const val = v as "none" | "silver" | "black";
                            setStandOff(val);
                            if (val !== "none") setStandOffQty(recommended);
                          }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="none" id="flow-so-none" />
                            <Label htmlFor="flow-so-none" className="font-body text-foreground cursor-pointer text-sm">None</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="silver" id="flow-so-silver" />
                            <Label htmlFor="flow-so-silver" className="font-body text-foreground cursor-pointer text-sm">Silver</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="black" id="flow-so-black" />
                            <Label htmlFor="flow-so-black" className="font-body text-foreground cursor-pointer text-sm">Black</Label>
                          </div>
                        </RadioGroup>
                        {standOff !== "none" && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                              <Info className="w-3 h-3" />
                              <span>Recommended: {recommended} stand-offs for {w}"×{h}"</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Label className="text-foreground font-body text-sm">Qty:</Label>
                              <Input
                                type="number"
                                min={4}
                                max={20}
                                value={standOffQty}
                                onChange={(e) => setStandOffQty(Math.max(4, Number(e.target.value)))}
                                className="bg-secondary border-border text-foreground font-body w-20"
                              />
                            </div>
                            {product === "metal" && (
                              <p className="text-xs text-primary font-body flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                15% surcharge applies for metal stand-off mounting (+${Math.ceil(price * 0.15)})
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Size preview */}
                    <div className="bg-secondary/30 rounded-xl p-6 border border-border">
                      <div className="flex items-center justify-center" style={{ minHeight: 120 }}>
                        <div
                          className={`border-2 border-primary/50 flex items-center justify-center transition-all ${
                            roundedCorners ? "rounded-lg" : ""
                          } ${
                            product === "metal"
                              ? "bg-gradient-to-br from-[hsl(220,8%,50%)] to-[hsl(220,8%,42%)]"
                              : "bg-gradient-to-br from-[hsl(200,15%,85%)] to-[hsl(200,15%,75%)]"
                          }`}
                          style={{
                            width: Math.min(w * 2.5, 200),
                            height: Math.min(h * 2.5, 160),
                          }}
                        >
                          <span className="text-xs font-body text-foreground/60">{w}"×{h}"</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Upload */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-display font-semibold text-foreground text-center mb-8">
                Upload Your {product === "cards" ? "Card Design" : "Photo"}
              </h3>

              <div
                className={`relative border-2 border-dashed rounded-xl transition-colors ${
                  uploadedImage ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}
              >
                {uploadedImage ? (
                  <div className="p-4">
                    <div className="relative aspect-video max-w-lg mx-auto rounded-lg overflow-hidden bg-secondary">
                      <img src={uploadedImage} alt="Uploaded design" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-center mt-4">
                      <p className="text-sm font-body text-foreground">{fileName}</p>
                      <button
                        onClick={() => { setUploadedImage(null); setFileName(""); }}
                        className="text-xs text-primary font-body mt-1 hover:underline"
                      >
                        Remove and upload a different file
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-16 flex flex-col items-center gap-4 cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-body font-semibold text-foreground">Click to upload your file</p>
                      <p className="text-sm text-muted-foreground font-body mt-1">
                        PNG, JPG, PDF, or AI — high resolution recommended
                      </p>
                    </div>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.ai"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    e.target.value = "";
                  }}
                />
              </div>

              {product !== "cards" && (
                <p className="text-xs text-muted-foreground font-body text-center">
                  For best results on a {w}"×{h}" print, use an image at least {w * 150}×{h * 150} pixels
                </p>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 3 && (
            <div className="space-y-8">
              <h3 className="text-2xl font-display font-semibold text-foreground text-center mb-8">
                Review Your Order
              </h3>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Preview */}
                <div className="bg-secondary/30 rounded-xl p-6 border border-border flex items-center justify-center">
                  {uploadedImage && (
                    <div
                      className={`overflow-hidden shadow-xl ${roundedCorners ? "rounded-xl" : ""}`}
                      style={{ maxWidth: 280, maxHeight: 280 }}
                    >
                      <img src={uploadedImage} alt="Your design" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>

                {/* Order summary */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">Product</span>
                      <span className="text-foreground font-medium">
                        {product === "metal" ? "Metal Print" : product === "acrylic" ? "Acrylic Print" : cardTypeLabel}
                      </span>
                    </div>
                    {product === "metal" && (
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-muted-foreground">Type</span>
                        <span className="text-foreground">{metalOptions[metalIdx].label}</span>
                      </div>
                    )}
                    {product !== "cards" && (
                      <>
                        <div className="flex justify-between font-body text-sm">
                          <span className="text-muted-foreground">Size</span>
                          <span className="text-foreground">{w}" × {h}" ({orientation})</span>
                        </div>
                        {roundedCorners && (
                          <div className="flex justify-between font-body text-sm">
                            <span className="text-muted-foreground">Rounded Corners</span>
                            <span className="text-foreground">Yes</span>
                          </div>
                        )}
                        {standOff !== "none" && (
                          <div className="flex justify-between font-body text-sm">
                            <span className="text-muted-foreground">Stand-Offs</span>
                            <span className="text-foreground capitalize">{standOff} × {standOffQty}</span>
                          </div>
                        )}
                      </>
                    )}
                    {product === "cards" && (
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="text-foreground">Set of 55</span>
                      </div>
                    )}
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">File</span>
                      <span className="text-foreground truncate max-w-[180px]">{fileName}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between font-body text-sm text-muted-foreground">
                      <span>
                        {product === "cards" ? `Set of 55 — ${cardTypeLabel}` : `${product === "metal" ? metalOptions[metalIdx].label : "Acrylic"} — ${w}"×${h}"`}
                      </span>
                      <span>${price.toFixed(2)}</span>
                    </div>
                    {metalSurcharge > 0 && (
                      <div className="flex justify-between font-body text-sm text-muted-foreground">
                        <span>Metal stand-off surcharge (15%)</span>
                        <span>${metalSurcharge.toFixed(2)}</span>
                      </div>
                    )}
                    {standOff !== "none" && (
                      <div className="flex justify-between font-body text-sm text-muted-foreground">
                        <span>Stand-offs ({standOff}) × {standOffQty}</span>
                        <span>${((standOff === "silver" ? addOns.standOffSilver : addOns.standOffBlack) * standOffQty).toFixed(2)}</span>
                      </div>
                    )}
                    {roundedCorners && (
                      <div className="flex justify-between font-body text-sm text-muted-foreground">
                        <span>Rounded Corners</span>
                        <span>$5.00</span>
                      </div>
                    )}
                    <div className="flex justify-between font-body text-sm text-muted-foreground">
                      <span>Shipping</span>
                      <span>
                        ${shipping.cost.toFixed(2)}
                        {shipping.note && <span className="text-xs ml-1">({shipping.note})</span>}
                      </span>
                    </div>
                    <div className="flex justify-between font-body text-xl font-bold text-foreground border-t border-border pt-3">
                      <span>Total</span>
                      <span className="text-gradient-gold">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground font-body">
                    Delivered in 48–72 hours
                  </p>
                </div>
              </div>

              <Button className="w-full bg-gradient-gold text-primary-foreground font-body font-semibold tracking-wide text-lg py-6 hover:opacity-90">
                Place Order
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-10 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="text-muted-foreground font-body"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            {step < 3 && (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="bg-gradient-gold text-primary-foreground font-body font-semibold tracking-wide hover:opacity-90"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrintDesigner;
