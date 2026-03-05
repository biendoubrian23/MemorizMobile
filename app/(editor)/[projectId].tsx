import React, { useCallback, useState, useEffect, useRef } from 'react';
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
import PhotoPickerSheet from './components/PhotoPickerSheet';
import LayoutSelectorSheet from './components/LayoutSelectorSheet';
import TemplateSelectorSheet, { ALBUM_TEMPLATES, MAGAZINE_TEMPLATES } from './components/TemplateSelectorSheet';
import InteriorTemplateSelectorSheet, { INTERIOR_ALBUM_TEMPLATES, INTERIOR_MAGAZINE_TEMPLATES } from './components/InteriorTemplateSelectorSheet';
import TextStylesSheet, { TEXT_STYLE_PRESETS } from './components/TextStylesSheet';
import TextFormattingToolbar from './components/TextFormattingToolbar';
import DraggableElement from './components/DraggableElement';
import { PageLayout, TextStylePreset, PageSlotData, PageElement } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
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
    setSelectedSlot,
    setSelectedElementId,
    updateSlotPhoto,
    updateSlotText,
    updateSlotTextStyle,
    updatePageLayout,
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
  const PAGE_WIDTH = PAGE_WIDTH_BASE;

  // ── UI state ──
  const [activeSheet, setActiveSheet] = useState<ToolbarTab | null>(null);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | null>(null);
  const [isStackedView, setIsStackedView] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Track whether photo picker was opened for a specific slot or "free"
  const [photoTargetSlot, setPhotoTargetSlot] = useState<{
    pageIdx: number;
    slotIdx: number;
  } | null>(null);

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
  const isCoverView = selectedPageIndex === 0;
  const getSpreadStart = () => {
    if (selectedPageIndex === 0) return 0;
    return selectedPageIndex % 2 === 1 ? selectedPageIndex : selectedPageIndex - 1;
  };
  const actualSpreadStart = getSpreadStart();
  const leftPage = pages[actualSpreadStart];
  const rightPage = isCoverView ? null : pages[actualSpreadStart + 1];
  const canGoBack = actualSpreadStart > 0;
  const canGoForward = isCoverView
    ? pages.length > 1
    : actualSpreadStart + 2 < pages.length;

  const navigateSpread = (dir: 'prev' | 'next') => {
    if (dir === 'prev') {
      setSelectedPage(actualSpreadStart === 1 ? 0 : Math.max(0, actualSpreadStart - 2));
    } else {
      setSelectedPage(isCoverView ? 1 : Math.min(pages.length - 1, actualSpreadStart + 2));
    }
  };

  // ═══════════════ Slot handlers ═══════════════
  const handleSlotPress = (pageIdx: number, slotIdx: number) => {
    setSelectedElementId(null);
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
      }
    },
    [selectedElementId, selectedPageIndex, pages, isEditingText],
  );

  const handleCanvasPress = () => {
    if (selectedElementId) setSelectedElementId(null);
    if (isEditingText) handleValidateText();
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
    setActiveSheet(activeSheet === 'photos' ? null : 'photos');
  };

  // ═══════════════ Layout / Template ═══════════════
  const handleLayoutSelected = (layout: PageLayout) => {
    updatePageLayout(selectedPageIndex, layout);
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

      {/* ─── Page indicator + toggle ─── */}
      <View style={styles.pageIndicatorRow}>
        <Text style={styles.pageIndicatorText}>
          {isCoverView
            ? 'Couverture'
            : `Pages ${actualSpreadStart + 1}-${Math.min(
                actualSpreadStart + 2,
                pages.length,
              )}`}
        </Text>
        {!isCoverView && (
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

      {/* ─── Canvas area ─── */}
      <View style={styles.canvasArea}>
        {/* Left arrow */}
        <TouchableOpacity
          style={[
            styles.navArrow,
            isStackedView && { position: 'absolute' as const, left: 4, zIndex: 10 },
          ]}
          onPress={() => navigateSpread('prev')}
          disabled={!canGoBack}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={canGoBack ? Colors.textSecondary : Colors.borderLight}
          />
        </TouchableOpacity>

        {/* Pages */}
        {isCoverView ? (
          <View style={styles.coverSpread}>
            {leftPage && (
              <PageView
                page={leftPage}
                pageIndex={actualSpreadStart}
                onSlotPress={(si) => handleSlotPress(actualSpreadStart, si)}
                onElementSelect={(el) => handleElementSelect(actualSpreadStart, el)}
                onElementDelete={(id) => removeElement(actualSpreadStart, id)}
                onCanvasPress={handleCanvasPress}
                selectedElementId={selectedElementId}
                isActive
                isCover
                pageWidth={PAGE_WIDTH}
                pageHeight={PAGE_HEIGHT}
                isEditingText={isEditingText}
                editingSlotIndex={
                  editingPageIndex === actualSpreadStart ? editingSlotIndex : null
                }
              />
            )}
          </View>
        ) : isStackedView ? (
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
                isActive={selectedPageIndex === actualSpreadStart}
                isCover={false}
                pageWidth={stackedPageWidth}
                pageHeight={stackedPageHeight}
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
                  isActive={selectedPageIndex === actualSpreadStart + 1}
                  isCover={false}
                  pageWidth={stackedPageWidth}
                  pageHeight={stackedPageHeight}
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
                isActive={selectedPageIndex === actualSpreadStart}
                isCover={false}
                pageWidth={PAGE_WIDTH}
                pageHeight={PAGE_HEIGHT}
                isEditingText={isEditingText}
                editingSlotIndex={
                  editingPageIndex === actualSpreadStart ? editingSlotIndex : null
                }
              />
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
                isActive={selectedPageIndex === actualSpreadStart + 1}
                isCover={false}
                pageWidth={PAGE_WIDTH}
                pageHeight={PAGE_HEIGHT}
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

        {/* Right arrow */}
        <TouchableOpacity
          style={[
            styles.navArrow,
            isStackedView && { position: 'absolute' as const, right: 4, zIndex: 10 },
          ]}
          onPress={() => navigateSpread('next')}
          disabled={!canGoForward}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={canGoForward ? Colors.textSecondary : Colors.borderLight}
          />
        </TouchableOpacity>
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
      {!(isEditingText && keyboardVisible) && (
        <View style={styles.thumbnailContainer}>
          <FlatList
            data={pages}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
            keyExtractor={(_, i) => `thumb-${i}`}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.thumbnail,
                  index === selectedPageIndex && styles.thumbnailActive,
                ]}
                onPress={() => setSelectedPage(index)}
              >
                <View style={styles.thumbnailInner}>
                  <Text style={styles.thumbnailNum}>{index + 1}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
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
              size={20}
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
              size={20}
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
        <PhotoPickerSheet
          onSelect={handlePhotoSelected}
          onClose={() => {
            setActiveSheet(null);
            setPhotoTargetSlot(null);
          }}
        />
      )}
      {activeSheet === 'layout' && (
        <LayoutSelectorSheet
          onSelect={handleLayoutSelected}
          onClose={() => setActiveSheet(null)}
          currentLayoutId={pages[selectedPageIndex]?.layoutId}
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

  const coverW = SPREAD_WIDTH * 0.7;
  const coverH = coverW * (pageHeight / pageWidth);
  const w = isCover ? coverW : pageWidth - 24;
  const h = isCover ? coverH : pageHeight;

  const elements = [...(page.elements || [])].sort(
    (a: PageElement, b: PageElement) => a.zIndex - b.zIndex,
  );

  return (
    <Pressable
      style={[
        isCover ? styles.coverPage : styles.page,
        { width: w, height: h },
        isActive && styles.pageActive,
      ]}
      onPress={onCanvasPress}
    >
      {/* ── Layout slots ── */}
      {layout.slots.map((slot: any, slotIdx: number) => {
        const slotData = page.slots[slotIdx];
        const isThisSlotEditing = isEditingText && editingSlotIndex === slotIdx;
        const isTextSlot = slot.type === 'text';
        return (
          <Pressable
            key={`slot-${slotIdx}`}
            style={[
              isTextSlot ? styles.slotText : styles.slot,
              {
                position: 'absolute',
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                width: `${slot.width}%`,
                height: `${slot.height}%`,
                borderRadius: slot.borderRadius || 0,
              } as any,
              isThisSlotEditing && styles.slotEditing,
            ]}
            onPress={() => onSlotPress(slotIdx)}
          >
            {slotData?.photoUri ? (
              <Image
                source={{ uri: slotData.photoUri }}
                style={styles.slotImage}
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
              <View style={styles.slotEmpty}>
                <Ionicons name="add" size={20} color={Colors.textTertiary} />
              </View>
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
  spread: {
    flexDirection: 'row',
    marginHorizontal: Spacing.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
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
  slotEmpty: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
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
  undoRedoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 4,
    backgroundColor: Colors.white,
    gap: Spacing.sm,
  },
  undoRedoBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  },
  toolItem: { flex: 1, alignItems: 'center', gap: 4 },
  toolItemActive: {},
  toolLabel: { ...Typography.small, color: Colors.textSecondary },
  toolLabelActive: { color: Colors.accent, fontWeight: '600' },
});
