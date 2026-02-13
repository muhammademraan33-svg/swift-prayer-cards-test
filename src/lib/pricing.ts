// Cost prices - marked up ~3x for retail
const MARKUP = 3;

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
  additionalStandOffSilver: 2.50,
  additionalStandOffBlack: 3.50,
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
  return Math.ceil(cost * MARKUP);
}

export function calcAcrylicPrice(widthIn: number, heightIn: number): number {
  const sqIn = widthIn * heightIn;
  const cost = Math.max(sqIn * acrylicCostPerSqIn, acrylicMinCost);
  return Math.ceil(cost * MARKUP);
}

// Eternity / business cards: cost $1 ea, retail ~$5 ea
export const cardPricing = {
  eternityCard: { single: 5, pack10: 40, pack25: 90, pack55: 175 },
  businessCard: { single: 5, pack25: 100, pack50: 175, pack100: 300 },
  invitationCard: { single: 6, pack25: 125, pack50: 225 },
  prayerCard: { single: 5, pack10: 40, pack25: 90, pack55: 175 },
};

export const standardSizes = [
  { label: '8"×10"', w: 8, h: 10 },
  { label: '11"×14"', w: 11, h: 14 },
  { label: '16"×20"', w: 16, h: 20 },
  { label: '18"×24"', w: 18, h: 24 },
  { label: '24"×36"', w: 24, h: 36 },
  { label: '30"×40"', w: 30, h: 40 },
  { label: '36"×48"', w: 36, h: 48 },
  { label: '48"×72"', w: 48, h: 72 },
  { label: '48"×96"', w: 48, h: 96 },
];
