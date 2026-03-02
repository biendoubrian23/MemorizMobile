import { TextStyle } from 'react-native';

/**
 * Typographie Memoriz
 * Logo en style serif/cursive, contenu en sans-serif
 */
export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 42,
} as const;

export const FontWeights: Record<string, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const LineHeights = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
} as const;

export const Typography = {
  // Logo
  logo: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    fontStyle: 'italic' as const,
  },

  // Headings (Playfair Display — style "Vogue")
  h1: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: FontSizes['4xl'],
    lineHeight: FontSizes['4xl'] * LineHeights.tight,
  },
  h2: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: FontSizes['3xl'],
    lineHeight: FontSizes['3xl'] * LineHeights.tight,
  },
  h3: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: FontSizes['2xl'],
    lineHeight: FontSizes['2xl'] * LineHeights.tight,
  },
  h4: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: FontSizes.xl,
    lineHeight: FontSizes.xl * LineHeights.normal,
  },

  // Body
  bodyLarge: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.lg * LineHeights.relaxed,
  },
  body: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.md * LineHeights.relaxed,
  },
  bodySmall: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.sm * LineHeights.relaxed,
  },

  // UI
  button: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  buttonSmall: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },
  small: {
    fontSize: 10,
    fontWeight: FontWeights.regular,
    lineHeight: 10 * LineHeights.normal,
  },
  caption: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.xs * LineHeights.normal,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  tabLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
  },
} as const;
