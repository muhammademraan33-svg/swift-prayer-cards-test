import { useState, useCallback } from "react";
import { initialWizardState, TOTAL_STEPS, type WizardState, type MaterialChoice, type StandOffChoice, type SelectedImage } from "./types";
import { recommendStandOffs, standardSizes } from "@/lib/pricing";
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
      if (patch.step !== undefined && onStepChange) onStepChange(next.step);
      return next;
    });
  }, [onStepChange]);

  const goTo = (step: number) => update({ step });

  const imageUrl = state.uploadedFile || state.image?.url || "";

  // Determine if upsell step applies (metal only)
  const isMetal = state.material.startsWith("metal");

  // Step mapping: for acrylic, skip step 3 (upsell)
  const nextStep = () => {
    let next = state.step + 1;
    if (!isMetal && next === 3) next = 4; // skip upsell for acrylic
    if (next > TOTAL_STEPS) next = TOTAL_STEPS;
    update({ step: next });
  };

  const prevStep = () => {
    let prev = state.step - 1;
    if (!isMetal && prev === 3) prev = 2; // skip upsell going back for acrylic
    if (prev < 1) prev = 1;
    update({ step: prev });
  };

  return (
    <section id="wizard" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
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
              style={{ width: `${((state.step - 1) / (isMetal ? TOTAL_STEPS - 1 : TOTAL_STEPS - 2)) * 100}%` }}
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
            onBack={prevStep}
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
