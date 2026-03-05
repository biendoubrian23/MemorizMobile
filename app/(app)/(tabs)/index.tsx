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
  Share,
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
const PROMO_CARD_WIDTH = SCREEN_WIDTH - Spacing.xl * 2 - 20; // slightly narrower to hint next card

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
          onPress={() => router.push('/(app)/create/setup')}
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

        {/* Thématiques */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thématiques</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/thematiques')}>
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
                onPress={() => router.push(`/(app)/create/setup?themeId=${theme.id}`)}
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

        {/* ─── Carousel promotionnel ──────────────────────────── */}
        <View style={styles.promoSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promoScroll}
            decelerationRate="fast"
            snapToInterval={PROMO_CARD_WIDTH + Spacing.md}
            snapToAlignment="start"
          >
            {/* ── 1. Offres du moment ── */}
            <LinearGradient
              colors={[Colors.accent, '#C4264A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.promoCard}
            >
              <View style={styles.promoCardHeader}>
                <Ionicons name="pricetag" size={22} color="#fff" />
                <Text style={styles.promoCardTitle}>Offres du moment</Text>
              </View>
              <Text style={styles.promoCardSubtitle}>-15% sur votre première commande</Text>
              <View style={styles.promoCodeBadge}>
                <Text style={styles.promoCodeText}>MEMORIZ10</Text>
              </View>
              <View style={styles.promoCountdownRow}>
                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.promoCountdownText}>Expire dans 3j 12h 45min</Text>
              </View>
              <TouchableOpacity style={styles.promoCtaWhite} activeOpacity={0.85}>
                <Text style={styles.promoCtaTextAccent}>En profiter</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.accent} />
              </TouchableOpacity>
            </LinearGradient>

            {/* ── 2. Chiffres clés ── */}
            <LinearGradient
              colors={[Colors.primary, '#0F1A33']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.promoCard}
            >
              <View style={styles.promoCardHeader}>
                <Ionicons name="trending-up" size={22} color="#fff" />
                <Text style={styles.promoCardTitle}>Chiffres clés</Text>
              </View>
              <View style={styles.chiffresGrid}>
                <View style={styles.chiffreItem}>
                  <Text style={styles.chiffreNumber}>15 000+</Text>
                  <Text style={styles.chiffreLabel}>albums créés</Text>
                </View>
                <View style={styles.chiffreItem}>
                  <Text style={styles.chiffreNumber}>4.8/5</Text>
                  <Text style={styles.chiffreLabel}>satisfaction</Text>
                </View>
                <View style={styles.chiffreItem}>
                  <Text style={styles.chiffreNumber}>50 000+</Text>
                  <Text style={styles.chiffreLabel}>photos imprimées</Text>
                </View>
                <View style={styles.chiffreItem}>
                  <Text style={styles.chiffreNumber}>98%</Text>
                  <Text style={styles.chiffreLabel}>recommandent</Text>
                </View>
              </View>
            </LinearGradient>

            {/* ── 3. Parrainage ── */}
            <LinearGradient
              colors={[Colors.success, '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.promoCard}
            >
              <View style={styles.promoCardHeader}>
                <Ionicons name="gift" size={22} color="#fff" />
                <Text style={styles.promoCardTitle}>Parrainage</Text>
              </View>
              <Text style={styles.promoCardSubtitle}>
                Invitez un ami, gagnez 5€ chacun !
              </Text>
              <Text style={styles.parrainageDesc}>
                Partagez votre code et recevez un bon de réduction dès la première commande de votre filleul.
              </Text>
              <TouchableOpacity
                style={styles.promoCtaWhite}
                activeOpacity={0.85}
                onPress={() => {
                  Share.share({
                    message: 'Rejoins Memoriz et crée ton album photo ! Utilise mon code pour obtenir 5€ de réduction 🎁',
                  });
                }}
              >
                <Ionicons name="share-social" size={16} color={Colors.success} />
                <Text style={[styles.promoCtaTextAccent, { color: Colors.success }]}>Partager</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* ── 4. Idées cadeaux ── */}
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.promoCard}
            >
              <View style={styles.promoCardHeader}>
                <Ionicons name="sparkles" size={22} color="#fff" />
                <Text style={styles.promoCardTitle}>Idées cadeaux</Text>
              </View>
              <Text style={styles.promoCardSubtitle}>
                Un album pour chaque occasion
              </Text>
              <View style={styles.occasionTags}>
                {['Noël', 'Saint-Valentin', 'Fête des mères', 'Anniversaire', 'Mariage', 'Naissance'].map((tag) => (
                  <View key={tag} style={styles.occasionTag}>
                    <Text style={styles.occasionTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.promoCtaWhite}
                activeOpacity={0.85}
                onPress={() => router.push('/thematiques')}
              >
                <Text style={[styles.promoCtaTextAccent, { color: '#D97706' }]}>Découvrir</Text>
                <Ionicons name="arrow-forward" size={16} color="#D97706" />
              </TouchableOpacity>
            </LinearGradient>
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

  /* Promo Carousel */
  promoSection: {
    marginTop: Spacing.xl,
  },
  promoScroll: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    paddingRight: Spacing['2xl'],
  },
  promoCard: {
    width: PROMO_CARD_WIDTH,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  promoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  promoCardTitle: {
    ...Typography.h4,
    color: '#fff',
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  promoCardSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.92)',
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  promoCodeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  promoCodeText: {
    ...Typography.body,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
    fontSize: 18,
  },
  promoCountdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  promoCountdownText: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
  },
  promoCtaWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  promoCtaTextAccent: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.accent,
  },
  chiffresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  chiffreItem: {
    width: '45%' as any,
    alignItems: 'center',
  },
  chiffreNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  chiffreLabel: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  parrainageDesc: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  occasionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  occasionTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  occasionTagText: {
    ...Typography.bodySmall,
    color: '#fff',
    fontWeight: '600',
  },
});
