import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/theme';
import { THEMATIQUES } from '../../src/data/thematiques';
import { useCartStore } from '../../src/store/cartStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHIP_GAP = Spacing.sm;
const CARD_GAP = Spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.xl * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.2;

/* ─── Collections ──────────────────────────────────────────── */

const COLLECTIONS = [
  {
    id: 'themes',
    label: 'THÈMES',
    image: require('../../assets/images/Catégorie/theme.png'),
  },
  {
    id: 'annee',
    label: 'COLLECTION\nANNÉE',
    image: require('../../assets/images/Catégorie/annee.png'),
  },
  {
    id: 'pays',
    label: 'COLLECTION\nPAYS',
    image: require('../../assets/images/Catégorie/pays.png'),
  },
  {
    id: 'regions',
    label: 'COLLECTION\nRÉGIONS',
    image: require('../../assets/images/Catégorie/région.png'),
  },
];

const PAYS_ITEMS = [
  { id: 'espagne',   name: 'Livre A4 Espagne',   image: require('../../assets/images/Catégorie/pays/espagne.png') },
  { id: 'italie',    name: 'Livre A4 Italie',    image: require('../../assets/images/Catégorie/pays/italie.png') },
  { id: 'portugal',  name: 'Livre A4 Portugal',  image: require('../../assets/images/Catégorie/pays/portugal.png') },
  { id: 'allemagne', name: 'Livre A4 Allemagne', image: require('../../assets/images/Catégorie/pays/allemagne.png') },
  { id: 'japan',     name: 'Livre A4 Japon',     image: require('../../assets/images/Catégorie/pays/japan.png') },
  { id: 'seoul',     name: 'Livre A4 Séoul',     image: require('../../assets/images/Catégorie/pays/seoul.png') },
  { id: 'turquie',   name: 'Livre A4 Turquie',   image: require('../../assets/images/Catégorie/pays/turquie.png') },
  { id: 'dubai',     name: 'Livre A4 Dubaï',     image: require('../../assets/images/Catégorie/pays/dubai.png') },
  { id: 'usa',       name: 'Livre A4 USA',        image: require('../../assets/images/Catégorie/pays/usa.png') },
];

/* ─── Composant ────────────────────────────────────────────── */

export default function CategoriesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as { collection?: string };
  const [activeCollection, setActiveCollection] = useState((params.collection as string | undefined) || 'themes');
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.length;

  const activeLabel = COLLECTIONS.find((c) => c.id === activeCollection)?.label?.replace('\n', ' ') || 'Thèmes';

  const gridItems: { id: string; name: string; image: any }[] =
    activeCollection === 'pays'
      ? PAYS_ITEMS
      : THEMATIQUES.map((t) => ({ id: t.id, name: t.name, image: t.image }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activeLabel}</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/cart')} style={styles.cartBtn}>
          <Ionicons name="cart-outline" size={24} color={Colors.textPrimary} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Collection chips grid (2x2) */}
        <View style={styles.chipsGrid}>
          {COLLECTIONS.map((col) => (
            <TouchableOpacity
              key={col.id}
              style={[
                styles.chip,
                activeCollection === col.id && styles.chipActive,
              ]}
              activeOpacity={0.85}
              onPress={() => setActiveCollection(col.id)}
            >
              <Image source={col.image} style={styles.chipImage} />
              <View style={styles.chipOverlay}>
                {activeCollection === col.id && (
                  <Ionicons name="heart" size={16} color={Colors.accent} style={styles.chipHeart} />
                )}
                <Text style={[
                  styles.chipLabel,
                  activeCollection === col.id && styles.chipLabelActive,
                ]}>{col.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Active collection title */}
        <Text style={styles.collectionTitle}>{activeLabel}</Text>

        {/* Cards grid */}
        <View style={styles.grid}>
          {gridItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push(`/(app)/create/setup?themeId=${item.id}`)}
            >
              <Image source={item.image} style={styles.cardImage} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardPrice}>À partir de <Text style={styles.cardPriceBold}>39,95 €</Text></Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Voir plus */}
        <TouchableOpacity style={styles.seeMoreBtn} activeOpacity={0.85}>
          <Text style={styles.seeMoreText}>Voir plus</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Styles ───────────────────────────────────────────────── */

const CHIP_WIDTH = (SCREEN_WIDTH - Spacing.xl * 2 - CHIP_GAP) / 2;
const CHIP_HEIGHT = 120;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing['3xl'],
  },
  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h4,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  /* Chips grid */
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: CHIP_GAP,
    marginBottom: Spacing.xl,
  },
  chip: {
    width: CHIP_WIDTH,
    height: CHIP_HEIGHT,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipActive: {
    borderColor: Colors.accent,
  },
  chipImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  chipOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xs,
  },
  chipHeart: {
    marginBottom: 2,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    textTransform: 'uppercase',
    lineHeight: 17,
  },
  chipLabelActive: {
    color: '#fff',
  },

  /* Collection title */
  collectionTitle: {
    ...Typography.h3,
    fontWeight: '800',
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },

  /* Cards grid */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: Spacing.md,
  },
  cardImage: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.lg,
    resizeMode: 'cover',
  },
  cardInfo: {
    marginTop: Spacing.sm,
  },
  cardName: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardPrice: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardPriceBold: {
    fontWeight: '800',
    color: Colors.textPrimary,
  },

  /* Voir plus */
  seeMoreBtn: {
    alignSelf: 'center',
    marginTop: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.textPrimary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.sm,
  },
  seeMoreText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
