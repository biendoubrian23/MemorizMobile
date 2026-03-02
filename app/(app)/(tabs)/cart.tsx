import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import { Button } from '../../../src/components/ui';
import { useAuthStore } from '../../../src/store/authStore';
import { useCartStore } from '../../../src/store/cartStore';
import { CartItemWithProject } from '../../../src/types';

export default function CartScreen() {
  const { user } = useAuthStore();
  const {
    items,
    isLoading,
    promoCode,
    promoDiscount,
    fetchCart,
    updateQuantity,
    removeItem,
    applyPromoCode,
    getSubtotal,
    getTotal,
  } = useCartStore();

  const [promoInput, setPromoInput] = useState('');

  useEffect(() => {
    if (user?.id) fetchCart(user.id);
  }, [user?.id]);

  const handleApplyPromo = async () => {
    try {
      await applyPromoCode(promoInput.trim());
      Alert.alert('Succès', 'Code promo appliqué !');
    } catch {
      Alert.alert('Erreur', 'Code promo invalide.');
    }
  };

  const handlePayment = () => {
    Alert.alert('Paiement', 'Le paiement sera intégré prochainement (Stripe & Apple Pay).');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        <Text style={styles.title}>
          Mon Panier{' '}
          <Text style={styles.itemCount}>({items.length} articles)</Text>
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bag-outline" size={64} color={Colors.border} />
            <Text style={styles.emptyTitle}>Votre panier est vide</Text>
            <Text style={styles.emptyText}>
              Commencez par créer un souvenir !
            </Text>
          </View>
        ) : (
          <>
            {/* Cart Items */}
            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                onRemove={() => removeItem(item.id)}
              />
            ))}

            {/* Promo Code */}
            <View style={styles.promoRow}>
              <View style={styles.promoIcon}>
                <Ionicons name="heart" size={18} color={Colors.accent} />
              </View>
              <TextInput
                style={styles.promoInput}
                placeholder="Code promo"
                placeholderTextColor={Colors.textTertiary}
                value={promoInput}
                onChangeText={setPromoInput}
              />
              <TouchableOpacity onPress={handleApplyPromo}>
                <Text style={styles.promoApply}>Appliquer</Text>
              </TouchableOpacity>
            </View>

            {/* Summary */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Sous-total</Text>
                <Text style={styles.summaryValue}>
                  {getSubtotal().toFixed(2)}€
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Livraison</Text>
                <Text style={styles.shippingFree}>Offerte</Text>
              </View>
              {promoDiscount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Réduction</Text>
                  <Text style={[styles.summaryValue, { color: Colors.success }]}>
                    -{promoDiscount.toFixed(2)}€
                  </Text>
                </View>
              )}
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{getTotal().toFixed(2)}€</Text>
              </View>
              <Text style={styles.paymentInfo}>
                Paiement sécurisé par <Text style={styles.paymentLink}>Stripe</Text> & <Text style={styles.paymentLink}>Apple Pay</Text>
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {items.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.payButton}
            onPress={handlePayment}
            activeOpacity={0.85}
          >
            <Text style={styles.payButtonText}>Payer la commande</Text>
            <View style={styles.payButtonPrice}>
              <Text style={styles.payButtonPriceText}>
                {getTotal().toFixed(2)}€
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ═══ Cart Item Card ═══
function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItemWithProject;
  onUpdateQuantity: (qty: number) => void;
  onRemove: () => void;
}) {
  const formatLabel = item.project
    ? `${getProductLabel(item.project.product_type)} ${getFormatShort(item.project.format)}`
    : '';
  const detailLabel = item.project
    ? `${item.project.page_count} Pages • Papier Mat.`
    : '';

  return (
    <View style={styles.cartItem}>
      {/* Thumbnail */}
      <LinearGradient
        colors={['#FF9A5C', '#FF6B8A']}
        style={styles.cartItemImage}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.cartItemInfo}>
        <View style={styles.cartItemHeader}>
          <Text style={styles.cartItemTitle} numberOfLines={1}>
            {item.project?.title || 'Mon Souvenir'}
          </Text>
          <TouchableOpacity onPress={onRemove}>
            <Ionicons name="trash-outline" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.cartItemFormat}>{formatLabel}</Text>
        <Text style={styles.cartItemDetail}>{detailLabel}</Text>

        {/* Quantity */}
        <View style={styles.quantityRow}>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              onPress={() => onUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Text style={[styles.quantityBtn, item.quantity <= 1 && { opacity: 0.3 }]}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => onUpdateQuantity(item.quantity + 1)}>
              <Text style={[styles.quantityBtn, { color: Colors.info }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Text style={styles.cartItemPrice}>
        {(item.unit_price * item.quantity).toFixed(2)}€
      </Text>
    </View>
  );
}

function getProductLabel(type: string) {
  const map: Record<string, string> = { album: 'Album', magazine: 'Magazine', wall_deco: 'Déco' };
  return map[type] || '';
}
function getFormatShort(format: string) {
  const map: Record<string, string> = { square: 'Carré 21x21cm', a4_portrait: 'A4', a4_landscape: 'A4 Paysage' };
  return map[format] || '';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
    flex: 1,
  },
  itemCount: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 120,
  },

  // Cart Item
  cartItem: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    alignItems: 'flex-start',
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  cartItemFormat: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cartItemDetail: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  quantityRow: {
    marginTop: Spacing.sm,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  quantityBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  quantityValue: {
    paddingHorizontal: Spacing.sm,
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cartItemPrice: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },

  // Promo
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing['2xl'],
    gap: Spacing.sm,
  },
  promoIcon: {
    marginRight: Spacing.xs,
  },
  promoInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  promoApply: {
    ...Typography.body,
    color: Colors.accent,
    fontWeight: '600',
  },

  // Summary
  summaryContainer: {
    marginTop: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  summaryLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  summaryValue: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
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
  totalLabel: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  totalValue: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  paymentInfo: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  paymentLink: {
    color: Colors.info,
    textDecorationLine: 'underline',
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  payButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  payButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 16,
  },
  payButtonPrice: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  payButtonPriceText: {
    ...Typography.button,
    color: Colors.white,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing['6xl'],
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
});
