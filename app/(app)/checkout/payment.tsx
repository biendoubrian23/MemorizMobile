import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import { useCartStore } from '../../../src/store/cartStore';

type PaymentMethod = 'card' | 'apple_pay' | 'google_pay';

export default function CheckoutPaymentScreen() {
  const { getTotal } = useCartStore();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const total = getTotal();

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      // Simuler un délai de traitement de paiement
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // TODO: Intégrer Stripe / Apple Pay ici
      router.replace('/(app)/checkout/confirmation');
    } catch {
      Alert.alert('Erreur', 'Le paiement a échoué. Réessayez.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Steps */}
      <View style={styles.stepsRow}>
        <StepDot done label="✓" text="Récap" />
        <View style={[styles.stepLine, styles.stepLineDone]} />
        <StepDot done label="✓" text="Adresse" />
        <View style={[styles.stepLine, styles.stepLineDone]} />
        <StepDot active label="3" text="Paiement" />
        <View style={styles.stepLine} />
        <StepDot active={false} label="4" text="Confirmation" />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Choisissez votre moyen de paiement</Text>

        {/* Card */}
        <PaymentOptionCard
          icon="card-outline"
          title="Carte bancaire"
          subtitle="Visa, Mastercard, CB"
          selected={selectedMethod === 'card'}
          onPress={() => setSelectedMethod('card')}
        />

        {/* Apple Pay */}
        <PaymentOptionCard
          icon="logo-apple"
          title="Apple Pay"
          subtitle="Paiement rapide et sécurisé"
          selected={selectedMethod === 'apple_pay'}
          onPress={() => setSelectedMethod('apple_pay')}
        />

        {/* Google Pay */}
        <PaymentOptionCard
          icon="logo-google"
          title="Google Pay"
          subtitle="Paiement avec votre compte Google"
          selected={selectedMethod === 'google_pay'}
          onPress={() => setSelectedMethod('google_pay')}
        />

        {/* Card form (si carte sélectionnée) */}
        {selectedMethod === 'card' && (
          <View style={styles.cardForm}>
            <View style={styles.cardPreview}>
              <Ionicons name="card" size={48} color={Colors.accent} />
              <Text style={styles.cardPreviewText}>
                Le formulaire de carte sécurisé sera{'\n'}affiché ici via Stripe
              </Text>
            </View>
          </View>
        )}

        {/* Secure info */}
        <View style={styles.secureRow}>
          <Ionicons name="lock-closed" size={16} color={Colors.success} />
          <Text style={styles.secureText}>
            Paiement 100% sécurisé par Stripe. Vos informations bancaires ne sont
            jamais stockées sur nos serveurs.
          </Text>
        </View>

        {/* Summary */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Montant total</Text>
          <Text style={styles.totalValue}>{total.toFixed(2)}€</Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.ctaButton, isProcessing && { opacity: 0.6 }]}
          onPress={handlePay}
          disabled={isProcessing}
          activeOpacity={0.85}
        >
          {isProcessing ? (
            <Text style={styles.ctaText}>Traitement en cours...</Text>
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color={Colors.white} />
              <Text style={styles.ctaText}>
                Payer {total.toFixed(2)}€
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function PaymentOptionCard({
  icon,
  title,
  subtitle,
  selected,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.optionCard, selected && styles.optionCardActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.optionRadio}>
        <View
          style={[
            styles.radioOuter,
            selected && styles.radioOuterActive,
          ]}
        >
          {selected && <View style={styles.radioInner} />}
        </View>
      </View>
      <Ionicons
        name={icon as any}
        size={24}
        color={selected ? Colors.accent : Colors.textSecondary}
      />
      <View style={styles.optionInfo}>
        <Text style={[styles.optionTitle, selected && { color: Colors.accent }]}>
          {title}
        </Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
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
      <Text style={[styles.stepText, isHighlighted && styles.stepTextActive]}>
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

  sectionTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },

  // Payment option
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  optionCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentSoft,
  },
  optionRadio: {},
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
  optionInfo: { flex: 1 },
  optionTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  optionSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1,
  },

  // Card form placeholder
  cardForm: {
    marginBottom: Spacing.lg,
  },
  cardPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'],
    backgroundColor: Colors.backgroundSoft,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  cardPreviewText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // Secure
  secureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  secureText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },

  // Total
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSoft,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  totalLabel: { ...Typography.h4, color: Colors.textPrimary },
  totalValue: { ...Typography.h3, color: Colors.accent },

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
