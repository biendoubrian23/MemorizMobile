import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import { TextStylePreset } from '../../../src/types';
import { LinearGradient } from 'expo-linear-gradient';

// ═══ Presets de styles de texte ═══
export const TEXT_STYLE_PRESETS: TextStylePreset[] = [
  {
    id: 'title',
    label: 'Titre',
    fontSize: 32,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontWeight: 'bold',
    fontStyle: 'normal',
    color: '#1B2541',
  },
  {
    id: 'subtitle',
    label: 'Sous-titre',
    fontSize: 24,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontWeight: 'bold',
    fontStyle: 'normal',
    color: '#1B2541',
  },
  {
    id: 'paragraph',
    label: 'Paragraphe',
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: '#4B5563',
  },
  {
    id: 'caption',
    label: 'Légende',
    fontSize: 12,
    fontFamily: 'System',
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: '#9CA3AF',
  },
  {
    id: 'display',
    label: 'Display',
    fontSize: 40,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontWeight: 'bold',
    fontStyle: 'normal',
    color: '#1B2541',
  },
  {
    id: 'script',
    label: 'Script',
    fontSize: 28,
    fontFamily: 'System',
    fontWeight: 'normal',
    fontStyle: 'italic',
    color: '#6B21A8',
  },
];

interface Props {
  onSelectPreset: (preset: TextStylePreset) => void;
  onAddFreeText: () => void;
  onClose: () => void;
}

export default function TextStylesSheet({ onSelectPreset, onAddFreeText, onClose }: Props) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>STYLES DE TEXTE</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Bouton ajouter zone de texte libre */}
      <TouchableOpacity onPress={onAddFreeText} style={styles.addBtnWrap}>
        <LinearGradient
          colors={['#9333EA', '#A855F7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.addBtn}
        >
          <Ionicons name="text" size={18} color="#FFF" />
          <Text style={styles.addBtnText}>Ajouter une zone de texte</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Liste des presets */}
      <ScrollView
        contentContainerStyle={styles.presetList}
        showsVerticalScrollIndicator={false}
      >
        {TEXT_STYLE_PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.id}
            style={styles.presetCard}
            onPress={() => onSelectPreset(preset)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.presetLabel,
                {
                  fontSize: Math.min(preset.fontSize, 36),
                  fontFamily: preset.fontFamily !== 'System' ? preset.fontFamily : undefined,
                  fontWeight: preset.fontWeight,
                  fontStyle: preset.fontStyle,
                  color: preset.color,
                },
              ]}
              numberOfLines={1}
            >
              {preset.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    paddingBottom: Spacing.xl,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnWrap: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  presetList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  presetCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  presetLabel: {
    // Dynamic styles applied inline
  },
});
