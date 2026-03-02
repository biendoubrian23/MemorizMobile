import { create } from 'zustand';
import { PageData, PageLayout, FormatType } from '../types';
import { DEFAULT_LAYOUTS } from '../../editor/utils/layouts';

interface EditorState {
  projectId: string | null;
  format: FormatType;
  pages: PageData[];
  selectedPageIndex: number;
  selectedSlotIndex: number | null;
  availablePhotos: string[]; // URIs des photos locales
  isLoading: boolean;
  isSaved: boolean;

  // Actions
  initEditor: (projectId: string, format: FormatType, existingPages?: PageData[]) => void;
  setSelectedPage: (index: number) => void;
  setSelectedSlot: (index: number | null) => void;
  updatePageLayout: (pageIndex: number, layout: PageLayout) => void;
  updateSlotPhoto: (pageIndex: number, slotIndex: number, photoUri: string) => void;
  updateSlotText: (pageIndex: number, slotIndex: number, text: string) => void;
  addPage: () => void;
  removePage: (index: number) => void;
  setAvailablePhotos: (photos: string[]) => void;
  addAvailablePhoto: (uri: string) => void;
  markSaved: () => void;
  markUnsaved: () => void;
  resetEditor: () => void;
}

const createEmptyPage = (pageIndex: number): PageData => ({
  pageIndex,
  layoutId: 'single_full',
  slots: [
    { slotIndex: 0, type: 'photo' },
  ],
});

export const useEditorStore = create<EditorState>((set, get) => ({
  projectId: null,
  format: 'square',
  pages: [],
  selectedPageIndex: 0,
  selectedSlotIndex: null,
  availablePhotos: [],
  isLoading: false,
  isSaved: true,

  initEditor: (projectId, format, existingPages) => {
    const pages = existingPages && existingPages.length > 0
      ? existingPages
      : Array.from({ length: 24 }, (_, i) => createEmptyPage(i));
    set({
      projectId,
      format,
      pages,
      selectedPageIndex: 0,
      selectedSlotIndex: null,
      isSaved: true,
    });
  },

  setSelectedPage: (index) => set({ selectedPageIndex: index, selectedSlotIndex: null }),
  setSelectedSlot: (index) => set({ selectedSlotIndex: index }),

  updatePageLayout: (pageIndex, layout) => {
    set((state) => {
      const pages = [...state.pages];
      const page = { ...pages[pageIndex] };
      page.layoutId = layout.id;
      page.slots = layout.slots.map((slot, i) => ({
        slotIndex: i,
        type: slot.type,
        photoUri: page.slots[i]?.photoUri,
        text: page.slots[i]?.text,
      }));
      pages[pageIndex] = page;
      return { pages, isSaved: false };
    });
  },

  updateSlotPhoto: (pageIndex, slotIndex, photoUri) => {
    set((state) => {
      const pages = [...state.pages];
      const page = { ...pages[pageIndex] };
      const slots = [...page.slots];
      slots[slotIndex] = { ...slots[slotIndex], photoUri };
      page.slots = slots;
      pages[pageIndex] = page;
      return { pages, isSaved: false };
    });
  },

  updateSlotText: (pageIndex, slotIndex, text) => {
    set((state) => {
      const pages = [...state.pages];
      const page = { ...pages[pageIndex] };
      const slots = [...page.slots];
      slots[slotIndex] = { ...slots[slotIndex], text };
      page.slots = slots;
      pages[pageIndex] = page;
      return { pages, isSaved: false };
    });
  },

  addPage: () => {
    set((state) => ({
      pages: [...state.pages, createEmptyPage(state.pages.length)],
      isSaved: false,
    }));
  },

  removePage: (index) => {
    set((state) => ({
      pages: state.pages
        .filter((_, i) => i !== index)
        .map((p, i) => ({ ...p, pageIndex: i })),
      selectedPageIndex: Math.max(0, state.selectedPageIndex - 1),
      isSaved: false,
    }));
  },

  setAvailablePhotos: (photos) => set({ availablePhotos: photos }),
  addAvailablePhoto: (uri) =>
    set((state) => ({ availablePhotos: [uri, ...state.availablePhotos] })),

  markSaved: () => set({ isSaved: true }),
  markUnsaved: () => set({ isSaved: false }),
  resetEditor: () =>
    set({
      projectId: null,
      pages: [],
      selectedPageIndex: 0,
      selectedSlotIndex: null,
      availablePhotos: [],
      isSaved: true,
    }),
}));
