import { useState, useCallback } from "react";
import { initialWizardState, TOTAL_STEPS, type WizardState, type MaterialChoice, type StandOffChoice, type SelectedImage } from "./types";
import { recommendStandOffs, standardSizes } from "@/lib/pricing";
import StepArt from "./StepArt";
import StepSize from "./StepSize";
import StepMaterial from "./StepMaterial";
import StepUpsell from "./StepUpsell";
import StepMounting from "./StepMounting";
import StepReview from "./StepReview";

const stepLabels = ["Artwork", "Size", "Material", "Personalize", "Finishing", "Review"];

const PrintWizard = () => {
  const [state, setState] = useState<WizardState>(initialWizardState);

  const update = useCallback((patch: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const goTo = (step: number) => update({ step });

  const imageUrl = state.uploadedFile || state.image?.url || "";

  // Determine if upsell step applies (metal only)
  const isMetal = state.material.startsWith("metal");

  // Step mapping: for acrylic, skip step 4 (upsell)
  const getEffectiveStep = () => {
    if (!isMetal && state.step === 4) return 5; // skip upsell for acrylic
    return state.step;
  };

  const nextStep = () => {
    let next = state.step + 1;
    if (!isMetal && next === 4) next = 5; // skip upsell for acrylic
    if (next > TOTAL_STEPS) next = TOTAL_STEPS;
    update({ step: next });
  };

  const prevStep = () => {
    let prev = state.step - 1;
    if (!isMetal && prev === 4) prev = 3; // skip upsell going back for acrylic
    if (prev < 1) prev = 1;
    update({ step: prev });
  };

  return (
    <section id="wizard" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            {stepLabels.map((label, i) => {
              const stepNum = i + 1;
              const isActive = state.step === stepNum;
              const isDone = state.step > stepNum;
              const isSkipped = !isMetal && stepNum === 4;

              if (isSkipped) return null;

              return (
                <button
                  key={label}
                  onClick={() => stepNum <= state.step && goTo(stepNum)}
                  className={`flex flex-col items-center gap-1 transition-colors ${
                    isActive ? "text-primary" : isDone ? "text-primary/60 cursor-pointer" : "text-muted-foreground/40"
                  }`}
                  disabled={stepNum > state.step}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-body font-bold transition-all ${
                      isActive
                        ? "bg-gradient-gold text-primary-foreground"
                        : isDone
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isDone ? "✓" : stepNum}
                  </div>
                  <span className="text-[10px] font-body tracking-wider uppercase hidden sm:block">{label}</span>
                </button>
              );
            })}
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
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
            onSelect={(idx) => update({ sizeIdx: idx })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {state.step === 3 && (
          <StepMaterial
            imageUrl={imageUrl}
            sizeIdx={state.sizeIdx}
            material={state.material}
            onSelect={(m) => update({ material: m, doubleSided: false, backImage: null, backUploadedFile: null })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {state.step === 4 && isMetal && (
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

        {state.step === 5 && (
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

        {state.step === 6 && (
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
