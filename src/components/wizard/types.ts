export interface SelectedImage {
  url: string;
  photographer: string;
  alt: string;
}

export type MaterialChoice = "acrylic" | "metal-designer" | "metal-museum";
export type StandOffChoice = "none" | "silver" | "black";

export interface CompanionPrint {
  image: SelectedImage | null;
  uploadedFile: string | null;
  sizeIdx: number;
  orientation: "landscape" | "portrait";
}

export interface CartItem {
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
  companionPrint: CompanionPrint | null;
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
  companionPrint: CompanionPrint | null;
  cart: CartItem[];
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
  companionPrint: null,
  cart: [],
};
