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

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    try {
      await signIn(email.trim(), password);
      // La redirection est gérée par AuthGate dans _layout.tsx
    } catch (error: any) {
      Alert.alert('Erreur de connexion', error.message || 'Une erreur est survenue.');
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert('Google', 'La connexion Google sera disponible prochainement.');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.backgroundGradientStart, Colors.backgroundGradientEnd, Colors.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.35 }}
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
            {/* Header with back button */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Logo size="md" />
              <View style={{ width: 24 }} />
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Re-bonjour.</Text>
              <Text style={styles.subtitle}>Vos projets vous attendent.</Text>
            </View>

            {/* Google button */}
            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continuer avec Google</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou avec email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="marie@exemple.com"
                value={email}
                onChangeText={setEmail}
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Mot de passe"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                icon="lock-closed-outline"
                secureTextEntry
              />

              {/* Remember me & Forgot */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberRow}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && (
                      <Ionicons name="checkmark" size={14} color={Colors.white} />
                    )}
                  </View>
                  <Text style={styles.rememberText}>Se souvenir de moi</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                  <Text style={styles.forgotText}>Oublié ?</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit */}
            <View style={styles.submitContainer}>
              <Button
                title="Se connecter"
                onPress={handleLogin}
                loading={isLoading}
                variant="primary"
                size="lg"
              />
            </View>

            {/* Register link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Pas encore membre ? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.registerLink}>Créer un compte</Text>
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
    marginBottom: Spacing['3xl'],
  },
  backButton: {
    padding: Spacing.xs,
  },
  titleContainer: {
    marginBottom: Spacing['3xl'],
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
  },

  // Google
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius['2xl'],
    paddingVertical: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
    marginRight: Spacing.md,
  },
  googleText: {
    ...Typography.button,
    color: Colors.textPrimary,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    paddingHorizontal: Spacing.lg,
  },

  // Form
  form: {
    marginBottom: Spacing.lg,
  },

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rememberText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  forgotText: {
    ...Typography.bodySmall,
    color: Colors.accent,
    fontWeight: '600',
  },

  // Submit
  submitContainer: {
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.xl,
  },

  // Register
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
