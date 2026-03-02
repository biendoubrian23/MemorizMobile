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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
      {/* Top gradient border */}
      <LinearGradient
        colors={['#6BB5FF', '#4ECDC4', '#6BB5FF']}
        style={styles.topBorder}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.stepIndicator}>Étape 1/2</Text>
            </View>

            {/* Hero banner placeholder */}
            <LinearGradient
              colors={['#D4C5A9', '#B8A88A']}
              style={styles.heroBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Rejoignez le club</Text>
              <Text style={styles.subtitle}>
                Créez votre premier album dès{'\n'}aujourd'hui.
              </Text>
            </View>

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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBorder: {
    height: 4,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.xs,
  },
  stepIndicator: {
    ...Typography.bodySmall,
    color: Colors.accent,
    fontWeight: '600',
  },
  heroBanner: {
    height: 80,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing['2xl'],
  },
  titleContainer: {
    marginBottom: Spacing['2xl'],
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    marginBottom: Spacing.lg,
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
  },

  // Login
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
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
