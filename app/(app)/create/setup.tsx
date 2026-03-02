import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import { Button } from '../../../src/components/ui';
import { useProjectStore } from '../../../src/store/projectStore';
import { useEditorStore } from '../../../src/store/editorStore';
import { useAuthStore } from '../../../src/store/authStore';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_WIDTH = SCREEN_WIDTH - Spacing.xl * 2;
const PREVIEW_HEIGHT = 280;

// ═══ 3D Preview Component ═══
function Preview3D({ source }: { source: any }) {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Map finger position to rotation (-15 to 15 degrees)
      rotateY.value = (e.translationX / 150) * 15;
      rotateX.value = -(e.translationY / 150) * 15;
    })
    .onEnd(() => {
      rotateX.value = withSpring(0, { damping: 12, stiffness: 120 });
      rotateY.value = withSpring(0, { damping: 12, stiffness: 120 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
    ],
  }));

  return (
    <View style={styles.preview3DWrapper}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.previewContainer, animatedStyle]}>
          <Image
            source={source}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

type ProductType = 'album' | 'magazine';
type BindingType = 'hardcover' | 'softcover' | 'lay_flat';
type FormatType = 'a4_portrait' | 'a4_landscape' | 'square';
type PaperType = 'standard' | 'cream_satin';
type LaminationType = 'glossy' | 'matte' | 'soft_touch';
type ColorMode = 'color' | 'black_white';

// ═══ Images ═══
const TYPE_IMAGES: Record<ProductType, any> = {
  album: require('../../../assets/images/type/album.png'),
  magazine: require('../../../assets/images/type/magazine.png'),
};

const BINDING_IMAGES: Record<string, any> = {
  hardcover: require('../../../assets/images/reliure/dos-carre-colle.jpeg'),
  softcover: require('../../../assets/images/reliure/rembordé.jpeg'),
  lay_flat: require('../../../assets/images/reliure/agraphé.jpeg'),
};

const FORMAT_IMAGES: Record<FormatType, any> = {
  a4_portrait: require('../../../assets/images/format/A4 portrait.jpeg'),
  a4_landscape: require('../../../assets/images/format/paysage.jpeg'),
  square: require('../../../assets/images/format/carré.jpeg'),
};

const PAPER_IMAGE = require('../../../assets/images/papier/papier.png');

const PELLICULAGE_IMAGES: Record<LaminationType, any> = {
  glossy: require('../../../assets/images/pelliculage/brillant.jpeg'),
  matte: require('../../../assets/images/pelliculage/mat.jpeg'),
  soft_touch: require('../../../assets/images/pelliculage/soft touch.jpeg'),
};

// ═══ Template Images ═══
const ALBUM_TEMPLATES: { key: string; source: any }[] = [
  { key: 'album-1', source: require('../../../assets/images/album/album (1).jpeg') },
  { key: 'album-2', source: require('../../../assets/images/album/album (2).jpeg') },
  { key: 'album-3', source: require('../../../assets/images/album/album (3).jpeg') },
  { key: 'album-4', source: require('../../../assets/images/album/album (4).jpeg') },
  { key: 'album-5', source: require('../../../assets/images/album/album (5).jpeg') },
  { key: 'album-6', source: require('../../../assets/images/album/album (6).jpeg') },
  { key: 'album-7', source: require('../../../assets/images/album/album (7).jpeg') },
  { key: 'album-8', source: require('../../../assets/images/album/album (8).jpeg') },
  { key: 'album-9', source: require('../../../assets/images/album/album (9).jpeg') },
  { key: 'album-10', source: require('../../../assets/images/album/album (10).jpeg') },
  { key: 'album-11', source: require('../../../assets/images/album/album (11).jpeg') },
  { key: 'album-12', source: require('../../../assets/images/album/album (12).jpeg') },
  { key: 'album-13', source: require('../../../assets/images/album/album (13).jpeg') },
  { key: 'album-14', source: require('../../../assets/images/album/album (14).jpeg') },
  { key: 'album-15', source: require('../../../assets/images/album/album (15).jpeg') },
  { key: 'album-16', source: require('../../../assets/images/album/album (16).jpeg') },
  { key: 'album-17', source: require('../../../assets/images/album/album (17).jpeg') },
  { key: 'album-18', source: require('../../../assets/images/album/album (18).jpeg') },
  { key: 'album-19', source: require('../../../assets/images/album/album (19).jpeg') },
  { key: 'album-20', source: require('../../../assets/images/album/album (20).jpeg') },
  { key: 'album-21', source: require('../../../assets/images/album/album (21).jpeg') },
];

const MAGAZINE_TEMPLATES: { key: string; source: any }[] = [
  { key: 'magazine-1', source: require('../../../assets/images/magazine/magazine (1).jpeg') },
  { key: 'magazine-2', source: require('../../../assets/images/magazine/magazine (2).jpeg') },
  { key: 'magazine-3', source: require('../../../assets/images/magazine/magazine (3).jpeg') },
  { key: 'magazine-4', source: require('../../../assets/images/magazine/magazine (4).jpeg') },
  { key: 'magazine-5', source: require('../../../assets/images/magazine/magazine (5).jpeg') },
  { key: 'magazine-6', source: require('../../../assets/images/magazine/magazine (6).jpeg') },
  { key: 'magazine-7', source: require('../../../assets/images/magazine/magazine (7).jpeg') },
  { key: 'magazine-8', source: require('../../../assets/images/magazine/magazine (8).jpeg') },
  { key: 'magazine-9', source: require('../../../assets/images/magazine/magazine (9).jpeg') },
  { key: 'magazine-10', source: require('../../../assets/images/magazine/magazine (10).jpeg') },
  { key: 'magazine-11', source: require('../../../assets/images/magazine/magazine (11).jpeg') },
  { key: 'magazine-12', source: require('../../../assets/images/magazine/magazine (12).jpeg') },
  { key: 'magazine-13', source: require('../../../assets/images/magazine/magazine (13).jpeg') },
];

// ═══ Options ═══
const PRODUCT_OPTIONS: { key: ProductType; label: string; icon: string }[] = [
  { key: 'album', label: 'Album', icon: 'book' },
  { key: 'magazine', label: 'Magazine', icon: 'newspaper' },
];

const BINDING_MAP: Record<string, { key: BindingType; label: string; desc: string }[]> = {
  album: [
    { key: 'hardcover', label: 'Dos carré collé', desc: 'Reliure classique robuste' },
    { key: 'softcover', label: 'Dos carré rembordé', desc: 'Finition premium, couverture rigide' },
  ],
  magazine: [
    { key: 'hardcover', label: 'Dos carré collé', desc: 'Reliure classique robuste' },
    { key: 'softcover', label: 'Dos carré rembordé', desc: 'Finition premium, couverture rigide' },
    { key: 'lay_flat', label: 'Piqûre à cheval', desc: 'Reliure agrafée, idéale pour les magazines' },
  ],
};

const FORMAT_OPTIONS: { key: FormatType; label: string; ratio: string }[] = [
  { key: 'a4_portrait', label: 'A4 Portrait', ratio: '21×29.7cm' },
  { key: 'a4_landscape', label: 'A4 Paysage', ratio: '29.7×21cm' },
  { key: 'square', label: 'Carré', ratio: '21×21cm' },
];

const PAPER_OPTIONS: { key: PaperType; label: string; desc: string }[] = [
  { key: 'standard', label: 'Standard', desc: 'Papier blanc classique' },
  { key: 'cream_satin', label: 'Satiné', desc: 'Finition satinée douce' },
];

const PELLICULAGE_OPTIONS: { key: LaminationType; label: string }[] = [
  { key: 'glossy', label: 'Brillant' },
  { key: 'matte', label: 'Mat' },
  { key: 'soft_touch', label: 'Soft Touch' },
];

const COLOR_OPTIONS: { key: ColorMode; label: string }[] = [
  { key: 'color', label: 'Couleur' },
  { key: 'black_white', label: 'Noir & Blanc' },
];

export default function CreateSetupScreen() {
  const { user } = useAuthStore();
  const { createProject } = useProjectStore();
  const { initEditor } = useEditorStore();

  const [step, setStep] = useState(0);
  const [productType, setProductType] = useState<ProductType>('album');
  const [bindingType, setBindingType] = useState<BindingType>('hardcover');
  const [format, setFormat] = useState<FormatType>('a4_portrait');
  const [paper, setPaper] = useState<PaperType>('standard');
  const [lamination, setLamination] = useState<LaminationType>('matte');
  const [colorMode, setColorMode] = useState<ColorMode>('color');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateTab, setTemplateTab] = useState<'album' | 'magazine'>(productType);
  const [isCreating, setIsCreating] = useState(false);

  const steps = [
    'Type de produit',
    'Reliure',
    'Format',
    'Papier',
    'Pelliculage',
    'Couleur',
    'Template',
  ];

  const totalSteps = steps.length;

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      // Create project
      setIsCreating(true);
      try {
        const created = await createProject({
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
        // Initialise l'éditeur avec le format choisi puis redirige
        initEditor(created.id, format);
        router.replace(`/(editor)/${created.id}`);
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
          <View>
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
            <Preview3D source={TYPE_IMAGES[productType]} />
          </View>
        );

      case 'Reliure':
        return (
          <View>
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
            {BINDING_IMAGES[bindingType] && (
              <Preview3D source={BINDING_IMAGES[bindingType]} />
            )}
          </View>
        );

      case 'Format':
        return (
          <View>
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
            <Preview3D source={FORMAT_IMAGES[format]} />
          </View>
        );

      case 'Papier':
        return (
          <View>
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
            <Preview3D source={PAPER_IMAGE} />
          </View>
        );

      case 'Pelliculage':
        return (
          <View>
            <View style={styles.chipRow}>
              {PELLICULAGE_OPTIONS.map((opt) => (
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
            <Preview3D source={PELLICULAGE_IMAGES[lamination]} />
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
                {opt.key === 'color' ? (
                  <LinearGradient
                    colors={['#FF6B6B', '#FFA94D', '#51CF66', '#339AF0', '#CC5DE8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.colorPreviewSquare}
                  />
                ) : (
                  <LinearGradient
                    colors={['#222222', '#666666', '#AAAAAA', '#EEEEEE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.colorPreviewSquare}
                  />
                )}
                <Text style={[styles.optionLabel, colorMode === opt.key && styles.optionLabelActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'Template':
        const templates = templateTab === 'album' ? ALBUM_TEMPLATES : MAGAZINE_TEMPLATES;
        return (
          <View>
            {/* Tabs Album / Magazine */}
            <View style={styles.templateTabs}>
              <TouchableOpacity
                style={[styles.templateTab, templateTab === 'album' && styles.templateTabActive]}
                onPress={() => setTemplateTab('album')}
              >
                <Text style={[styles.templateTabText, templateTab === 'album' && styles.templateTabTextActive]}>
                  Album
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.templateTab, templateTab === 'magazine' && styles.templateTabActive]}
                onPress={() => setTemplateTab('magazine')}
              >
                <Text style={[styles.templateTabText, templateTab === 'magazine' && styles.templateTabTextActive]}>
                  Magazine
                </Text>
              </TouchableOpacity>
            </View>

            {/* 2-column gallery */}
            <View style={styles.templateGrid}>
              {templates.map((tpl) => (
                <TouchableOpacity
                  key={tpl.key}
                  style={[
                    styles.templateCard,
                    selectedTemplate === tpl.key && styles.templateCardActive,
                  ]}
                  onPress={() => setSelectedTemplate(tpl.key)}
                >
                  <Image source={tpl.source} style={styles.templateImage} resizeMode="cover" />
                  {selectedTemplate === tpl.key && (
                    <View style={styles.templateCheck}>
                      <Ionicons name="checkmark-circle" size={24} color={Colors.accent} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
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
          {steps[step] === 'Reliure' && 'Sélectionnez le type de reliure pour votre souvenir'}
          {steps[step] === 'Format' && 'Choisissez les dimensions de votre souvenir'}
          {steps[step] === 'Papier' && 'Sélectionnez la qualité du papier intérieur'}
          {steps[step] === 'Pelliculage' && 'Choisissez la finition de la couverture'}
          {steps[step] === 'Couleur' && 'Mode d\'impression de vos photos'}
          {steps[step] === 'Template' && 'Choisissez un template pour la couverture'}
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
  colorPreviewSquare: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
  },

  // Template
  templateTabs: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.backgroundSecondary,
    padding: 4,
  },
  templateTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
  templateTabActive: {
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  templateTabText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  templateTabTextActive: {
    color: Colors.accent,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  templateCard: {
    width: (SCREEN_WIDTH - Spacing.xl * 2 - Spacing.md) / 2,
    aspectRatio: 0.75,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  templateCardActive: {
    borderColor: Colors.accent,
    borderWidth: 3,
  },
  templateImage: {
    width: '100%',
    height: '100%',
  },
  templateCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },

  // 3D Preview
  preview3DWrapper: {
    alignItems: 'center',
    marginTop: Spacing['2xl'],
    paddingBottom: Spacing.xl,
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: PREVIEW_WIDTH * 0.85,
    height: PREVIEW_HEIGHT,
    borderRadius: BorderRadius.xl,
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
