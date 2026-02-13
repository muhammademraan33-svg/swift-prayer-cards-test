// Markup: 2x for prints, 1.4x for cards
const PRINT_MARKUP = 2;
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
  standOffSilver: 2.50,
  standOffBlack: 3.50,
  metalStandOffSurcharge: 0.15, // 15% of base print price
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
  { label: '11"×14"', w: 11, h: 14 },
  { label: '12"×16"', w: 12, h: 16 },
  { label: '16"×20"', w: 16, h: 20 },
  { label: '18"×24"', w: 18, h: 24 },
  { label: '20"×30"', w: 20, h: 30 },
  { label: '24"×36"', w: 24, h: 36 },
  { label: '30"×40"', w: 30, h: 40 },
  { label: '32"×48"', w: 32, h: 48 },
  { label: '36"×48"', w: 36, h: 48 },
  { label: '40"×60"', w: 40, h: 60 },
  { label: '48"×72"', w: 48, h: 72 },
  { label: '48"×84"', w: 48, h: 84 },
  { label: '48"×96"', w: 48, h: 96 },
];
