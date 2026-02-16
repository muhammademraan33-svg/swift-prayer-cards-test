export interface SelectedImage {
  url: string;
  photographer: string;
  alt: string;
}

export type MaterialChoice = "acrylic" | "metal-designer" | "metal-museum";
export type StandOffChoice = "none" | "silver" | "black";

export const CUSTOM_SIZE_IDX = -1;

/** An additional print in a multi-print set */
export interface AdditionalPrint {
  image: SelectedImage | null;
  uploadedFile: string | null;
}

export interface CartItem {
  image: SelectedImage | null;
  uploadedFile: string | null;
  imageNaturalWidth: number;
  imageNaturalHeight: number;
  sizeIdx: number;
  customWidth: number;
  customHeight: number;
  quantity: number;
  additionalPrints: AdditionalPrint[];
  material: MaterialChoice;
  doubleSided: boolean;
  backImage: SelectedImage | null;
  backUploadedFile: string | null;
  standOff: StandOffChoice;
  standOffQty: number;
  roundedCorners: boolean;
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
  customWidth: number;
  customHeight: number;
  quantity: number;
  additionalPrints: AdditionalPrint[];
  material: MaterialChoice;
  doubleSided: boolean;
  backImage: SelectedImage | null;
  backUploadedFile: string | null;
  standOff: StandOffChoice;
  standOffQty: number;
  roundedCorners: boolean;
  cart: CartItem[];
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
  customWidth: 12,
  customHeight: 16,
  quantity: 1,
  additionalPrints: [],
  material: "metal-designer",
  doubleSided: false,
  backImage: null,
  backUploadedFile: null,
  standOff: "none",
  standOffQty: 4,
  roundedCorners: false,
  cart: [],
  rotation: 0,
  zoom: 1,
  panX: 0,
  panY: 0,
};
