import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import { useAuthStore } from '../../../src/store/authStore';
import { supabase } from '../../../src/lib/supabase';

interface AddressForm {
  firstName: string;
  lastName: string;
  street: string;
  street2: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
}

const EMPTY_ADDRESS: AddressForm = {
  firstName: '',
  lastName: '',
  street: '',
  street2: '',
  postalCode: '',
  city: '',
  country: 'France',
  phone: '',
};

export default function CheckoutAddressScreen() {
  const { user } = useAuthStore();
  const [form, setForm] = useState<AddressForm>(EMPTY_ADDRESS);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSavedAddresses();
  }, []);

  const loadSavedAddresses = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });
    if (data && data.length > 0) {
      setSavedAddresses(data);
      // Auto-sélectionner l'adresse par défaut
      const defaultAddr = data.find((a: any) => a.is_default) || data[0];
      if (defaultAddr) {
        selectAddress(defaultAddr);
      }
    }
  };

  const selectAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setForm({
      firstName: addr.first_name || '',
      lastName: addr.last_name || '',
      street: addr.street || '',
      street2: addr.street2 || '',
      postalCode: addr.postal_code || '',
      city: addr.city || '',
      country: addr.country || 'France',
      phone: addr.phone || '',
    });
  };

  const updateField = (key: keyof AddressForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSelectedAddressId(null); // L'utilisateur modifie → déselectionner
  };

  const validate = (): boolean => {
    if (!form.firstName.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir votre prénom.');
      return false;
    }
    if (!form.lastName.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir votre nom.');
      return false;
    }
    if (!form.street.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir votre adresse.');
      return false;
    }
    if (!form.postalCode.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir le code postal.');
      return false;
    }
    if (!form.city.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir la ville.');
      return false;
    }
    return true;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Sauvegarder ou mettre à jour l'adresse
      if (selectedAddressId) {
        await supabase
          .from('addresses')
          .update({
            first_name: form.firstName.trim(),
            last_name: form.lastName.trim(),
            street: form.street.trim(),
            street2: form.street2.trim() || null,
            postal_code: form.postalCode.trim(),
            city: form.city.trim(),
            country: form.country.trim(),
            phone: form.phone.trim() || null,
          })
          .eq('id', selectedAddressId);
      } else {
        await supabase.from('addresses').insert({
          user_id: user.id,
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          street: form.street.trim(),
          street2: form.street2.trim() || null,
          postal_code: form.postalCode.trim(),
          city: form.city.trim(),
          country: form.country.trim(),
          phone: form.phone.trim() || null,
          is_default: savedAddresses.length === 0,
        });
      }

      router.push('/(app)/checkout/payment');
    } catch {
      Alert.alert('Erreur', "Impossible de sauvegarder l'adresse.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adresse de livraison</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Steps */}
      <View style={styles.stepsRow}>
        <StepDot done label="✓" text="Récap" />
        <View style={[styles.stepLine, styles.stepLineDone]} />
        <StepDot active label="2" text="Adresse" />
        <View style={styles.stepLine} />
        <StepDot active={false} label="3" text="Paiement" />
        <View style={styles.stepLine} />
        <StepDot active={false} label="4" text="Confirmation" />
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
          {/* Saved addresses */}
          {savedAddresses.length > 0 && (
            <View style={styles.savedSection}>
              <Text style={styles.sectionTitle}>Adresses enregistrées</Text>
              {savedAddresses.map((addr) => (
                <TouchableOpacity
                  key={addr.id}
                  style={[
                    styles.savedCard,
                    selectedAddressId === addr.id && styles.savedCardActive,
                  ]}
                  onPress={() => selectAddress(addr)}
                  activeOpacity={0.7}
                >
                  <View style={styles.savedRadio}>
                    <View
                      style={[
                        styles.radioOuter,
                        selectedAddressId === addr.id && styles.radioOuterActive,
                      ]}
                    >
                      {selectedAddressId === addr.id && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.savedName}>
                      {addr.first_name} {addr.last_name}
                    </Text>
                    <Text style={styles.savedAddr}>
                      {addr.street}, {addr.postal_code} {addr.city}
                    </Text>
                  </View>
                  {addr.is_default && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Par défaut</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Form */}
          <Text style={styles.sectionTitle}>
            {savedAddresses.length > 0
              ? 'Modifier ou ajouter une adresse'
              : 'Adresse de livraison'}
          </Text>

          <View style={styles.row}>
            <FormField
              label="Prénom"
              value={form.firstName}
              onChangeText={(v) => updateField('firstName', v)}
              placeholder="Jean"
              half
            />
            <FormField
              label="Nom"
              value={form.lastName}
              onChangeText={(v) => updateField('lastName', v)}
              placeholder="Dupont"
              half
            />
          </View>
          <FormField
            label="Adresse"
            value={form.street}
            onChangeText={(v) => updateField('street', v)}
            placeholder="12 rue de la Paix"
          />
          <FormField
            label="Complément (optionnel)"
            value={form.street2}
            onChangeText={(v) => updateField('street2', v)}
            placeholder="Bât. A, étage 3"
          />
          <View style={styles.row}>
            <FormField
              label="Code postal"
              value={form.postalCode}
              onChangeText={(v) => updateField('postalCode', v)}
              placeholder="75001"
              keyboardType="numeric"
              half
            />
            <FormField
              label="Ville"
              value={form.city}
              onChangeText={(v) => updateField('city', v)}
              placeholder="Paris"
              half
            />
          </View>
          <FormField
            label="Pays"
            value={form.country}
            onChangeText={(v) => updateField('country', v)}
            placeholder="France"
          />
          <FormField
            label="Téléphone (optionnel)"
            value={form.phone}
            onChangeText={(v) => updateField('phone', v)}
            placeholder="+33 6 12 34 56 78"
            keyboardType="phone-pad"
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.ctaButton, isLoading && { opacity: 0.6 }]}
          onPress={handleContinue}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>
            {isLoading ? 'Enregistrement...' : 'Continuer — Paiement'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ═══ Sub-components ═══

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  half,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  half?: boolean;
}) {
  return (
    <View style={[styles.fieldContainer, half && { flex: 1 }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize="words"
      />
    </View>
  );
}

function StepDot({
  active,
  done,
  label,
  text,
}: {
  active?: boolean;
  done?: boolean;
  label: string;
  text: string;
}) {
  const isHighlighted = active || done;
  return (
    <View style={styles.stepItem}>
      <View
        style={[
          styles.stepDot,
          isHighlighted && styles.stepDotActive,
          done && styles.stepDotDone,
        ]}
      >
        <Text
          style={[
            styles.stepDotText,
            isHighlighted && styles.stepDotTextActive,
          ]}
        >
          {label}
        </Text>
      </View>
      <Text
        style={[styles.stepText, isHighlighted && styles.stepTextActive]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },

  // Steps
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: 4,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: Colors.accent },
  stepDotDone: { backgroundColor: Colors.success },
  stepDotText: {
    ...Typography.small,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
  stepDotTextActive: { color: Colors.white },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.borderLight,
    marginBottom: 16,
  },
  stepLineDone: { backgroundColor: Colors.success },
  stepText: { ...Typography.small, color: Colors.textTertiary },
  stepTextActive: { color: Colors.accent, fontWeight: '600' },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 120 },

  // Saved
  savedSection: { marginBottom: Spacing.xl },
  sectionTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  savedCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentSoft,
  },
  savedRadio: { marginRight: Spacing.md },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: { borderColor: Colors.accent },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  savedName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  savedAddr: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  defaultBadgeText: {
    ...Typography.small,
    color: Colors.accent,
    fontWeight: '600',
  },

  // Form
  row: { flexDirection: 'row', gap: Spacing.md },
  fieldContainer: { marginBottom: Spacing.md },
  fieldLabel: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
  },

  // Bottom
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  ctaButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  ctaText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 15,
  },
});
