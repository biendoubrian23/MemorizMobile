import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.xl * 2 - Spacing.md) / 2;

// ═══ Template Images ═══
export const ALBUM_TEMPLATES: { key: string; source: any }[] = [
  { key: 'album-1', source: require('../../../assets/images/album/album (1).jpeg') },
  { key: 'album-2', source: require('../../../assets/images/album/album (2).jpeg') },
  { key: 'album-3', source: require('../../../assets/images/album/album (3).jpeg') },
  { key: 'album-4', source: require('../../../assets/images/album/album (4).jpeg') },
  { key: 'album-5', source: require('../../../assets/images/album/album (5).jpeg') },
  { key: 'album-6', source: require('../../../assets/images/album/album (6).jpeg') },
  { key: 'album-7', source: require('../../../assets/images/album/album (7).jpeg') },
  { key: 'album-8', source: require('../../../assets/images/album/album (8).jpeg') },
  { key: 'album-9', source: require('../../../assets/images/album/album (9).jpeg') },
  { key: 'album-10', source: require('../../../assets/images/album/album (10).jpeg') },
  { key: 'album-11', source: require('../../../assets/images/album/album (11).jpeg') },
  { key: 'album-12', source: require('../../../assets/images/album/album (12).jpeg') },
  { key: 'album-13', source: require('../../../assets/images/album/album (13).jpeg') },
  { key: 'album-14', source: require('../../../assets/images/album/album (14).jpeg') },
  { key: 'album-15', source: require('../../../assets/images/album/album (15).jpeg') },
  { key: 'album-16', source: require('../../../assets/images/album/album (16).jpeg') },
  { key: 'album-17', source: require('../../../assets/images/album/album (17).jpeg') },
  { key: 'album-18', source: require('../../../assets/images/album/album (18).jpeg') },
  { key: 'album-19', source: require('../../../assets/images/album/album (19).jpeg') },
  { key: 'album-20', source: require('../../../assets/images/album/album (20).jpeg') },
  { key: 'album-21', source: require('../../../assets/images/album/album (21).jpeg') },
];

export const MAGAZINE_TEMPLATES: { key: string; source: any }[] = [
  { key: 'magazine-1', source: require('../../../assets/images/magazine/magazine (1).jpeg') },
  { key: 'magazine-2', source: require('../../../assets/images/magazine/magazine (2).jpeg') },
  { key: 'magazine-3', source: require('../../../assets/images/magazine/magazine (3).jpeg') },
  { key: 'magazine-4', source: require('../../../assets/images/magazine/magazine (4).jpeg') },
  { key: 'magazine-5', source: require('../../../assets/images/magazine/magazine (5).jpeg') },
  { key: 'magazine-6', source: require('../../../assets/images/magazine/magazine (6).jpeg') },
  { key: 'magazine-7', source: require('../../../assets/images/magazine/magazine (7).jpeg') },
  { key: 'magazine-8', source: require('../../../assets/images/magazine/magazine (8).jpeg') },
  { key: 'magazine-9', source: require('../../../assets/images/magazine/magazine (9).jpeg') },
  { key: 'magazine-10', source: require('../../../assets/images/magazine/magazine (10).jpeg') },
  { key: 'magazine-11', source: require('../../../assets/images/magazine/magazine (11).jpeg') },
  { key: 'magazine-12', source: require('../../../assets/images/magazine/magazine (12).jpeg') },
  { key: 'magazine-13', source: require('../../../assets/images/magazine/magazine (13).jpeg') },
];

interface Props {
  onSelect: (templateKey: string) => void;
  onClose: () => void;
  currentTemplate?: string | null;
}

export default function TemplateSelectorSheet({ onSelect, onClose, currentTemplate }: Props) {
  const [tab, setTab] = useState<'album' | 'magazine'>('album');
  const templates = tab === 'album' ? ALBUM_TEMPLATES : MAGAZINE_TEMPLATES;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Couverture</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'album' && styles.tabActive]}
          onPress={() => setTab('album')}
        >
          <Text style={[styles.tabText, tab === 'album' && styles.tabTextActive]}>Album</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'magazine' && styles.tabActive]}
          onPress={() => setTab('magazine')}
        >
          <Text style={[styles.tabText, tab === 'magazine' && styles.tabTextActive]}>Magazine</Text>
        </TouchableOpacity>
      </View>

      {/* Gallery */}
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {templates.map((tpl) => (
          <TouchableOpacity
            key={tpl.key}
            style={[
              styles.card,
              currentTemplate === tpl.key && styles.cardActive,
            ]}
            onPress={() => onSelect(tpl.key)}
          >
            <Image source={tpl.source} style={styles.cardImage} resizeMode="cover" />
            {currentTemplate === tpl.key && (
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark-circle" size={22} color={Colors.accent} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.backgroundSecondary,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
  tabActive: {
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  tabText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  tabTextActive: {
    color: Colors.accent,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
  card: {
    width: CARD_WIDTH,
    aspectRatio: 0.75,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  cardActive: {
    borderColor: Colors.accent,
    borderWidth: 3,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.white,
    borderRadius: 11,
  },
});
