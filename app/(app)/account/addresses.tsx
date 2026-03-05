import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import { Input, Button } from '../../../src/components/ui';
import { useAddressStore } from '../../../src/store/addressStore';
import { Address } from '../../../src/types';

// ═══ Address Form Modal ═══
function AddressFormModal({
  visible,
  onClose,
  editAddress,
}: {
  visible: boolean;
  onClose: () => void;
  editAddress: Address | null;
}) {
  const { addAddress, updateAddress } = useAddressStore();

  const [label, setLabel] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [street, setStreet] = useState('');
  const [street2, setStreet2] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('France');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editAddress) {
      setLabel(editAddress.label);
      setFirstName(editAddress.first_name);
      setLastName(editAddress.last_name);
      setStreet(editAddress.street);
      setStreet2(editAddress.street2 ?? '');
      setPostalCode(editAddress.postal_code);
      setCity(editAddress.city);
      setCountry(editAddress.country);
      setPhone(editAddress.phone ?? '');
      setIsDefault(editAddress.is_default);
    } else {
      setLabel('Domicile');
      setFirstName('');
      setLastName('');
      setStreet('');
      setStreet2('');
      setPostalCode('');
      setCity('');
      setCountry('France');
      setPhone('');
      setIsDefault(false);
    }
  }, [editAddress, visible]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !street.trim() || !postalCode.trim() || !city.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        label: label.trim() || 'Domicile',
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        street: street.trim(),
        street2: street2.trim() || null,
        postal_code: postalCode.trim(),
        city: city.trim(),
        country: country.trim(),
        phone: phone.trim() || null,
        is_default: isDefault,
      };

      if (editAddress) {
        await updateAddress(editAddress.id, data);
      } else {
        await addAddress(data);
      }
      onClose();
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de sauvegarder.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={formStyles.container} edges={['top']}>
        <View style={formStyles.header}>
          <TouchableOpacity onPress={onClose} style={formStyles.headerBtn}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={formStyles.headerTitle}>
            {editAddress ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
          </Text>
          <View style={formStyles.headerBtn} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={formStyles.scroll}
            contentContainerStyle={formStyles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Input
              label="Intitulé"
              placeholder="Domicile, Bureau..."
              value={label}
              onChangeText={setLabel}
              icon="bookmark-outline"
              autoCapitalize="words"
            />
            <Input
              label="Prénom *"
              placeholder="Prénom du destinataire"
              value={firstName}
              onChangeText={setFirstName}
              icon="person-outline"
              autoCapitalize="words"
              style={{ marginTop: Spacing.lg }}
            />
            <Input
              label="Nom *"
              placeholder="Nom du destinataire"
              value={lastName}
              onChangeText={setLastName}
              icon="person-outline"
              autoCapitalize="words"
              style={{ marginTop: Spacing.lg }}
            />
            <Input
              label="Adresse *"
              placeholder="Numéro et nom de rue"
              value={street}
              onChangeText={setStreet}
              icon="location-outline"
              autoCapitalize="words"
              style={{ marginTop: Spacing.lg }}
            />
            <Input
              label="Complément d'adresse"
              placeholder="Bâtiment, étage, code..."
              value={street2}
              onChangeText={setStreet2}
              icon="location-outline"
              autoCapitalize="words"
              style={{ marginTop: Spacing.lg }}
            />
            <View style={formStyles.row}>
              <Input
                label="Code postal *"
                placeholder="75001"
                value={postalCode}
                onChangeText={setPostalCode}
                keyboardType="numeric"
                style={{ flex: 1 }}
              />
              <Input
                label="Ville *"
                placeholder="Paris"
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
                style={{ flex: 2, marginLeft: Spacing.md }}
              />
            </View>
            <Input
              label="Pays"
              placeholder="France"
              value={country}
              onChangeText={setCountry}
              icon="globe-outline"
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

            {/* Default toggle */}
            <TouchableOpacity
              style={formStyles.toggleRow}
              onPress={() => setIsDefault(!isDefault)}
            >
              <Ionicons
                name={isDefault ? 'checkbox' : 'square-outline'}
                size={24}
                color={isDefault ? Colors.accent : Colors.textTertiary}
              />
              <Text style={formStyles.toggleLabel}>Adresse par défaut</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={formStyles.bottomBar}>
            <Button
              title={editAddress ? 'Enregistrer' : 'Ajouter l\'adresse'}
              onPress={handleSave}
              loading={isSaving}
              variant="primary"
              size="lg"
              icon="checkmark-circle"
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const formStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
  },
  row: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing['2xl'],
    paddingVertical: Spacing.sm,
  },
  toggleLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
});

// ═══ Main Addresses Screen ═══
export default function AddressesScreen() {
  const { addresses, isLoading, fetchAddresses, deleteAddress, setDefault } = useAddressStore();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = (address: Address) => {
    Alert.alert(
      'Supprimer l\'adresse',
      `Voulez-vous supprimer "${address.label}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(address.id);
            } catch (err: any) {
              Alert.alert('Erreur', err.message);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAddress(null);
    fetchAddresses(); // refresh
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adresses de livraison</Text>
        <TouchableOpacity onPress={handleAdd} style={styles.headerBtn}>
          <Ionicons name="add" size={24} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {addresses.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>Aucune adresse</Text>
            <Text style={styles.emptyDesc}>
              Ajoutez une adresse de livraison pour vos commandes.
            </Text>
            <Button
              title="Ajouter une adresse"
              onPress={handleAdd}
              variant="primary"
              size="md"
              icon="add-circle"
              fullWidth={false}
              style={{ marginTop: Spacing.xl }}
            />
          </View>
        )}

        {addresses.map((addr) => (
          <View key={addr.id} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <View style={styles.addressLabelRow}>
                <Ionicons name="location" size={18} color={Colors.accent} />
                <Text style={styles.addressLabel}>{addr.label}</Text>
                {addr.is_default && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Par défaut</Text>
                  </View>
                )}
              </View>
              <View style={styles.addressActions}>
                <TouchableOpacity onPress={() => handleEdit(addr)} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={18} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(addr)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.addressName}>
              {addr.first_name} {addr.last_name}
            </Text>
            <Text style={styles.addressLine}>{addr.street}</Text>
            {addr.street2 ? <Text style={styles.addressLine}>{addr.street2}</Text> : null}
            <Text style={styles.addressLine}>
              {addr.postal_code} {addr.city}
            </Text>
            <Text style={styles.addressLine}>{addr.country}</Text>
            {addr.phone ? (
              <Text style={styles.addressPhone}>{addr.phone}</Text>
            ) : null}

            {!addr.is_default && (
              <TouchableOpacity
                style={styles.setDefaultBtn}
                onPress={() => setDefault(addr.id)}
              >
                <Ionicons name="star-outline" size={16} color={Colors.accent} />
                <Text style={styles.setDefaultText}>Définir par défaut</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      <AddressFormModal
        visible={showForm}
        onClose={handleCloseForm}
        editAddress={editingAddress}
      />
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
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing['6xl'],
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
  },
  emptyDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    maxWidth: 260,
  },

  // Address Card
  addressCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  addressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addressLabel: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  defaultBadge: {
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.xs,
  },
  defaultBadgeText: {
    ...Typography.small,
    color: Colors.accent,
    fontWeight: '600',
  },
  addressActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  addressLine: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  addressPhone: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  setDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  setDefaultText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '600',
  },
});
