import type { Bundle } from "@/lib/pricing";

export interface SelectedImage {
  url: string;
  photographer: string;
  alt: string;
}

export type MaterialChoice = "acrylic" | "metal-designer" | "metal-museum";
export type StandOffChoice = "none" | "silver" | "black";

export interface BundleSlot {
  image: SelectedImage | null;
  uploadedFile: string | null;
}

export interface WizardState {
  step: number;
  image: SelectedImage | null;
  uploadedFile: string | null;
  sizeIdx: number;
  material: MaterialChoice;
  doubleSided: boolean;
  backImage: SelectedImage | null;
  backUploadedFile: string | null;
  standOff: StandOffChoice;
  standOffQty: number;
  roundedCorners: boolean;
  // Bundle mode
  selectedBundle: Bundle | null;
  bundleSlots: BundleSlot[];
}

export const TOTAL_STEPS = 5;

export const initialWizardState: WizardState = {
  step: 1,
  image: null,
  uploadedFile: null,
  sizeIdx: 0,
  material: "metal-designer",
  doubleSided: false,
  backImage: null,
  backUploadedFile: null,
  standOff: "none",
  standOffQty: 4,
  roundedCorners: false,
  selectedBundle: null,
  bundleSlots: [],
};
