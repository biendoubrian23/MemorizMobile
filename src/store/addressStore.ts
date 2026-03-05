import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Address, AddressInsert, AddressUpdate } from '../types';

interface AddressState {
  addresses: Address[];
  isLoading: boolean;

  fetchAddresses: () => Promise<void>;
  addAddress: (address: Omit<AddressInsert, 'user_id'>) => Promise<Address>;
  updateAddress: (id: string, data: AddressUpdate) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  isLoading: false,

  fetchAddresses: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ addresses: (data as Address[]) || [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addAddress: async (addressData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non connecté');

    // Si c'est la première adresse ou marquée par défaut, unset les autres
    if (addressData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...addressData, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    const addr = data as Address;

    // Si c'est la première adresse, la rendre par défaut
    const current = get().addresses;
    if (current.length === 0 && !addr.is_default) {
      await supabase.from('addresses').update({ is_default: true }).eq('id', addr.id);
      addr.is_default = true;
    }

    set({ addresses: [addr, ...current] });
    return addr;
  },

  updateAddress: async (id, data) => {
    if (data.is_default) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }
    }

    const { error } = await supabase
      .from('addresses')
      .update(data)
      .eq('id', id);

    if (error) throw error;

    set({
      addresses: get().addresses.map((a) => {
        if (a.id === id) return { ...a, ...data };
        if (data.is_default) return { ...a, is_default: false };
        return a;
      }),
    });
  },

  deleteAddress: async (id) => {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    set({ addresses: get().addresses.filter((a) => a.id !== id) });
  },

  setDefault: async (id) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);

    await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id);

    set({
      addresses: get().addresses.map((a) => ({
        ...a,
        is_default: a.id === id,
      })),
    });
  },
}));
