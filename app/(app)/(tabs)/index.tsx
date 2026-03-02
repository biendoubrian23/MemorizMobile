import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import { Logo } from '../../../src/components/ui';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

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

        {/* Hero Banner */}
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={['#FF6B8A', '#FF9A5C', '#6BB5FF']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                Vos souvenirs méritent{'\n'}mieux qu'un écran.
              </Text>
              <Text style={styles.heroSubtitle}>
                Transformez vos moments en œuvres d'art.
              </Text>
              <TouchableOpacity
                style={styles.heroCta}
                onPress={() => router.push('/(app)/create/setup')}
              >
                <Text style={styles.heroCtaText}>CRÉER MON SOUVENIR</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
          {/* Dots */}
          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
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
              <TouchableOpacity key={theme.name} style={styles.themeCard}>
                <LinearGradient
                  colors={theme.colors}
                  style={styles.themeImage}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.themeOverlay}>
                    <Text style={styles.themeCardName}>{theme.name}</Text>
                    <Text style={styles.themeCardDesc}>{theme.desc}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Comment ça marche */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment ça marche</Text>
          {STEPS.map((step) => (
            <View key={step.num} style={styles.stepRow}>
              <View style={[styles.stepBullet, { backgroundColor: step.color }]} />
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.num}. {step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Ils ont adoré */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ils ont adoré</Text>
          <View style={styles.testimonialCard}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons key={s} name="star" size={16} color={Colors.starFilled} />
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

const THEMES = [
  { name: 'Amour', desc: 'Pour dire "Je t\'aime"', colors: ['#FF6B8A', '#FF9A5C'] as const },
  { name: 'Voyage', desc: 'Le tour du monde', colors: ['#6BB5FF', '#4ECDC4'] as const },
  { name: 'Nature', desc: 'Évasion verte', colors: ['#4ECDC4', '#44AF69'] as const },
];

const STEPS = [
  { num: 1, title: 'Choisissez', desc: 'Sélectionnez le format album ou magazine.', color: Colors.accent },
  { num: 2, title: 'Importez', desc: 'Connectez vos photos depuis votre téléphone.', color: '#FFD93D' },
  { num: 3, title: 'Personnalisez', desc: 'Mise en page automatique ou manuelle.', color: '#4ECDC4' },
];

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

  // Hero
  heroContainer: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
  },
  heroGradient: {
    borderRadius: BorderRadius.xl,
    height: 240,
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  heroTitle: {
    ...Typography.h3,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.lg,
  },
  heroCta: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    alignSelf: 'flex-start',
  },
  heroCtaText: {
    ...Typography.buttonSmall,
    color: Colors.primary,
    letterSpacing: 1,
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
  },

  // Sections
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
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },

  // Themes
  themesRow: {
    gap: Spacing.md,
  },
  themeCard: {
    width: 160,
    height: 160,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  themeImage: {
    flex: 1,
  },
  themeOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.2)',
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

  // Steps
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  stepBullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    marginRight: Spacing.md,
  },
  stepContent: {
    flex: 1,
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

  // Testimonial
  testimonialCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: Spacing.md,
  },
  testimonialText: {
    ...Typography.body,
    color: Colors.white,
    fontStyle: 'italic',
    lineHeight: 24,
  },
});
