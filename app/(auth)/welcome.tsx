import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/theme';
import { Button, Logo } from '../../src/components/ui';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[Colors.backgroundGradientStart, Colors.backgroundGradientEnd, Colors.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.4 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.header}>
            <Logo size="lg" />
          </View>

          {/* Hero Image placeholder */}
          <View style={styles.heroContainer}>
            <LinearGradient
              colors={['#FF6B8A', '#FF9A5C', '#FFD93D']}
              style={styles.heroImage}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTitle}>
                  Vos souvenirs méritent{'\n'}mieux qu'un écran.
                </Text>
                <Text style={styles.heroSubtitle}>
                  Transformez vos moments en œuvres d'art.
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaContainer}>
            <Button
              title="CRÉER MON SOUVENIR"
              onPress={() => router.push('/(auth)/register')}
              variant="outline"
              size="lg"
            />

            <View style={styles.dotsContainer}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Thématiques</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.themesRow}
            >
              {THEMES.map((theme) => (
                <View key={theme.name} style={styles.themeCard}>
                  <LinearGradient
                    colors={theme.colors}
                    style={styles.themeImage}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <Text style={styles.themeName}>{theme.name}</Text>
                  <Text style={styles.themeDesc}>{theme.desc}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* How it works */}
          <View style={styles.howSection}>
            <Text style={styles.sectionTitle}>Comment ça marche</Text>
            {STEPS.map((step) => (
              <View key={step.num} style={styles.stepRow}>
                <View style={styles.stepDot}>
                  <View style={[styles.stepDotInner, { backgroundColor: step.color }]} />
                </View>
                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>{step.num}. {step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Bottom CTAs */}
          <View style={styles.bottomCta}>
            <Button
              title="Se connecter"
              onPress={() => router.push('/(auth)/login')}
              variant="primary"
              size="lg"
            />
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Pas encore membre ? </Text>
              <Text
                style={styles.registerLink}
                onPress={() => router.push('/(auth)/register')}
              >
                Créer un compte
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const THEMES = [
  { name: 'Amour', desc: 'Pour dire "Je t\'aime"', colors: ['#FF6B8A', '#FF9A5C'] as const },
  { name: 'Voyage', desc: 'Le tour du monde', colors: ['#6BB5FF', '#4ECDC4'] as const },
  { name: 'Nature', desc: 'Évasion verte', colors: ['#4ECDC4', '#44AF69'] as const },
  { name: 'Famille', desc: 'Les liens sacrés', colors: ['#FFD93D', '#FF9A5C'] as const },
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
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['4xl'],
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContainer: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing['2xl'],
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    height: 220,
  },
  heroImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    padding: Spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroTitle: {
    ...Typography.h3,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.9)',
  },
  ctaContainer: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing['2xl'],
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
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
  featuresSection: {
    marginTop: Spacing['4xl'],
    paddingLeft: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  themesRow: {
    gap: Spacing.md,
    paddingRight: Spacing.xl,
  },
  themeCard: {
    width: 140,
  },
  themeImage: {
    width: 140,
    height: 140,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  themeName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  themeDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  howSection: {
    marginTop: Spacing['4xl'],
    paddingHorizontal: Spacing.xl,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    alignItems: 'flex-start',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: Spacing.md,
  },
  stepDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepText: {
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
  bottomCta: {
    marginTop: Spacing['4xl'],
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  registerRow: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
  },
  registerText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  registerLink: {
    ...Typography.body,
    color: Colors.accent,
    fontWeight: '600',
  },
});
