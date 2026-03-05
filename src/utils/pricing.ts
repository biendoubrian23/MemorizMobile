/**
 * Pricing helper – calcule le prix d'un album / magazine
 * en fonction du type de produit, du format, de la reliure et du nombre de pages.
 */

// ── Prix de base par produit ──
const BASE_PRICES: Record<string, number> = {
  album: 24.90,
  magazine: 14.90,
};

// ── Supplément format ──
const FORMAT_EXTRA: Record<string, number> = {
  square: 0,
  a4_portrait: 5.00,
  a4_landscape: 5.00,
};

// ── Supplément reliure ──
const BINDING_EXTRA: Record<string, number> = {
  softcover: 0,
  hardcover: 8.00,
  lay_flat: 12.00,
};

// ── Prix par page supplémentaire (au-delà de 24 pages incluses) ──
const INCLUDED_PAGES = 24;
const EXTRA_PAGE_PRICE = 0.50;

// ── Labels lisibles ──
export const PRODUCT_LABELS: Record<string, string> = {
  album: 'Album Photo',
  magazine: 'Magazine',
};

export const FORMAT_LABELS: Record<string, string> = {
  square: 'Carré 21×21 cm',
  a4_portrait: 'A4 Portrait',
  a4_landscape: 'A4 Paysage',
};

export const BINDING_LABELS: Record<string, string> = {
  softcover: 'Couverture souple',
  hardcover: 'Couverture rigide',
  lay_flat: 'Lay Flat (pages à plat)',
};

export const PAPER_LABELS: Record<string, string> = {
  standard: 'Standard',
  lisse_satin: 'Lisse satiné',
  doux: 'Doux au toucher',
};

export const LAMINATION_LABELS: Record<string, string> = {
  glossy: 'Brillant',
  matte: 'Mat',
  soft_touch: 'Soft Touch',
};

export interface PricingInput {
  productType: string;
  format: string;
  bindingType: string;
  pageCount: number;
}

/**
 * Calcule le prix unitaire d'un produit.
 */
export function calculateUnitPrice(input: PricingInput): number {
  const base = BASE_PRICES[input.productType] ?? 24.90;
  const formatExtra = FORMAT_EXTRA[input.format] ?? 0;
  const bindingExtra = BINDING_EXTRA[input.bindingType] ?? 0;
  const extraPages = Math.max(0, input.pageCount - INCLUDED_PAGES);
  const pagesExtra = extraPages * EXTRA_PAGE_PRICE;

  return Number((base + formatExtra + bindingExtra + pagesExtra).toFixed(2));
}

/**
 * Retourne un résumé textuel du prix.
 */
export function getPricingSummary(input: PricingInput): string {
  const price = calculateUnitPrice(input);
  return `${price.toFixed(2)}€`;
}
