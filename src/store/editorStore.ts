import { create } from 'zustand';
import { PageData, PageLayout, FormatType, PageElement, PageSlotData } from '../types';
import { DEFAULT_LAYOUTS } from '../../editor/utils/layouts';
import { saveDraft, loadDraft } from '../services/draftStorage';

// ─── Debounce helper for auto-save ───
let saveTimer: ReturnType<typeof setTimeout> | null = null;
const SAVE_DELAY = 1500;

function debouncedSave(state: EditorState) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    if (!state.projectId) return;
    try {
      await saveDraft(state.projectId, state.format, state.pages, state.availablePhotos);
      useEditorStore.setState({ isSaved: true });
    } catch (e) {
      console.warn('[draftStorage] auto-save failed', e);
    }
  }, SAVE_DELAY);
}

// ─── Generate unique element ID ───
function generateId(): string {
  return `el_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

interface EditorState {
  projectId: string | null;
  format: FormatType;
  pages: PageData[];
  selectedPageIndex: number;
  selectedSlotIndex: number | null;
  selectedElementId: string | null;
  availablePhotos: string[];
  isLoading: boolean;
  isSaved: boolean;

  // Undo / Redo
  history: PageData[][];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  // Actions - Navigation
  initEditor: (projectId: string, format: FormatType, existingPages?: PageData[], coverImageUri?: string) => Promise<void>;
  setSelectedPage: (index: number) => void;
  setSelectedSlot: (index: number | null) => void;
  setSelectedElementId: (id: string | null) => void;

  // Actions - Layout & Slots
  updatePageLayout: (pageIndex: number, layout: PageLayout) => void;
  updateSlotPhoto: (pageIndex: number, slotIndex: number, photoUri: string) => void;
  updateSlotText: (pageIndex: number, slotIndex: number, text: string, skipHistory?: boolean) => void;
  updateSlotTextStyle: (pageIndex: number, slotIndex: number, style: Partial<PageSlotData>, skipHistory?: boolean) => void;
  addTextSlotToPage: (pageIndex: number, preset: import('../types').TextStylePreset) => void;

  // Actions - Free Elements (layers)
  addElement: (pageIndex: number, partial: Partial<PageElement> & { type: PageElement['type'] }) => string;
  updateElement: (pageIndex: number, elementId: string, updates: Partial<PageElement>, skipHistory?: boolean) => void;
  removeElement: (pageIndex: number, elementId: string) => void;
  duplicateElement: (pageIndex: number, elementId: string) => void;
  bringForward: (pageIndex: number, elementId: string) => void;
  sendBackward: (pageIndex: number, elementId: string) => void;

  // Actions - Pages
  addPage: () => void;
  removePage: (index: number) => void;

  // Actions - Photos
  setAvailablePhotos: (photos: string[]) => void;
  addAvailablePhoto: (uri: string) => void;

  // Actions - Persistence
  markSaved: () => void;
  markUnsaved: () => void;
  resetEditor: () => void;
  loadDraftForProject: (projectId: string) => Promise<boolean>;
  saveDraftNow: () => Promise<void>;

  // Actions - Undo / Redo
  undo: () => void;
  redo: () => void;
}

const createEmptyPage = (pageIndex: number): PageData => ({
  pageIndex,
  layoutId: 'single_full',
  slots: [{ slotIndex: 0, type: 'photo' }],
  elements: [],
});

// ─── Ensure backward compat for drafts without elements ───
function ensureElements(page: PageData): PageData {
  if (!page.elements) return { ...page, elements: [] };
  return page;
}

const MAX_HISTORY = 50;

// Deep-clone pages array for history snapshots
function clonePages(pages: PageData[]): PageData[] {
  return JSON.parse(JSON.stringify(pages));
}

// Push current pages onto history stack (call BEFORE mutating)
function pushHistory(state: EditorState): Partial<EditorState> {
  const snapshot = clonePages(state.pages);
  // Truncate any redo-forward entries
  const history = state.history.slice(0, state.historyIndex + 1);
  history.push(snapshot);
  // Trim oldest if over limit
  if (history.length > MAX_HISTORY) history.shift();
  return {
    history,
    historyIndex: history.length - 1,
    canUndo: true,
    canRedo: false,
  };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  projectId: null,
  format: 'square',
  pages: [],
  selectedPageIndex: 0,
  selectedSlotIndex: null,
  selectedElementId: null,
  availablePhotos: [],
  isLoading: false,
  isSaved: true,

  // Undo / Redo initial state
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,

  // ═══ Initialization ═══
  initEditor: async (projectId, format, existingPages, coverImageUri) => {
    let pages: PageData[];
    let photos: string[] = [];

    if (existingPages && existingPages.length > 0) {
      pages = existingPages.map(ensureElements);
    } else {
      const draft = await loadDraft(projectId);
      if (draft) {
        pages = draft.pages.map(ensureElements);
        photos = draft.availablePhotos || [];
        format = draft.metadata.format as FormatType;
      } else {
        pages = Array.from({ length: 24 }, (_, i) => createEmptyPage(i));
      }
    }

    if (coverImageUri && pages.length > 0) {
      const coverPage = { ...pages[0] };
      const slots = [...coverPage.slots];
      if (slots.length > 0) {
        slots[0] = { ...slots[0], photoUri: coverImageUri };
      }
      coverPage.slots = slots;
      pages[0] = coverPage;
    }

    set({
      projectId,
      format,
      pages,
      selectedPageIndex: 0,
      selectedSlotIndex: null,
      selectedElementId: null,
      availablePhotos: photos,
      isSaved: true,
      // Reset history on new project
      history: [clonePages(pages)],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
    });
  },

  // ═══ Navigation ═══
  setSelectedPage: (index) => set({ selectedPageIndex: index, selectedSlotIndex: null, selectedElementId: null }),
  setSelectedSlot: (index) => set({ selectedSlotIndex: index, selectedElementId: null }),
  setSelectedElementId: (id) => set({ selectedElementId: id, selectedSlotIndex: null }),

  // ═══ Layout & Slots ═══
  updatePageLayout: (pageIndex, layout) => {
    set((state) => {
      const histUp = pushHistory(state);
      const pages = [...state.pages];
      const page = { ...pages[pageIndex] };
      page.layoutId = layout.id;
      page.slots = layout.slots.map((slot, i) => ({
        slotIndex: i,
        type: slot.type,
        photoUri: page.slots[i]?.photoUri,
        text: page.slots[i]?.text,
      }));
      // Preserve free elements
      page.elements = [...(page.elements || [])];
      pages[pageIndex] = page;
      return { ...histUp, pages, isSaved: false };
    });
    debouncedSave(get());
  },

  updateSlotPhoto: (pageIndex, slotIndex, photoUri) => {
    set((state) => {
      const histUp = pushHistory(state);
      const pages = [...state.pages];
      const page = { ...pages[pageIndex] };
      const slots = [...page.slots];
      slots[slotIndex] = { ...slots[slotIndex], photoUri };
      page.slots = slots;
      pages[pageIndex] = page;
      return { ...histUp, pages, isSaved: false };
    });
    debouncedSave(get());
  },

  updateSlotText: (pageIndex, slotIndex, text, skipHistory) => {
    set((state) => {
      const histUp = skipHistory ? {} : pushHistory(state);
      const pages = [...state.pages];
      const page = { ...pages[pageIndex] };
      const slots = [...page.slots];
      slots[slotIndex] = { ...slots[slotIndex], text };
      page.slots = slots;
      pages[pageIndex] = page;
      return { ...histUp, pages, isSaved: false };
    });
    debouncedSave(get());
  },

  updateSlotTextStyle: (pageIndex, slotIndex, style, skipHistory) => {
    set((state) => {
      const histUp = skipHistory ? {} : pushHistory(state);
      const pages = [...state.pages];
      const page = { ...pages[pageIndex] };
      const slots = [...page.slots];
      slots[slotIndex] = { ...slots[slotIndex], ...style };
      page.slots = slots;
      pages[pageIndex] = page;
      return { ...histUp, pages, isSaved: false };
    });
    debouncedSave(get());
  },

  addTextSlotToPage: (pageIndex, preset) => {
    set((state) => {
      const histUp = pushHistory(state);
      const pages = [...state.pages];
      const page = { ...pages[pageIndex] };
      const slots = [...page.slots];
      const newSlot: PageSlotData = {
        slotIndex: slots.length,
        type: 'text',
        text: '',
        fontSize: preset.fontSize,
        fontFamily: preset.fontFamily,
        fontWeight: preset.fontWeight,
        fontStyle: preset.fontStyle,
        color: preset.color,
        textAlign: 'center',
        textStylePreset: preset.id,
      };
      slots.push(newSlot);
      page.slots = slots;
      pages[pageIndex] = page;
      return { ...histUp, pages, isSaved: false };
    });
    debouncedSave(get());
  },

  // ═══ Free Elements (Layers) ═══
  addElement: (pageIndex, partial) => {
    const id = generateId();
    const state = get();
    const page = state.pages[pageIndex];
    const maxZ = (page?.elements || []).reduce((max, el) => Math.max(max, el.zIndex), 0);

    set((s) => {
      const histUp = pushHistory(s);
      const pages = [...s.pages];
      const p = { ...pages[pageIndex] };
      const newElement: PageElement = {
        id,
        type: partial.type,
        x: partial.x ?? 15,
        y: partial.y ?? 25,
        width: partial.width ?? 70,
        height: partial.height ?? 20,
        rotation: partial.rotation ?? 0,
        zIndex: maxZ + 1,
        opacity: partial.opacity ?? 1,
        locked: partial.locked ?? false,
        ...(partial as any),
      };
      // Override id to ensure it's the generated one
      newElement.id = id;
      p.elements = [...(p.elements || []), newElement];
      pages[pageIndex] = p;
      return { ...histUp, pages, isSaved: false, selectedElementId: id };
    });
    debouncedSave(get());
    return id;
  },

  updateElement: (pageIndex, elementId, updates, skipHistory) => {
    set((state) => {
      const histUp = skipHistory ? {} : pushHistory(state);
      const pages = [...state.pages];
      const page = { ...pages[pageIndex] };
      page.elements = (page.elements || []).map((el) =>
        el.id === elementId ? { ...el, ...updates } : el
      );
      pages[pageIndex] = page;
      return { ...histUp, pages, isSaved: false };
    });
    debouncedSave(get());
  },

  removeElement: (pageIndex, elementId) => {
    set((state) => {
      const histUp = pushHistory(state);
      const pages = [...state.pages];
      const page = { ...pages[pageIndex] };
      page.elements = (page.elements || []).filter((el) => el.id !== elementId);
      pages[pageIndex] = page;
      return { ...histUp, pages, isSaved: false, selectedElementId: null };
    });
    debouncedSave(get());
  },

  duplicateElement: (pageIndex, elementId) => {
    const state = get();
    const page = state.pages[pageIndex];
    const original = page?.elements?.find((el) => el.id === elementId);
    if (!original) return;

    const id = generateId();
    const maxZ = (page.elements || []).reduce((max, el) => Math.max(max, el.zIndex), 0);

    set((s) => {
      const histUp = pushHistory(s);
      const pages = [...s.pages];
      const p = { ...pages[pageIndex] };
      const duplicate: PageElement = {
        ...original,
        id,
        x: Math.min(original.x + 5, 90),
        y: Math.min(original.y + 5, 90),
        zIndex: maxZ + 1,
        locked: false,
      };
      p.elements = [...(p.elements || []), duplicate];
      pages[pageIndex] = p;
      return { ...histUp, pages, isSaved: false, selectedElementId: id };
    });
    debouncedSave(get());
  },

  bringForward: (pageIndex, elementId) => {
    set((state) => {
      const histUp = pushHistory(state);
      const pages = [...state.pages];
      const page = { ...pages[pageIndex] };
      const elements = [...(page.elements || [])];
      const idx = elements.findIndex((el) => el.id === elementId);
      if (idx < 0) return state;
      const maxZ = elements.reduce((max, el) => Math.max(max, el.zIndex), 0);
      elements[idx] = { ...elements[idx], zIndex: maxZ + 1 };
      page.elements = elements;
      pages[pageIndex] = page;
      return { ...histUp, pages, isSaved: false };
    });
    debouncedSave(get());
  },

  sendBackward: (pageIndex, elementId) => {
    set((state) => {
      const histUp = pushHistory(state);
      const pages = [...state.pages];
      const page = { ...pages[pageIndex] };
      const elements = [...(page.elements || [])];
      const idx = elements.findIndex((el) => el.id === elementId);
      if (idx < 0) return state;
      const minZ = elements.reduce((min, el) => Math.min(min, el.zIndex), Infinity);
      elements[idx] = { ...elements[idx], zIndex: Math.max(0, minZ - 1) };
      page.elements = elements;
      pages[pageIndex] = page;
      return { ...histUp, pages, isSaved: false };
    });
    debouncedSave(get());
  },

  // ═══ Pages ═══
  addPage: () => {
    set((state) => {
      const histUp = pushHistory(state);
      return {
        ...histUp,
        pages: [...state.pages, createEmptyPage(state.pages.length)],
        isSaved: false,
      };
    });
    debouncedSave(get());
  },

  removePage: (index) => {
    set((state) => {
      const histUp = pushHistory(state);
      return {
        ...histUp,
        pages: state.pages
          .filter((_, i) => i !== index)
          .map((p, i) => ({ ...p, pageIndex: i })),
        selectedPageIndex: Math.max(0, state.selectedPageIndex - 1),
        isSaved: false,
      };
    });
    debouncedSave(get());
  },

  // ═══ Photos ═══
  setAvailablePhotos: (photos) => set({ availablePhotos: photos }),
  addAvailablePhoto: (uri) =>
    set((state) => ({ availablePhotos: [uri, ...state.availablePhotos] })),

  // ═══ Persistence ═══
  markSaved: () => set({ isSaved: true }),
  markUnsaved: () => set({ isSaved: false }),
  resetEditor: () =>
    set({
      projectId: null,
      pages: [],
      selectedPageIndex: 0,
      selectedSlotIndex: null,
      selectedElementId: null,
      availablePhotos: [],
      isSaved: true,
      history: [],
      historyIndex: -1,
      canUndo: false,
      canRedo: false,
    }),

  loadDraftForProject: async (projectId: string) => {
    const draft = await loadDraft(projectId);
    if (!draft) return false;
    const pages = draft.pages.map(ensureElements);
    set({
      projectId,
      format: draft.metadata.format as FormatType,
      pages,
      availablePhotos: draft.availablePhotos || [],
      selectedPageIndex: 0,
      selectedSlotIndex: null,
      selectedElementId: null,
      isSaved: true,
      history: [clonePages(pages)],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
    });
    return true;
  },

  saveDraftNow: async () => {
    const state = get();
    if (!state.projectId) return;
    await saveDraft(state.projectId, state.format, state.pages, state.availablePhotos);
    set({ isSaved: true });
  },

  // ═══ Undo / Redo ═══
  undo: () => {
    const state = get();
    if (state.historyIndex <= 0) return;
    const newIndex = state.historyIndex - 1;
    const restoredPages = clonePages(state.history[newIndex]);
    set({
      pages: restoredPages,
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: true,
      isSaved: false,
      selectedSlotIndex: null,
      selectedElementId: null,
    });
    debouncedSave(get());
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;
    const newIndex = state.historyIndex + 1;
    const restoredPages = clonePages(state.history[newIndex]);
    set({
      pages: restoredPages,
      historyIndex: newIndex,
      canUndo: true,
      canRedo: newIndex < state.history.length - 1,
      isSaved: false,
      selectedSlotIndex: null,
      selectedElementId: null,
    });
    debouncedSave(get());
  },
}));
