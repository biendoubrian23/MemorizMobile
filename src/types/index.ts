import { Database } from './database';

// ═══ Auth ═══
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
  birthDate?: string;
}

// ═══ Profile ═══
export type Profile = Database['public']['Tables']['profiles']['Row'];

// ═══ Project ═══
export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export type ProductType = 'album' | 'magazine';
export type BindingType = 'hardcover' | 'softcover' | 'lay_flat';
export type FormatType = 'a4_portrait' | 'a4_landscape' | 'square';
export type PaperType = 'standard' | 'lisse_satin' | 'doux';
export type LaminationType = 'glossy' | 'matte' | 'soft_touch';
export type ColorMode = 'color' | 'black_white';
export type ProjectStatus = 'draft' | 'ordered' | 'delivered';

// ═══ Cart ═══
export type CartItem = Database['public']['Tables']['cart_items']['Row'];

export interface CartItemWithProject extends CartItem {
  project: Project;
}

// ═══ Addresses ═══
export type Address = Database['public']['Tables']['addresses']['Row'];
export type AddressInsert = Database['public']['Tables']['addresses']['Insert'];
export type AddressUpdate = Database['public']['Tables']['addresses']['Update'];

// ═══ Editor ═══
export type ProjectPhoto = Database['public']['Tables']['project_photos']['Row'];

export interface PageLayout {
  id: string;
  name: string;
  slots: LayoutSlot[];
  category: 'single' | 'double' | 'collage' | 'text';
}

export interface LayoutSlot {
  x: number; // % from left
  y: number; // % from top
  width: number; // %
  height: number; // %
  type: 'photo' | 'text';
  rotation?: number;
  borderRadius?: number;
}

export interface PageData {
  pageIndex: number;
  layoutId: string;
  slots: PageSlotData[];
  elements: PageElement[];
}

export interface PageSlotData {
  slotIndex: number;
  type: 'photo' | 'text';
  photoUri?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecorationLine?: 'none' | 'underline' | 'line-through' | 'underline line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  color?: string;
  textStylePreset?: string; // id du preset utilisé
  // Image fitting within layout slot
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
}

// ═══ Free-form element on a page ═══
export interface PageElement {
  id: string;
  type: 'text' | 'image';
  // Position & size (% of page dimensions, 0-100)
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  opacity: number;
  locked: boolean;
  // Image-specific
  imageUri?: string;
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  borderRadius?: number;
  // Text-specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecorationLine?: 'none' | 'underline' | 'line-through' | 'underline line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  lineHeight?: number;
  letterSpacing?: number;
}

// Preset de style de texte pour le panneau
export interface TextStylePreset {
  id: string;
  label: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  color: string;
}

// ═══ Theme ═══
export interface EditorTheme {
  id: string;
  name: string;
  backgroundColors: string[];
  accentColor: string;
  fontFamily: string;
}

// ═══ Navigation ═══
export type ProjectFilter = 'all' | 'in_progress' | 'ordered';
