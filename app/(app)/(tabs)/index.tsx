import React, { useRef, useState, useCallback } from 'react';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_WIDTH = SCREEN_WIDTH;

/* ─── Données ──────────────────────────────────────────────── */

const HERO_SLIDES = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80',
    title: 'Vos souvenirs méritent\nmieux qu\'un écran.',
    subtitle: 'Transformez vos moments en œuvres d\'art.',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    title: 'Des albums photo\nqui vous ressemblent.',
    subtitle: 'Personnalisez chaque page à votre image.',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    title: 'Partagez vos\nplus beaux moments.',
    subtitle: 'Offrez un souvenir unique à vos proches.',
  },
];

const THEMES = [
  {
    name: 'Amour',
    desc: 'Pour dire "Je t\'aime"',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80',
  },
  {
    name: 'Voyage',
    desc: 'Le tour du monde',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80',
  },
  {
    name: 'Nature',
    desc: 'Évasion verte',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
  },
  {
    name: 'Famille',
    desc: 'Moments précieux',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&q=80',
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

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / HERO_WIDTH);
    setActiveSlide(index);
  }, []);

  const renderHeroSlide = useCallback(({ item }: { item: typeof HERO_SLIDES[0] }) => (
    <View style={styles.heroSlide}>
      <Image source={{ uri: item.image }} style={styles.heroImage} />
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
            <TouchableOpacity>
              <Text style={styles.seeAll}>Tout voir</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.themesRow}
          >
            {THEMES.map((theme) => (
              <TouchableOpacity key={theme.name} style={styles.themeCard} activeOpacity={0.85}>
                <Image source={{ uri: theme.image }} style={styles.themeImage} />
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

        {/* Ils ont adoré */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ils ont adoré</Text>
          <View style={styles.testimonialCard}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons key={s} name="star" size={18} color={Colors.starFilled} />
              ))}
            </View>
            <Text style={styles.testimonialText}>
              "La qualité du papier est incroyable. On dirait un vrai magazine de mode, mais avec nos photos de mariage."
            </Text>
          </View>
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

  /* Testimonial */
  testimonialCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    backgroundColor: '#FDF6EE',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: Spacing.md,
  },
  testimonialText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 24,
  },
});
