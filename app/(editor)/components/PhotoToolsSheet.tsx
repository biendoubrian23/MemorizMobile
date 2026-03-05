import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import DraggableSlider from './DraggableSlider';
import FilteredImage from './FilteredImage';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import { PageSlotData } from '../../../src/types';
import { useEditorStore } from '../../../src/store/editorStore';
import { DEFAULT_LAYOUTS } from '../../../editor/utils/layouts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMNS = 4;
const GAP = 3;
const PHOTO_SIZE = (SCREEN_WIDTH - Spacing.md * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

// Crop preview constants
const CROP_FRAME_MAX = 150;
const CROP_PAD = 24;

const FORMAT_ASPECTS: Record<string, number> = {
  a4_portrait: 29.7 / 21,
  a4_landscape: 21 / 29.7,
  square: 1,
};

type MainTab = 'pellicule' | 'recadrage' | 'ajuster';
type GalleryTab = 'recents' | 'favorites' | 'albums';

interface Props {
  onSelectPhoto: (uri: string) => void;
  onClose: () => void;
  initialTab?: MainTab;
  pageIndex: number;
  slotIndex: number | null;
}

const GALLERY_TABS: { key: GalleryTab; label: string }[] = [
  { key: 'recents', label: 'Récents' },
  { key: 'favorites', label: 'Favoris' },
  { key: 'albums', label: 'Albums' },
];

export default function PhotoToolsSheet({
  onSelectPhoto,
  onClose,
  initialTab = 'pellicule',
  pageIndex,
  slotIndex,
}: Props) {
  const [mainTab, setMainTab] = useState<MainTab>(initialTab);
  const [galleryTab, setGalleryTab] = useState<GalleryTab>('recents');

  const { availablePhotos, addAvailablePhoto, pages } = useEditorStore();
  const updateSlotImageFit = useEditorStore((s) => s.updateSlotImageFit);
  const updateSlotPhoto = useEditorStore((s) => s.updateSlotPhoto);
  const storeFormat = useEditorStore((s) => s.format);

  const page = pages[pageIndex];
  const currentSlot = slotIndex != null ? page?.slots[slotIndex] : null;
  const hasPhoto = !!currentSlot?.photoUri;
  const imageScale = currentSlot?.imageScale ?? 1;
  const imageOffsetX = currentSlot?.imageOffsetX ?? 0;
  const imageOffsetY = currentSlot?.imageOffsetY ?? 0;

  // Image adjustments
  const brightness = currentSlot?.brightness ?? 0;
  const contrast = currentSlot?.contrast ?? 0;
  const saturation = currentSlot?.saturation ?? 0;
  const warmth = currentSlot?.warmth ?? 0;
  const sharpness = currentSlot?.sharpness ?? 0;
  const vignette = currentSlot?.vignette ?? 0;

  // ── Crop frame dimensions (component-level for gesture access) ──
  const pageAspect = FORMAT_ASPECTS[storeFormat || 'square'] || 1;
  const cropLayout = DEFAULT_LAYOUTS.find((l) => l.id === page?.layoutId);
  const cropLayoutSlot = slotIndex != null ? cropLayout?.slots[slotIndex] : null;
  const slotMargin = page?.slotBorderWidth ?? 0;
  const slotSpacingVal = page?.slotSpacing ?? 0;
  const rawSlotW = cropLayoutSlot?.width ?? 50;
  const rawSlotH = cropLayoutSlot?.height ?? 50;
  const marginedSlotW = rawSlotW * (100 - 2 * slotMargin) / 100;
  const marginedSlotH = rawSlotH * (100 - 2 * slotMargin) / 100;
  const spacedSlotW = marginedSlotW - slotSpacingVal;
  const spacedSlotH = marginedSlotH - slotSpacingVal;
  // Physical ratio = (percentW / percentH) / pageAspect
  // For spread images, the image spans 2 pages, so the ratio is doubled
  const basePhysicalRatio = spacedSlotH > 0 ? (spacedSlotW / spacedSlotH) / pageAspect : 1;
  const slotPhysicalRatio = page?.isSpreadImage ? basePhysicalRatio * 2 : basePhysicalRatio;

  let cropFrameW: number, cropFrameH: number;
  if (slotPhysicalRatio >= 1) {
    cropFrameW = CROP_FRAME_MAX;
    cropFrameH = CROP_FRAME_MAX / slotPhysicalRatio;
  } else {
    cropFrameH = CROP_FRAME_MAX;
    cropFrameW = CROP_FRAME_MAX * slotPhysicalRatio;
  }

  const usedUris = new Set<string>();
  pages.forEach((p) =>
    p.slots.forEach((slot) => {
      if (slot.photoUri) usedUris.add(slot.photoUri);
    }),
  );

  // ═══════════════════════════════════════
  // Pellicule handlers
  // ═══════════════════════════════════════
  const handlePickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', "L'accès à la galerie est nécessaire.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: 20,
    });
    if (!result.canceled && result.assets) {
      result.assets.forEach((asset) => addAvailablePhoto(asset.uri));
    }
  };

  const handleCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', "L'accès à la caméra est nécessaire.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!result.canceled && result.assets[0]) {
      addAvailablePhoto(result.assets[0].uri);
      onSelectPhoto(result.assets[0].uri);
    }
  };

  const handleSelectPhoto = (uri: string) => {
    onSelectPhoto(uri);
    // Auto-switch to recadrage if a slot is selected
    if (slotIndex != null) {
      setTimeout(() => setMainTab('recadrage'), 300);
    }
  };

  // ═══════════════════════════════════════
  // Recadrage handlers
  // ═══════════════════════════════════════
  const handleImageFitChange = useCallback(
    (fit: Partial<Pick<PageSlotData, 'imageScale' | 'imageOffsetX' | 'imageOffsetY'>>) => {
      if (slotIndex != null) {
        updateSlotImageFit(pageIndex, slotIndex, fit);
      }
    },
    [pageIndex, slotIndex, updateSlotImageFit],
  );

  const handleImageAdjustChange = useCallback(
    (adj: Partial<Pick<PageSlotData, 'brightness' | 'contrast' | 'saturation' | 'warmth' | 'sharpness' | 'vignette'>>) => {
      if (slotIndex != null) {
        updateSlotImageFit(pageIndex, slotIndex, adj);
      }
    },
    [pageIndex, slotIndex, updateSlotImageFit],
  );

  const handleRotate = useCallback(async () => {
    if (!currentSlot?.photoUri || slotIndex == null) return;
    try {
      const result = await ImageManipulator.manipulateAsync(
        currentSlot.photoUri,
        [{ rotate: 90 }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
      );
      updateSlotPhoto(pageIndex, slotIndex, result.uri);
    } catch {
      Alert.alert('Erreur', 'Impossible de pivoter l\'image.');
    }
  }, [currentSlot?.photoUri, pageIndex, slotIndex, updateSlotPhoto]);

  const handleFlipH = useCallback(async () => {
    if (!currentSlot?.photoUri || slotIndex == null) return;
    try {
      const result = await ImageManipulator.manipulateAsync(
        currentSlot.photoUri,
        [{ flip: ImageManipulator.FlipType.Horizontal }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
      );
      updateSlotPhoto(pageIndex, slotIndex, result.uri);
    } catch {
      Alert.alert('Erreur', 'Impossible de retourner l\'image.');
    }
  }, [currentSlot?.photoUri, pageIndex, slotIndex, updateSlotPhoto]);

  const handleFlipV = useCallback(async () => {
    if (!currentSlot?.photoUri || slotIndex == null) return;
    try {
      const result = await ImageManipulator.manipulateAsync(
        currentSlot.photoUri,
        [{ flip: ImageManipulator.FlipType.Vertical }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
      );
      updateSlotPhoto(pageIndex, slotIndex, result.uri);
    } catch {
      Alert.alert('Erreur', 'Impossible de retourner l\'image.');
    }
  }, [currentSlot?.photoUri, pageIndex, slotIndex, updateSlotPhoto]);

  // ═══════════════════════════════════════
  // Recadrage gesture state
  // ═══════════════════════════════════════
  const animScale = useSharedValue(imageScale);
  const animOffsetX = useSharedValue(imageOffsetX);
  const animOffsetY = useSharedValue(imageOffsetY);
  const pinchStart = useSharedValue(1);
  const panStartX = useSharedValue(0);
  const panStartY = useSharedValue(0);

  useEffect(() => {
    animScale.value = imageScale;
    animOffsetX.value = imageOffsetX;
    animOffsetY.value = imageOffsetY;
  }, [imageScale, imageOffsetX, imageOffsetY]);

  const commitCropValues = useCallback(
    (scale: number, offX: number, offY: number) => {
      handleImageFitChange({
        imageScale: Math.round(scale * 100) / 100,
        imageOffsetX: Math.round(offX * 10) / 10, // percentage with 1 decimal
        imageOffsetY: Math.round(offY * 10) / 10,
      });
    },
    [handleImageFitChange],
  );

  // Capture frame dimensions for worklets (plain numbers are serialisable)
  const cfW = cropFrameW;
  const cfH = cropFrameH;

  const panGesture = Gesture.Pan()
    .onStart(() => {
      panStartX.value = animOffsetX.value;
      panStartY.value = animOffsetY.value;
    })
    .onUpdate((e) => {
      // Offsets are now percentages of the frame size
      animOffsetX.value = panStartX.value + (e.translationX * 0.5 / cfW) * 100;
      animOffsetY.value = panStartY.value + (e.translationY * 0.5 / cfH) * 100;
    })
    .onEnd(() => {
      runOnJS(commitCropValues)(animScale.value, animOffsetX.value, animOffsetY.value);
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      pinchStart.value = animScale.value;
    })
    .onUpdate((e) => {
      animScale.value = Math.max(0.5, Math.min(3, pinchStart.value * e.scale));
    })
    .onEnd(() => {
      runOnJS(commitCropValues)(animScale.value, animOffsetX.value, animOffsetY.value);
    });

  const cropGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedCropStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: animScale.value },
      { translateX: (animOffsetX.value / 100) * cfW },
      { translateY: (animOffsetY.value / 100) * cfH },
    ],
  }));

  // ═══════════════════════════════════════
  // RENDER: Pellicule tab
  // ═══════════════════════════════════════
  const renderPelliculeTab = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.galleryTabRow}>
        {GALLERY_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.galleryTab, galleryTab === tab.key && styles.galleryTabActive]}
            onPress={() => setGalleryTab(tab.key)}
          >
            <Text style={[styles.galleryTabText, galleryTab === tab.key && styles.galleryTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={handlePickFromLibrary}>
          <Ionicons name="images-outline" size={20} color={Colors.primary} />
          <Text style={styles.actionBtnText}>Galerie</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleCamera}>
          <Ionicons name="camera-outline" size={20} color={Colors.primary} />
          <Text style={styles.actionBtnText}>Caméra</Text>
        </TouchableOpacity>
      </View>

      {availablePhotos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={48} color={Colors.border} />
          <Text style={styles.emptyText}>Aucune photo importée</Text>
          <Text style={styles.emptySubtext}>Ajoutez des photos depuis votre galerie</Text>
        </View>
      ) : (
        <FlatList
          data={availablePhotos}
          numColumns={COLUMNS}
          keyExtractor={(item, idx) => `photo-${idx}`}
          contentContainerStyle={styles.photoGrid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isUsed = usedUris.has(item);
            return (
              <TouchableOpacity
                style={styles.photoItem}
                onPress={() => handleSelectPhoto(item)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: item }} style={styles.photoImage} />
                {isUsed && (
                  <View style={styles.usedBadge}>
                    <Text style={styles.usedBadgeText}>Utilisée</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );

  // ═══════════════════════════════════════
  // RENDER: Recadrage tab
  // ═══════════════════════════════════════
  const renderRecadrageTab = () => {
    if (!hasPhoto || slotIndex == null) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="crop-outline" size={40} color={Colors.borderLight} />
          <Text style={styles.emptyText}>Aucune photo sélectionnée</Text>
          <Text style={styles.emptySubtext}>
            Sélectionnez un bloc contenant une photo{'\n'}pour ajuster son cadrage
          </Text>
        </View>
      );
    }

    // Use component-level frame dimensions (accounts for page aspect + margins + spacing)
    const frameW = cropFrameW;
    const frameH = cropFrameH;
    const containerW = frameW + CROP_PAD * 2;
    const containerH = frameH + CROP_PAD * 2;

    return (
      <View style={styles.cropContainer}>
        {/* Interactive crop preview */}
        <View style={styles.cropPreviewWrapper}>
          <View
            style={[
              styles.cropPreviewOuter,
              { width: containerW, height: containerH },
            ]}
          >
            <GestureDetector gesture={cropGesture}>
              <Animated.View style={StyleSheet.absoluteFill}>
                <Animated.Image
                  source={{ uri: currentSlot!.photoUri }}
                  style={[
                    {
                      position: 'absolute',
                      left: CROP_PAD,
                      top: CROP_PAD,
                      width: frameW,
                      height: frameH,
                    },
                    animatedCropStyle,
                  ]}
                  resizeMode="cover"
                />
              </Animated.View>
            </GestureDetector>

            {/* Dark overlays around the frame */}
            <View
              style={[styles.cropOverlay, { top: 0, left: 0, right: 0, height: CROP_PAD }]}
              pointerEvents="none"
            />
            <View
              style={[styles.cropOverlay, { bottom: 0, left: 0, right: 0, height: CROP_PAD }]}
              pointerEvents="none"
            />
            <View
              style={[
                styles.cropOverlay,
                { top: CROP_PAD, left: 0, width: CROP_PAD, height: frameH },
              ]}
              pointerEvents="none"
            />
            <View
              style={[
                styles.cropOverlay,
                { top: CROP_PAD, right: 0, width: CROP_PAD, height: frameH },
              ]}
              pointerEvents="none"
            />

            {/* Frame border */}
            <View
              style={[
                styles.cropFrame,
                {
                  left: CROP_PAD,
                  top: CROP_PAD,
                  width: frameW,
                  height: frameH,
                },
              ]}
              pointerEvents="none"
            />
          </View>

          <Text style={styles.cropHintText}>
            Pincez pour zoomer {`\u2022`} Glissez pour déplacer
          </Text>
        </View>

        {/* Zoom slider */}
        <View style={styles.cropZoomRow}>
          <Ionicons name="search-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.cropInfoText}>Zoom : {Math.round(imageScale * 100)}%</Text>
        </View>
        <View style={styles.sliderRow}>
          <TouchableOpacity onPress={() => handleImageFitChange({ imageScale: Math.max(0.5, +(imageScale - 0.05).toFixed(2)) })}>
            <Ionicons name="remove-circle-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <DraggableSlider
            min={0.5}
            max={3}
            value={imageScale}
            step={0.05}
            onValueChange={(v) => handleImageFitChange({ imageScale: v })}
          />
          <TouchableOpacity onPress={() => handleImageFitChange({ imageScale: Math.min(3, +(imageScale + 0.05).toFixed(2)) })}>
            <Ionicons name="add-circle-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Bottom section pinned to bottom */}
        <View style={styles.cropBottomSection}>
          {/* Transformation */}
          <Text style={styles.sectionTitle}>Transformation</Text>
          <View style={styles.transformRow}>
            <TouchableOpacity style={styles.transformBtn} onPress={handleRotate}>
              <Ionicons name="refresh-outline" size={24} color={Colors.textPrimary} />
              <Text style={styles.transformLabel}>Pivoter 90°</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.transformBtn} onPress={handleFlipH}>
              <Ionicons name="swap-horizontal-outline" size={24} color={Colors.textPrimary} />
              <Text style={styles.transformLabel}>Miroir H</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.transformBtn} onPress={handleFlipV}>
              <Ionicons name="swap-vertical-outline" size={24} color={Colors.textPrimary} />
              <Text style={styles.transformLabel}>Miroir V</Text>
            </TouchableOpacity>
          </View>

          {/* Reset */}
          <TouchableOpacity
            style={styles.cropResetBtn}
            onPress={() => handleImageFitChange({ imageScale: 1, imageOffsetX: 0, imageOffsetY: 0 })}
          >
            <Ionicons name="refresh-outline" size={14} color={Colors.accent} />
            <Text style={styles.resetText}>Réinitialiser</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ═══════════════════════════════════════
  // RENDER: Ajuster tab
  // ═══════════════════════════════════════
  type AdjustKey = 'brightness' | 'contrast' | 'saturation' | 'warmth' | 'sharpness' | 'vignette';
  const [selectedAdj, setSelectedAdj] = useState<AdjustKey>('brightness');

  const ADJUSTMENTS: { key: AdjustKey; label: string; icon: string; min: number; max: number; value: number }[] = [
    { key: 'brightness', label: 'Luminosité', icon: 'sunny-outline', min: -100, max: 100, value: brightness },
    { key: 'contrast', label: 'Contraste', icon: 'contrast-outline', min: -100, max: 100, value: contrast },
    { key: 'saturation', label: 'Saturation', icon: 'water-outline', min: -100, max: 100, value: saturation },
    { key: 'warmth', label: 'Éclat', icon: 'sunny', min: -100, max: 100, value: warmth },
    { key: 'sharpness', label: 'Affiner', icon: 'triangle-outline', min: 0, max: 100, value: sharpness },
    { key: 'vignette', label: 'Vignette', icon: 'ellipse-outline', min: 0, max: 100, value: vignette },
  ];

  const renderAjusterTab = () => {
    if (!hasPhoto || slotIndex == null) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="color-wand-outline" size={40} color={Colors.borderLight} />
          <Text style={styles.emptyText}>Aucune photo sélectionnée</Text>
          <Text style={styles.emptySubtext}>
            Sélectionnez un bloc contenant une photo{'\n'}pour ajuster ses paramètres
          </Text>
        </View>
      );
    }

    // Compute preview overlay opacity for brightness preview
    const activeAdj = ADJUSTMENTS.find((a) => a.key === selectedAdj)!;

    return (
      <View style={styles.ajusterContainer}>
        {/* Preview with real color matrix filters */}
        <View style={styles.adjPreviewContainer}>
          <View style={styles.adjPreviewFrame}>
            <FilteredImage
              uri={currentSlot!.photoUri}
              brightness={brightness}
              contrast={contrast}
              saturation={saturation}
              warmth={warmth}
              sharpness={sharpness}
              vignette={vignette}
              containerStyle={{ width: '100%', height: '100%' }}
              imageStyle={{
                width: '100%',
                height: '100%',
                transform: [
                  { scale: imageScale },
                  { translateX: imageOffsetX },
                  { translateY: imageOffsetY },
                ],
              }}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Horizontal scrollable adjustment icons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.adjIconsRow}
          style={styles.adjIconsScroll}
        >
          {ADJUSTMENTS.map((adj) => {
            const isActive = selectedAdj === adj.key;
            const hasValue = adj.value !== 0;
            return (
              <TouchableOpacity
                key={adj.key}
                style={styles.adjIconItem}
                onPress={() => setSelectedAdj(adj.key)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.adjIconCircle,
                  isActive && styles.adjIconCircleActive,
                  hasValue && !isActive && styles.adjIconCircleModified,
                ]}>
                  <Ionicons
                    name={adj.icon as any}
                    size={24}
                    color={isActive ? Colors.accent : hasValue ? Colors.textPrimary : Colors.textTertiary}
                  />
                </View>
                <Text style={[
                  styles.adjIconLabel,
                  isActive && styles.adjIconLabelActive,
                ]} numberOfLines={1}>
                  {adj.label}
                </Text>
                {hasValue && (
                  <View style={[styles.adjDot, isActive && styles.adjDotActive]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Active slider for selected adjustment */}
        <View style={styles.adjSliderSection}>
          <View style={styles.adjSliderHeader}>
            <Ionicons name={activeAdj.icon as any} size={16} color={Colors.textSecondary} />
            <Text style={styles.adjSliderTitle}>
              {activeAdj.label} : {activeAdj.value > 0 ? '+' : ''}{activeAdj.value}
            </Text>
          </View>
          <View style={styles.sliderRow}>
            <TouchableOpacity onPress={() => handleImageAdjustChange({ [activeAdj.key]: Math.max(activeAdj.min, activeAdj.value - 5) })}>
              <Ionicons name="remove-circle-outline" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <DraggableSlider
              min={activeAdj.min}
              max={activeAdj.max}
              value={activeAdj.value}
              step={1}
              onValueChange={(v) => handleImageAdjustChange({ [activeAdj.key]: v })}
            />
            <TouchableOpacity onPress={() => handleImageAdjustChange({ [activeAdj.key]: Math.min(activeAdj.max, activeAdj.value + 5) })}>
              <Ionicons name="add-circle-outline" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.sliderValue}>{activeAdj.value}</Text>
          </View>
        </View>

        {/* Reset adjustments */}
        <TouchableOpacity
          style={styles.adjResetBtn}
          onPress={() => handleImageAdjustChange({ brightness: 0, contrast: 0, saturation: 0, warmth: 0, sharpness: 0, vignette: 0 })}
        >
          <Ionicons name="refresh-outline" size={16} color={Colors.accent} />
          <Text style={styles.resetText}>Réinitialiser</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ═══════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════
  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Photos</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Main tabs */}
        <View style={styles.mainTabRow}>
          <TouchableOpacity
            style={[styles.mainTab, mainTab === 'pellicule' && styles.mainTabActive]}
            onPress={() => setMainTab('pellicule')}
          >
            <Ionicons
              name="images-outline"
              size={20}
              color={mainTab === 'pellicule' ? Colors.accent : Colors.textTertiary}
            />
            <Text style={[styles.mainTabLabel, mainTab === 'pellicule' && styles.mainTabLabelActive]}>
              Pellicule
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mainTab, mainTab === 'recadrage' && styles.mainTabActive]}
            onPress={() => setMainTab('recadrage')}
          >
            <Ionicons
              name="crop-outline"
              size={20}
              color={mainTab === 'recadrage' ? Colors.accent : Colors.textTertiary}
            />
            <Text style={[styles.mainTabLabel, mainTab === 'recadrage' && styles.mainTabLabelActive]}>
              Recadrage
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mainTab, mainTab === 'ajuster' && styles.mainTabActive]}
            onPress={() => setMainTab('ajuster')}
          >
            <Ionicons
              name="color-wand-outline"
              size={20}
              color={mainTab === 'ajuster' ? Colors.accent : Colors.textTertiary}
            />
            <Text style={[styles.mainTabLabel, mainTab === 'ajuster' && styles.mainTabLabelActive]}>
              Ajuster
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {mainTab === 'pellicule'
            ? renderPelliculeTab()
            : mainTab === 'recadrage'
              ? renderRecadrageTab()
              : renderAjusterTab()}
        </View>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════
// STYLES
// ═══════════════════════════════════════
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  sheet: { flex: 1 },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
    marginTop: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  headerTitle: { ...Typography.h4, color: Colors.textPrimary },

  // ─── Main tabs ───
  mainTabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  mainTabActive: {
    borderBottomColor: Colors.accent,
  },
  mainTabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  mainTabLabelActive: {
    color: Colors.accent,
  },

  content: { flex: 1 },

  // ─── Gallery sub-tabs ───
  galleryTabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  galleryTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  galleryTabActive: { backgroundColor: Colors.primary },
  galleryTabText: { ...Typography.caption, fontWeight: '600', color: Colors.textSecondary },
  galleryTabTextActive: { color: Colors.white },

  // ─── Actions row ───
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  actionBtnText: { ...Typography.caption, fontWeight: '600', color: Colors.primary },

  // ─── Photo grid ───
  photoGrid: { paddingHorizontal: Spacing.md },
  photoItem: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    margin: GAP / 2,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  photoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  usedBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  usedBadgeText: { fontSize: 9, fontWeight: '700', color: Colors.white },

  // ─── Empty state ───
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyText: { ...Typography.body, color: Colors.textSecondary, fontWeight: '600' },
  emptySubtext: { ...Typography.caption, color: Colors.textTertiary, textAlign: 'center' },

  // ─── Recadrage crop preview ───
  cropContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  cropPreviewWrapper: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cropPreviewOuter: {
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  cropOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  cropFrame: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: 2,
  },
  cropHintText: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  cropInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  cropZoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    marginBottom: 2,
  },
  cropInfoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  cropBottomSection: {
    marginTop: 'auto',
    paddingBottom: Spacing.sm,
  },
  cropResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sliderLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    marginTop: Spacing.sm,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  sliderValue: {
    fontSize: 12,
    color: Colors.textSecondary,
    width: 40,
    textAlign: 'right',
  },

  // ─── Reset ───
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  resetText: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '600',
  },

  // ─── Transform ───
  transformRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  transformBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundSecondary,
    gap: 4,
  },
  transformLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // ─── Ajuster tab layout ───
  ajusterContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  adjPreviewContainer: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  adjPreviewFrame: {
    width: 130,
    height: 130,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.backgroundSecondary,
  },
  adjIconsScroll: {
    flexGrow: 0,
    marginTop: Spacing.md,
  },
  adjIconsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  adjIconItem: {
    alignItems: 'center',
    width: 58,
  },
  adjIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  adjIconCircleActive: {
    borderColor: Colors.accent,
    borderWidth: 2,
    backgroundColor: `${Colors.accent}10`,
  },
  adjIconCircleModified: {
    borderColor: Colors.textSecondary,
  },
  adjIconLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 6,
    textAlign: 'center',
  },
  adjIconLabelActive: {
    color: Colors.accent,
    fontWeight: '600',
  },
  adjDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.textSecondary,
    marginTop: 3,
  },
  adjDotActive: {
    backgroundColor: Colors.accent,
  },
  adjSliderSection: {
    marginTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  adjSliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  adjSliderTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  adjResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
