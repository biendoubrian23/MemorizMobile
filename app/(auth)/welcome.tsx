import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/theme';
import { Button, Logo } from '../../src/components/ui';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../../assets/images/premierepage.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Dark overlay for readability */}
      <View style={styles.overlay} />

      {/* Center content */}
      <View style={styles.content}>
        {/* Top: Logo */}
        <View style={styles.topSection}>
          <Logo size="lg" color={Colors.white} />
        </View>

        {/* Bottom Group: CTA card + Headline + Guest Link */}
        <View style={styles.bottomGroup}>
          <View style={styles.ctaCard}>
            <Button
              title="Se connecter"
              onPress={() => router.push('/(auth)/login')}
              variant="primary"
              size="lg"
            />
            <Button
              title="Créer un compte"
              onPress={() => router.push('/(auth)/register')}
              variant="outline"
              size="lg"
            />
          </View>

          <View style={styles.textSection}>
            <Text style={styles.headline}>
              Imprimez vos souvenirs{"\n"}en quelques clics.
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/(app)/(tabs)')}
              style={styles.guestBtn}
            >
              <Text style={styles.guestText}>Continuer en tant qu'invité</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C1E12',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['4xl'] * 1.5,
    paddingBottom: Spacing['3xl'], // slightly reduced bottom padding
  },
  topSection: {
    alignItems: 'center',
  },
  bottomGroup: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.xl, // Space between buttons and the text below
  },
  ctaCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['2xl'],
    gap: Spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  textSection: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headline: {
    fontSize: 26, // Slightly smaller
    fontStyle: 'italic',
    fontWeight: '300',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 36,
  },
  guestBtn: {
    paddingVertical: Spacing.sm,
  },
  guestText: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'underline',
  },
});
