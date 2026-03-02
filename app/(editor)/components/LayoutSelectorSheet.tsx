import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import { PageLayout } from '../../../src/types';
import {
  DEFAULT_LAYOUTS,
  SINGLE_LAYOUTS,
  DOUBLE_LAYOUTS,
  COLLAGE_LAYOUTS,
  TEXT_LAYOUTS,
} from '../../../editor/utils/layouts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMNS = 3;
const GAP = Spacing.md;
const ITEM_SIZE = (SCREEN_WIDTH - Spacing.xl * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

type Category = 'single' | 'double' | 'collage' | 'text';

const TABS: { key: Category; label: string }[] = [
  { key: 'single', label: '1 Photo' },
  { key: 'double', label: '2 Photos' },
  { key: 'collage', label: 'Collage' },
  { key: 'text', label: 'Texte' },
];

const CATEGORY_MAP: Record<Category, PageLayout[]> = {
  single: SINGLE_LAYOUTS,
  double: DOUBLE_LAYOUTS,
  collage: COLLAGE_LAYOUTS,
  text: TEXT_LAYOUTS,
};

interface Props {
  onSelect: (layout: PageLayout) => void;
  onClose: () => void;
  currentLayoutId?: string;
}

export default function LayoutSelectorSheet({ onSelect, onClose, currentLayoutId }: Props) {
  const [activeTab, setActiveTab] = useState<Category>('single');
  const layouts = CATEGORY_MAP[activeTab];

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mises en page</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={layouts}
          numColumns={COLUMNS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = item.id === currentLayoutId;
            return (
              <TouchableOpacity
                style={[styles.layoutCard, isSelected && styles.layoutCardActive]}
                onPress={() => onSelect(item)}
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
                            ? (slot.borderRadius / 100) * ITEM_SIZE
                            : 1,
                          backgroundColor:
                            slot.type === 'text' ? Colors.borderLight : '#D6D6D6',
                        } as any,
                      ]}
                    >
                      {slot.type === 'text' && (
                        <View style={styles.textLines}>
                          <View style={styles.textLine} />
                          <View style={[styles.textLine, { width: '60%' }]} />
                        </View>
                      )}
                    </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
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
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { ...Typography.caption, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  gridContainer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['4xl'] },
  gridRow: { gap: GAP, marginBottom: GAP },
  layoutCard: {
    width: ITEM_SIZE,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  layoutCardActive: { borderColor: Colors.accent, backgroundColor: '#FEF2F4' },
  layoutPreview: {
    width: ITEM_SIZE - Spacing.xl,
    height: (ITEM_SIZE - Spacing.xl) * 1.3,
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  previewSlot: { borderWidth: 0.5, borderColor: '#BFBFBF' },
  textLines: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 3, padding: 4 },
  textLine: { width: '80%', height: 2, backgroundColor: '#C0C0C0', borderRadius: 1 },
  selectedBadge: { position: 'absolute', top: 4, right: 4 },
  layoutName: { ...Typography.small, color: Colors.textTertiary, marginTop: Spacing.xs },
  layoutNameActive: { color: Colors.accent, fontWeight: '600' },
});
