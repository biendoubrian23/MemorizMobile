import { Database } from './database';

// ═══ Auth ═══
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

// ═══ Profile ═══
export type Profile = Database['public']['Tables']['profiles']['Row'];

// ═══ Project ═══
export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export type ProductType = 'album' | 'magazine' | 'wall_deco';
export type BindingType = 'hardcover' | 'softcover' | 'lay_flat';
export type FormatType = 'a4_portrait' | 'a4_landscape' | 'square';
export type PaperType = 'standard' | 'cream_satin';
export type LaminationType = 'glossy' | 'matte' | 'soft_touch';
export type ColorMode = 'color' | 'black_white';
export type ProjectStatus = 'draft' | 'ordered' | 'delivered';

// ═══ Cart ═══
export type CartItem = Database['public']['Tables']['cart_items']['Row'];

export interface CartItemWithProject extends CartItem {
  project: Project;
}

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
}

export interface PageSlotData {
  slotIndex: number;
  type: 'photo' | 'text';
  photoUri?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
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
