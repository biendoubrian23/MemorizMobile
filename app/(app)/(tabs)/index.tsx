import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import { Logo } from '../../../src/components/ui';
import { THEMATIQUES } from '../../../src/data/thematiques';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_WIDTH = SCREEN_WIDTH;
const AUTO_SCROLL_INTERVAL = 7000; // 7 secondes
const PRODUCT_CARD_WIDTH = (SCREEN_WIDTH - Spacing.xl * 2 - Spacing.md) / 2;

/* ─── Données ──────────────────────────────────────────────── */

const HERO_SLIDES = [
  {
    id: '1',
    image: require('../../../assets/images/accueil1.png'),
    title: 'Vos souvenirs méritent\nmieux qu\'un écran.',
    subtitle: 'Transformez vos moments en œuvres d\'art.',
  },
  {
    id: '2',
    image: require('../../../assets/images/accueil2.png'),
    title: 'Des albums photo\nqui vous ressemblent.',
    subtitle: 'Personnalisez chaque page à votre image.',
  },
  {
    id: '3',
    image: require('../../../assets/images/accueil3.png'),
    title: 'Partagez vos\nplus beaux moments.',
    subtitle: 'Offrez un souvenir unique à vos proches.',
  },
];

const STEPS = [
  { num: 1, title: 'Choisissez', desc: 'Sélectionnez le format album ou magazine.', color: Colors.accent },
  { num: 2, title: 'Importez', desc: 'Connectez vos photos depuis votre téléphone.', color: '#D1D5DB' },
  { num: 3, title: 'Personnalisez', desc: 'Mise en page automatique ou manuelle.', color: '#D1D5DB' },
];

/* ─── Composant ────────────────────────────────────────────── */

export default function HomeScreen() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // ─── Auto-scroll du carousel toutes les 7 secondes ───
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % HERO_SLIDES.length;
        flatListRef.current?.scrollToOffset({ offset: next * HERO_WIDTH, animated: true });
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / HERO_WIDTH);
    setActiveSlide(index);
  }, []);

  const renderHeroSlide = useCallback(({ item }: { item: typeof HERO_SLIDES[0] }) => (
    <View style={styles.heroSlide}>
      <Image source={item.image} style={styles.heroImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.65)'] as const}
        style={styles.heroOverlay}
        start={{ x: 0.5, y: 0.2 }}
        end={{ x: 0.5, y: 1 }}
      >
        <Text style={styles.heroTitle}>{item.title}</Text>
        <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
        <TouchableOpacity
          style={styles.heroCta}
          onPress={() => router.push('/(app)/categories')}
          activeOpacity={0.85}
        >
          <Text style={styles.heroCtaText}>CRÉER MON SOUVENIR</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  ), [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Logo size="md" />
          <TouchableOpacity onPress={() => router.push('/(app)/menu')}>
            <Ionicons name="menu" size={26} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Hero Carousel */}
        <View style={styles.heroContainer}>
          {/* Full-width hero, no horizontal margin */}
          <FlatList
            ref={flatListRef}
            data={HERO_SLIDES}
            keyExtractor={(item) => item.id}
            renderItem={renderHeroSlide}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            snapToInterval={HERO_WIDTH}
            decelerationRate="fast"
            contentContainerStyle={{ gap: 0 }}
          />
          {/* Dots */}
          <View style={styles.dotsContainer}>
            {HERO_SLIDES.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, activeSlide === i && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* Catégories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Catégories</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/categories')}>
              <Text style={styles.seeAll}>Tout voir</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.themesRow}
          >
            {THEMATIQUES.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={styles.themeCard}
                activeOpacity={0.85}
                onPress={() => router.push('/(app)/categories')}
              >
                <Image source={theme.image} style={styles.themeImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.65)'] as const}
                  style={styles.themeOverlay}
                  start={{ x: 0.5, y: 0.3 }}
                  end={{ x: 0.5, y: 1 }}
                >
                  <Text style={styles.themeCardName}>{theme.name}</Text>
                  <Text style={styles.themeCardDesc}>{theme.desc}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Comment ça marche */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment ça marche</Text>
          <View>
            {STEPS.map((step, index) => (
              <View key={step.num} style={styles.stepRow}>
                {/* Bullet + vertical line */}
                <View style={styles.stepBulletCol}>
                  <View style={[styles.stepBullet, { backgroundColor: step.color }]} />
                  {index < STEPS.length - 1 && <View style={styles.stepLine} />}
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.num}. {step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ─── Section 1 : Bannière promo Livres photo ─────────── */}
        <TouchableOpacity style={styles.promoBanner} activeOpacity={0.85} onPress={() => router.push('/(app)/categories')}>
          <View style={styles.promoBannerInner}>
            <Image
              source={require('../../../assets/images/accueil/image (1).jpeg')}
              style={styles.promoBannerImage}
            />
            <View style={styles.promoBannerText}>
              <Text style={styles.promoBannerTitle}>Livres photo <Text style={{ color: Colors.accent }}>❤️</Text></Text>
              <View style={styles.promoBannerDivider} />
              <Text style={styles.promoBannerDiscount}>-30%</Text>
              <Text style={styles.promoBannerSub}>sans minimum</Text>
              <View style={styles.promoBannerCodeRow}>
                <Text style={styles.promoBannerCodeLabel}>Code : </Text>
                <Text style={styles.promoBannerCode}>30LIVRES</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* ─── Section 2 : Fabrication française ──────────────── */}
        <TouchableOpacity style={styles.fabricSection} activeOpacity={0.85} onPress={() => router.push('/(app)/categories')}>
          <Text style={styles.fabricTitle}>Livres photo</Text>
          <Text style={styles.fabricSubtitle}>Créez un livre 100% unique à votre image</Text>
          <View style={styles.fabricBadge}>
            <Text style={styles.fabricBadgeText}>FABRICATION 🇫🇷</Text>
          </View>
          <Image
            source={require('../../../assets/images/accueil/image (2).jpeg')}
            style={styles.fabricImage}
          />
        </TouchableOpacity>

        {/* ─── Section 3 : Carrousel Paysage / Portrait ──────── */}
        <View style={styles.productSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productScroll}
            decelerationRate="fast"
            snapToInterval={PRODUCT_CARD_WIDTH + Spacing.md}
            snapToAlignment="start"
          >
            {/* Paysage */}
            <TouchableOpacity
              style={styles.productCard}
              activeOpacity={0.85}
              onPress={() => router.push('/(app)/categories')}
            >
              <Image
                source={require('../../../assets/images/accueil/image (3).jpeg')}
                style={styles.productCardImage}
              />
              <Text style={styles.productCardTitle}>Livres Photo - Paysage</Text>
              <Text style={styles.productCardPrice}>À partir de 16,99 €</Text>
            </TouchableOpacity>

            {/* Portrait */}
            <TouchableOpacity
              style={styles.productCard}
              activeOpacity={0.85}
              onPress={() => router.push('/(app)/categories')}
            >
              <Image
                source={require('../../../assets/images/accueil/image (4).jpeg')}
                style={styles.productCardImage}
              />
              <Text style={styles.productCardTitle}>Livres Photo - Portrait</Text>
              <Text style={styles.productCardPrice}>À partir de 32,99 €</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Styles ───────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },

  /* Hero */
  heroContainer: {
    marginTop: 0,
  },
  heroSlide: {
    width: HERO_WIDTH,
    height: 300,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: Spacing.xl,
  },
  heroTitle: {
    ...Typography.h3,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.92)',
    marginBottom: Spacing.lg,
  },
  heroCta: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing['2xl'],
    borderRadius: BorderRadius['2xl'],
    alignSelf: 'flex-start',
  },
  heroCtaText: {
    ...Typography.buttonSmall,
    color: Colors.primary,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 20,
    borderRadius: 10,
  },

  /* Sections */
  section: {
    marginTop: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  seeAll: {
    ...Typography.bodySmall,
    color: Colors.accent,
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },

  /* Themes */
  themesRow: {
    gap: Spacing.md,
  },
  themeCard: {
    width: 160,
    height: 180,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  themeImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  themeOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: Spacing.md,
  },
  themeCardName: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.white,
  },
  themeCardDesc: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.9)',
  },

  /* Steps */
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 54,
  },
  stepBulletCol: {
    alignItems: 'center',
    width: 24,
    marginRight: Spacing.md,
  },
  stepBullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  stepContent: {
    flex: 1,
    paddingBottom: Spacing.lg,
  },
  stepTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  stepDesc: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },

  /* Promo Banner (Section 1) */
  promoBanner: {
    marginTop: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
  },
  promoBannerInner: {
    flexDirection: 'row',
    backgroundColor: '#F5F0EA',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    alignItems: 'center',
  },
  promoBannerImage: {
    width: '45%',
    height: 180,
    resizeMode: 'cover',
  },
  promoBannerText: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  promoBannerTitle: {
    ...Typography.h4,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  promoBannerDivider: {
    width: 40,
    height: 2,
    backgroundColor: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  promoBannerDiscount: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.primary,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  promoBannerSub: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  promoBannerCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoBannerCodeLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  promoBannerCode: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 1,
  },

  /* Fabrication (Section 2) */
  fabricSection: {
    marginTop: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
  },
  fabricTitle: {
    ...Typography.h3,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  fabricSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  fabricBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.textPrimary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  fabricBadgeText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  fabricImage: {
    width: '100%',
    height: 220,
    borderRadius: BorderRadius.xl,
    resizeMode: 'cover',
  },

  /* Product Carousel (Section 3) */
  productSection: {
    marginTop: Spacing['2xl'],
  },
  productScroll: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
  },
  productCardImage: {
    width: '100%',
    height: 160,
    borderRadius: BorderRadius.lg,
    resizeMode: 'cover',
    marginBottom: Spacing.sm,
  },
  productCardTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  productCardPrice: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});
