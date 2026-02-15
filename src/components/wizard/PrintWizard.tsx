import { useState, useCallback } from "react";
import { initialWizardState, TOTAL_STEPS, type WizardState, type MaterialChoice, type StandOffChoice, type SelectedImage, type BundleSlot } from "./types";
import { recommendStandOffs, standardSizes, type Bundle } from "@/lib/pricing";
import StepArt from "./StepArt";
import StepSize from "./StepSize";
import StepUpsell from "./StepUpsell";
import StepMounting from "./StepMounting";
import StepReview from "./StepReview";
import StepBundleImages from "./StepBundleImages";

const stepLabels = ["Artwork", "Size & Material", "Personalize", "Finishing", "Review"];
const bundleStepLabels = ["First Image", "Size & Bundle", "Bundle Images", "Finishing", "Review"];

interface Props {
  onStepChange?: (step: number) => void;
}

const PrintWizard = ({ onStepChange }: Props) => {
  const [state, setState] = useState<WizardState>(initialWizardState);

  const update = useCallback((patch: Partial<WizardState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      if (patch.step !== undefined && onStepChange) onStepChange(next.step);
      return next;
    });
  }, [onStepChange]);

  const goTo = (step: number) => update({ step });

  const imageUrl = state.uploadedFile || state.image?.url || "";
  const isMetal = state.material.startsWith("metal");
  const isBundle = !!state.selectedBundle;

  // Step navigation
  const nextStep = () => {
    let next = state.step + 1;
    if (isBundle) {
      // Bundle flow: 1 (art) → 2 (size/bundle select) → 3 (bundle images) → 4 (finishing) → 5 (review)
      // Skip upsell (step 3 is bundle images instead)
    } else {
      if (!isMetal && next === 3) next = 4; // skip upsell for acrylic
    }
    if (next > TOTAL_STEPS) next = TOTAL_STEPS;
    update({ step: next });
  };

  const prevStep = () => {
    let prev = state.step - 1;
    if (isBundle) {
      // Bundle flow going back
    } else {
      if (!isMetal && prev === 3) prev = 2;
    }
    if (prev < 1) prev = 1;
    update({ step: prev });
  };

  const handleSelectBundle = (bundle: Bundle) => {
    const totalPrints = bundle.prints.reduce((sum, p) => sum + p.qty, 0);
    // Pre-fill first slot with the already-selected image
    const slots: BundleSlot[] = Array.from({ length: totalPrints }, (_, i) => 
      i === 0 ? { image: state.image, uploadedFile: state.uploadedFile } : { image: null, uploadedFile: null }
    );
    update({ selectedBundle: bundle, bundleSlots: slots, step: 3 });
  };

  const handleUpdateSlot = (index: number, slot: BundleSlot) => {
    const newSlots = [...state.bundleSlots];
    newSlots[index] = slot;
    update({ bundleSlots: newSlots });
  };

  const handleBundleBack = () => {
    // Going back from bundle images returns to size step, clearing bundle
    update({ selectedBundle: null, bundleSlots: [], step: 2 });
  };

  const activeLabels = isBundle ? bundleStepLabels : stepLabels;

  return (
    <section id="wizard" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center gap-1 mb-2">
            {activeLabels.map((label, i) => {
              const stepNum = i + 1;
              const isActive = state.step === stepNum;
              const isDone = state.step > stepNum;
              const isSkipped = !isBundle && !isMetal && stepNum === 3;

              if (isSkipped) return null;

              return (
                <button
                  key={label}
                  onClick={() => stepNum <= state.step && goTo(stepNum)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-body tracking-wider uppercase transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-gradient-gold text-primary-foreground font-bold"
                      : isDone
                        ? "bg-primary/15 text-primary cursor-pointer"
                        : "bg-secondary text-muted-foreground/50"
                  }`}
                  disabled={stepNum > state.step}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 border border-current/20">
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
              style={{ width: `${((state.step - 1) / (isMetal || isBundle ? TOTAL_STEPS - 1 : TOTAL_STEPS - 2)) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        {state.step === 1 && (
          <StepArt
            image={state.image}
            uploadedFile={state.uploadedFile}
            onSelect={(img) => update({ image: img, uploadedFile: null })}
            onUpload={(dataUrl) => update({ uploadedFile: dataUrl, image: null })}
            onNext={nextStep}
          />
        )}

        {state.step === 2 && imageUrl && (
          <StepSize
            imageUrl={imageUrl}
            sizeIdx={state.sizeIdx}
            material={state.material}
            onSelect={(idx) => update({ sizeIdx: idx })}
            onSelectMaterial={(m) => update({ material: m, doubleSided: false, backImage: null, backUploadedFile: null })}
            onNext={nextStep}
            onBack={prevStep}
            onSelectBundle={handleSelectBundle}
          />
        )}

        {state.step === 3 && isBundle && state.selectedBundle && (
          <StepBundleImages
            bundle={state.selectedBundle}
            slots={state.bundleSlots}
            onUpdateSlot={handleUpdateSlot}
            onNext={() => update({ step: 4 })}
            onBack={handleBundleBack}
          />
        )}

        {state.step === 3 && !isBundle && isMetal && (
          <StepUpsell
            frontImage={imageUrl}
            backImage={state.backImage}
            backUploadedFile={state.backUploadedFile}
            doubleSided={state.doubleSided}
            material={state.material}
            sizeIdx={state.sizeIdx}
            onToggleDouble={(v) => update({ doubleSided: v })}
            onSelectBack={(img) => update({ backImage: img, backUploadedFile: null })}
            onUploadBack={(dataUrl) => update({ backUploadedFile: dataUrl, backImage: null })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {state.step === 4 && (
          <StepMounting
            sizeIdx={state.sizeIdx}
            standOff={state.standOff}
            standOffQty={state.standOffQty}
            roundedCorners={state.roundedCorners}
            onStandOff={(v) => {
              const size = standardSizes[state.sizeIdx];
              update({ standOff: v, standOffQty: v !== "none" ? recommendStandOffs(size.w, size.h) : state.standOffQty });
            }}
            onStandOffQty={(v) => update({ standOffQty: v })}
            onRoundedCorners={(v) => update({ roundedCorners: v })}
            onNext={nextStep}
            onBack={() => {
              if (isBundle) update({ step: 3 });
              else prevStep();
            }}
          />
        )}

        {state.step === 5 && (
          <StepReview
            state={state}
            onBack={prevStep}
          />
        )}
      </div>
    </section>
  );
};

export default PrintWizard;
