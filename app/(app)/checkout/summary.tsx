import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import { useCartStore } from '../../../src/store/cartStore';
import { useAuthStore } from '../../../src/store/authStore';
import {
  PRODUCT_LABELS,
  FORMAT_LABELS,
  BINDING_LABELS,
  PAPER_LABELS,
  LAMINATION_LABELS,
} from '../../../src/utils/pricing';

export default function CheckoutSummaryScreen() {
  const { user } = useAuthStore();
  const { items, promoCode, promoDiscount, getSubtotal, getTotal } = useCartStore();

  const subtotal = getSubtotal();
  const total = getTotal();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Récapitulatif</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Steps indicator */}
      <View style={styles.stepsRow}>
        <StepDot active label="1" text="Récap" />
        <View style={styles.stepLine} />
        <StepDot active={false} label="2" text="Adresse" />
        <View style={styles.stepLine} />
        <StepDot active={false} label="3" text="Paiement" />
        <View style={styles.stepLine} />
        <StepDot active={false} label="4" text="Confirmation" />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Items */}
        {items.map((item) => {
          const project = item.project;
          return (
            <View key={item.id} style={styles.itemCard}>
              <LinearGradient
                colors={['#FF9A5C', '#FF6B8A']}
                style={styles.itemThumb}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {project?.title || 'Mon Memoriz'}
                </Text>
                <Text style={styles.itemDetail}>
                  {PRODUCT_LABELS[project?.product_type ?? 'album']} •{' '}
                  {FORMAT_LABELS[project?.format ?? 'square']}
                </Text>
                <Text style={styles.itemDetail}>
                  {BINDING_LABELS[project?.binding_type ?? 'hardcover']} •{' '}
                  {project?.page_count ?? 24} pages
                </Text>
                <Text style={styles.itemDetail}>
                  Papier {PAPER_LABELS[project?.paper_type ?? 'standard']} •{' '}
                  {LAMINATION_LABELS[project?.lamination ?? 'matte']}
                </Text>
                <View style={styles.qtyRow}>
                  <Text style={styles.qtyLabel}>Qté : {item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    {(item.unit_price * item.quantity).toFixed(2)}€
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{subtotal.toFixed(2)}€</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Livraison</Text>
            <Text style={styles.shippingFree}>Offerte</Text>
          </View>
          {promoDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Réduction ({promoCode})
              </Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                -{promoDiscount.toFixed(2)}€
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{total.toFixed(2)}€</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(app)/checkout/address')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Continuer — Adresse de livraison</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function StepDot({
  active,
  label,
  text,
}: {
  active: boolean;
  label: string;
  text: string;
}) {
  return (
    <View style={styles.stepItem}>
      <View
        style={[
          styles.stepDot,
          active && styles.stepDotActive,
        ]}
      >
        <Text
          style={[styles.stepDotText, active && styles.stepDotTextActive]}
        >
          {label}
        </Text>
      </View>
      <Text style={[styles.stepText, active && styles.stepTextActive]}>
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
  stepDotText: { ...Typography.small, fontWeight: '700', color: Colors.textTertiary },
  stepDotTextActive: { color: Colors.white },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.borderLight,
    marginBottom: 16,
  },
  stepText: { ...Typography.small, color: Colors.textTertiary },
  stepTextActive: { color: Colors.accent, fontWeight: '600' },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 120 },

  // Item card
  itemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  itemThumb: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
  },
  itemInfo: { flex: 1, marginLeft: Spacing.md },
  itemTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  itemDetail: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  qtyLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  itemPrice: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // Summary
  summaryCard: {
    backgroundColor: Colors.backgroundSoft,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  summaryLabel: { ...Typography.body, color: Colors.textSecondary },
  summaryValue: { ...Typography.body, color: Colors.textSecondary },
  shippingFree: {
    ...Typography.body,
    color: Colors.success,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  totalLabel: { ...Typography.h4, color: Colors.textPrimary },
  totalValue: { ...Typography.h4, color: Colors.textPrimary },

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
