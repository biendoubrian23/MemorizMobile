import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../../src/theme';

// ═══ Polices disponibles ═══
const AVAILABLE_FONTS = [
  { id: 'System', label: 'System (Défaut)' },
  { id: 'PlayfairDisplay_400Regular', label: 'Playfair Display' },
  { id: 'PlayfairDisplay_700Bold', label: 'Playfair Display Bold' },
  { id: 'PlayfairDisplay_700Bold_Italic', label: 'Playfair Bold Italic' },
  { id: 'serif', label: 'Serif' },
  { id: 'monospace', label: 'Monospace' },
  // Android & cross-platform fonts
  { id: 'sans-serif', label: 'Sans-Serif' },
  { id: 'sans-serif-light', label: 'Sans-Serif Light' },
  { id: 'sans-serif-thin', label: 'Sans-Serif Thin' },
  { id: 'sans-serif-condensed', label: 'Sans-Serif Condensed' },
  { id: 'sans-serif-medium', label: 'Sans-Serif Medium' },
  { id: 'Roboto', label: 'Roboto' },
  { id: 'notoserif', label: 'Noto Serif' },
  { id: 'cursive', label: 'Cursive' },
  // iOS fonts
  { id: 'Georgia', label: 'Georgia' },
  { id: 'Times New Roman', label: 'Times New Roman' },
  { id: 'Courier New', label: 'Courier New' },
  { id: 'Helvetica', label: 'Helvetica' },
  { id: 'Helvetica Neue', label: 'Helvetica Neue' },
  { id: 'Avenir', label: 'Avenir' },
  { id: 'Avenir Next', label: 'Avenir Next' },
  { id: 'Futura', label: 'Futura' },
  { id: 'Gill Sans', label: 'Gill Sans' },
  { id: 'Baskerville', label: 'Baskerville' },
  { id: 'Didot', label: 'Didot' },
  { id: 'Palatino', label: 'Palatino' },
  { id: 'Trebuchet MS', label: 'Trebuchet MS' },
  { id: 'Verdana', label: 'Verdana' },
  { id: 'Cochin', label: 'Cochin' },
  { id: 'Copperplate', label: 'Copperplate' },
  { id: 'American Typewriter', label: 'American Typewriter' },
  { id: 'Menlo', label: 'Menlo' },
];

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 134];

interface TextStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecorationLine: 'none' | 'underline' | 'line-through' | 'underline line-through';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textAlign: 'left' | 'center' | 'right';
  color: string;
}

interface Props {
  style: TextStyle;
  onStyleChange: (updates: Partial<TextStyle>) => void;
  onValidate: () => void;
}

const COLOR_PALETTE = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#1B2541', '#E8385D',
  '#9333EA', '#10B981', '#F59E0B', '#6366F1', '#EC4899',
  '#14B8A6', '#8B5CF6', '#EF4444', '#3B82F6', '#22C55E',
];

export default function TextFormattingToolbar({ style, onStyleChange, onValidate }: Props) {
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const toggleBold = () => {
    onStyleChange({ fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold' });
  };

  const toggleItalic = () => {
    onStyleChange({ fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic' });
  };

  const toggleUnderline = () => {
    const current = style.textDecorationLine;
    if (current === 'underline' || current === 'underline line-through') {
      onStyleChange({
        textDecorationLine: current === 'underline line-through' ? 'line-through' : 'none',
      });
    } else {
      onStyleChange({
        textDecorationLine: current === 'line-through' ? 'underline line-through' : 'underline',
      });
    }
  };

  const toggleStrikethrough = () => {
    const current = style.textDecorationLine;
    if (current === 'line-through' || current === 'underline line-through') {
      onStyleChange({
        textDecorationLine: current === 'underline line-through' ? 'underline' : 'none',
      });
    } else {
      onStyleChange({
        textDecorationLine: current === 'underline' ? 'underline line-through' : 'line-through',
      });
    }
  };

  const toggleCase = () => {
    const cases: TextStyle['textTransform'][] = ['none', 'uppercase', 'capitalize', 'lowercase'];
    const idx = cases.indexOf(style.textTransform);
    onStyleChange({ textTransform: cases[(idx + 1) % cases.length] });
  };

  const cycleAlign = () => {
    const aligns: TextStyle['textAlign'][] = ['left', 'center', 'right'];
    const idx = aligns.indexOf(style.textAlign);
    onStyleChange({ textAlign: aligns[(idx + 1) % aligns.length] });
  };

  const alignIcon = style.textAlign === 'left'
    ? 'reorder-three-outline'
    : style.textAlign === 'center'
      ? 'menu-outline'
      : 'reorder-four-outline';

  const isUnderline = style.textDecorationLine === 'underline' || style.textDecorationLine === 'underline line-through';
  const isStrikethrough = style.textDecorationLine === 'line-through' || style.textDecorationLine === 'underline line-through';

  const currentFontLabel = AVAILABLE_FONTS.find(f => f.id === style.fontFamily)?.label || 'System';

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Taille de police */}
        <TouchableOpacity
          style={styles.fontSizeBtn}
          onPress={() => setShowFontSizePicker(true)}
        >
          <Text style={styles.fontSizeText}>{style.fontSize} pt</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        {/* Alignement */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={cycleAlign}
        >
          <Ionicons name={alignIcon as any} size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.separator} />

        {/* Bold */}
        <TouchableOpacity
          style={[styles.iconBtn, style.fontWeight === 'bold' && styles.iconBtnActive]}
          onPress={toggleBold}
        >
          <Text style={[styles.formatText, { fontWeight: 'bold' }]}>B</Text>
        </TouchableOpacity>

        {/* Italic */}
        <TouchableOpacity
          style={[styles.iconBtn, style.fontStyle === 'italic' && styles.iconBtnActive]}
          onPress={toggleItalic}
        >
          <Text style={[styles.formatText, { fontStyle: 'italic' }]}>I</Text>
        </TouchableOpacity>

        {/* Underline */}
        <TouchableOpacity
          style={[styles.iconBtn, isUnderline && styles.iconBtnActive]}
          onPress={toggleUnderline}
        >
          <Text style={[styles.formatText, { textDecorationLine: 'underline' }]}>U</Text>
        </TouchableOpacity>

        {/* Strikethrough */}
        <TouchableOpacity
          style={[styles.iconBtn, isStrikethrough && styles.iconBtnActive]}
          onPress={toggleStrikethrough}
        >
          <Text style={[styles.formatText, { textDecorationLine: 'line-through' }]}>S</Text>
        </TouchableOpacity>

        {/* Case */}
        <TouchableOpacity
          style={[styles.iconBtn, style.textTransform !== 'none' && styles.iconBtnActive]}
          onPress={toggleCase}
        >
          <Text style={styles.formatText}>aA</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        {/* Font family */}
        <TouchableOpacity
          style={styles.fontFamilyBtn}
          onPress={() => setShowFontPicker(true)}
        >
          <Text style={styles.fontFamilyText} numberOfLines={1}>{currentFontLabel}</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        {/* Color */}
        <TouchableOpacity
          style={styles.colorBtn}
          onPress={() => setShowColorPicker(true)}
        >
          <View style={[styles.colorCircle, { backgroundColor: style.color }]} />
        </TouchableOpacity>
      </ScrollView>

      {/* Bouton valider */}
      <TouchableOpacity style={styles.validateBtn} onPress={onValidate}>
        <Ionicons name="checkmark" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>

      {/* Font Size Picker */}
      <Modal visible={showFontSizePicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFontSizePicker(false)}
        >
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Taille de police</Text>
            <FlatList
              data={FONT_SIZES}
              keyExtractor={(item) => String(item)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    item === style.fontSize && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    onStyleChange({ fontSize: item });
                    setShowFontSizePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      item === style.fontSize && styles.pickerItemTextActive,
                    ]}
                  >
                    {item} pt
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Font Family Picker */}
      <Modal visible={showFontPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFontPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Police</Text>
            {AVAILABLE_FONTS.map((font) => (
              <TouchableOpacity
                key={font.id}
                style={[
                  styles.pickerItem,
                  font.id === style.fontFamily && styles.pickerItemActive,
                ]}
                onPress={() => {
                  onStyleChange({ fontFamily: font.id });
                  setShowFontPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    font.id === style.fontFamily && styles.pickerItemTextActive,
                    font.id !== 'System' ? { fontFamily: font.id } : {},
                  ]}
                >
                  {font.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Color Picker */}
      <Modal visible={showColorPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowColorPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Couleur du texte</Text>
            <View style={styles.colorGrid}>
              {COLOR_PALETTE.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    color === style.color && styles.colorSwatchActive,
                    color === '#FFFFFF' && { borderWidth: 1, borderColor: '#DDD' },
                  ]}
                  onPress={() => {
                    onStyleChange({ color });
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 30,
    marginHorizontal: Spacing.sm,
    marginVertical: Spacing.xs,
    paddingLeft: Spacing.sm,
    paddingRight: 4,
    height: 48,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: Spacing.sm,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 4,
  },
  fontSizeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fontSizeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: '#EDE9FE',
  },
  formatText: {
    fontSize: 18,
    color: Colors.textPrimary,
  },
  fontFamilyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    maxWidth: 140,
  },
  fontFamilyText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  validateBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.borderLight,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    width: '70%',
    maxHeight: 400,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  pickerItemActive: {
    backgroundColor: '#EDE9FE',
  },
  pickerItemText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  pickerItemTextActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  colorBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorSwatchActive: {
    borderWidth: 3,
    borderColor: '#7C3AED',
  },
});
