import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { CartItemWithProject } from '../types';

interface CartState {
  items: CartItemWithProject[];
  promoCode: string;
  promoDiscount: number;
  isLoading: boolean;

  // Actions
  fetchCart: (userId: string) => Promise<void>;
  addToCart: (userId: string, projectId: string, unitPrice: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyPromoCode: (code: string) => Promise<void>;
  clearCart: (userId: string) => Promise<void>;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  promoCode: '',
  promoDiscount: 0,
  isLoading: false,

  fetchCart: async (userId) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, project:projects(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Transformer les résultats
      const items: CartItemWithProject[] = (data ?? []).map((item: any) => ({
        ...item,
        project: item.project,
      }));
      set({ items });
    } catch (error) {
      console.error('Fetch cart error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (userId, projectId, unitPrice) => {
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: userId,
        project_id: projectId,
        unit_price: unitPrice,
        quantity: 1,
      })
      .select('*, project:projects(*)')
      .single();

    if (error) throw error;
    const item = data as unknown as CartItemWithProject;
    set((state) => ({
      items: [item, ...state.items],
    }));
  },

  updateQuantity: async (itemId, quantity) => {
    if (quantity < 1) return;
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (error) throw error;
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    }));
  },

  removeItem: async (itemId) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));
  },

  applyPromoCode: async (code) => {
    // TODO: Vérifier le code promo côté serveur
    // Pour l'instant on simule
    if (code.toUpperCase() === 'MEMORIZ10') {
      set({ promoCode: code, promoDiscount: 10 });
    } else {
      throw new Error('Code promo invalide');
    }
  },

  clearCart: async (userId) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    set({ items: [], promoCode: '', promoDiscount: 0 });
  },

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().promoDiscount;
    return Math.max(0, subtotal - discount);
  },
}));
