import { create } from 'zustand';
import { PageData, PageLayout, FormatType } from '../types';
import { DEFAULT_LAYOUTS } from '../../editor/utils/layouts';
import { saveDraft, loadDraft } from '../services/draftStorage';

// ─── Debounce helper for auto-save ───
let saveTimer: ReturnType<typeof setTimeout> | null = null;
const SAVE_DELAY = 1500; // ms

function debouncedSave(state: EditorState) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    if (!state.projectId) return;
    try {
      await saveDraft(state.projectId, state.format, state.pages, state.availablePhotos);
      // Marque comme sauvegardé sans re-trigger
      useEditorStore.setState({ isSaved: true });
    } catch (e) {
      console.warn('[draftStorage] auto-save failed', e);
    }
  }, SAVE_DELAY);
}

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
  initEditor: (projectId: string, format: FormatType, existingPages?: PageData[]) => Promise<void>;
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
  loadDraftForProject: (projectId: string) => Promise<boolean>;
  saveDraftNow: () => Promise<void>;
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

  initEditor: async (projectId, format, existingPages) => {
    // 1. Si on a des pages existantes, on les utilise
    // 2. Sinon on essaie de charger un brouillon local
    // 3. Sinon on crée 24 pages vides
    let pages: PageData[];
    let photos: string[] = [];

    if (existingPages && existingPages.length > 0) {
      pages = existingPages;
    } else {
      const draft = await loadDraft(projectId);
      if (draft) {
        pages = draft.pages;
        photos = draft.availablePhotos || [];
        format = draft.metadata.format as FormatType;
      } else {
        pages = Array.from({ length: 24 }, (_, i) => createEmptyPage(i));
      }
    }

    set({
      projectId,
      format,
      pages,
      selectedPageIndex: 0,
      selectedSlotIndex: null,
      availablePhotos: photos,
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
    debouncedSave(get());
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
    debouncedSave(get());
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
    debouncedSave(get());
  },

  addPage: () => {
    set((state) => ({
      pages: [...state.pages, createEmptyPage(state.pages.length)],
      isSaved: false,
    }));
    debouncedSave(get());
  },

  removePage: (index) => {
    set((state) => ({
      pages: state.pages
        .filter((_, i) => i !== index)
        .map((p, i) => ({ ...p, pageIndex: i })),
      selectedPageIndex: Math.max(0, state.selectedPageIndex - 1),
      isSaved: false,
    }));
    debouncedSave(get());
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

  loadDraftForProject: async (projectId: string) => {
    const draft = await loadDraft(projectId);
    if (!draft) return false;
    set({
      projectId,
      format: draft.metadata.format as FormatType,
      pages: draft.pages,
      availablePhotos: draft.availablePhotos || [],
      selectedPageIndex: 0,
      selectedSlotIndex: null,
      isSaved: true,
    });
    return true;
  },

  saveDraftNow: async () => {
    const state = get();
    if (!state.projectId) return;
    await saveDraft(state.projectId, state.format, state.pages, state.availablePhotos);
    set({ isSaved: true });
  },
}));
