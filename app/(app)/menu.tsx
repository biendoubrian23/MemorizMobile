import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/theme';

type MenuCategory = {
  title: string;
  items: { label: string; popular?: boolean; route?: string }[];
};

const MENU_DATA: MenuCategory[] = [
  {
    title: 'Albums',
    items: [
      { label: 'Couverture Rigide', popular: true },
      { label: 'Couverture Souple' },
      { label: 'Ouverture à plat' },
    ],
  },
  {
    title: 'Magazines',
    items: [
      { label: 'Magazine Standard' },
      { label: 'Magazine Premium' },
    ],
  },
];

const LINKS = [
  { icon: 'sparkles-outline' as const, label: 'Inspiration & Blog' },
  { icon: 'help-circle-outline' as const, label: 'Aide & Contact' },
  { icon: 'person-outline' as const, label: 'Mon Compte' },
];

export default function MenuScreen() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  const toggleCategory = (idx: number) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={26} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Categories */}
        {MENU_DATA.map((cat, catIdx) => (
          <View key={catIdx} style={styles.categoryContainer}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => toggleCategory(catIdx)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryTitle}>{cat.title}</Text>
              <Ionicons
                name={expandedIdx === catIdx ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

            {expandedIdx === catIdx && (
              <View style={styles.categoryItems}>
                {cat.items.map((item, itemIdx) => (
                  <TouchableOpacity
                    key={itemIdx}
                    style={styles.categoryItem}
                    activeOpacity={0.65}
                  >
                    <View style={styles.categoryItemDot} />
                    <Text style={styles.categoryItemLabel}>{item.label}</Text>
                    {item.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>POPULAIRE</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Links */}
        {LINKS.map((link, idx) => (
          <TouchableOpacity key={idx} style={styles.linkRow} activeOpacity={0.65}>
            <Ionicons name={link.icon} size={22} color={Colors.primary} />
            <Text style={styles.linkLabel}>{link.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        ))}

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaContainer}
          activeOpacity={0.85}
          onPress={() => {
            router.back();
            setTimeout(() => router.push('/(app)/create/setup'), 200);
          }}
        >
          <LinearGradient
            colors={[Colors.accent, '#FF8FA3']}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="add-circle-outline" size={24} color={Colors.white} />
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaTitle}>Créer mon souvenir</Text>
              <Text style={styles.ctaSub}>Album ou Magazine</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },

  // Category
  categoryContainer: {
    marginBottom: Spacing.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  categoryTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  categoryItems: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingLeft: Spacing.lg,
    gap: Spacing.md,
  },
  categoryItemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  categoryItemLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
  },
  popularBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xl,
  },

  // Links
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  linkLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },

  // CTA
  ctaContainer: {
    marginTop: Spacing['2xl'],
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.white,
  },
  ctaSub: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
