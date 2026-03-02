import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import { useEditorStore } from '../../../src/store/editorStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMNS = 4;
const GAP = 3;
const PHOTO_SIZE = (SCREEN_WIDTH - Spacing.md * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

type Tab = 'recents' | 'favorites' | 'albums';

interface Props {
  onSelect: (uri: string) => void;
  onClose: () => void;
}

export default function PhotoPickerSheet({ onSelect, onClose }: Props) {
  const { availablePhotos, addAvailablePhoto, pages } = useEditorStore();
  const [activeTab, setActiveTab] = useState<Tab>('recents');

  const usedUris = new Set<string>();
  pages.forEach((page) =>
    page.slots.forEach((slot) => {
      if (slot.photoUri) usedUris.add(slot.photoUri);
    }),
  );

  const handlePickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', "L'accès à la galerie est nécessaire.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: 20,
    });

    if (!result.canceled && result.assets) {
      result.assets.forEach((asset) => {
        addAvailablePhoto(asset.uri);
      });
    }
  };

  const handleCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', "L'accès à la caméra est nécessaire.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      addAvailablePhoto(result.assets[0].uri);
      onSelect(result.assets[0].uri);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'recents', label: 'Récents' },
    { key: 'favorites', label: 'Favoris' },
    { key: 'albums', label: 'Albums' },
  ];

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pellicule</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handlePickFromLibrary}>
            <Ionicons name="images-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Galerie</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCamera}>
            <Ionicons name="camera-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Caméra</Text>
          </TouchableOpacity>
        </View>

        {availablePhotos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Aucune photo importée</Text>
            <Text style={styles.emptySubtext}>Ajoutez des photos depuis votre galerie</Text>
          </View>
        ) : (
          <FlatList
            data={availablePhotos}
            numColumns={COLUMNS}
            keyExtractor={(item, idx) => `photo-${idx}`}
            contentContainerStyle={styles.photoGrid}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isUsed = usedUris.has(item);
              return (
                <TouchableOpacity
                  style={styles.photoItem}
                  onPress={() => onSelect(item)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: item }} style={styles.photoImage} />
                  {isUsed && (
                    <View style={styles.usedBadge}>
                      <Text style={styles.usedBadgeText}>Utilisée</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  sheet: { flex: 1 },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
    marginTop: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  headerTitle: { ...Typography.h4, color: Colors.textPrimary },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { ...Typography.caption, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  actionBtnText: { ...Typography.caption, fontWeight: '600', color: Colors.primary },
  photoGrid: { paddingHorizontal: Spacing.md },
  photoItem: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    margin: GAP / 2,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  photoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  usedBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  usedBadgeText: { fontSize: 9, fontWeight: '700', color: Colors.white },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyText: { ...Typography.body, color: Colors.textSecondary, fontWeight: '600' },
  emptySubtext: { ...Typography.caption, color: Colors.textTertiary },
});
