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
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import { useAuthStore } from '../../../src/store/authStore';

type SettingItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  danger?: boolean;
};

export default function AccountScreen() {
  const { user, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: signOut },
    ]);
  };

  const sections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Mon Compte',
      items: [
        { icon: 'person-outline', label: 'Informations personnelles' },
        { icon: 'home-outline', label: 'Adresses de livraison' },
        { icon: 'card-outline', label: 'Moyens de paiement' },
        { icon: 'receipt-outline', label: 'Historique des commandes' },
      ],
    },
    {
      title: 'Préférences',
      items: [
        { icon: 'notifications-outline', label: 'Notifications' },
        { icon: 'color-palette-outline', label: 'Apparence' },
        { icon: 'language-outline', label: 'Langue' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Aide & FAQ' },
        { icon: 'chatbubble-outline', label: 'Nous contacter' },
        { icon: 'star-outline', label: 'Noter l\'application' },
      ],
    },
    {
      title: '',
      items: [
        {
          icon: 'log-out-outline',
          label: 'Se déconnecter',
          onPress: handleSignOut,
          danger: true,
        },
      ],
    },
  ];

  const initials = user
    ? `${(user.firstName?.[0] || '').toUpperCase()}${(user.lastName?.[0] || '').toUpperCase()}`
    : '?';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.screenTitle}>Mon Compte</Text>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.firstName || ''} {user?.lastName || ''}
            </Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="create-outline" size={20} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Membership Banner */}
        <TouchableOpacity style={styles.memberBanner} activeOpacity={0.85}>
          <View>
            <Text style={styles.memberTitle}>Memoriz Premium</Text>
            <Text style={styles.memberSub}>Livraison gratuite & réductions exclusives</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.white} />
        </TouchableOpacity>

        {/* Settings Sections */}
        {sections.map((section, sectionIdx) => (
          <View key={sectionIdx} style={styles.section}>
            {section.title ? (
              <Text style={styles.sectionTitle}>{section.title}</Text>
            ) : null}
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={itemIdx}
                  style={[
                    styles.settingRow,
                    itemIdx < section.items.length - 1 && styles.settingRowBorder,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.65}
                >
                  <View style={[styles.settingIcon, item.danger && styles.settingIconDanger]}>
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={item.danger ? Colors.error : Colors.primary}
                    />
                  </View>
                  <Text style={[styles.settingLabel, item.danger && styles.settingLabelDanger]}>
                    {item.label}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={item.danger ? Colors.error : Colors.textTertiary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.version}>Memoriz v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  screenTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.h3,
    color: Colors.white,
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  profileName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  profileEmail: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    padding: Spacing.sm,
  },

  // Membership
  memberBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  memberTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.white,
  },
  memberSub: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Section
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingIconDanger: {
    backgroundColor: '#FEE2E2',
  },
  settingLabel: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  settingLabelDanger: {
    color: Colors.error,
  },

  // Version
  version: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
