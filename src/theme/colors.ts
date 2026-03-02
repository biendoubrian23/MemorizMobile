/**
 * Palette de couleurs Memoriz
 * Inspirée des maquettes : tons navy, rose/corail, et blancs
 */
export const Colors = {
  // Primaires
  primary: '#1B2541',        // Navy foncé - boutons principaux, titres
  primaryLight: '#2D3A5C',   // Navy clair
  primaryDark: '#0F1729',    // Navy très foncé

  // Accent
  accent: '#E8385D',         // Rose/corail - CTAs, liens, badges
  accentLight: '#FF6B8A',    // Rose clair
  accentSoft: '#FFF0F3',     // Rose très léger (backgrounds)

  // Texte
  textPrimary: '#1B2541',    // Texte principal
  textSecondary: '#6B7280',  // Texte secondaire / placeholders
  textTertiary: '#9CA3AF',   // Texte tertiaire
  textWhite: '#FFFFFF',      // Texte sur fond sombre
  textLink: '#E8385D',       // Liens

  // Backgrounds
  background: '#FFFFFF',     // Fond principal
  backgroundSecondary: '#F5F5F5', // Fond secondaire (settings, etc.)
  backgroundSoft: '#F9FAFB', // Fond légèrement gris
  backgroundCard: '#FFFFFF', // Fond cartes
  backgroundGradientStart: '#FDE8EC', // Gradient rose
  backgroundGradientEnd: '#E8F4FD',   // Gradient bleu

  // Borders & Dividers
  border: '#E5E7EB',         // Bordure standard
  borderLight: '#F3F4F6',    // Bordure légère
  borderBlue: '#DBEAFE',     // Bordure bleue (cartes)
  divider: '#F3F4F6',        // Séparateur

  // Status
  success: '#10B981',        // Vert validation
  warning: '#F59E0B',        // Orange warning
  error: '#EF4444',          // Rouge erreur
  info: '#3B82F6',           // Bleu info

  // Tags / Badges
  badgeDraft: '#FEF3C7',     // Jaune brouillon
  badgeDraftText: '#D97706',
  badgeOrdered: '#D1FAE5',   // Vert commandé
  badgeOrderedText: '#059669',
  badgePopular: '#E8385D',   // Badge populaire

  // Ombres
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowMedium: 'rgba(0, 0, 0, 0.12)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Ratings
  starFilled: '#F59E0B',
  starEmpty: '#D1D5DB',

  // Transparent
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorKey = keyof typeof Colors;
