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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import { Button } from '../../../src/components/ui';
import { useProjectStore } from '../../../src/store/projectStore';
import { useAuthStore } from '../../../src/store/authStore';

type ProductType = 'album' | 'magazine' | 'wall_deco';
type BindingType = 'hardcover' | 'softcover' | 'lay_flat';
type FormatType = 'a4_portrait' | 'a4_landscape' | 'square';
type PaperType = 'standard' | 'cream_satin';
type LaminationType = 'glossy' | 'matte' | 'soft_touch';
type ColorMode = 'color' | 'black_white';

const PRODUCT_OPTIONS: { key: ProductType; label: string; icon: string }[] = [
  { key: 'album', label: 'Album', icon: 'book' },
  { key: 'magazine', label: 'Magazine', icon: 'newspaper' },
  { key: 'wall_deco', label: 'Déco Murale', icon: 'image' },
];

const BINDING_MAP: Record<string, { key: BindingType; label: string; desc: string }[]> = {
  album: [
    { key: 'hardcover', label: 'Couverture Rigide', desc: 'Plus robuste, idéal pour les souvenirs' },
    { key: 'softcover', label: 'Couverture Souple', desc: 'Légère et économique' },
    { key: 'lay_flat', label: 'Ouverture à Plat', desc: 'Pages qui s\'ouvrent entièrement' },
  ],
  magazine: [
    { key: 'softcover', label: 'Standard', desc: 'Reliure agrafée classique' },
  ],
  wall_deco: [],
};

const FORMAT_OPTIONS: { key: FormatType; label: string; ratio: string }[] = [
  { key: 'a4_portrait', label: 'A4 Portrait', ratio: '21×29.7cm' },
  { key: 'a4_landscape', label: 'A4 Paysage', ratio: '29.7×21cm' },
  { key: 'square', label: 'Carré', ratio: '21×21cm' },
];

const PAPER_OPTIONS: { key: PaperType; label: string; desc: string }[] = [
  { key: 'standard', label: 'Standard', desc: 'Blanc brillant classique' },
  { key: 'cream_satin', label: 'Doux Crème Satin', desc: 'Finition satinée chaleureuse' },
];

const LAMINATION_OPTIONS: { key: LaminationType; label: string }[] = [
  { key: 'glossy', label: 'Brillant' },
  { key: 'matte', label: 'Mat' },
  { key: 'soft_touch', label: 'Soft Touch' },
];

const COLOR_OPTIONS: { key: ColorMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'color', label: 'Couleur', icon: 'color-palette' },
  { key: 'black_white', label: 'Noir & Blanc', icon: 'contrast' },
];

export default function CreateSetupScreen() {
  const { user } = useAuthStore();
  const { createProject } = useProjectStore();

  const [step, setStep] = useState(0);
  const [productType, setProductType] = useState<ProductType>('album');
  const [bindingType, setBindingType] = useState<BindingType>('hardcover');
  const [format, setFormat] = useState<FormatType>('a4_portrait');
  const [paper, setPaper] = useState<PaperType>('standard');
  const [lamination, setLamination] = useState<LaminationType>('matte');
  const [colorMode, setColorMode] = useState<ColorMode>('color');
  const [isCreating, setIsCreating] = useState(false);

  const steps = [
    'Type de produit',
    ...(productType !== 'wall_deco' ? ['Reliure'] : []),
    'Format',
    'Papier',
    'Lamination',
    'Couleur',
  ];

  const totalSteps = steps.length;

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      // Create project
      setIsCreating(true);
      try {
        await createProject({
          user_id: user!.id,
          title: 'Mon Souvenir',
          product_type: productType,
          binding_type: bindingType,
          format,
          paper_type: paper,
          lamination,
          color_mode: colorMode,
          page_count: 24,
          pages_data: {},
          status: 'draft',
        });
        router.replace('/(app)/(tabs)/projects');
      } catch (err: any) {
        Alert.alert('Erreur', err.message || 'Impossible de créer le projet');
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else router.back();
  };

  const renderStepContent = () => {
    const actualStep = steps[step];

    switch (actualStep) {
      case 'Type de produit':
        return (
          <View style={styles.optionsGrid}>
            {PRODUCT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.optionCard, productType === opt.key && styles.optionCardActive]}
                onPress={() => setProductType(opt.key)}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={32}
                  color={productType === opt.key ? Colors.accent : Colors.textSecondary}
                />
                <Text style={[styles.optionLabel, productType === opt.key && styles.optionLabelActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'Reliure':
        return (
          <View style={styles.optionsList}>
            {(BINDING_MAP[productType] || []).map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.listOption, bindingType === opt.key && styles.listOptionActive]}
                onPress={() => setBindingType(opt.key)}
              >
                <View style={styles.radioOuter}>
                  {bindingType === opt.key && <View style={styles.radioInner} />}
                </View>
                <View style={styles.listOptionText}>
                  <Text style={[styles.listOptionLabel, bindingType === opt.key && styles.listOptionLabelActive]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.listOptionDesc}>{opt.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'Format':
        return (
          <View style={styles.formatGrid}>
            {FORMAT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.formatCard, format === opt.key && styles.formatCardActive]}
                onPress={() => setFormat(opt.key)}
              >
                <View
                  style={[
                    styles.formatPreview,
                    opt.key === 'a4_portrait' && { width: 50, height: 70 },
                    opt.key === 'a4_landscape' && { width: 70, height: 50 },
                    opt.key === 'square' && { width: 60, height: 60 },
                    format === opt.key && styles.formatPreviewActive,
                  ]}
                />
                <Text style={[styles.formatLabel, format === opt.key && styles.optionLabelActive]}>
                  {opt.label}
                </Text>
                <Text style={styles.formatRatio}>{opt.ratio}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'Papier':
        return (
          <View style={styles.optionsList}>
            {PAPER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.listOption, paper === opt.key && styles.listOptionActive]}
                onPress={() => setPaper(opt.key)}
              >
                <View style={styles.radioOuter}>
                  {paper === opt.key && <View style={styles.radioInner} />}
                </View>
                <View style={styles.listOptionText}>
                  <Text style={[styles.listOptionLabel, paper === opt.key && styles.listOptionLabelActive]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.listOptionDesc}>{opt.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'Lamination':
        return (
          <View style={styles.chipRow}>
            {LAMINATION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.chip, lamination === opt.key && styles.chipActive]}
                onPress={() => setLamination(opt.key)}
              >
                <Text style={[styles.chipText, lamination === opt.key && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'Couleur':
        return (
          <View style={styles.colorGrid}>
            {COLOR_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.colorCard, colorMode === opt.key && styles.colorCardActive]}
                onPress={() => setColorMode(opt.key)}
              >
                <Ionicons
                  name={opt.icon}
                  size={28}
                  color={colorMode === opt.key ? Colors.accent : Colors.textSecondary}
                />
                <Text style={[styles.optionLabel, colorMode === opt.key && styles.optionLabelActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau Souvenir</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((step + 1) / totalSteps) * 100}%` }]} />
        </View>
        <Text style={styles.stepIndicator}>
          Étape {step + 1}/{totalSteps}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepTitle}>{steps[step]}</Text>
        <Text style={styles.stepSubtitle}>
          {step === 0 && 'Choisissez le type de souvenir que vous souhaitez créer'}
          {steps[step] === 'Reliure' && 'Sélectionnez le type de reliure pour votre album'}
          {steps[step] === 'Format' && 'Choisissez les dimensions de votre souvenir'}
          {steps[step] === 'Papier' && 'Sélectionnez la qualité du papier intérieur'}
          {steps[step] === 'Lamination' && 'Choisissez la finition de la couverture'}
          {steps[step] === 'Couleur' && 'Mode d\'impression de vos photos'}
        </Text>

        {renderStepContent()}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <Button
          title={step < totalSteps - 1 ? 'Continuer' : 'Créer mon souvenir'}
          onPress={handleNext}
          loading={isCreating}
          variant="primary"
          size="lg"
          icon={step < totalSteps - 1 ? 'arrow-forward' : 'checkmark-circle'}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Progress
  progressContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  stepIndicator: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },

  stepTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing['2xl'],
  },

  // Options Grid
  optionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  optionCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'],
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    gap: Spacing.sm,
  },
  optionCardActive: {
    borderColor: Colors.accent,
    backgroundColor: '#FEF2F4',
  },
  optionLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  optionLabelActive: {
    color: Colors.accent,
  },

  // List Options
  optionsList: {
    gap: Spacing.md,
  },
  listOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    gap: Spacing.md,
  },
  listOptionActive: {
    borderColor: Colors.accent,
    backgroundColor: '#FEF2F4',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent,
  },
  listOptionText: {
    flex: 1,
  },
  listOptionLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  listOptionLabelActive: {
    color: Colors.accent,
  },
  listOptionDesc: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },

  // Format Grid
  formatGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  formatCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    gap: Spacing.sm,
  },
  formatCardActive: {
    borderColor: Colors.accent,
    backgroundColor: '#FEF2F4',
  },
  formatPreview: {
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formatPreviewActive: {
    borderColor: Colors.accent,
    backgroundColor: '#FDDDE3',
  },
  formatLabel: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  formatRatio: {
    ...Typography.small,
    color: Colors.textTertiary,
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  chip: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  chipActive: {
    borderColor: Colors.accent,
    backgroundColor: '#FEF2F4',
  },
  chipText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.accent,
  },

  // Color
  colorGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  colorCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'],
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    gap: Spacing.sm,
  },
  colorCardActive: {
    borderColor: Colors.accent,
    backgroundColor: '#FEF2F4',
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
});
