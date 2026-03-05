import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import { useCartStore } from '../../../src/store/cartStore';
import { useAuthStore } from '../../../src/store/authStore';

export default function CheckoutConfirmationScreen() {
  const { user } = useAuthStore();
  const { items, getTotal, clearCart } = useCartStore();
  const total = getTotal();
  const itemCount = items.length;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Vider le panier après la confirmation
    if (user?.id) {
      clearCart(user.id).catch(() => {});
    }
  }, []);

  const orderNumber = `MEM-${Date.now().toString(36).toUpperCase()}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Steps – all done */}
      <View style={styles.stepsRow}>
        <StepDot done label="✓" text="Récap" />
        <View style={[styles.stepLine, styles.stepLineDone]} />
        <StepDot done label="✓" text="Adresse" />
        <View style={[styles.stepLine, styles.stepLineDone]} />
        <StepDot done label="✓" text="Paiement" />
        <View style={[styles.stepLine, styles.stepLineDone]} />
        <StepDot done label="✓" text="Confirmation" />
      </View>

      <View style={styles.content}>
        {/* Success icon */}
        <Animated.View
          style={[
            styles.successCircle,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Ionicons name="checkmark" size={48} color={Colors.white} />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={styles.title}>Commande confirmée !</Text>
          <Text style={styles.subtitle}>
            Merci pour votre commande. Vous recevrez un e-mail de confirmation
            à {user?.email ?? 'votre adresse e-mail'}.
          </Text>

          {/* Order details */}
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>N° de commande</Text>
              <Text style={styles.detailValue}>{orderNumber}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Articles</Text>
              <Text style={styles.detailValue}>
                {itemCount} {itemCount > 1 ? 'articles' : 'article'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Montant payé</Text>
              <Text style={styles.detailValueAccent}>
                {total.toFixed(2)}€
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Livraison estimée</Text>
              <Text style={styles.detailValue}>5-7 jours ouvrés</Text>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.timeline}>
            <TimelineStep
              icon="checkmark-circle"
              title="Commande reçue"
              subtitle="Nous préparons votre commande"
              active
            />
            <TimelineStep
              icon="print-outline"
              title="En cours d'impression"
              subtitle="Production sous 2-3 jours"
            />
            <TimelineStep
              icon="airplane-outline"
              title="Expédition"
              subtitle="Suivi par e-mail"
            />
            <TimelineStep
              icon="home-outline"
              title="Livré chez vous"
              subtitle="5-7 jours ouvrés"
              last
            />
          </View>
        </Animated.View>
      </View>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.replace('/(app)/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Retour à l'accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace('/(app)/(tabs)/projects')}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryText}>Voir mes projets</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function TimelineStep({
  icon,
  title,
  subtitle,
  active,
  last,
}: {
  icon: string;
  title: string;
  subtitle: string;
  active?: boolean;
  last?: boolean;
}) {
  return (
    <View style={styles.timelineStep}>
      <View style={styles.timelineLeft}>
        <View
          style={[
            styles.timelineIcon,
            active && styles.timelineIconActive,
          ]}
        >
          <Ionicons
            name={icon as any}
            size={16}
            color={active ? Colors.white : Colors.textTertiary}
          />
        </View>
        {!last && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.timelineInfo}>
        <Text
          style={[styles.timelineTitle, active && { color: Colors.textPrimary }]}
        >
          {title}
        </Text>
        <Text style={styles.timelineSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function StepDot({
  done,
  label,
  text,
}: {
  done?: boolean;
  label: string;
  text: string;
}) {
  return (
    <View style={styles.stepItem}>
      <View style={[styles.stepDot, done && styles.stepDotDone]}>
        <Text style={[styles.stepDotText, done && styles.stepDotTextActive]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.stepText, done && styles.stepTextDone]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Steps
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
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
  stepTextDone: { color: Colors.success, fontWeight: '600' },

  // Content
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },

  // Detail card
  detailCard: {
    width: '100%',
    backgroundColor: Colors.backgroundSoft,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: { ...Typography.body, color: Colors.textSecondary },
  detailValue: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  detailValueAccent: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.accent,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },

  // Timeline
  timeline: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconActive: { backgroundColor: Colors.success },
  timelineLine: {
    width: 2,
    height: 28,
    backgroundColor: Colors.borderLight,
  },
  timelineInfo: {
    flex: 1,
    paddingBottom: Spacing.md,
  },
  timelineTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  timelineSubtitle: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },

  // Bottom
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  ctaText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 15,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  secondaryText: {
    ...Typography.body,
    color: Colors.accent,
    fontWeight: '600',
  },
});
