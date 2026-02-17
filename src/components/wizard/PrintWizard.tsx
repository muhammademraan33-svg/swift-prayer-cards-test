import { useState, useCallback } from "react";
import { initialWizardState, TOTAL_STEPS, type WizardState, type CartItem } from "./types";
import { recommendStandOffs } from "@/lib/pricing";
import { resolveSize } from "@/lib/sizeHelpers";
import StepArt from "./StepArt";
import StepSize from "./StepSize";
import StepUpsell from "./StepUpsell";
import StepMounting from "./StepMounting";
import StepReview from "./StepReview";

const stepLabels = ["Artwork", "Size & Material", "Personalize", "Finishing", "Review"];

interface Props {
  onStepChange?: (step: number) => void;
}

const PrintWizard = ({ onStepChange }: Props) => {
  const [state, setState] = useState<WizardState>(initialWizardState);

  const update = useCallback((patch: Partial<WizardState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      if (patch.step !== undefined) {
        setTimeout(() => {
          document.getElementById("wizard")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
      return next;
    });
  }, []);

  const goTo = (step: number) => update({ step });

  const imageUrl = state.uploadedFile || state.image?.url || "";
  const isMetal = state.material.startsWith("metal");

  const nextStep = () => {
    let next = state.step + 1;
    if (!isMetal && next === 3) next = 4; // skip upsell for acrylic
    if (next > TOTAL_STEPS) next = TOTAL_STEPS;
    update({ step: next });
  };

  const prevStep = () => {
    let prev = state.step - 1;
    if (!isMetal && prev === 3) prev = 2;
    if (prev < 1) prev = 1;
    update({ step: prev });
  };

  return (
    <section id="wizard" className="py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-6">
          <span className="text-[10px] tracking-[0.3em] uppercase text-primary font-body">Start Here</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-1">
            Create Your Print
          </h2>
          <p className="text-muted-foreground font-body text-sm mt-2 max-w-md mx-auto">
            Follow the steps below to design your custom museum-grade print.
          </p>
        </div>
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center gap-1 mb-2">
            {stepLabels.map((label, i) => {
              const stepNum = i + 1;
              const isActive = state.step === stepNum;
              const isDone = state.step > stepNum;
              const isSkipped = !isMetal && stepNum === 3;

              if (isSkipped) return null;

              return (
                <button
                  key={label + i}
                  onClick={() => stepNum <= state.step && goTo(stepNum)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body tracking-wider uppercase transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-gradient-gold text-primary-foreground font-bold"
                      : isDone
                        ? "bg-primary/15 text-primary cursor-pointer"
                        : "bg-secondary text-muted-foreground/50"
                  }`}
                  disabled={stepNum > state.step}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border border-current/20">
                    {isDone ? "✓" : stepNum}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>
          <div className="h-0.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-gold transition-all duration-500"
              style={{ width: `${((state.step - 1) / (isMetal ? TOTAL_STEPS - 1 : TOTAL_STEPS - 2)) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        {state.step === 1 && (
          <StepArt
            image={state.image}
            uploadedFile={state.uploadedFile}
            onSelect={(img) => update({ image: img, uploadedFile: null, imageNaturalWidth: 0, imageNaturalHeight: 0, rotation: 0, zoom: 1, panX: 0, panY: 0 })}
            onUpload={(dataUrl, w, h) => update({ uploadedFile: dataUrl, image: null, imageNaturalWidth: w, imageNaturalHeight: h, rotation: 0, zoom: 1, panX: 0, panY: 0 })}
            onNext={nextStep}
          />
        )}

        {state.step === 2 && imageUrl && (
          <StepSize
            imageUrl={imageUrl}
            sizeIdx={state.sizeIdx}
            material={state.material}
            additionalPrints={state.additionalPrints}
            imageNaturalWidth={state.imageNaturalWidth}
            imageNaturalHeight={state.imageNaturalHeight}
            rotation={state.rotation}
            zoom={state.zoom}
            panX={state.panX}
            panY={state.panY}
            customWidth={state.customWidth}
            customHeight={state.customHeight}
            quantity={state.quantity}
            onSelect={(idx) => update({ sizeIdx: idx })}
            onCustomSize={(w, h) => update({ customWidth: w, customHeight: h })}
            onQuantity={(q) => update({ quantity: q })}
            onAdditionalPrints={(ap) => update({ additionalPrints: ap })}
            onSelectMaterial={(m) => update({ material: m, doubleSided: false, backImage: null, backUploadedFile: null })}
            onRotate={(r) => update({ rotation: r })}
            onZoom={(z) => update({ zoom: z })}
            onPan={(x, y) => update({ panX: x, panY: y })}
            onReplaceImage={(dataUrl, w, h) => update({ uploadedFile: dataUrl, image: null, imageNaturalWidth: w, imageNaturalHeight: h, rotation: 0, zoom: 1, panX: 0, panY: 0 })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {state.step === 3 && isMetal && (
          <StepUpsell
            frontImage={imageUrl}
            backImage={state.backImage}
            backUploadedFile={state.backUploadedFile}
            doubleSided={state.doubleSided}
            material={state.material}
            sizeIdx={state.sizeIdx}
            quantity={state.quantity}
            additionalPrints={state.additionalPrints}
            onToggleDouble={(v) => update({ doubleSided: v })}
            onSelectBack={(img) => update({ backImage: img, backUploadedFile: null })}
            onUploadBack={(dataUrl) => update({ backUploadedFile: dataUrl, backImage: null })}
            onAdditionalPrints={(ap) => update({ additionalPrints: ap })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {state.step === 4 && (
          <StepMounting
            sizeIdx={state.sizeIdx}
            customWidth={state.customWidth}
            customHeight={state.customHeight}
            standOff={state.standOff}
            standOffQty={state.standOffQty}
            roundedCorners={state.roundedCorners}
            onStandOff={(v) => {
              const size = resolveSize(state.sizeIdx, state.customWidth, state.customHeight);
              update({ standOff: v, standOffQty: v !== "none" ? recommendStandOffs(size.w, size.h) : state.standOffQty });
            }}
            onStandOffQty={(v) => update({ standOffQty: v })}
            onRoundedCorners={(v) => update({ roundedCorners: v })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {state.step === 5 && (
          <StepReview
            state={state}
            onBack={prevStep}
            onAddAnother={() => {
              const cartItem: CartItem = {
                image: state.image,
                uploadedFile: state.uploadedFile,
                imageNaturalWidth: state.imageNaturalWidth,
                imageNaturalHeight: state.imageNaturalHeight,
                sizeIdx: state.sizeIdx,
                customWidth: state.customWidth,
                customHeight: state.customHeight,
                quantity: state.quantity,
                additionalPrints: state.additionalPrints,
                material: state.material,
                doubleSided: state.doubleSided,
                backImage: state.backImage,
                backUploadedFile: state.backUploadedFile,
                standOff: state.standOff,
                standOffQty: state.standOffQty,
                roundedCorners: state.roundedCorners,
                rotation: state.rotation,
                zoom: state.zoom,
                panX: state.panX,
                panY: state.panY,
              };
              
              // Reset to step 1 with cart preserved
              setState({
                ...initialWizardState,
                step: 1,
                cart: [...state.cart, cartItem],
              });
              
              // Scroll to top of wizard
              setTimeout(() => {
                document.getElementById("wizard")?.scrollIntoView({ 
                  behavior: "smooth", 
                  block: "start" 
                });
              }, 100);
            }}
            onCheckout={() => {
              // Future: integrate real checkout
            }}
          />
        )}
      </div>
    </section>
  );
};

export default PrintWizard;
