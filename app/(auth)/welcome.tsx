import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography, Spacing } from '../../src/theme';
import { Button } from '../../src/components/ui';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#F2A7C3', '#F7C4D8', '#FCE4EE', '#FFF0F6', '#FFFFFF']}
      locations={[0, 0.25, 0.5, 0.75, 1]}
      style={styles.container}
    >
      {/* Image de livres en haut */}
      <View style={styles.imageWrapper}>
        <Image
          source={require('../../assets/images/first.png')}
          style={styles.bookImage}
          resizeMode="contain"
        />
      </View>

      {/* Contenu bas */}
      <View style={styles.bottomContent}>
        {/* Nom de la marque */}
        <Text style={styles.brandName}>Memoriz.</Text>

        {/* Accroche */}
        <Text style={styles.tagline}>
          Le moyen le plus simple{'\n'}d’imprimer vos souvenirs
        </Text>
        <Text style={styles.subTagline}>
          Créez un objet délicieusement unique en quelques clics.
        </Text>

        {/* Boutons */}
        <View style={styles.buttonsContainer}>
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

        {/* Lien invité */}
        <TouchableOpacity
          onPress={() => router.replace('/(app)/(tabs)')}
          style={styles.guestBtn}
        >
          <Text style={styles.guestText}>Continuer en tant qu’invité</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing['4xl'],
  },
  bookImage: {
    width: width * 1.0,
    height: height * 0.48,
  },
  bottomContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['4xl'],
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  brandName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 42,
    color: '#C0396B',
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 22,
    fontWeight: '700',
    color: '#C0396B',
    lineHeight: 30,
  },
  subTagline: {
    fontSize: 14,
    fontWeight: '400',
    color: '#C0396B',
    opacity: 0.8,
    marginBottom: Spacing.md,
  },
  buttonsContainer: {
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  guestBtn: {
    paddingVertical: Spacing.sm,
    alignSelf: 'center',
    marginTop: Spacing.xs,
  },
  guestText: {
    ...Typography.bodySmall,
    color: '#C0396B',
    opacity: 0.7,
    textDecorationLine: 'underline',
  },
});
