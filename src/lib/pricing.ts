// Markup: 2x for prints, 1.4x for cards
const PRINT_MARKUP = 2.2;
const CARD_MARKUP = 1.4;

export interface MetalOption {
  label: string;
  costPerSqIn: number;
  minCost: number;
}

export const metalOptions: MetalOption[] = [
  { label: '.040" Single-Sided', costPerSqIn: 0.06, minCost: 8.64 },
  { label: '.040" Double-Sided', costPerSqIn: 0.07, minCost: 10.08 },
  { label: '.080" Single-Sided', costPerSqIn: 0.10, minCost: 14.40 },
  { label: '.080" Double-Sided', costPerSqIn: 0.11, minCost: 15.84 },
];

export const acrylicCostPerSqIn = 0.10;
export const acrylicMinCost = 14.40;

export const addOns = {
  roundedCorners: 5.00,
  standOffSilver: 3.00,
  standOffBlack: 4.00,
  metalStandOffSurcharge: 0, // absorbed into base markup
};

export type ShippingTier = { label: string; cost: number; note?: string };

export const shippingTiers: ShippingTier[] = [
  { label: '24"×36" and under', cost: 10 },
  { label: '24"×36" – 32"×48"', cost: 15 },
  { label: '36"×36" – 36"×48"', cost: 35 },
  { label: '36"×48" – 48"×48"', cost: 50 },
  { label: '39"×72" – 24"×96"', cost: 75 },
  { label: '24"×96" – 48"×96"', cost: 199, note: 'Freight +1 day' },
];

export function getShippingCost(widthIn: number, heightIn: number): ShippingTier {
  const maxDim = Math.max(widthIn, heightIn);
  const minDim = Math.min(widthIn, heightIn);

  if (maxDim <= 36 && minDim <= 24) return shippingTiers[0];
  if (maxDim <= 48 && minDim <= 32) return shippingTiers[1];
  if (maxDim <= 48 && minDim <= 36) return shippingTiers[2];
  if (maxDim <= 48) return shippingTiers[3];
  if (maxDim <= 96 && minDim <= 39) return shippingTiers[4];
  return shippingTiers[5];
}

const LUXPRESS_MULTIPLIER = 1.50;
const OVERNIGHT_MULTIPLIER = 2.20;
const OVERNIGHT_MIN_RAW_COST = 8.64;

export type ShippingSpeed = 'standard' | 'luxpress' | 'overnight';

export function calcLuxpressShipping(standardCost: number): number {
  return Math.ceil(standardCost * LUXPRESS_MULTIPLIER);
}

export function calcOvernightShipping(
  widthIn: number,
  heightIn: number,
  costPerSqIn: number,
  minCost: number,
): number {
  const rawCost = Math.max(widthIn * heightIn * costPerSqIn, Math.max(minCost, OVERNIGHT_MIN_RAW_COST));
  return Math.ceil(rawCost * OVERNIGHT_MULTIPLIER);
}

export function calcMetalPrice(widthIn: number, heightIn: number, option: MetalOption): number {
  const sqIn = widthIn * heightIn;
  const cost = Math.max(sqIn * option.costPerSqIn, option.minCost);
  return Math.ceil(cost * PRINT_MARKUP);
}

export function calcAcrylicPrice(widthIn: number, heightIn: number): number {
  const sqIn = widthIn * heightIn;
  const cost = Math.max(sqIn * acrylicCostPerSqIn, acrylicMinCost);
  return Math.ceil(cost * PRINT_MARKUP);
}

// Auto-recommend stand-off quantity based on dimensions (every 2-3 feet)
export function recommendStandOffs(widthIn: number, heightIn: number): number {
  const horizontalCount = Math.max(2, Math.ceil(widthIn / 24) + 1);
  const verticalCount = Math.max(2, Math.ceil(heightIn / 24) + 1);
  return Math.max(4, 2 * (horizontalCount + verticalCount) - 4);
}

// Cards: cost $1 ea, markup 1.4x
export const cardPricing = {
  eternityCard: { pack55: Math.ceil(55 * CARD_MARKUP) },
  businessCard: { pack55: Math.ceil(55 * CARD_MARKUP) },
  invitationCard: { pack55: Math.ceil(55 * CARD_MARKUP) },
  prayerCard: { pack55: Math.ceil(55 * CARD_MARKUP) },
};

export const standardSizes = [
  { label: '8"×10"', w: 8, h: 10 },
  { label: '8"×12"', w: 8, h: 12 },
  { label: '10"×10"', w: 10, h: 10 },
  { label: '11"×14"', w: 11, h: 14 },
  { label: '12"×12"', w: 12, h: 12 },
  { label: '12"×16"', w: 12, h: 16 },
  { label: '12"×18"', w: 12, h: 18 },
  { label: '12"×36"', w: 12, h: 36 },
  { label: '16"×20"', w: 16, h: 20 },
  { label: '16"×24"', w: 16, h: 24 },
  { label: '18"×24"', w: 18, h: 24 },
  { label: '20"×30"', w: 20, h: 30 },
  { label: '24"×36"', w: 24, h: 36 },
  { label: '30"×40"', w: 30, h: 40 },
  { label: '32"×48"', w: 32, h: 48 },
  { label: '36"×48"', w: 36, h: 48 },
  { label: '36"×60"', w: 36, h: 60 },
  { label: '40"×60"', w: 40, h: 60 },
  { label: '48"×72"', w: 48, h: 72 },
  { label: '48"×84"', w: 48, h: 84 },
  { label: '48"×96"', w: 48, h: 96 },
];

// Bundles — matching Portrilux pricing
export interface Bundle {
  id: string;
  name: string;
  description: string;
  prints: { w: number; h: number; qty: number }[];
  salePrice: number;
  originalPrice: number;
  discount: string;
  tag?: string;
}

export const bundles: Bundle[] = [
  {
    id: 'classic-3',
    name: 'The Classic 3-Pack',
    description: '3 × 8"×10" metal prints — perfect starter wall',
    prints: [{ w: 8, h: 10, qty: 3 }],
    salePrice: 80,
    originalPrice: 100,
    discount: '20%',
    tag: 'Starter',
  },
  {
    id: 'fab-four',
    name: 'The Fabulous Four',
    description: '4 × 8"×12" metal prints — gallery-ready set',
    prints: [{ w: 8, h: 12, qty: 4 }],
    salePrice: 112,
    originalPrice: 140,
    discount: '20%',
  },
  {
    id: 'three-piece-wonder',
    name: 'Three-Piece Wonder',
    description: '3 × 11"×14" metal prints — elegant trio',
    prints: [{ w: 11, h: 14, qty: 3 }],
    salePrice: 120,
    originalPrice: 170,
    discount: '29%',
    tag: 'Best Value',
  },
  {
    id: 'quad-square',
    name: 'Quad Square Collection',
    description: '4 × 10"×10" metal prints — modern grid layout',
    prints: [{ w: 10, h: 10, qty: 4 }],
    salePrice: 128,
    originalPrice: 160,
    discount: '20%',
  },
  {
    id: 'panorama',
    name: 'Signature Panorama',
    description: '12"×36" panoramic metal print — edge-to-edge impact',
    prints: [{ w: 12, h: 36, qty: 1 }],
    salePrice: 125,
    originalPrice: 169,
    discount: '26%',
  },
  {
    id: 'staple-3',
    name: 'Staple Classic 3-Pack',
    description: '3 × 12"×18" metal prints — versatile wall display',
    prints: [{ w: 12, h: 18, qty: 3 }],
    salePrice: 175,
    originalPrice: 255,
    discount: '31%',
    tag: 'Popular',
  },
  {
    id: 'classic-wall-mix',
    name: 'Classic Wall Mix',
    description: '3 prints in 3 sizes: 12"×12", 12"×18", 16"×24"',
    prints: [{ w: 12, h: 12, qty: 1 }, { w: 12, h: 18, qty: 1 }, { w: 16, h: 24, qty: 1 }],
    salePrice: 185,
    originalPrice: 245,
    discount: '24%',
  },
  {
    id: 'super-six',
    name: 'Super Six Collection',
    description: '6 × 12"×18" metal prints — fill an entire wall',
    prints: [{ w: 12, h: 18, qty: 6 }],
    salePrice: 336,
    originalPrice: 420,
    discount: '20%',
  },
  {
    id: 'centerpiece',
    name: 'The Centerpiece Set',
    description: '2 × 16"×20" + 1 × 24"×36" — statement arrangement',
    prints: [{ w: 16, h: 20, qty: 2 }, { w: 24, h: 36, qty: 1 }],
    salePrice: 360,
    originalPrice: 450,
    discount: '20%',
    tag: 'Statement',
  },
  {
    id: 'bold-wall',
    name: 'The Bold Wall',
    description: '9 × 11"×14" metal prints — gallery wall masterpiece',
    prints: [{ w: 11, h: 14, qty: 9 }],
    salePrice: 409,
    originalPrice: 585,
    discount: '30%',
    tag: 'Gallery',
  },
];

// Collage bundles with variable sizing
export interface CollageBundle {
  id: string;
  name: string;
  description: string;
  photoCount: number;
  sizes: { label: string; price: number; originalPrice: number }[];
}

export const collageBundles: CollageBundle[] = [
  {
    id: 'collage-5',
    name: '5-Photo Collage',
    description: 'Your favorite 5 photos arranged in a stunning collage on metal',
    photoCount: 5,
    sizes: [
      { label: '16"×20"', price: 90, originalPrice: 126 },
      { label: '20"×30"', price: 140, originalPrice: 196 },
      { label: '24"×36"', price: 185, originalPrice: 259 },
    ],
  },
];
