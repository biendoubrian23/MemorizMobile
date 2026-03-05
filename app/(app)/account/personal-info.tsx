import React, { useState, useEffect } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import { Input, Button } from '../../../src/components/ui';
import { useAuthStore } from '../../../src/store/authStore';

export default function PersonalInfoScreen() {
  const { user, updateProfile, isLoading } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges =
    firstName !== (user?.firstName ?? '') ||
    lastName !== (user?.lastName ?? '') ||
    phone !== (user?.phone ?? '') ||
    birthDate !== (user?.birthDate ?? '');

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Erreur', 'Le prénom et le nom sont obligatoires.');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        birthDate: birthDate.trim() || undefined,
      });
      Alert.alert('Succès', 'Vos informations ont été mises à jour.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de sauvegarder.');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = `${(firstName[0] || '').toUpperCase()}${(lastName[0] || '').toUpperCase()}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Informations personnelles</Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || '?'}</Text>
            </View>
            <Text style={styles.avatarHint}>
              {user?.email ?? ''}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Input
              label="Prénom"
              placeholder="Votre prénom"
              value={firstName}
              onChangeText={setFirstName}
              icon="person-outline"
              autoCapitalize="words"
            />
            <Input
              label="Nom"
              placeholder="Votre nom"
              value={lastName}
              onChangeText={setLastName}
              icon="person-outline"
              autoCapitalize="words"
              style={{ marginTop: Spacing.lg }}
            />
            <Input
              label="Téléphone"
              placeholder="06 12 34 56 78"
              value={phone}
              onChangeText={setPhone}
              icon="call-outline"
              keyboardType="phone-pad"
              style={{ marginTop: Spacing.lg }}
            />
            <Input
              label="Date de naissance"
              placeholder="JJ/MM/AAAA"
              value={birthDate}
              onChangeText={(text) => {
                // Auto-format: add slashes
                const cleaned = text.replace(/[^0-9]/g, '');
                let formatted = cleaned;
                if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
                if (cleaned.length > 4) formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
                setBirthDate(formatted);
              }}
              icon="calendar-outline"
              keyboardType="numeric"
              style={{ marginTop: Spacing.lg }}
            />
          </View>

          {/* Email (read-only) */}
          <View style={styles.formCard}>
            <Input
              label="Email"
              placeholder=""
              value={user?.email ?? ''}
              onChangeText={() => {}}
              icon="mail-outline"
              editable={false}
            />
            <Text style={styles.emailHint}>
              L'email ne peut pas être modifié.
            </Text>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.bottomBar}>
          <Button
            title="Enregistrer"
            onPress={handleSave}
            loading={isSaving}
            disabled={!hasChanges}
            variant="primary"
            size="lg"
            icon="checkmark-circle"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    ...Typography.h2,
    color: Colors.white,
  },
  avatarHint: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },

  // Form
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  emailHint: {
    ...Typography.small,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },

  // Bottom action
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
});
