import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import DraggableSlider from './DraggableSlider';
import { PageLayout, PageData } from '../../../src/types';
import {
  DEFAULT_LAYOUTS,
  SINGLE_LAYOUTS,
  DOUBLE_LAYOUTS,
  COLLAGE_LAYOUTS,
  TEXT_LAYOUTS,
} from '../../../editor/utils/layouts';
import { useEditorStore } from '../../../src/store/editorStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const GRID_GAP = Spacing.md;
const GRID_ITEM = (SCREEN_WIDTH - Spacing.xl * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

// ─── Tab definitions ───
type ToolTab = 'grille' | 'couleur' | 'bordures' | 'espacement';

const TOOL_TABS: { key: ToolTab; icon: string; label: string }[] = [
  { key: 'grille', icon: 'grid-outline', label: 'Grille' },
  { key: 'couleur', icon: 'color-palette-outline', label: 'Couleur' },
  { key: 'bordures', icon: 'square-outline', label: 'Bordures' },
  { key: 'espacement', icon: 'resize-outline', label: 'Espace' },
];

// ─── Grid sub-tabs ───
type GridCategory = 'single' | 'double' | 'collage' | 'text';
const GRID_TABS: { key: GridCategory; label: string }[] = [
  { key: 'single', label: '1 Photo' },
  { key: 'double', label: '2 Photos' },
  { key: 'collage', label: 'Collage' },
  { key: 'text', label: 'Texte' },
];
const GRID_MAP: Record<GridCategory, PageLayout[]> = {
  single: SINGLE_LAYOUTS,
  double: DOUBLE_LAYOUTS,
  collage: COLLAGE_LAYOUTS,
  text: TEXT_LAYOUTS,
};

// ─── Color presets ───
const PAGE_COLORS = [
  '#FFFFFF', '#F9FAFB', '#F3F4F6', '#E5E7EB',
  '#FEF2F2', '#FFF7ED', '#FFFBEB', '#F0FDF4',
  '#EFF6FF', '#F5F3FF', '#FDF2F8', '#FFF1F2',
  '#1B2541', '#374151', '#6B7280', '#000000',
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#3B82F6', '#8B5CF6', '#EC4899', '#E8385D',
];



interface Props {
  onClose: () => void;
  onSelectLayout: (layout: PageLayout) => void;
  pageIndex: number;
}

export default function LayoutToolsSheet({ onClose, onSelectLayout, pageIndex }: Props) {
  const [activeToolTab, setActiveToolTab] = useState<ToolTab>('grille');
  const [gridCategory, setGridCategory] = useState<GridCategory>('single');

  const page = useEditorStore((s) => s.pages[pageIndex]);
  const updatePageStyle = useEditorStore((s) => s.updatePageStyle);

  const currentLayoutId = page?.layoutId;
  const bgColor = page?.backgroundColor || '#FFFFFF';
  const borderRadius = page?.slotBorderRadius ?? 0;
  const spacing = page?.slotSpacing ?? 0;
  const borderWidth = page?.slotBorderWidth ?? 0;
  const borderColor = page?.slotBorderColor || 'transparent';

  const handlePageStyleChange = useCallback(
    (style: Partial<Pick<PageData, 'backgroundColor' | 'slotBorderRadius' | 'slotSpacing' | 'slotBorderWidth' | 'slotBorderColor'>>) => {
      updatePageStyle(pageIndex, style);
    },
    [pageIndex, updatePageStyle],
  );

  // ═══════════════════════════════════════
  // RENDER: Grille tab (existing layout grid)
  // ═══════════════════════════════════════
  const renderGrilleTab = () => {
    const layouts = GRID_MAP[gridCategory];
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.subTabRow}>
          {GRID_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.subTab, gridCategory === tab.key && styles.subTabActive]}
              onPress={() => setGridCategory(tab.key)}
            >
              <Text style={[styles.subTabText, gridCategory === tab.key && styles.subTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={layouts}
          numColumns={GRID_COLUMNS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = item.id === currentLayoutId;
            return (
              <TouchableOpacity
                style={[styles.layoutCard, isSelected && styles.layoutCardActive]}
                onPress={() => onSelectLayout(item)}
                activeOpacity={0.7}
              >
                <View style={styles.layoutPreview}>
                  {item.slots.map((slot, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.previewSlot,
                        {
                          position: 'absolute',
                          left: `${slot.x}%`,
                          top: `${slot.y}%`,
                          width: `${slot.width}%`,
                          height: `${slot.height}%`,
                          borderRadius: slot.borderRadius
                            ? (slot.borderRadius / 100) * GRID_ITEM
                            : 1,
                          backgroundColor:
                            slot.type === 'text' ? Colors.borderLight : '#D6D6D6',
                        } as any,
                      ]}
                    />
                  ))}
                </View>
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.accent} />
                  </View>
                )}
                <Text style={[styles.layoutName, isSelected && styles.layoutNameActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  // ═══════════════════════════════════════
  // RENDER: Couleur tab
  // ═══════════════════════════════════════
  const renderCouleurTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionLabel}>Couleur de fond de la page</Text>
      <View style={styles.colorGrid}>
        {PAGE_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorSwatch,
              { backgroundColor: color },
              color === '#FFFFFF' && styles.colorSwatchWhite,
              bgColor === color && styles.colorSwatchActive,
            ]}
            onPress={() => handlePageStyleChange({ backgroundColor: color })}
          >
            {bgColor === color && (
              <Ionicons
                name="checkmark"
                size={16}
                color={['#FFFFFF', '#F9FAFB', '#F3F4F6', '#FFFBEB', '#FFF7ED', '#FEF2F2', '#F0FDF4', '#EFF6FF', '#F5F3FF', '#FDF2F8', '#FFF1F2'].includes(color) ? Colors.accent : '#FFF'}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  // ═══════════════════════════════════════
  // RENDER: Bordures tab
  // ═══════════════════════════════════════
  const renderBorduresTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Border radius */}
      <Text style={styles.sectionLabel}>Coins des blocs</Text>
      <View style={styles.presetRow}>
        {[0, 4, 8, 16, 30].map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.borderPreset, borderRadius === r && styles.borderPresetActive]}
            onPress={() => handlePageStyleChange({ slotBorderRadius: r })}
          >
            <View style={[styles.borderPresetInner, { borderRadius: r > 0 ? Math.min(r, 12) : 0 }]} />
            <Text style={[styles.presetLabel, borderRadius === r && styles.presetLabelActive]}>
              {r === 0 ? 'Droit' : `${r}px`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Slider for custom radius */}
      <Text style={styles.sectionLabel}>Arrondi personnalisé : {borderRadius}px</Text>
      <View style={styles.sliderRow}>
        <TouchableOpacity onPress={() => handlePageStyleChange({ slotBorderRadius: Math.max(0, borderRadius - 1) })}>
          <Ionicons name="remove-circle-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <DraggableSlider
          min={0}
          max={50}
          value={borderRadius}
          step={1}
          onValueChange={(v) => handlePageStyleChange({ slotBorderRadius: v })}
        />
        <TouchableOpacity onPress={() => handlePageStyleChange({ slotBorderRadius: Math.min(50, borderRadius + 1) })}>
          <Ionicons name="add-circle-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.sliderValue}>{borderRadius}</Text>
      </View>

      {/* Page margin (distance between images and page edges) */}
      <Text style={styles.sectionLabel}>Marge de page : {borderWidth}%</Text>
      <View style={styles.presetRow}>
        {[
          { value: 0, label: 'Aucune' },
          { value: 1, label: '1%' },
          { value: 2, label: '2%' },
          { value: 3, label: '3%' },
          { value: 5, label: '5%' },
        ].map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[styles.spacingPreset, borderWidth === p.value && styles.spacingPresetActive]}
            onPress={() => handlePageStyleChange({ slotBorderWidth: p.value })}
          >
            <View style={styles.marginPreview}>
              <View style={[styles.marginInner, { margin: p.value * 2 }]} />
            </View>
            <Text style={[styles.presetLabel, borderWidth === p.value && styles.presetLabelActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Slider for custom margin */}
      <Text style={styles.sectionLabel}>Marge personnalisée : {borderWidth}%</Text>
      <View style={styles.sliderRow}>
        <TouchableOpacity onPress={() => handlePageStyleChange({ slotBorderWidth: Math.max(0, borderWidth - 0.5) })}>
          <Ionicons name="remove-circle-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <DraggableSlider
          min={0}
          max={10}
          value={borderWidth}
          step={0.5}
          onValueChange={(v) => handlePageStyleChange({ slotBorderWidth: v })}
        />
        <TouchableOpacity onPress={() => handlePageStyleChange({ slotBorderWidth: Math.min(10, borderWidth + 0.5) })}>
          <Ionicons name="add-circle-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.sliderValue}>{borderWidth}%</Text>
      </View>
    </ScrollView>
  );

  // ═══════════════════════════════════════
  // RENDER: Espacement tab
  // ═══════════════════════════════════════
  const renderEspacementTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionLabel}>Espacement entre les blocs</Text>

      {/* Quick presets */}
      <View style={styles.presetRow}>
        {[
          { value: 0, label: 'Aucun' },
          { value: 1, label: 'Fin' },
          { value: 2, label: 'Moyen' },
          { value: 4, label: 'Large' },
          { value: 6, label: 'Très large' },
        ].map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[styles.spacingPreset, spacing === p.value && styles.spacingPresetActive]}
            onPress={() => handlePageStyleChange({ slotSpacing: p.value })}
          >
            <View style={styles.spacingPreview}>
              <View style={[styles.spacingBlock, { margin: Math.min(p.value, 3) }]} />
              <View style={[styles.spacingBlock, { margin: Math.min(p.value, 3) }]} />
              <View style={[styles.spacingBlock, { margin: Math.min(p.value, 3) }]} />
              <View style={[styles.spacingBlock, { margin: Math.min(p.value, 3) }]} />
            </View>
            <Text style={[styles.presetLabel, spacing === p.value && styles.presetLabelActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Slider */}
      <Text style={styles.sectionLabel}>Valeur : {spacing}%</Text>
      <View style={styles.sliderRow}>
        <TouchableOpacity onPress={() => handlePageStyleChange({ slotSpacing: Math.max(0, spacing - 0.5) })}>
          <Ionicons name="remove-circle-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <DraggableSlider
          min={0}
          max={10}
          value={spacing}
          step={0.5}
          onValueChange={(v) => handlePageStyleChange({ slotSpacing: v })}
        />
        <TouchableOpacity onPress={() => handlePageStyleChange({ slotSpacing: Math.min(10, spacing + 0.5) })}>
          <Ionicons name="add-circle-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.sliderValue}>{spacing}%</Text>
      </View>
    </ScrollView>
  );

  // ═══════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════
  const renderContent = () => {
    switch (activeToolTab) {
      case 'grille': return renderGrilleTab();
      case 'couleur': return renderCouleurTab();
      case 'bordures': return renderBorduresTab();
      case 'espacement': return renderEspacementTab();
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mise en page</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Tool tabs */}
        <View style={styles.toolTabRow}>
          {TOOL_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.toolTab, activeToolTab === tab.key && styles.toolTabActive]}
              onPress={() => setActiveToolTab(tab.key)}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={activeToolTab === tab.key ? '#FFF' : Colors.textSecondary}
              />
              <Text
                style={[styles.toolTabLabel, activeToolTab === tab.key && styles.toolTabLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          {renderContent()}
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
    height: '55%',
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
    paddingVertical: Spacing.sm,
  },
  headerTitle: { ...Typography.h4, color: Colors.textPrimary },

  // ─── Tool tabs (pill row) ───
  toolTabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  toolTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
  },
  toolTabActive: {
    backgroundColor: Colors.accent,
  },
  toolTabLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  toolTabLabelActive: {
    color: '#FFF',
  },

  // ─── Sub-tabs (inside Grille) ───
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  subTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  subTabText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  subTabTextActive: { color: Colors.white },

  // ─── Grid layout selector ───
  gridContainer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['4xl'] },
  gridRow: { gap: GRID_GAP, marginBottom: GRID_GAP },
  layoutCard: {
    width: GRID_ITEM,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  layoutCardActive: { borderColor: Colors.accent, backgroundColor: '#FEF2F4' },
  layoutPreview: {
    width: GRID_ITEM - Spacing.xl,
    height: (GRID_ITEM - Spacing.xl) * 1.3,
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  previewSlot: { borderWidth: 0.5, borderColor: '#BFBFBF' },
  selectedBadge: { position: 'absolute', top: 4, right: 4 },
  layoutName: { fontSize: 10, color: Colors.textTertiary, marginTop: 4 },
  layoutNameActive: { color: Colors.accent, fontWeight: '600' },

  // ─── Tab content ───
  tabContent: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    paddingBottom: 100,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },

  // ─── Color grid ───
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  colorSwatchWhite: {
    borderColor: Colors.borderLight,
  },
  colorSwatchActive: {
    borderColor: Colors.accent,
    borderWidth: 2.5,
  },

  // ─── Border presets ───
  presetRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  borderPreset: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: Colors.backgroundSecondary,
    minWidth: 56,
  },
  borderPresetActive: {
    borderColor: Colors.accent,
    backgroundColor: '#FEF2F4',
  },
  borderPresetInner: {
    width: 32,
    height: 32,
    backgroundColor: '#D6D6D6',
    borderWidth: 1,
    borderColor: '#BFBFBF',
  },
  marginPreview: {
    width: 36,
    height: 36,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marginInner: {
    flex: 1,
    backgroundColor: '#D6D6D6',
    borderRadius: 2,
  },
  presetLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 4,
    fontWeight: '600',
  },
  presetLabelActive: {
    color: Colors.accent,
  },

  // ─── Spacing presets ───
  spacingPreset: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: Colors.backgroundSecondary,
    minWidth: 56,
  },
  spacingPresetActive: {
    borderColor: Colors.accent,
    backgroundColor: '#FEF2F4',
  },
  spacingPreview: {
    width: 36,
    height: 36,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  spacingBlock: {
    width: 11,
    height: 11,
    backgroundColor: '#D6D6D6',
    borderRadius: 1,
  },

  // ─── Slider row ───
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sliderValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    minWidth: 36,
    textAlign: 'center',
  },
});
