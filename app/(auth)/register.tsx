import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/theme';
import { Button, Input, Logo } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const isPasswordValid = password.length >= 8;

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (!isPasswordValid) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!acceptTerms) {
      Alert.alert('Erreur', 'Veuillez accepter les conditions générales.');
      return;
    }
    try {
      await signUp(email.trim(), password, firstName.trim(), lastName.trim());
      // Redirection gérée par AuthGate
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue.');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Hero banner with overlaid header */}
            <ImageBackground
              source={require('../../assets/images/inscription.jpeg')}
              style={styles.heroBanner}
              resizeMode="cover"
            >
              <View style={styles.heroOverlay} />

              {/* Header on top of image */}
              <SafeAreaView edges={['top']} style={styles.heroHeader}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                >
                  <Ionicons name="chevron-back" size={24} color={Colors.white} />
                </TouchableOpacity>
              </SafeAreaView>

              {/* Title on image */}
              <View style={styles.heroTextContainer}>
                <Text style={styles.heroTitle}>Rejoignez le club</Text>
                <Text style={styles.heroSubtitle}>
                  Créez votre premier album dès{' '}aujourd'hui.
                </Text>
              </View>
            </ImageBackground>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.nameRow}>
                <View style={styles.nameField}>
                  <Input
                    label="PRÉNOM"
                    placeholder="Sophie"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.nameField}>
                  <Input
                    label="NOM"
                    placeholder="Dupont"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <Input
                label="EMAIL"
                placeholder="sophie@hello.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="MOT DE PASSE"
                placeholder="Min. 8 caractères"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                valid={isPasswordValid}
              />

              {/* Terms */}
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAcceptTerms(!acceptTerms)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    acceptTerms && styles.checkboxChecked,
                  ]}
                >
                  {acceptTerms && (
                    <Ionicons name="checkmark" size={14} color={Colors.white} />
                  )}
                </View>
                <Text style={styles.termsText}>
                  J'accepte les{' '}
                  <Text style={styles.termsLink}>Conditions Générales</Text>
                  {' '}et la{' '}
                  <Text style={styles.termsLink}>Politique de Confidentialité</Text>.
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit */}
            <View style={styles.submitContainer}>
              <Button
                title="Créer mon compte"
                onPress={handleRegister}
                loading={isLoading}
                variant="primary"
                size="lg"
                icon="arrow-forward"
                iconPosition="right"
              />
            </View>

            {/* Login link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Déjà un souvenir ? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing['4xl'],
  },
  heroBanner: {
    height: 200,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing['2xl'],
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroTextContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  heroTitle: {
    ...Typography.h2,
    color: Colors.white,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    textAlign: 'center',
  },
  form: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  nameRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  nameField: {
    flex: 1,
  },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.textPrimary,
    textDecorationLine: 'underline',
  },

  // Submit
  submitContainer: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },

  // Login
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loginText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  loginLink: {
    ...Typography.body,
    color: Colors.accent,
    fontWeight: '600',
  },
});
