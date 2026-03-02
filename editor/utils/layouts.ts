import { PageLayout } from '../../src/types';

/**
 * Layouts prédéfinis pour l'éditeur de pages
 * Chaque slot est positionné en pourcentage (0-100)
 */

// ═══ 1 Photo ═══
export const SINGLE_LAYOUTS: PageLayout[] = [
  {
    id: 'single_full',
    name: 'Pleine page',
    category: 'single',
    slots: [
      { x: 0, y: 0, width: 100, height: 100, type: 'photo' },
    ],
  },
  {
    id: 'single_padded',
    name: 'Avec marge',
    category: 'single',
    slots: [
      { x: 8, y: 8, width: 84, height: 84, type: 'photo', borderRadius: 12 },
    ],
  },
  {
    id: 'single_rounded',
    name: 'Arrondi',
    category: 'single',
    slots: [
      { x: 10, y: 10, width: 80, height: 70, type: 'photo', borderRadius: 20 },
    ],
  },
  {
    id: 'single_with_text',
    name: 'Photo + légende',
    category: 'single',
    slots: [
      { x: 8, y: 5, width: 84, height: 72, type: 'photo', borderRadius: 8 },
      { x: 8, y: 80, width: 84, height: 15, type: 'text' },
    ],
  },
];

// ═══ 2 Photos ═══
export const DOUBLE_LAYOUTS: PageLayout[] = [
  {
    id: 'double_horizontal',
    name: 'Côte à côte',
    category: 'double',
    slots: [
      { x: 4, y: 10, width: 44, height: 80, type: 'photo', borderRadius: 8 },
      { x: 52, y: 10, width: 44, height: 80, type: 'photo', borderRadius: 8 },
    ],
  },
  {
    id: 'double_vertical',
    name: 'Empilé',
    category: 'double',
    slots: [
      { x: 8, y: 4, width: 84, height: 44, type: 'photo', borderRadius: 8 },
      { x: 8, y: 52, width: 84, height: 44, type: 'photo', borderRadius: 8 },
    ],
  },
  {
    id: 'double_big_small',
    name: 'Grand + petit',
    category: 'double',
    slots: [
      { x: 4, y: 4, width: 60, height: 92, type: 'photo', borderRadius: 8 },
      { x: 68, y: 30, width: 28, height: 40, type: 'photo', borderRadius: 8 },
    ],
  },
];

// ═══ Collage ═══
export const COLLAGE_LAYOUTS: PageLayout[] = [
  {
    id: 'collage_3_grid',
    name: 'Grille 3',
    category: 'collage',
    slots: [
      { x: 4, y: 4, width: 56, height: 92, type: 'photo', borderRadius: 8 },
      { x: 64, y: 4, width: 32, height: 44, type: 'photo', borderRadius: 8 },
      { x: 64, y: 52, width: 32, height: 44, type: 'photo', borderRadius: 8 },
    ],
  },
  {
    id: 'collage_4_grid',
    name: 'Grille 4',
    category: 'collage',
    slots: [
      { x: 4, y: 4, width: 44, height: 44, type: 'photo', borderRadius: 8 },
      { x: 52, y: 4, width: 44, height: 44, type: 'photo', borderRadius: 8 },
      { x: 4, y: 52, width: 44, height: 44, type: 'photo', borderRadius: 8 },
      { x: 52, y: 52, width: 44, height: 44, type: 'photo', borderRadius: 8 },
    ],
  },
  {
    id: 'collage_mosaic',
    name: 'Mosaïque',
    category: 'collage',
    slots: [
      { x: 4, y: 4, width: 60, height: 48, type: 'photo', borderRadius: 8 },
      { x: 68, y: 4, width: 28, height: 48, type: 'photo', borderRadius: 8 },
      { x: 4, y: 56, width: 28, height: 40, type: 'photo', borderRadius: 8 },
      { x: 36, y: 56, width: 60, height: 40, type: 'photo', borderRadius: 8 },
    ],
  },
];

// ═══ Texte ═══
export const TEXT_LAYOUTS: PageLayout[] = [
  {
    id: 'text_full',
    name: 'Texte plein',
    category: 'text',
    slots: [
      { x: 10, y: 10, width: 80, height: 80, type: 'text' },
    ],
  },
  {
    id: 'text_with_photo',
    name: 'Texte + photo',
    category: 'text',
    slots: [
      { x: 8, y: 5, width: 84, height: 50, type: 'photo', borderRadius: 8 },
      { x: 8, y: 60, width: 84, height: 35, type: 'text' },
    ],
  },
  {
    id: 'text_lines',
    name: 'Citations',
    category: 'text',
    slots: [
      { x: 15, y: 20, width: 70, height: 60, type: 'text' },
    ],
  },
];

// ═══ Tous les layouts ═══
export const DEFAULT_LAYOUTS: PageLayout[] = [
  ...SINGLE_LAYOUTS,
  ...DOUBLE_LAYOUTS,
  ...COLLAGE_LAYOUTS,
  ...TEXT_LAYOUTS,
];

export function getLayoutsByCategory(category: PageLayout['category']): PageLayout[] {
  return DEFAULT_LAYOUTS.filter((l) => l.category === category);
}

export function getLayoutById(id: string): PageLayout | undefined {
  return DEFAULT_LAYOUTS.find((l) => l.id === id);
}
