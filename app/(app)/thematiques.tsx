import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/theme';
import { THEMATIQUES } from '../../src/data/thematiques';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = Spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.xl * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.2;

export default function ThematiquesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thématiques</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        {THEMATIQUES.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push(`/(app)/create/setup?themeId=${theme.id}`)}
          >
            <Image source={theme.image} style={styles.cardImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.65)'] as const}
              style={styles.cardOverlay}
              start={{ x: 0.5, y: 0.3 }}
              end={{ x: 0.5, y: 1 }}
            >
              <Text style={styles.cardName}>{theme.name}</Text>
              <Text style={styles.cardDesc}>{theme.desc}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: CARD_GAP,
    paddingBottom: Spacing['3xl'],
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: Spacing.md,
  },
  cardName: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.white,
  },
  cardDesc: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.9)',
  },
});
