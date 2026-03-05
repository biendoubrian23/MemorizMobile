/**
 * Types de base de données Supabase (auto-générés à terme)
 * Pour l'instant on définit manuellement les types
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          birth_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          birth_date?: string | null;
        };
        Update: {
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          birth_date?: string | null;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          cover_image_url: string | null;
          product_type: 'album' | 'magazine';
          binding_type: 'hardcover' | 'softcover' | 'lay_flat';
          format: 'a4_portrait' | 'a4_landscape' | 'square';
          paper_type: 'standard' | 'lisse_satin' | 'doux';
          lamination: 'glossy' | 'matte' | 'soft_touch';
          color_mode: 'color' | 'black_white';
          page_count: number;
          theme_id: string | null;
          status: 'draft' | 'ordered' | 'delivered';
          pages_data: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          cover_image_url?: string | null;
          product_type: 'album' | 'magazine';
          binding_type: 'hardcover' | 'softcover' | 'lay_flat';
          format: 'a4_portrait' | 'a4_landscape' | 'square';
          paper_type?: 'standard' | 'lisse_satin' | 'doux';
          lamination?: 'glossy' | 'matte' | 'soft_touch';
          color_mode?: 'color' | 'black_white';
          page_count?: number;
          theme_id?: string | null;
          status?: 'draft' | 'ordered' | 'delivered';
          pages_data?: Record<string, unknown>;
        };
        Update: {
          title?: string;
          cover_image_url?: string | null;
          page_count?: number;
          status?: 'draft' | 'ordered' | 'delivered';
          pages_data?: Record<string, unknown>;
          theme_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          quantity: number;
          unit_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          quantity?: number;
          unit_price: number;
        };
        Update: {
          quantity?: number;
        };
        Relationships: [];
      };
      project_photos: {
        Row: {
          id: string;
          project_id: string;
          storage_path: string;
          page_index: number | null;
          slot_index: number | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          storage_path: string;
          page_index?: number | null;
          slot_index?: number | null;
          sort_order?: number;
        };
        Update: {
          page_index?: number | null;
          slot_index?: number | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          first_name: string;
          last_name: string;
          street: string;
          street2: string | null;
          postal_code: string;
          city: string;
          country: string;
          phone: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string;
          first_name: string;
          last_name: string;
          street: string;
          street2?: string | null;
          postal_code: string;
          city: string;
          country?: string;
          phone?: string | null;
          is_default?: boolean;
        };
        Update: {
          label?: string;
          first_name?: string;
          last_name?: string;
          street?: string;
          street2?: string | null;
          postal_code?: string;
          city?: string;
          country?: string;
          phone?: string | null;
          is_default?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      product_type: 'album' | 'magazine';
      binding_type: 'hardcover' | 'softcover' | 'lay_flat';
      format_type: 'a4_portrait' | 'a4_landscape' | 'square';
      paper_type: 'standard' | 'lisse_satin' | 'doux';
      lamination_type: 'glossy' | 'matte' | 'soft_touch';
      color_mode: 'color' | 'black_white';
      project_status: 'draft' | 'ordered' | 'delivered';
    };
    CompositeTypes: Record<string, never>;
  };
}
