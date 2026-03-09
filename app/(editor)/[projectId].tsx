import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  FlatList,
  TextInput,
  Keyboard,
  Pressable,
  ScrollView,
  BackHandler,
  PanResponder,
  GestureResponderEvent,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/theme';
import { useEditorStore } from '../../src/store/editorStore';
import { useCartStore } from '../../src/store/cartStore';
import { useAuthStore } from '../../src/store/authStore';
import { useProjectStore } from '../../src/store/projectStore';
import { calculateUnitPrice } from '../../src/utils/pricing';
import { DEFAULT_LAYOUTS } from '../../editor/utils/layouts';
import PhotoToolsSheet from './components/PhotoToolsSheet';
import LayoutToolsSheet from './components/LayoutToolsSheet';
import TemplateSelectorSheet, { ALBUM_TEMPLATES, MAGAZINE_TEMPLATES } from './components/TemplateSelectorSheet';
import InteriorTemplateSelectorSheet, { INTERIOR_ALBUM_TEMPLATES, INTERIOR_MAGAZINE_TEMPLATES } from './components/InteriorTemplateSelectorSheet';
import { LinearGradient } from 'expo-linear-gradient';
import TextStylesSheet, { TEXT_STYLE_PRESETS } from './components/TextStylesSheet';
import TextFormattingToolbar from './components/TextFormattingToolbar';
import DraggableElement from './components/DraggableElement';
import FilteredImage from './components/FilteredImage';
import { PageLayout, TextStylePreset, PageSlotData, PageElement } from '../../src/types';

// Placeholder image for empty photo slots
const GRID_PLACEHOLDER = require('../../assets/images/grid-placeholder.png');

// French month names for achevé d'imprimer
const FRENCH_MONTHS = [
  'janvier', 'f\u00e9vrier', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'ao\u00fbt', 'septembre', 'octobre', 'novembre', 'd\u00e9cembre',
];
function getAcheveDate(): string {
  const now = new Date();
  return `${FRENCH_MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.55;
const SPREAD_WIDTH = SCREEN_WIDTH - Spacing.xl * 2;
const PAGE_WIDTH_BASE = SPREAD_WIDTH / 2;

const FORMAT_ASPECTS: Record<string, number> = {
  a4_portrait: 29.7 / 21,
  a4_landscape: 21 / 29.7,
  square: 1,
};

type ToolbarTab = 'layout' | 'photos' | 'text' | 'templates' | 'interiors';

// ═══════════════════════════════════════════════
//  Editor Screen
// ═══════════════════════════════════════════════
export default function EditorScreen() {
  const { projectId, format: formatParam } = useLocalSearchParams<{
    projectId: string;
    format?: string;
  }>();

  const {
    pages,
    selectedPageIndex,
    selectedElementId,
    isSaved,
    format: storeFormat,
    setSelectedPage,
    setZoomLevel: storeSetZoomLevel,
    setSelectedSlot,
    setSelectedElementId,
    updateSlotPhoto,
    updateSlotText,
    updateSlotTextStyle,
    updatePageLayout,
    updatePageStyle,
    addElement,
    updateElement,
    removeElement,
    duplicateElement,
    bringForward,
    sendBackward,
    initEditor,
    saveDraftNow,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorStore();
  const removePagePair = useEditorStore((s) => s.removePagePair);
  const addPage = useEditorStore((s) => s.addPage);
  const toggleSpreadImage = useEditorStore((s) => s.toggleSpreadImage);

  const { user } = useAuthStore();
  const { currentProject, setCurrentProject, projects } = useProjectStore();
  const { addToCart } = useCartStore();

  // Charger le projet courant depuis le store quand on ouvre l'\u00e9diteur
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const found = projects.find((p) => p.id === projectId);
      if (found) setCurrentProject(found);
    }
  }, [projectId, projects.length]);

  // ── Dimensions ──
  const currentFormat = storeFormat || formatParam || 'square';
  const PAGE_ASPECT = FORMAT_ASPECTS[currentFormat] || 1;
  const PAGE_HEIGHT = PAGE_WIDTH_BASE * PAGE_ASPECT;

  // ── Binding type → spine (tranche) visibility ──
  const bindingType = currentProject?.binding_type ?? 'hardcover';
  const hasSpine = bindingType === 'hardcover' || bindingType === 'softcover';
  // Spine width proportional to page count (≈8px for 24 pages, grows with more pages)
  const spineWidth = hasSpine ? Math.max(8, Math.round((pages.length / 24) * 12)) : 0;
  const PAGE_WIDTH = PAGE_WIDTH_BASE;

  // ── UI state ──
  const [activeSheet, setActiveSheet] = useState<ToolbarTab | null>(null);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | null>(null);
  const [isStackedView, setIsStackedView] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showPageHighlight, setShowPageHighlight] = useState(true);

  // Read zoom from store (persisted)
  const zoomLevel = useEditorStore((s) => s.zoomLevel);
  const setZoomLevel = (z: number) => storeSetZoomLevel(z);

  // ── Zoom track drag ──
  const zoomTrackRef = useRef<View>(null);
  const zoomTrackWidth = useRef(120);
  const zoomTrackPageX = useRef(0);

  const zoomPanResponder = useMemo(() => {
    const clampZoom = (pageX: number) => {
      const x = pageX - zoomTrackPageX.current;
      const ratio = Math.max(0, Math.min(1, x / zoomTrackWidth.current));
      return +(0.5 + ratio * 2).toFixed(2); // 0.5 → 2.5
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        // Re-measure position on grant (most reliable moment)
        zoomTrackRef.current?.measureInWindow((x) => {
          if (x != null) zoomTrackPageX.current = x;
        });
        setZoomLevel(clampZoom(e.nativeEvent.pageX));
      },
      onPanResponderMove: (e) => {
        setZoomLevel(clampZoom(e.nativeEvent.pageX));
      },
    });
  }, []);

  // Track whether photo picker was opened for a specific slot or "free"
  const [photoTargetSlot, setPhotoTargetSlot] = useState<{
    pageIdx: number;
    slotIdx: number;
  } | null>(null);
  const [photoInitialTab, setPhotoInitialTab] = useState<'pellicule' | 'recadrage'>('pellicule');

  // ── Text editing (works for both slots & free elements) ──
  const [isEditingText, setIsEditingText] = useState(false);
  const [editingPageIndex, setEditingPageIndex] = useState<number | null>(null);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [textStyle, setTextStyle] = useState({
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: 'normal' as 'normal' | 'bold',
    fontStyle: 'normal' as 'normal' | 'italic',
    textDecorationLine: 'none' as
      | 'none'
      | 'underline'
      | 'line-through'
      | 'underline line-through',
    textTransform: 'none' as 'none' | 'uppercase' | 'lowercase' | 'capitalize',
    textAlign: 'center' as 'left' | 'center' | 'right',
    color: '#1B2541',
  });
  const textInputRef = useRef<TextInput>(null);

  // ── Keyboard listener ──
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // ── Android back button handler ──
  useEffect(() => {
    const onBackPress = () => {
      if (isEditingText) {
        handleValidateText();
        return true;
      }
      if (activeSheet) {
        setActiveSheet(null);
        setPhotoTargetSlot(null);
        return true;
      }
      if (selectedElementId) {
        setSelectedElementId(null);
        return true;
      }
      return false; // Let default back navigation happen
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isEditingText, activeSheet, selectedElementId]);

  // ── Init ── Toujours réinitialiser quand le projectId change
  useEffect(() => {
    if (projectId) {
      initEditor(projectId, (formatParam as any) || 'square');
    }
    // Sauvegarder et nettoyer quand on quitte l'éditeur
    return () => {
      const state = useEditorStore.getState();
      if (state.projectId) {
        state.saveDraftNow().catch(() => {});
      }
    };
  }, [projectId]);

  // ═══════════════ Spread / pagination ═══════════════
  const backCoverIndex = pages.length - 1;
  const isCoverView = selectedPageIndex === 0 || selectedPageIndex === backCoverIndex;
  const getSpreadStart = () => {
    if (isCoverView) return 0;
    return selectedPageIndex % 2 === 1 ? selectedPageIndex : selectedPageIndex - 1;
  };
  const actualSpreadStart = getSpreadStart();
  const leftPage = isCoverView ? pages[0] : pages[actualSpreadStart];
  const rightPage = isCoverView ? pages[backCoverIndex] : pages[actualSpreadStart + 1];
  const canGoBack = !isCoverView; // From any interior spread, can always go back
  const canGoForward = isCoverView
    ? pages.length > 2 // There exist interior pages
    : actualSpreadStart + 2 < backCoverIndex; // More interior pages before back cover

  const navigateSpread = (dir: 'prev' | 'next') => {
    if (dir === 'prev') {
      // Go to previous interior spread, or to covers
      if (actualSpreadStart <= 1) {
        setSelectedPage(0); // Go to cover spread
      } else {
        setSelectedPage(Math.max(1, actualSpreadStart - 2));
      }
    } else {
      if (isCoverView) {
        setSelectedPage(1); // First interior spread
      } else {
        setSelectedPage(Math.min(backCoverIndex - 1, actualSpreadStart + 2));
      }
    }
  };

  // ── Thumbnail order: front cover, back cover, then interiors ──
  const thumbnailOrder = useMemo(() => {
    if (pages.length < 2) return pages.map((_, i) => i);
    const order = [0, pages.length - 1]; // covers first
    for (let i = 1; i < pages.length - 1; i++) order.push(i); // then interiors
    return order;
  }, [pages.length]);

  // ═══════════════ Slot handlers ═══════════════
  const handleSlotPress = (pageIdx: number, slotIdx: number) => {
    // Achevé pages are locked — ignore
    if (pages[pageIdx]?.isAchevePage) return;
    setSelectedElementId(null);
    setShowPageHighlight(true);
    const page = pages[pageIdx];
    const layout =
      DEFAULT_LAYOUTS.find((l) => l.id === page.layoutId) || DEFAULT_LAYOUTS[0];
    const slotDef = layout.slots[slotIdx];

    if (slotDef?.type === 'text') {
      startSlotTextEditing(pageIdx, slotIdx);
    } else {
      setPhotoTargetSlot({ pageIdx, slotIdx });
      setSelectedSlot(slotIdx);
      setSelectedPage(pageIdx);
      // If slot already has a photo, open on recadrage; otherwise pellicule
      const slotData = pages[pageIdx]?.slots[slotIdx];
      setPhotoInitialTab(slotData?.photoUri ? 'recadrage' : 'pellicule');
      setActiveSheet('photos');
    }
  };

  // ═══════════════ Text editing — Slots ═══════════════
  const startSlotTextEditing = (pageIdx: number, slotIdx: number) => {
    const slotData = pages[pageIdx]?.slots[slotIdx];
    setEditingPageIndex(pageIdx);
    setEditingSlotIndex(slotIdx);
    setEditingElementId(null);
    setEditingText(slotData?.text || '');
    setTextStyle({
      fontSize: slotData?.fontSize || 16,
      fontFamily: slotData?.fontFamily || 'System',
      fontWeight: (slotData?.fontWeight as any) || 'normal',
      fontStyle: (slotData?.fontStyle as any) || 'normal',
      textDecorationLine: (slotData?.textDecorationLine as any) || 'none',
      textTransform: (slotData?.textTransform as any) || 'none',
      textAlign: slotData?.textAlign || 'center',
      color: slotData?.color || '#1B2541',
    });
    setIsEditingText(true);
    setActiveSheet(null);
    setTimeout(() => textInputRef.current?.focus(), 150);
  };

  // ═══════════════ Text editing — Free elements ═══════════════
  const startElementTextEditing = (elementId: string) => {
    const page = pages[selectedPageIndex];
    const el = page?.elements?.find((e) => e.id === elementId);
    if (!el || el.type !== 'text') return;

    setEditingPageIndex(selectedPageIndex);
    setEditingSlotIndex(null);
    setEditingElementId(elementId);
    setEditingText(el.text || '');
    setTextStyle({
      fontSize: el.fontSize || 16,
      fontFamily: el.fontFamily || 'System',
      fontWeight: (el.fontWeight as any) || 'normal',
      fontStyle: (el.fontStyle as any) || 'normal',
      textDecorationLine: (el.textDecorationLine as any) || 'none',
      textTransform: (el.textTransform as any) || 'none',
      textAlign: el.textAlign || 'center',
      color: el.color || '#1B2541',
    });
    setIsEditingText(true);
    setActiveSheet(null);
    setTimeout(() => textInputRef.current?.focus(), 150);
  };

  // ═══════════════ Element selection ═══════════════
  const handleElementSelect = useCallback(
    (pageIdx: number, element: PageElement) => {
      if (element.id === selectedElementId && element.type === 'text') {
        startElementTextEditing(element.id);
      } else {
        // Close text editing when selecting a different element or non-text element
        if (isEditingText) handleValidateText();
        setSelectedPage(pageIdx);
        setSelectedElementId(element.id);
        setShowPageHighlight(true);
      }
    },
    [selectedElementId, selectedPageIndex, pages, isEditingText],
  );

  const handleCanvasPress = () => {
    if (selectedElementId) setSelectedElementId(null);
    if (isEditingText) handleValidateText();
    setShowPageHighlight(true);
  };

  /** Tap on the empty area around pages → deselect page highlight */
  const handleBackgroundPress = () => {
    if (selectedElementId) setSelectedElementId(null);
    if (isEditingText) handleValidateText();
    setShowPageHighlight(false);
  };

  // ═══════════════ Text preset → free element ═══════════════
  const handleTextPresetSelected = (preset: TextStylePreset) => {
    const id = addElement(selectedPageIndex, {
      type: 'text',
      text: '',
      fontSize: preset.fontSize,
      fontFamily: preset.fontFamily,
      fontWeight: preset.fontWeight,
      fontStyle: preset.fontStyle,
      color: preset.color,
      textAlign: 'center',
      x: 10,
      y: 30,
      width: 80,
      height: 15,
    });
    setActiveSheet(null);
    setTimeout(() => startElementTextEditing(id), 100);
  };

  const handleAddFreeText = () => {
    const defaultPreset =
      TEXT_STYLE_PRESETS.find((p) => p.id === 'paragraph') || TEXT_STYLE_PRESETS[2];
    handleTextPresetSelected(defaultPreset);
  };

  // ═══════════════ Text style changes ═══════════════
  const handleTextStyleChange = (updates: Partial<typeof textStyle>) => {
    setTextStyle((prev) => ({ ...prev, ...updates }));
    // skipHistory=true : pas d'historique à chaque changement de style en temps réel
    if (editingElementId && editingPageIndex !== null) {
      updateElement(editingPageIndex, editingElementId, updates, true);
    } else if (editingPageIndex !== null && editingSlotIndex !== null) {
      updateSlotTextStyle(
        editingPageIndex,
        editingSlotIndex,
        updates as Partial<PageSlotData>,
        true,
      );
    }
  };

  const handleValidateText = () => {
    // Commit final du texte — une seule mise à jour atomique (évite les états intermédiaires)
    if (editingElementId && editingPageIndex !== null) {
      updateElement(editingPageIndex, editingElementId, {
        text: editingText,
        ...textStyle,
      });
    } else if (editingPageIndex !== null && editingSlotIndex !== null) {
      // Un seul appel pour texte + style = un seul pushHistory + un seul re-render
      updateSlotTextStyle(
        editingPageIndex,
        editingSlotIndex,
        { text: editingText, ...textStyle } as Partial<PageSlotData>,
      );
    }
    setIsEditingText(false);
    setEditingPageIndex(null);
    setEditingSlotIndex(null);
    setEditingElementId(null);
    Keyboard.dismiss();
  };

  const handleTextChange = (text: string) => {
    setEditingText(text);
    // skipHistory=true : mise à jour visuelle en temps réel sans polluer l'historique
    if (editingElementId && editingPageIndex !== null) {
      updateElement(editingPageIndex, editingElementId, { text }, true);
    } else if (editingPageIndex !== null && editingSlotIndex !== null) {
      updateSlotText(editingPageIndex, editingSlotIndex, text, true);
    }
  };

  // ═══════════════ Photo selection ═══════════════
  const handlePhotoSelected = (uri: string) => {
    if (photoTargetSlot) {
      updateSlotPhoto(photoTargetSlot.pageIdx, photoTargetSlot.slotIdx, uri);
      setPhotoTargetSlot(null);
    } else {
      addElement(selectedPageIndex, {
        type: 'image',
        imageUri: uri,
        x: 10,
        y: 10,
        width: 50,
        height: 40,
      });
    }
    setActiveSheet(null);
  };

  const handleOpenPhotos = () => {
    setPhotoTargetSlot(null);
    setPhotoInitialTab('pellicule');
    setActiveSheet(activeSheet === 'photos' ? null : 'photos');
  };

  // ═══════════════ Layout / Template ═══════════════
  const handleLayoutSelected = (layout: PageLayout) => {
    updatePageLayout(selectedPageIndex, layout);
    // Apply default border & spacing for multi-slot grids (like a real album)
    const currentPage = pages[selectedPageIndex];
    if (layout.slots.length > 1) {
      const defaults: Record<string, number> = {};
      if (currentPage?.slotBorderWidth === undefined || currentPage.slotBorderWidth === 0) {
        defaults.slotBorderWidth = 2;
      }
      if (currentPage?.slotSpacing === undefined || currentPage.slotSpacing === 0) {
        defaults.slotSpacing = 1;
      }
      if (currentPage?.slotBorderRadius === undefined || currentPage.slotBorderRadius === 0) {
        defaults.slotBorderRadius = 4;
      }
      if (Object.keys(defaults).length > 0) {
        updatePageStyle(selectedPageIndex, defaults);
      }
    }
    setActiveSheet(null);
  };

  const isCoverPage = (index: number) => index === 0 || index === pages.length - 1;

  const handleTemplateSelected = (templateKey: string) => {
    // Vérifier que la page sélectionnée est bien une page de couverture
    if (!isCoverPage(selectedPageIndex)) {
      Alert.alert(
        'Page incompatible',
        'Ce design est réservé aux pages de couverture (première et dernière page).\nSélectionnez une page de couverture ou utilisez l\'onglet « Intérieur ».',
      );
      return;
    }
    setSelectedTemplateKey(templateKey);
    const allTemplates = [...ALBUM_TEMPLATES, ...MAGAZINE_TEMPLATES];
    const tpl = allTemplates.find((t) => t.key === templateKey);
    if (tpl) {
      const resolved = Image.resolveAssetSource(tpl.source);
      if (resolved?.uri) {
        updateSlotPhoto(selectedPageIndex, 0, resolved.uri);
      }
    }
    setActiveSheet(null);
  };

  const handleInteriorTemplateSelected = (templateKey: string) => {
    // Vérifier que la page sélectionnée est une page intérieure
    if (isCoverPage(selectedPageIndex)) {
      Alert.alert(
        'Page incompatible',
        'Ce design est réservé aux pages intérieures.\nSélectionnez une page intérieure ou utilisez l\'onglet « Couverture ».',
      );
      return;
    }
    const allInterior = [...INTERIOR_ALBUM_TEMPLATES, ...INTERIOR_MAGAZINE_TEMPLATES];
    const tpl = allInterior.find((t) => t.key === templateKey);
    if (tpl) {
      const resolved = Image.resolveAssetSource(tpl.source);
      if (resolved?.uri) {
        updateSlotPhoto(selectedPageIndex, 0, resolved.uri);
      }
    }
    setActiveSheet(null);
  };

  const handleSave = async () => {
    await saveDraftNow();
    Alert.alert('Sauvegarde', 'Projet sauvegardé localement !');
  };

  const handleAddToCart = async () => {
    if (!user?.id || !projectId) {
      Alert.alert('Erreur', 'Vous devez être connecté pour commander.');
      return;
    }
    try {
      await saveDraftNow();
      const unitPrice = calculateUnitPrice({
        productType: currentProject?.product_type ?? 'album',
        format: currentProject?.format ?? currentFormat,
        bindingType: currentProject?.binding_type ?? 'hardcover',
        pageCount: currentProject?.page_count ?? pages.length,
      });
      await addToCart(user.id, projectId, unitPrice);
      Alert.alert(
        'Ajouté au panier ! 🎉',
        `Votre ${currentProject?.product_type === 'magazine' ? 'magazine' : 'album'} a été ajouté au panier.`,
        [
          { text: 'Continuer', style: 'cancel' },
          {
            text: 'Voir le panier',
            onPress: () => router.push('/(app)/(tabs)/cart'),
          },
        ],
      );
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'ajouter au panier. Réessayez.");
    }
  };

  // ═══════════════ Element toolbar actions ═══════════════
  const selectedElement = selectedElementId
    ? pages[selectedPageIndex]?.elements?.find((e) => e.id === selectedElementId)
    : null;

  const handleDeleteElement = () => {
    if (selectedElementId) removeElement(selectedPageIndex, selectedElementId);
  };
  const handleDuplicateElement = () => {
    if (selectedElementId) duplicateElement(selectedPageIndex, selectedElementId);
  };
  const handleBringForward = () => {
    if (selectedElementId) bringForward(selectedPageIndex, selectedElementId);
  };
  const handleSendBackward = () => {
    if (selectedElementId) sendBackward(selectedPageIndex, selectedElementId);
  };
  const handleLockToggle = () => {
    if (selectedElement)
      updateElement(selectedPageIndex, selectedElement.id, {
        locked: !selectedElement.locked,
      });
  };

  // ── Stacked view dimensions ──
  const stackedPageWidth = SCREEN_WIDTH * 0.65;
  const stackedPageHeight = stackedPageWidth * PAGE_ASPECT;

  // ── Zoomed page dimensions ──
  const zoomedPageWidth = PAGE_WIDTH * zoomLevel;
  const zoomedPageHeight = PAGE_HEIGHT * zoomLevel;
  const zoomedStackedW = stackedPageWidth * zoomLevel;
  const zoomedStackedH = stackedPageHeight * zoomLevel;
  const zoomedSpineWidth = spineWidth * zoomLevel;

  // ═══════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={async () => {
          // Sauvegarder le brouillon avant de quitter
          await saveDraftNow().catch(() => {});
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(app)/(tabs)');
          }
        }} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{currentProject?.title || 'Mon Memoriz'}</Text>
          <View style={styles.saveStatus}>
            <View
              style={[
                styles.saveDot,
                { backgroundColor: isSaved ? Colors.success : Colors.warning },
              ]}
            />
            <Text style={styles.saveText}>
              {isSaved ? 'Sauvegardé' : 'Non sauvegardé'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
          <Ionicons name="cloud-upload-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAddToCart} style={styles.orderBtn}>
          <Ionicons name="cart-outline" size={16} color={Colors.white} />
          <Text style={styles.orderBtnText}>Commander</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Page indicator + toggle + zoom ─── */}
      <View style={styles.pageIndicatorRow}>
        <Text style={styles.pageIndicatorText}>
          {isCoverView
            ? 'Couvertures (1-2)'
            : leftPage?.isAchevePage
              ? 'Achev\u00e9 d\u2019imprimer'
              : leftPage?.isSpreadImage
                ? `Panoramique ${actualSpreadStart + 2}-${actualSpreadStart + 3}`
                : `Pages ${actualSpreadStart + 2}-${actualSpreadStart + 3}`}
        </Text>
        {!isCoverView && !leftPage?.isAchevePage && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {/* Toggle panoramique (spread image) */}
            <TouchableOpacity
              style={[
                styles.viewToggleBtn,
                leftPage?.isSpreadImage && styles.viewToggleBtnActive,
              ]}
              onPress={() => toggleSpreadImage(actualSpreadStart)}
            >
              <Ionicons
                name="expand-outline"
                size={18}
                color={leftPage?.isSpreadImage ? Colors.accent : Colors.textSecondary}
              />
            </TouchableOpacity>
            {/* Toggle vue empilée */}
            {!leftPage?.isSpreadImage && (
              <TouchableOpacity
                style={[
                  styles.viewToggleBtn,
                  isStackedView && styles.viewToggleBtnActive,
                ]}
                onPress={() => setIsStackedView(!isStackedView)}
              >
                <Ionicons
                  name={
                    isStackedView
                      ? 'tablet-landscape-outline'
                      : 'tablet-portrait-outline'
                  }
                  size={18}
                  color={isStackedView ? Colors.accent : Colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* ─── Zoom bar ─── */}
      <View style={styles.zoomRow}>
        <TouchableOpacity
          style={[styles.zoomBtn, zoomLevel <= 0.5 && styles.zoomBtnDisabled]}
          onPress={() => setZoomLevel(Math.max(0.5, +(zoomLevel - 0.1).toFixed(1)))}
          disabled={zoomLevel <= 0.5}
        >
          <Ionicons name="remove" size={16} color={zoomLevel <= 0.5 ? Colors.borderLight : Colors.textSecondary} />
        </TouchableOpacity>

        {/* Barre de zoom interactive (glissable) */}
        <View
          ref={zoomTrackRef}
          style={styles.zoomTrack}
          onLayout={(e: LayoutChangeEvent) => {
            zoomTrackWidth.current = e.nativeEvent.layout.width;
            zoomTrackRef.current?.measureInWindow((x) => {
              if (x != null) zoomTrackPageX.current = x;
            });
          }}
          {...zoomPanResponder.panHandlers}
        >
          <View style={styles.zoomTrackBg} />
          <View style={[styles.zoomTrackFill, { width: `${((zoomLevel - 0.5) / 2) * 100}%` }]} />
          <View style={[
            styles.zoomThumb,
            { left: `${((zoomLevel - 0.5) / 2) * 100}%` },
          ]} />
        </View>

        <TouchableOpacity
          style={[styles.zoomBtn, zoomLevel >= 2.5 && styles.zoomBtnDisabled]}
          onPress={() => setZoomLevel(Math.min(2.5, +(zoomLevel + 0.1).toFixed(1)))}
          disabled={zoomLevel >= 2.5}
        >
          <Ionicons name="add" size={16} color={zoomLevel >= 2.5 ? Colors.borderLight : Colors.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.zoomLabel}>{Math.round(zoomLevel * 100)}%</Text>

        {zoomLevel !== 1 && (
          <TouchableOpacity onPress={() => setZoomLevel(1)} style={styles.zoomResetBtn}>
            <Text style={styles.zoomResetText}>1:1</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Canvas area ─── */}
      <View style={styles.canvasWrapper}>
        {/* Left arrow — hidden when a bottom sheet is open */}
        {!activeSheet && (
          <TouchableOpacity
            style={[styles.navArrow, styles.navArrowLeft]}
            onPress={() => navigateSpread('prev')}
            disabled={!canGoBack}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={canGoBack ? Colors.textSecondary : Colors.borderLight}
            />
          </TouchableOpacity>
        )}

        {/* Right arrow — hidden when a bottom sheet is open */}
        {!activeSheet && (
          <TouchableOpacity
            style={[styles.navArrow, styles.navArrowRight]}
            onPress={() => navigateSpread('next')}
            disabled={!canGoForward}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={canGoForward ? Colors.textSecondary : Colors.borderLight}
            />
          </TouchableOpacity>
        )}

      <ScrollView
        style={styles.canvasAreaScroll}
        contentContainerStyle={styles.canvasAreaScrollContent}
        horizontal
        showsHorizontalScrollIndicator={zoomLevel > 1.2}
        showsVerticalScrollIndicator={false}
        bounces={false}
        nestedScrollEnabled
        scrollEnabled={!selectedElementId}
      >
        <ScrollView
          contentContainerStyle={[
            styles.canvasAreaInner,
            activeSheet && { paddingBottom: SHEET_HEIGHT },
          ]}
          showsVerticalScrollIndicator={zoomLevel > 1.2}
          showsHorizontalScrollIndicator={false}
          bounces={false}
          nestedScrollEnabled
          scrollEnabled={!selectedElementId}
        >
      <Pressable style={styles.canvasArea} onPress={handleBackgroundPress}>

        {/* Pages */}
        {isCoverView ? (
          <View style={styles.spread}>
            {/* Front cover (page 0) */}
            {leftPage && (
              <PageView
                page={leftPage}
                pageIndex={0}
                onSlotPress={(si) => handleSlotPress(0, si)}
                onElementSelect={(el) => handleElementSelect(0, el)}
                onElementDelete={(id) => removeElement(0, id)}
                onCanvasPress={handleCanvasPress}
                selectedElementId={selectedElementId}
                isActive={showPageHighlight && selectedPageIndex === 0}
                isCover={false}
                pageWidth={zoomedPageWidth}
                pageHeight={zoomedPageHeight}
                isEditingText={isEditingText}
                editingSlotIndex={
                  editingPageIndex === 0 ? editingSlotIndex : null
                }
              />
            )}
            {/* Spine / Tranche between covers */}
            {leftPage && rightPage && hasSpine && (
              <View
                style={[
                  styles.coverSpineStrip,
                  { width: zoomedSpineWidth, height: zoomedPageHeight },
                ]}
                pointerEvents="none"
              >
                {/* Bord gauche sombre */}
                <View style={styles.coverSpineEdge} />
                {/* Fond blanc/crème */}
                <View style={styles.coverSpineFill} />
                {/* Bord droit sombre */}
                <View style={styles.coverSpineEdge} />
              </View>
            )}
            {/* Simple fold line for lay_flat */}
            {leftPage && rightPage && !hasSpine && (
              <View style={[styles.spineOverlay, { height: zoomedPageHeight }]} pointerEvents="none">
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.08)', 'transparent']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.spineLine} />
              </View>
            )}
            {/* Back cover (last page) */}
            {rightPage && (
              <PageView
                page={rightPage}
                pageIndex={backCoverIndex}
                onSlotPress={(si) => handleSlotPress(backCoverIndex, si)}
                onElementSelect={(el) => handleElementSelect(backCoverIndex, el)}
                onElementDelete={(id) => removeElement(backCoverIndex, id)}
                onCanvasPress={handleCanvasPress}
                selectedElementId={selectedElementId}
                isActive={showPageHighlight && selectedPageIndex === backCoverIndex}
                isCover={false}
                pageWidth={zoomedPageWidth}
                pageHeight={zoomedPageHeight}
                isEditingText={isEditingText}
                editingSlotIndex={
                  editingPageIndex === backCoverIndex ? editingSlotIndex : null
                }
              />
            )}
          </View>
        ) : leftPage?.isAchevePage ? (
          /* ── Achev\u00e9 d'imprimer spread (locked) ── */
          <View style={styles.spread}>
            {/* Left page: achev\u00e9 text */}
            <View style={[styles.page, { width: zoomedPageWidth - 24, height: zoomedPageHeight, backgroundColor: '#FFFFFF' }]}>
              <View style={styles.acheveContent}>
                <Text style={styles.acheveLogo}>Memoriz.com</Text>
                <View style={{ height: 6 }} />
                <Text style={styles.acheveText}>IMPRIMÉ EN FRANCE</Text>
                <Text style={styles.acheveText}>{`Achevé d\u2019imprimer en \u00ab\u00a0${getAcheveDate()}\u00a0\u00bb`}</Text>
                <Text style={styles.acheveText}>Chez Messages  SAS</Text>
                <Text style={styles.acheveText}>111, rue Nicolas Vauquelin – 31100 Toulouse</Text>
                <Text style={styles.acheveText}>05 31 61 60 42</Text>
                <Text style={styles.acheveText}>www.memoriz.com</Text>
              </View>
              {/* Lock badge */}
              <View style={styles.acheveLockBadge}>
                <Ionicons name="lock-closed" size={10} color={Colors.textTertiary} />
              </View>
            </View>
            {/* Spine */}
            <View style={[styles.spineOverlay, { height: zoomedPageHeight }]} pointerEvents="none">
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.08)', 'transparent']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.spineLine} />
            </View>
            {/* Right page: blank */}
            <View style={[styles.page, { width: zoomedPageWidth - 24, height: zoomedPageHeight, backgroundColor: '#FFFFFF' }]}>
              <View style={styles.acheveLockBadge}>
                <Ionicons name="lock-closed" size={10} color={Colors.textTertiary} />
              </View>
            </View>
          </View>
        ) : isStackedView && !leftPage?.isSpreadImage ? (
          <ScrollView
            contentContainerStyle={styles.stackedSpread}
            showsVerticalScrollIndicator={false}
          >
            {leftPage && (
              <PageView
                page={leftPage}
                pageIndex={actualSpreadStart}
                onSlotPress={(si) => handleSlotPress(actualSpreadStart, si)}
                onElementSelect={(el) => handleElementSelect(actualSpreadStart, el)}
                onElementDelete={(id) => removeElement(actualSpreadStart, id)}
                onCanvasPress={handleCanvasPress}
                selectedElementId={selectedElementId}
                isActive={showPageHighlight && selectedPageIndex === actualSpreadStart}
                isCover={false}
                pageWidth={zoomedStackedW}
                pageHeight={zoomedStackedH}
                isEditingText={isEditingText}
                editingSlotIndex={
                  editingPageIndex === actualSpreadStart ? editingSlotIndex : null
                }
              />
            )}
            {rightPage && (
              <View style={{ marginTop: Spacing.md }}>
                <PageView
                  page={rightPage}
                  pageIndex={actualSpreadStart + 1}
                  onSlotPress={(si) =>
                    handleSlotPress(actualSpreadStart + 1, si)
                  }
                  onElementSelect={(el) =>
                    handleElementSelect(actualSpreadStart + 1, el)
                  }
                  onElementDelete={(id) => removeElement(actualSpreadStart + 1, id)}
                  onCanvasPress={handleCanvasPress}
                  selectedElementId={selectedElementId}
                  isActive={showPageHighlight && selectedPageIndex === actualSpreadStart + 1}
                  isCover={false}
                  pageWidth={zoomedStackedW}
                  pageHeight={zoomedStackedH}
                  isEditingText={isEditingText}
                  editingSlotIndex={
                    editingPageIndex === actualSpreadStart + 1
                      ? editingSlotIndex
                      : null
                  }
                />
              </View>
            )}
          </ScrollView>
        ) : leftPage?.isSpreadImage ? (
          /* ── Spread Image: single image spanning both pages ── */
          <View style={styles.spread}>
            <Pressable
              style={[
                styles.spreadImageContainer,
                {
                  width: (zoomedPageWidth - 24) * 2,
                  height: zoomedPageHeight,
                  backgroundColor: leftPage.backgroundColor || '#FFFFFF',
                },
                showPageHighlight && styles.pageActive,
              ]}
              onPress={() => {
                const slotData = leftPage.slots[0];
                setShowPageHighlight(true);
                setPhotoTargetSlot({ pageIdx: actualSpreadStart, slotIdx: 0 });
                setSelectedSlot(0);
                setSelectedPage(actualSpreadStart);
                setPhotoInitialTab(slotData?.photoUri ? 'recadrage' : 'pellicule');
                setActiveSheet('photos');
              }}
            >
              {(() => {
                const slotData = leftPage.slots[0];
                const containerW = (zoomedPageWidth - 24) * 2;
                const containerH = zoomedPageHeight;
                const imgScale = slotData?.imageScale ?? 1;
                const imgOffX = slotData?.imageOffsetX ?? 0;
                const imgOffY = slotData?.imageOffsetY ?? 0;
                const translatePxX = (imgOffX / 100) * containerW;
                const translatePxY = (imgOffY / 100) * containerH;
                return slotData?.photoUri ? (
                  <FilteredImage
                    uri={slotData.photoUri}
                    brightness={slotData?.brightness ?? 0}
                    contrast={slotData?.contrast ?? 0}
                    saturation={slotData?.saturation ?? 0}
                    warmth={slotData?.warmth ?? 0}
                    sharpness={slotData?.sharpness ?? 0}
                    vignette={slotData?.vignette ?? 0}
                    containerStyle={{ flex: 1, width: '100%', height: '100%', overflow: 'hidden' }}
                    imageStyle={[
                      styles.slotImage,
                      {
                        transform: [
                          { scale: imgScale },
                          { translateX: translatePxX },
                          { translateY: translatePxY },
                        ],
                      },
                    ]}
                  />
                ) : (
                  <View style={styles.spreadImagePlaceholder}>
                    <Ionicons name="images-outline" size={32} color={Colors.textTertiary} />
                    <Text style={styles.spreadImagePlaceholderText}>Image panoramique</Text>
                  </View>
                );
              })()}
            </Pressable>
            {/* Pliure overlay on top of spread image */}
            <View style={[styles.spineOverlay, { height: zoomedPageHeight, left: '50%', marginLeft: -4 }]} pointerEvents="none">
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.06)', 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.06)', 'transparent']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.spineLine} />
            </View>
          </View>
        ) : (
          <View style={styles.spread}>
            {leftPage && (
              <PageView
                page={leftPage}
                pageIndex={actualSpreadStart}
                onSlotPress={(si) => handleSlotPress(actualSpreadStart, si)}
                onElementSelect={(el) => handleElementSelect(actualSpreadStart, el)}
                onElementDelete={(id) => removeElement(actualSpreadStart, id)}
                onCanvasPress={handleCanvasPress}
                selectedElementId={selectedElementId}
                isActive={showPageHighlight && selectedPageIndex === actualSpreadStart}
                isCover={false}
                pageWidth={zoomedPageWidth}
                pageHeight={zoomedPageHeight}
                isEditingText={isEditingText}
                editingSlotIndex={
                  editingPageIndex === actualSpreadStart ? editingSlotIndex : null
                }
              />
            )}
            {/* ── Pliure / reliure au centre ── */}
            {leftPage && rightPage && (
              <View style={[styles.spineOverlay, { height: zoomedPageHeight }]} pointerEvents="none">
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.08)', 'transparent']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.spineLine} />
              </View>
            )}
            {rightPage && (
              <PageView
                page={rightPage}
                pageIndex={actualSpreadStart + 1}
                onSlotPress={(si) =>
                  handleSlotPress(actualSpreadStart + 1, si)
                }
                onElementSelect={(el) =>
                  handleElementSelect(actualSpreadStart + 1, el)
                }
                onElementDelete={(id) => removeElement(actualSpreadStart + 1, id)}
                onCanvasPress={handleCanvasPress}
                selectedElementId={selectedElementId}
                isActive={showPageHighlight && selectedPageIndex === actualSpreadStart + 1}
                isCover={false}
                pageWidth={zoomedPageWidth}
                pageHeight={zoomedPageHeight}
                isEditingText={isEditingText}
                editingSlotIndex={
                  editingPageIndex === actualSpreadStart + 1
                    ? editingSlotIndex
                    : null
                }
              />
            )}
          </View>
        )}

      </Pressable>
        </ScrollView>
      </ScrollView>
      </View>

      {/* ─── Text formatting toolbar ─── */}
      {isEditingText && (
        <TextFormattingToolbar
          style={textStyle}
          onStyleChange={handleTextStyleChange}
          onValidate={handleValidateText}
        />
      )}

      {/* ─── Text input (captures keyboard) ─── */}
      {isEditingText && (
        <TextInput
          ref={textInputRef}
          style={styles.hiddenTextInput}
          value={editingText}
          onChangeText={handleTextChange}
          multiline
          autoFocus
          placeholder="Tapez votre texte..."
          placeholderTextColor={Colors.textTertiary}
        />
      )}

      {/* ─── Thumbnails ─── */}
      {!(isEditingText && keyboardVisible) && !activeSheet && (
        <View style={styles.thumbnailContainer}>
          <FlatList
            style={{ flex: 1 }}
            data={thumbnailOrder}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
            keyExtractor={(actualIdx, i) => `thumb-${actualIdx}-${i}`}
            renderItem={({ item: actualIdx, index: visualIdx }) => {
              // Both pages of the current spread should highlight
              const isActive = isCoverView
                ? (actualIdx === 0 || actualIdx === backCoverIndex)
                : (actualIdx === actualSpreadStart || actualIdx === actualSpreadStart + 1);
              const isAcheve = pages[actualIdx]?.isAchevePage;
              return (
                <TouchableOpacity
                  style={[
                    styles.thumbnail,
                    isActive && styles.thumbnailActive,
                    isAcheve && styles.thumbnailLocked,
                  ]}
                  onPress={() => { setSelectedPage(actualIdx); setShowPageHighlight(true); }}
                >
                  <View style={styles.thumbnailInner}>
                    {isAcheve ? (
                      <Ionicons name="lock-closed" size={10} color={Colors.textTertiary} />
                    ) : (
                      <Text style={styles.thumbnailNum}>{visualIdx + 1}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
          {/* ── Boutons +/- en fin de liste ── */}
          {pages.length > 6 && (
            <TouchableOpacity
              style={styles.thumbnailActionBtn}
              onPress={() => {
                // Last 2 editable interior pages (before achevé + back cover)
                const acheveIdx = pages.findIndex((p) => p.isAchevePage);
                const lastInteriorStart = acheveIdx > 2 ? acheveIdx - 2 : pages.length - 5;
                Alert.alert(
                  'Supprimer 2 pages ?',
                  `Les 2 dernières pages intérieures seront supprimées.\nCette action peut être annulée.`,
                  [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Supprimer',
                      style: 'destructive',
                      onPress: () => removePagePair(lastInteriorStart),
                    },
                  ],
                );
              }}
            >
              <Ionicons name="remove" size={14} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.thumbnailActionBtn, styles.thumbnailActionBtnAdd]}
            onPress={() => {
              addPage();
            }}
          >
            <Ionicons name="add" size={14} color={Colors.accent} />
          </TouchableOpacity>
        </View>
      )}

      {/* ─── Undo / Redo ─── */}
      {!(isEditingText && keyboardVisible) && (
        <View style={styles.undoRedoRow}>
          <TouchableOpacity
            style={[styles.undoRedoBtn, !canUndo && styles.undoRedoBtnDisabled]}
            onPress={undo}
            disabled={!canUndo}
          >
            <Ionicons
              name="arrow-undo"
              size={16}
              color={canUndo ? Colors.textPrimary : Colors.borderLight}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.undoRedoBtn, !canRedo && styles.undoRedoBtnDisabled]}
            onPress={redo}
            disabled={!canRedo}
          >
            <Ionicons
              name="arrow-redo"
              size={16}
              color={canRedo ? Colors.textPrimary : Colors.borderLight}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* ─── Bottom toolbar ─── */}
      {!(isEditingText && keyboardVisible) && (
        <View style={styles.toolbar}>
          {(
            [
              {
                key: 'layout' as ToolbarTab,
                icon: 'grid-outline',
                label: 'Mise en page',
                onPress: () =>
                  setActiveSheet(activeSheet === 'layout' ? null : 'layout'),
              },
              {
                key: 'photos' as ToolbarTab,
                icon: 'images-outline',
                label: 'Photos',
                onPress: handleOpenPhotos,
              },
              {
                key: 'text' as ToolbarTab,
                icon: 'text-outline',
                label: 'Texte',
                onPress: () =>
                  setActiveSheet(activeSheet === 'text' ? null : 'text'),
              },
              {
                key: 'templates' as ToolbarTab,
                icon: 'book-outline',
                label: 'Couverture',
                onPress: () =>
                  setActiveSheet(activeSheet === 'templates' ? null : 'templates'),
              },
              {
                key: 'interiors' as ToolbarTab,
                icon: 'layers-outline',
                label: 'Intérieur',
                onPress: () =>
                  setActiveSheet(activeSheet === 'interiors' ? null : 'interiors'),
              },
            ] as const
          ).map((tool) => (
            <TouchableOpacity
              key={tool.key}
              style={[
                styles.toolItem,
                activeSheet === tool.key && styles.toolItemActive,
              ]}
              onPress={tool.onPress}
            >
              <Ionicons
                name={tool.icon as any}
                size={22}
                color={
                  activeSheet === tool.key ? Colors.accent : Colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.toolLabel,
                  activeSheet === tool.key && styles.toolLabelActive,
                ]}
              >
                {tool.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ─── Bottom sheets ─── */}
      {activeSheet === 'photos' && (
        <PhotoToolsSheet
          onSelectPhoto={handlePhotoSelected}
          onClose={() => {
            setActiveSheet(null);
            setPhotoTargetSlot(null);
          }}
          initialTab={photoInitialTab}
          pageIndex={photoTargetSlot?.pageIdx ?? selectedPageIndex}
          slotIndex={photoTargetSlot?.slotIdx ?? null}
        />
      )}
      {activeSheet === 'layout' && (
        <LayoutToolsSheet
          onClose={() => setActiveSheet(null)}
          onSelectLayout={handleLayoutSelected}
          pageIndex={selectedPageIndex}
        />
      )}
      {activeSheet === 'text' && !isEditingText && (
        <TextStylesSheet
          onSelectPreset={handleTextPresetSelected}
          onAddFreeText={handleAddFreeText}
          onClose={() => setActiveSheet(null)}
        />
      )}
      {activeSheet === 'templates' && (
        <TemplateSelectorSheet
          onSelect={handleTemplateSelected}
          onClose={() => setActiveSheet(null)}
          currentTemplate={selectedTemplateKey}
        />
      )}
      {activeSheet === 'interiors' && (
        <InteriorTemplateSelectorSheet
          onSelect={handleInteriorTemplateSelected}
          onClose={() => setActiveSheet(null)}
        />
      )}
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════
//  PageView Component
// ═══════════════════════════════════════════════
function PageView({
  page,
  pageIndex,
  onSlotPress,
  onElementSelect,
  onElementDelete,
  onCanvasPress,
  selectedElementId,
  isActive,
  isCover,
  pageWidth,
  pageHeight,
  isEditingText,
  editingSlotIndex,
}: {
  page: any;
  pageIndex: number;
  onSlotPress: (slotIdx: number) => void;
  onElementSelect: (element: PageElement) => void;
  onElementDelete: (elementId: string) => void;
  onCanvasPress: () => void;
  selectedElementId: string | null;
  isActive: boolean;
  isCover: boolean;
  pageWidth: number;
  pageHeight: number;
  isEditingText?: boolean;
  editingSlotIndex?: number | null;
}) {
  const updateElement = useEditorStore((s) => s.updateElement);
  const layout =
    DEFAULT_LAYOUTS.find((l) => l.id === page.layoutId) || DEFAULT_LAYOUTS[0];

  // Les dimensions sont déjà calculées par le parent (avec zoom)
  const w = isCover ? pageWidth * 0.7 : pageWidth - 24;
  const h = isCover ? w * (pageHeight / pageWidth) : pageHeight;

  const elements = [...(page.elements || [])].sort(
    (a: PageElement, b: PageElement) => a.zIndex - b.zIndex,
  );

  // Page-level style overrides
  const pageBg = page.backgroundColor || '#FFFFFF';
  const slotRadius = page.slotBorderRadius ?? 0;
  const slotSpacing = page.slotSpacing ?? 0;
  const slotBorderW = page.slotBorderWidth ?? 0;

  // ── Compute tiled (flush) slot positions when spacing is explicitly set ──
  const tiledSlots = React.useMemo(() => {
    if (page.slotSpacing === undefined) return null; // use raw layout positions
    const slots = layout.slots;
    if (!slots || slots.length === 0) return null;
    if (slots.length === 1) return [{ x: 0, y: 0, width: 100, height: 100 }];

    // Check for overlapping slots → skip tiling (e.g. focus+vignette)
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const a = slots[i], b = slots[j];
        if (a.x < b.x + b.width && a.x + a.width > b.x &&
            a.y < b.y + b.height && a.y + a.height > b.y) {
          return null; // overlapping layout, don't tile
        }
      }
    }

    // Group into rows by similar y-center (within 10% tolerance)
    const indexed = slots.map((s: any, i: number) => ({ ...s, _i: i }));
    indexed.sort((a: any, b: any) => a.y - b.y || a.x - b.x);
    const rows: any[][] = [];
    let curRow: any[] = [];
    for (const s of indexed) {
      if (curRow.length === 0) { curRow.push(s); continue; }
      const rowCenterY = curRow[0].y + curRow[0].height / 2;
      const sCenterY = s.y + s.height / 2;
      if (Math.abs(sCenterY - rowCenterY) < 10) { curRow.push(s); }
      else { rows.push(curRow); curRow = [s]; }
    }
    if (curRow.length > 0) rows.push(curRow);

    // Compute proportional heights per row
    const rowH = rows.map(r => Math.max(...r.map((s: any) => s.height)));
    const totalH = rowH.reduce((a, b) => a + b, 0);
    const result: { x: number; y: number; width: number; height: number }[] = new Array(slots.length);
    let yPos = 0;
    rows.forEach((row, ri) => {
      const h = (rowH[ri] / totalH) * 100;
      row.sort((a: any, b: any) => a.x - b.x);
      const totalW = row.reduce((sum: number, s: any) => sum + s.width, 0);
      let xPos = 0;
      for (const s of row) {
        const w = (s.width / totalW) * 100;
        result[s._i] = { x: xPos, y: yPos, width: w, height: h };
        xPos += w;
      }
      yPos += h;
    });
    return result;
  }, [layout.slots, page.slotSpacing]);

  return (
    <Pressable
      style={[
        isCover ? styles.coverPage : styles.page,
        { width: w, height: h, backgroundColor: pageBg },
        isActive && styles.pageActive,
      ]}
      onPress={onCanvasPress}
    >
      {/* ── Layout slots ── */}
      {layout.slots.map((slot: any, slotIdx: number) => {
        const slotData = page.slots[slotIdx];
        const isThisSlotEditing = isEditingText && editingSlotIndex === slotIdx;
        const isTextSlot = slot.type === 'text';

        // Use tiled position if available, else raw layout position
        const baseX = tiledSlots ? tiledSlots[slotIdx].x : slot.x;
        const baseY = tiledSlots ? tiledSlots[slotIdx].y : slot.y;
        const baseW = tiledSlots ? tiledSlots[slotIdx].width : slot.width;
        const baseH = tiledSlots ? tiledSlots[slotIdx].height : slot.height;

        // Apply page margin (bordure): remap positions into padded area
        const margin = slotBorderW; // percentage
        const marginedX = margin + baseX * (100 - 2 * margin) / 100;
        const marginedY = margin + baseY * (100 - 2 * margin) / 100;
        const marginedW = baseW * (100 - 2 * margin) / 100;
        const marginedH = baseH * (100 - 2 * margin) / 100;

        // Apply spacing (espace) as inset between images
        const spacedX = marginedX + slotSpacing / 2;
        const spacedY = marginedY + slotSpacing / 2;
        const spacedW = marginedW - slotSpacing;
        const spacedH = marginedH - slotSpacing;

        // Image fit from slot data
        const imgScale = slotData?.imageScale ?? 1;
        const imgOffX = slotData?.imageOffsetX ?? 0;
        const imgOffY = slotData?.imageOffsetY ?? 0;

        // Convert percentage-based offsets to pixel translations
        const slotPixelW = (spacedW / 100) * w;
        const slotPixelH = (spacedH / 100) * h;
        const translatePxX = (imgOffX / 100) * slotPixelW;
        const translatePxY = (imgOffY / 100) * slotPixelH;

        // Image adjustments
        const slotBrightness = slotData?.brightness ?? 0;
        const slotContrast = slotData?.contrast ?? 0;
        const slotSaturation = slotData?.saturation ?? 0;
        const slotWarmth = slotData?.warmth ?? 0;
        const slotVignette = slotData?.vignette ?? 0;

        return (
          <Pressable
            key={`slot-${slotIdx}`}
            style={[
              isTextSlot ? styles.slotText : styles.slot,
              {
                position: 'absolute',
                left: `${spacedX}%`,
                top: `${spacedY}%`,
                width: `${spacedW}%`,
                height: `${spacedH}%`,
                borderRadius: page.slotBorderRadius !== undefined ? slotRadius : (slot.borderRadius || 0),
              } as any,
              isThisSlotEditing && styles.slotEditing,
            ]}
            onPress={() => onSlotPress(slotIdx)}
          >
            {slotData?.photoUri ? (
              <FilteredImage
                uri={slotData.photoUri}
                brightness={slotBrightness}
                contrast={slotContrast}
                saturation={slotSaturation}
                warmth={slotWarmth}
                sharpness={slotData?.sharpness ?? 0}
                vignette={slotVignette}
                containerStyle={{ flex: 1, width: '100%', height: '100%', overflow: 'hidden' }}
                imageStyle={[
                  styles.slotImage,
                  {
                    transform: [
                      { scale: imgScale },
                      { translateX: translatePxX },
                      { translateY: translatePxY },
                    ],
                  },
                ]}
              />
            ) : slotData?.text && isTextSlot ? (
              <Text
                style={[
                  styles.slotTextDirect,
                  isThisSlotEditing && styles.slotTextEditingBg,
                  {
                    fontSize: Math.min(slotData.fontSize || 14, w * 0.12),
                    fontFamily:
                      slotData.fontFamily && slotData.fontFamily !== 'System'
                        ? slotData.fontFamily
                        : undefined,
                    fontWeight: slotData.fontWeight || 'normal',
                    fontStyle: slotData.fontStyle || 'normal',
                    textDecorationLine:
                      slotData.textDecorationLine !== 'none'
                        ? slotData.textDecorationLine
                        : undefined,
                    textTransform:
                      slotData.textTransform !== 'none'
                        ? slotData.textTransform
                        : undefined,
                    textAlign: slotData.textAlign || 'center',
                    color: slotData.color || Colors.textPrimary,
                  },
                ]}
                numberOfLines={6}
              >
                {slotData.text}
              </Text>
            ) : slot.type === 'photo' ? (
              layout.slots.length > 1 ? (
                <View style={{ flex: 1, width: '100%', height: '100%' }}>
                  <Image
                    source={GRID_PLACEHOLDER}
                    style={styles.slotImage as any}
                  />
                  <View style={styles.slotPlaceholderOverlay}>
                    <Ionicons name="add" size={24} color="rgba(255,255,255,0.85)" />
                  </View>
                </View>
              ) : (
                <View style={styles.slotEmpty}>
                  <Ionicons name="add" size={20} color={Colors.textTertiary} />
                </View>
              )
            ) : (
              <View style={[styles.slotEmpty, styles.slotEmptyText]}>
                <Ionicons name="text" size={16} color={Colors.textTertiary} />
              </View>
            )}
          </Pressable>
        );
      })}

      {/* ── Dynamic text slots (backward compat with old drafts) ── */}
      {page.slots
        .filter(
          (_: any, i: number) => i >= layout.slots.length && _?.type === 'text',
        )
        .map((slotData: any, idx: number) => {
          const actualIdx = layout.slots.length + idx;
          const isThisSlotEditing =
            isEditingText && editingSlotIndex === actualIdx;
          return (
            <Pressable
              key={`dyn-text-${actualIdx}`}
              style={[
                styles.dynamicTextSlot,
                {
                  top: `${15 + idx * 18}%`,
                  left: '8%',
                  width: '84%',
                  height: '15%',
                },
                isThisSlotEditing && styles.slotEditing,
              ]}
              onPress={() => onSlotPress(actualIdx)}
            >
              {slotData?.text ? (
                <Text
                  style={{
                    fontSize: Math.min(slotData.fontSize || 14, w * 0.1),
                    fontFamily:
                      slotData.fontFamily && slotData.fontFamily !== 'System'
                        ? slotData.fontFamily
                        : undefined,
                    fontWeight: slotData.fontWeight || 'normal',
                    fontStyle: slotData.fontStyle || 'normal',
                    textDecorationLine:
                      slotData.textDecorationLine || 'none',
                    textTransform: slotData.textTransform || 'none',
                    textAlign: slotData.textAlign || 'center',
                    color: slotData.color || Colors.textPrimary,
                  }}
                  numberOfLines={4}
                >
                  {slotData.text}
                </Text>
              ) : (
                <Text style={styles.dynamicTextPlaceholder}>Tapez ici...</Text>
              )}
            </Pressable>
          );
        })}

      {/* ── Free-form overlay elements ── */}
      {elements.map((element: PageElement) => (
        <DraggableElement
          key={element.id}
          element={element}
          isSelected={element.id === selectedElementId}
          pageWidth={w}
          pageHeight={h}
          onSelect={() => onElementSelect(element)}
          onDelete={() => onElementDelete(element.id)}
          onPositionChange={(nx, ny) =>
            updateElement(pageIndex, element.id, { x: nx, y: ny })
          }
          onSizeChange={(nw, nh) =>
            updateElement(pageIndex, element.id, { width: nw, height: nh })
          }
          onRotationChange={(rot) =>
            updateElement(pageIndex, element.id, { rotation: rot })
          }
        />
      ))}
    </Pressable>
  );
}

// ═══════════════════════════════════════════════
//  Styles
// ═══════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    gap: 4,
    marginLeft: Spacing.xs,
  },
  orderBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  saveStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  saveDot: { width: 6, height: 6, borderRadius: 3 },
  saveText: { ...Typography.small, color: Colors.textTertiary },
  pageIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  pageIndicatorText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  coverSpineStrip: {
    flexDirection: 'row',
    zIndex: 10,
    overflow: 'hidden',
  },
  coverSpineEdge: {
    width: 1.5,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  coverSpineFill: {
    flex: 1,
    height: '100%',
    backgroundColor: '#F5F0EB',
  },
  viewToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewToggleBtnActive: {
    backgroundColor: '#FFF0F3',
    borderColor: Colors.accent,
  },
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 4,
    gap: 6,
  },
  zoomBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  zoomBtnDisabled: {
    opacity: 0.4,
  },
  zoomTrack: {
    width: 120,
    height: 20,
    borderRadius: 2,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    position: 'relative',
  },
  zoomTrackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
  },
  zoomTrackFill: {
    position: 'absolute',
    left: 0,
    top: 8,
    height: 4,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  zoomThumb: {
    position: 'absolute',
    top: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent,
    marginLeft: -6,
    borderWidth: 1.5,
    borderColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  zoomLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '600',
    width: 36,
    textAlign: 'center',
  },
  zoomResetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  zoomResetText: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: '700',
  },
  canvasAreaScroll: {
    flex: 1,
  },
  canvasAreaScrollContent: {
    flexGrow: 1,
  },
  canvasAreaInner: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  navArrowLeft: {
    position: 'absolute',
    left: 6,
    top: '50%',
    marginTop: -18,
    zIndex: 5,
  },
  navArrowRight: {
    position: 'absolute',
    right: 6,
    top: '50%',
    marginTop: -18,
    zIndex: 5,
  },
  canvasWrapper: {
    flex: 1,
    position: 'relative',
  },
  spread: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  spineOverlay: {
    width: 16,
    marginHorizontal: -8,
    zIndex: 10,
    position: 'relative',
  },
  spineLine: {
    position: 'absolute',
    left: '50%',
    marginLeft: -0.5,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  stackedSpread: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  coverSpread: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.sm,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  page: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  coverPage: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    borderRadius: BorderRadius.md,
  },
  pageActive: {
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  acheveContent: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  acheveLogo: {
    fontSize: 8,
    fontWeight: '700',
    color: '#1B2541',
    marginBottom: 1,
  },
  acheveText: {
    fontSize: 5,
    color: '#1B2541',
    textAlign: 'center',
    lineHeight: 8,
  },
  acheveLockBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailLocked: {
    opacity: 0.5,
  },
  spreadImageContainer: {
    overflow: 'hidden',
    borderRadius: 2,
  },
  spreadImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  spreadImagePlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textTertiary,
  },
  slot: { overflow: 'hidden' },
  slotText: { /* pas d'overflow hidden pour les slots texte — évite le clipping */ },
  slotEditing: {
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  slotImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  slotPlaceholderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  slotEmpty: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotEmptyText: {
    backgroundColor: '#F5F0FF',
    borderColor: '#DDD6FE',
  },
  slotTextDirect: {
    flex: 1,
    width: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 4,
  } as any,
  slotTextEditingBg: { backgroundColor: '#F5F0FF' },
  dynamicTextSlot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderStyle: 'dashed',
    borderRadius: 4,
    padding: 4,
    backgroundColor: 'rgba(245, 240, 255, 0.5)',
  },
  dynamicTextPlaceholder: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  hiddenTextInput: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    fontSize: 15,
    color: Colors.textPrimary,
    maxHeight: 80,
  },
  thumbnailContainer: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm,
    zIndex: 10,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  thumbnail: {
    width: 40,
    height: 52,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    marginRight: Spacing.xs,
  },
  thumbnailActive: {
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  thumbnailInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailNum: {
    ...Typography.small,
    color: Colors.textTertiary,
  },
  thumbnailActionBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginLeft: Spacing.xs,
    alignSelf: 'center',
  },
  thumbnailActionBtnAdd: {
    borderColor: Colors.accent,
  },
  undoRedoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 2,
    backgroundColor: Colors.white,
    gap: 4,
    zIndex: 10,
    elevation: 10,
  },
  undoRedoBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  undoRedoBtnDisabled: {
    opacity: 0.4,
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    zIndex: 10,
    elevation: 10,
  },
  toolItem: { flex: 1, alignItems: 'center', gap: 4 },
  toolItemActive: {},
  toolLabel: { ...Typography.small, color: Colors.textSecondary },
  toolLabelActive: { color: Colors.accent, fontWeight: '600' },
});
