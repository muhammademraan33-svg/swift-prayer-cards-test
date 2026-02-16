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
  imageNaturalWidth: number;
  imageNaturalHeight: number;
  sizeIdx: number;
  material: MaterialChoice;
  doubleSided: boolean;
  backImage: SelectedImage | null;
  backUploadedFile: string | null;
  standOff: StandOffChoice;
  standOffQty: number;
  roundedCorners: boolean;
  companionPrint: CompanionPrint | null;
  rotation: number;
  zoom: number;
  panX: number;
  panY: number;
}

export interface WizardState {
  step: number;
  image: SelectedImage | null;
  uploadedFile: string | null;
  imageNaturalWidth: number;
  imageNaturalHeight: number;
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
  // Image adjustments
  rotation: number;
  zoom: number;
  panX: number;
  panY: number;
}

export const TOTAL_STEPS = 5;

export const initialWizardState: WizardState = {
  step: 1,
  image: null,
  uploadedFile: null,
  imageNaturalWidth: 0,
  imageNaturalHeight: 0,
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
  rotation: 0,
  zoom: 1,
  panX: 0,
  panY: 0,
};
