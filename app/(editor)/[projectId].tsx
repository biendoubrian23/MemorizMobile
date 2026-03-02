import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/theme';
import { useEditorStore } from '../../src/store/editorStore';
import { DEFAULT_LAYOUTS } from '../../editor/utils/layouts';
import PhotoPickerSheet from './components/PhotoPickerSheet';
import LayoutSelectorSheet from './components/LayoutSelectorSheet';
import { PageLayout } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SPREAD_WIDTH = SCREEN_WIDTH - Spacing.xl * 2;
const PAGE_WIDTH = SPREAD_WIDTH / 2;
const PAGE_ASPECT = 1.3;
const PAGE_HEIGHT = PAGE_WIDTH * PAGE_ASPECT;

type ToolbarTab = 'layout' | 'photos' | 'text' | 'themes';

export default function EditorScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const {
    pages,
    selectedPageIndex,
    isSaved,
    setSelectedPage,
    setSelectedSlot,
    updateSlotPhoto,
    updatePageLayout,
  } = useEditorStore();

  const [activeSheet, setActiveSheet] = useState<ToolbarTab | null>(null);

  const spreadStart = selectedPageIndex % 2 === 0 ? selectedPageIndex : selectedPageIndex - 1;
  const leftPage = pages[spreadStart];
  const rightPage = pages[spreadStart + 1];

  const canGoBack = spreadStart >= 2;
  const canGoForward = spreadStart + 2 < pages.length;

  const navigateSpread = (dir: 'prev' | 'next') => {
    if (dir === 'prev' && canGoBack) setSelectedPage(spreadStart - 2);
    if (dir === 'next' && canGoForward) setSelectedPage(spreadStart + 2);
  };

  const handleSlotPress = (pageIdx: number, slotIdx: number) => {
    setSelectedSlot(slotIdx);
    setSelectedPage(pageIdx);
    setActiveSheet('photos');
  };

  const handlePhotoSelected = (uri: string) => {
    const state = useEditorStore.getState();
    const slotIdx = state.selectedSlotIndex ?? 0;
    updateSlotPhoto(state.selectedPageIndex, slotIdx, uri);
    setActiveSheet(null);
  };

  const handleLayoutSelected = (layout: PageLayout) => {
    updatePageLayout(selectedPageIndex, layout);
    setActiveSheet(null);
  };

  const handleSave = () => {
    Alert.alert('Sauvegarde', 'Projet sauvegardé !');
    useEditorStore.getState().markSaved();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Mon Souvenir</Text>
          <View style={styles.saveStatus}>
            <View
              style={[styles.saveDot, { backgroundColor: isSaved ? Colors.success : Colors.warning }]}
            />
            <Text style={styles.saveText}>{isSaved ? 'Sauvegardé' : 'Non sauvegardé'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
          <Ionicons name="cloud-upload-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Page Indicator */}
      <View style={styles.pageIndicator}>
        <Text style={styles.pageIndicatorText}>
          Pages {spreadStart + 1}-{Math.min(spreadStart + 2, pages.length)}
        </Text>
      </View>

      {/* Canvas Area */}
      <View style={styles.canvasArea}>
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

        <View style={styles.spread}>
          {leftPage && (
            <PageView
              page={leftPage}
              pageIndex={spreadStart}
              onSlotPress={(slotIdx) => handleSlotPress(spreadStart, slotIdx)}
              isActive={selectedPageIndex === spreadStart}
            />
          )}
          {rightPage && (
            <PageView
              page={rightPage}
              pageIndex={spreadStart + 1}
              onSlotPress={(slotIdx) => handleSlotPress(spreadStart + 1, slotIdx)}
              isActive={selectedPageIndex === spreadStart + 1}
            />
          )}
        </View>

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
      </View>

      {/* Page Thumbnails */}
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

      {/* Bottom Toolbar */}
      <View style={styles.toolbar}>
        {([
          { key: 'layout' as ToolbarTab, icon: 'grid-outline', label: 'Mise en page' },
          { key: 'photos' as ToolbarTab, icon: 'images-outline', label: 'Photos' },
          { key: 'text' as ToolbarTab, icon: 'text-outline', label: 'Texte' },
          { key: 'themes' as ToolbarTab, icon: 'color-palette-outline', label: 'Thèmes' },
        ]).map((tool) => (
          <TouchableOpacity
            key={tool.key}
            style={[styles.toolItem, activeSheet === tool.key && styles.toolItemActive]}
            onPress={() => setActiveSheet(activeSheet === tool.key ? null : tool.key)}
          >
            <Ionicons
              name={tool.icon as any}
              size={22}
              color={activeSheet === tool.key ? Colors.accent : Colors.textSecondary}
            />
            <Text
              style={[styles.toolLabel, activeSheet === tool.key && styles.toolLabelActive]}
            >
              {tool.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Sheets */}
      {activeSheet === 'photos' && (
        <PhotoPickerSheet
          onSelect={handlePhotoSelected}
          onClose={() => setActiveSheet(null)}
        />
      )}
      {activeSheet === 'layout' && (
        <LayoutSelectorSheet
          onSelect={handleLayoutSelected}
          onClose={() => setActiveSheet(null)}
          currentLayoutId={pages[selectedPageIndex]?.layoutId}
        />
      )}
    </SafeAreaView>
  );
}

// ═══ Page View Component ═══
function PageView({
  page,
  pageIndex,
  onSlotPress,
  isActive,
}: {
  page: any;
  pageIndex: number;
  onSlotPress: (slotIdx: number) => void;
  isActive: boolean;
}) {
  const layout = DEFAULT_LAYOUTS.find((l) => l.id === page.layoutId) || DEFAULT_LAYOUTS[0];

  return (
    <TouchableOpacity
      style={[styles.page, isActive && styles.pageActive]}
      activeOpacity={0.85}
    >
      {layout.slots.map((slot, slotIdx) => {
        const slotData = page.slots[slotIdx];
        return (
          <TouchableOpacity
            key={slotIdx}
            style={[
              styles.slot,
              {
                position: 'absolute',
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                width: `${slot.width}%`,
                height: `${slot.height}%`,
                borderRadius: slot.borderRadius || 0,
              } as any,
            ]}
            onPress={() => onSlotPress(slotIdx)}
          >
            {slotData?.photoUri ? (
              <Image source={{ uri: slotData.photoUri }} style={styles.slotImage} />
            ) : slot.type === 'photo' ? (
              <View style={styles.slotEmpty}>
                <Ionicons name="add" size={20} color={Colors.textTertiary} />
              </View>
            ) : (
              <View style={styles.slotEmpty}>
                <Ionicons name="text" size={16} color={Colors.textTertiary} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </TouchableOpacity>
  );
}

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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
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
  saveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  saveText: {
    ...Typography.small,
    color: Colors.textTertiary,
  },
  pageIndicator: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  pageIndicatorText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
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
  navArrowLeft: {},
  navArrowRight: {},
  spread: {
    flexDirection: 'row',
    marginHorizontal: Spacing.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  page: {
    width: PAGE_WIDTH - 24,
    height: PAGE_HEIGHT,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  pageActive: {
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  slot: {
    overflow: 'hidden',
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
  toolbar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  toolItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  toolItemActive: {},
  toolLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  toolLabelActive: {
    color: Colors.accent,
    fontWeight: '600',
  },
});
