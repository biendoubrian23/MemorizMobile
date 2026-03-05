import { PageLayout } from '../../src/types';

/**
 * Layouts prédéfinis pour l'éditeur de pages
 * Chaque slot est positionné en pourcentage (0-100)
 */

// ═══════════════════════════════════════════════════════════════
// 1 PHOTO — 12 layouts
// ═══════════════════════════════════════════════════════════════
export const SINGLE_LAYOUTS: PageLayout[] = [
  // 1. Pleine page — sans marge, immersif
  {
    id: 'single_full',
    name: 'Pleine page',
    category: 'single',
    slots: [
      { x: 0, y: 0, width: 100, height: 100, type: 'photo' },
    ],
  },
  // 2. Avec marge régulière
  {
    id: 'single_padded',
    name: 'Avec marge',
    category: 'single',
    slots: [
      { x: 8, y: 8, width: 84, height: 84, type: 'photo', borderRadius: 12 },
    ],
  },
  // 3. Arrondi doux
  {
    id: 'single_rounded',
    name: 'Arrondi',
    category: 'single',
    slots: [
      { x: 10, y: 12, width: 80, height: 70, type: 'photo', borderRadius: 24 },
    ],
  },
  // 4. Photo + légende en bas
  {
    id: 'single_with_text',
    name: 'Photo + légende',
    category: 'single',
    slots: [
      { x: 8, y: 5, width: 84, height: 72, type: 'photo', borderRadius: 8 },
      { x: 8, y: 80, width: 84, height: 15, type: 'text' },
    ],
  },
  // 5. Polaroid — photo carrée en haut + zone blanche en bas
  {
    id: 'single_polaroid',
    name: 'Polaroid',
    category: 'single',
    slots: [
      { x: 12, y: 6, width: 76, height: 65, type: 'photo' },
      { x: 12, y: 74, width: 76, height: 18, type: 'text' },
    ],
  },
  // 6. Cercle central
  {
    id: 'single_circle',
    name: 'Cercle',
    category: 'single',
    slots: [
      { x: 15, y: 15, width: 70, height: 70, type: 'photo', borderRadius: 999 },
    ],
  },
  // 7. Cinéma — bandes noires haut/bas, photo panoramique au centre
  {
    id: 'single_cinema',
    name: 'Cinéma',
    category: 'single',
    slots: [
      { x: 0, y: 20, width: 100, height: 60, type: 'photo' },
    ],
  },
  // 8. Titre en haut + photo en dessous
  {
    id: 'single_title_top',
    name: 'Titre + photo',
    category: 'single',
    slots: [
      { x: 8, y: 3, width: 84, height: 14, type: 'text' },
      { x: 6, y: 20, width: 88, height: 75, type: 'photo', borderRadius: 12 },
    ],
  },
  // 9. Carte postale — photo large en haut, zone texte en bas
  {
    id: 'single_postcard',
    name: 'Carte postale',
    category: 'single',
    slots: [
      { x: 0, y: 0, width: 100, height: 62, type: 'photo' },
      { x: 10, y: 67, width: 80, height: 28, type: 'text' },
    ],
  },
  // 10. Portrait centré avec beaucoup de blanc
  {
    id: 'single_centered_portrait',
    name: 'Portrait centré',
    category: 'single',
    slots: [
      { x: 20, y: 8, width: 60, height: 84, type: 'photo', borderRadius: 16 },
    ],
  },
  // 11. Paysage centré — photo horizontale au milieu de la page
  {
    id: 'single_landscape_center',
    name: 'Paysage centré',
    category: 'single',
    slots: [
      { x: 6, y: 25, width: 88, height: 50, type: 'photo', borderRadius: 10 },
    ],
  },
  // 12. Cadre vintage — double bordure effet
  {
    id: 'single_vintage_frame',
    name: 'Cadre vintage',
    category: 'single',
    slots: [
      { x: 14, y: 14, width: 72, height: 72, type: 'photo', borderRadius: 4 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// 2 PHOTOS — 12 layouts
// ═══════════════════════════════════════════════════════════════
export const DOUBLE_LAYOUTS: PageLayout[] = [
  // 1. Côte à côte classique
  {
    id: 'double_horizontal',
    name: 'Côte à côte',
    category: 'double',
    slots: [
      { x: 3, y: 8, width: 45, height: 84, type: 'photo', borderRadius: 8 },
      { x: 52, y: 8, width: 45, height: 84, type: 'photo', borderRadius: 8 },
    ],
  },
  // 2. Empilé vertical
  {
    id: 'double_vertical',
    name: 'Empilé',
    category: 'double',
    slots: [
      { x: 8, y: 4, width: 84, height: 44, type: 'photo', borderRadius: 8 },
      { x: 8, y: 52, width: 84, height: 44, type: 'photo', borderRadius: 8 },
    ],
  },
  // 3. Grand + petit
  {
    id: 'double_big_small',
    name: 'Grand + petit',
    category: 'double',
    slots: [
      { x: 4, y: 4, width: 60, height: 92, type: 'photo', borderRadius: 8 },
      { x: 68, y: 30, width: 28, height: 40, type: 'photo', borderRadius: 12 },
    ],
  },
  // 4. Diagonale — une en haut à gauche, une en bas à droite
  {
    id: 'double_diagonal',
    name: 'Diagonale',
    category: 'double',
    slots: [
      { x: 4, y: 4, width: 52, height: 44, type: 'photo', borderRadius: 10 },
      { x: 44, y: 52, width: 52, height: 44, type: 'photo', borderRadius: 10 },
    ],
  },
  // 5. Focus + vignette — grande photo + petite en coin
  {
    id: 'double_focus_inset',
    name: 'Focus + vignette',
    category: 'double',
    slots: [
      { x: 0, y: 0, width: 100, height: 100, type: 'photo' },
      { x: 60, y: 62, width: 34, height: 32, type: 'photo', borderRadius: 12 },
    ],
  },
  // 6. Deux cercles
  {
    id: 'double_circles',
    name: 'Deux cercles',
    category: 'double',
    slots: [
      { x: 6, y: 16, width: 40, height: 40, type: 'photo', borderRadius: 999 },
      { x: 54, y: 40, width: 40, height: 40, type: 'photo', borderRadius: 999 },
    ],
  },
  // 7. Bande horizontale — deux photos en bandeau
  {
    id: 'double_banner',
    name: 'Bandeau',
    category: 'double',
    slots: [
      { x: 0, y: 15, width: 50, height: 35, type: 'photo' },
      { x: 50, y: 50, width: 50, height: 35, type: 'photo' },
    ],
  },
  // 8. Avant / Après — split vertical net
  {
    id: 'double_split_vertical',
    name: 'Avant / Après',
    category: 'double',
    slots: [
      { x: 0, y: 0, width: 49, height: 100, type: 'photo' },
      { x: 51, y: 0, width: 49, height: 100, type: 'photo' },
    ],
  },
  // 9. Split horizontal — haut/bas
  {
    id: 'double_split_horizontal',
    name: 'Haut / Bas',
    category: 'double',
    slots: [
      { x: 0, y: 0, width: 100, height: 49, type: 'photo' },
      { x: 0, y: 51, width: 100, height: 49, type: 'photo' },
    ],
  },
  // 10. Grande + légende photo en bas
  {
    id: 'double_hero_thumb',
    name: 'Héro + miniature',
    category: 'double',
    slots: [
      { x: 4, y: 4, width: 92, height: 60, type: 'photo', borderRadius: 12 },
      { x: 28, y: 68, width: 44, height: 28, type: 'photo', borderRadius: 10 },
    ],
  },
  // 11. L inversé — grande à gauche + petite en bas à droite
  {
    id: 'double_l_shape',
    name: 'L inversé',
    category: 'double',
    slots: [
      { x: 4, y: 4, width: 55, height: 92, type: 'photo', borderRadius: 8 },
      { x: 63, y: 52, width: 33, height: 44, type: 'photo', borderRadius: 8 },
    ],
  },
  // 12. Deux panoramiques empilés
  {
    id: 'double_pano_stacked',
    name: 'Panoramiques',
    category: 'double',
    slots: [
      { x: 6, y: 10, width: 88, height: 34, type: 'photo', borderRadius: 12 },
      { x: 6, y: 52, width: 88, height: 34, type: 'photo', borderRadius: 12 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// COLLAGE — 12 layouts (3 à 6 photos)
// ═══════════════════════════════════════════════════════════════
export const COLLAGE_LAYOUTS: PageLayout[] = [
  // 1. Grille 3 — une grande + 2 petites
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
  // 2. Grille 4 — 2×2 symétrique
  {
    id: 'collage_4_grid',
    name: 'Grille 4',
    category: 'collage',
    slots: [
      { x: 3, y: 3, width: 46, height: 46, type: 'photo', borderRadius: 8 },
      { x: 51, y: 3, width: 46, height: 46, type: 'photo', borderRadius: 8 },
      { x: 3, y: 51, width: 46, height: 46, type: 'photo', borderRadius: 8 },
      { x: 51, y: 51, width: 46, height: 46, type: 'photo', borderRadius: 8 },
    ],
  },
  // 3. Mosaïque asymétrique
  {
    id: 'collage_mosaic',
    name: 'Mosaïque',
    category: 'collage',
    slots: [
      { x: 3, y: 3, width: 62, height: 48, type: 'photo', borderRadius: 8 },
      { x: 68, y: 3, width: 29, height: 48, type: 'photo', borderRadius: 8 },
      { x: 3, y: 54, width: 29, height: 43, type: 'photo', borderRadius: 8 },
      { x: 35, y: 54, width: 62, height: 43, type: 'photo', borderRadius: 8 },
    ],
  },
  // 4. Triptyque horizontal — 3 colonnes égales
  {
    id: 'collage_triptych',
    name: 'Triptyque',
    category: 'collage',
    slots: [
      { x: 3, y: 8, width: 30, height: 84, type: 'photo', borderRadius: 8 },
      { x: 35, y: 8, width: 30, height: 84, type: 'photo', borderRadius: 8 },
      { x: 67, y: 8, width: 30, height: 84, type: 'photo', borderRadius: 8 },
    ],
  },
  // 5. 3 bandes horizontales
  {
    id: 'collage_3_rows',
    name: '3 bandes',
    category: 'collage',
    slots: [
      { x: 6, y: 3, width: 88, height: 30, type: 'photo', borderRadius: 10 },
      { x: 6, y: 35, width: 88, height: 30, type: 'photo', borderRadius: 10 },
      { x: 6, y: 67, width: 88, height: 30, type: 'photo', borderRadius: 10 },
    ],
  },
  // 6. Héro + 3 miniatures en bas
  {
    id: 'collage_hero_3',
    name: 'Héro + 3',
    category: 'collage',
    slots: [
      { x: 3, y: 3, width: 94, height: 55, type: 'photo', borderRadius: 12 },
      { x: 3, y: 61, width: 30, height: 36, type: 'photo', borderRadius: 8 },
      { x: 35, y: 61, width: 30, height: 36, type: 'photo', borderRadius: 8 },
      { x: 67, y: 61, width: 30, height: 36, type: 'photo', borderRadius: 8 },
    ],
  },
  // 7. T-shape — grande en haut + 2 en bas
  {
    id: 'collage_t_shape',
    name: 'T inversé',
    category: 'collage',
    slots: [
      { x: 3, y: 3, width: 94, height: 50, type: 'photo', borderRadius: 10 },
      { x: 3, y: 56, width: 46, height: 41, type: 'photo', borderRadius: 8 },
      { x: 51, y: 56, width: 46, height: 41, type: 'photo', borderRadius: 8 },
    ],
  },
  // 8. Grille 6 — 3×2
  {
    id: 'collage_6_grid',
    name: 'Grille 6',
    category: 'collage',
    slots: [
      { x: 3, y: 3, width: 30, height: 46, type: 'photo', borderRadius: 6 },
      { x: 35, y: 3, width: 30, height: 46, type: 'photo', borderRadius: 6 },
      { x: 67, y: 3, width: 30, height: 46, type: 'photo', borderRadius: 6 },
      { x: 3, y: 51, width: 30, height: 46, type: 'photo', borderRadius: 6 },
      { x: 35, y: 51, width: 30, height: 46, type: 'photo', borderRadius: 6 },
      { x: 67, y: 51, width: 30, height: 46, type: 'photo', borderRadius: 6 },
    ],
  },
  // 9. Croix — centre + 4 coins
  {
    id: 'collage_cross',
    name: 'Croix',
    category: 'collage',
    slots: [
      { x: 28, y: 3, width: 44, height: 30, type: 'photo', borderRadius: 8 },
      { x: 3, y: 35, width: 30, height: 30, type: 'photo', borderRadius: 8 },
      { x: 35, y: 35, width: 30, height: 30, type: 'photo', borderRadius: 8 },
      { x: 67, y: 35, width: 30, height: 30, type: 'photo', borderRadius: 8 },
      { x: 28, y: 67, width: 44, height: 30, type: 'photo', borderRadius: 8 },
    ],
  },
  // 10. Mosaïque 5 — grande gauche + 4 petites droites
  {
    id: 'collage_mosaic_5',
    name: 'Mosaïque 5',
    category: 'collage',
    slots: [
      { x: 3, y: 3, width: 50, height: 94, type: 'photo', borderRadius: 10 },
      { x: 56, y: 3, width: 41, height: 22, type: 'photo', borderRadius: 6 },
      { x: 56, y: 27, width: 41, height: 22, type: 'photo', borderRadius: 6 },
      { x: 56, y: 51, width: 41, height: 22, type: 'photo', borderRadius: 6 },
      { x: 56, y: 75, width: 41, height: 22, type: 'photo', borderRadius: 6 },
    ],
  },
  // 11. Escalier — photos décalées en diagonale
  {
    id: 'collage_staircase',
    name: 'Escalier',
    category: 'collage',
    slots: [
      { x: 3, y: 3, width: 35, height: 30, type: 'photo', borderRadius: 8 },
      { x: 22, y: 28, width: 35, height: 30, type: 'photo', borderRadius: 8 },
      { x: 42, y: 53, width: 35, height: 30, type: 'photo', borderRadius: 8 },
    ],
  },
  // 12. Diamant — 4 photos en losange central
  {
    id: 'collage_diamond',
    name: 'Diamant',
    category: 'collage',
    slots: [
      { x: 28, y: 3, width: 44, height: 28, type: 'photo', borderRadius: 8 },
      { x: 3, y: 26, width: 44, height: 28, type: 'photo', borderRadius: 8 },
      { x: 53, y: 26, width: 44, height: 28, type: 'photo', borderRadius: 8 },
      { x: 28, y: 50, width: 44, height: 28, type: 'photo', borderRadius: 8 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// TEXTE — 12 layouts
// ═══════════════════════════════════════════════════════════════
export const TEXT_LAYOUTS: PageLayout[] = [
  // 1. Texte plein — zone de texte maximale
  {
    id: 'text_full',
    name: 'Texte plein',
    category: 'text',
    slots: [
      { x: 10, y: 10, width: 80, height: 80, type: 'text' },
    ],
  },
  // 2. Photo en haut + texte en bas
  {
    id: 'text_with_photo',
    name: 'Texte + photo',
    category: 'text',
    slots: [
      { x: 8, y: 5, width: 84, height: 50, type: 'photo', borderRadius: 8 },
      { x: 8, y: 60, width: 84, height: 35, type: 'text' },
    ],
  },
  // 3. Citation centrée — grand texte centré
  {
    id: 'text_quote',
    name: 'Citation',
    category: 'text',
    slots: [
      { x: 15, y: 25, width: 70, height: 50, type: 'text' },
    ],
  },
  // 4. Deux colonnes de texte
  {
    id: 'text_two_columns',
    name: 'Deux colonnes',
    category: 'text',
    slots: [
      { x: 5, y: 8, width: 42, height: 84, type: 'text' },
      { x: 53, y: 8, width: 42, height: 84, type: 'text' },
    ],
  },
  // 5. Titre + paragraphe
  {
    id: 'text_title_body',
    name: 'Titre + corps',
    category: 'text',
    slots: [
      { x: 10, y: 8, width: 80, height: 18, type: 'text' },
      { x: 10, y: 30, width: 80, height: 62, type: 'text' },
    ],
  },
  // 6. Photo à gauche + texte à droite
  {
    id: 'text_photo_left',
    name: 'Photo gauche + texte',
    category: 'text',
    slots: [
      { x: 4, y: 8, width: 42, height: 84, type: 'photo', borderRadius: 10 },
      { x: 52, y: 8, width: 44, height: 84, type: 'text' },
    ],
  },
  // 7. Texte à gauche + photo à droite
  {
    id: 'text_photo_right',
    name: 'Texte + photo droite',
    category: 'text',
    slots: [
      { x: 4, y: 8, width: 44, height: 84, type: 'text' },
      { x: 54, y: 8, width: 42, height: 84, type: 'photo', borderRadius: 10 },
    ],
  },
  // 8. Journal — titre + 2 colonnes
  {
    id: 'text_journal',
    name: 'Journal',
    category: 'text',
    slots: [
      { x: 8, y: 5, width: 84, height: 15, type: 'text' },
      { x: 5, y: 24, width: 42, height: 70, type: 'text' },
      { x: 53, y: 24, width: 42, height: 70, type: 'text' },
    ],
  },
  // 9. Texte en bas + photo en haut (inversé)
  {
    id: 'text_bottom_photo_top',
    name: 'Photo haut + texte bas',
    category: 'text',
    slots: [
      { x: 0, y: 0, width: 100, height: 55, type: 'photo' },
      { x: 10, y: 60, width: 80, height: 35, type: 'text' },
    ],
  },
  // 10. Bandeau photo au milieu + texte haut et bas
  {
    id: 'text_sandwich',
    name: 'Sandwich',
    category: 'text',
    slots: [
      { x: 10, y: 5, width: 80, height: 22, type: 'text' },
      { x: 4, y: 30, width: 92, height: 38, type: 'photo', borderRadius: 10 },
      { x: 10, y: 72, width: 80, height: 22, type: 'text' },
    ],
  },
  // 11. Lettre — texte avec photo portrait en coin
  {
    id: 'text_letter',
    name: 'Lettre',
    category: 'text',
    slots: [
      { x: 8, y: 5, width: 84, height: 60, type: 'text' },
      { x: 58, y: 62, width: 34, height: 34, type: 'photo', borderRadius: 12 },
    ],
  },
  // 12. Page de chapitre — gros titre + petit texte
  {
    id: 'text_chapter',
    name: 'Page chapitre',
    category: 'text',
    slots: [
      { x: 12, y: 30, width: 76, height: 20, type: 'text' },
      { x: 20, y: 55, width: 60, height: 15, type: 'text' },
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
