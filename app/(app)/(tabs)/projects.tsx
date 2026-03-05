import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  RefreshControl,
  Alert,
  Image,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import { useAuthStore } from '../../../src/store/authStore';
import { useProjectStore } from '../../../src/store/projectStore';
import { loadDraft } from '../../../src/services/draftStorage';
import { Project, ProjectFilter } from '../../../src/types';

const { width } = Dimensions.get('window');

const FILTERS: { key: ProjectFilter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'ordered', label: 'Commandés' },
];

export default function ProjectsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { projects, filter, isLoading, fetchProjects, setFilter, getFilteredProjects, deleteProject } =
    useProjectStore();

  // Map projectId → cover URI extracted from local drafts
  const [draftCovers, setDraftCovers] = useState<Record<string, string>>({});

  // Load cover URIs from local drafts for all projects
  const loadDraftCovers = useCallback(async (projectList: typeof projects) => {
    const covers: Record<string, string> = {};
    await Promise.all(
      projectList.map(async (p) => {
        // Skip if project already has a cover_image_url
        if (p.cover_image_url) return;
        try {
          const draft = await loadDraft(p.id);
          if (draft?.pages?.length) {
            // Parcourir TOUTES les pages (couverture d'abord, puis les autres)
            for (const page of draft.pages) {
              // Check slots first
              if (Array.isArray(page?.slots)) {
                for (const slot of page.slots) {
                  if (slot?.photoUri) {
                    covers[p.id] = slot.photoUri;
                    return;
                  }
                }
              }
              // Check free-form elements
              if (Array.isArray((page as any)?.elements)) {
                for (const el of (page as any).elements) {
                  if (el?.type === 'image' && el?.imageUri) {
                    covers[p.id] = el.imageUri;
                    return;
                  }
                }
              }
            }
          }
        } catch {
          // Ignore
        }
      }),
    );
    setDraftCovers(covers);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchProjects(user.id);
    }
  }, [user?.id]);

  // Recharger les covers à chaque focus sur l'onglet (retour de l'éditeur)
  useFocusEffect(
    useCallback(() => {
      if (user?.id) fetchProjects(user.id);
      if (projects.length > 0) loadDraftCovers(projects);
    }, [user?.id, projects.length]),
  );

  // Load draft covers when projects change
  useEffect(() => {
    if (projects.length > 0) {
      loadDraftCovers(projects);
    }
  }, [projects]);

  const filteredProjects = getFilteredProjects();

  const handleRefresh = () => {
    if (user?.id) fetchProjects(user.id);
    if (projects.length > 0) loadDraftCovers(projects);
  };

  const handleDelete = (project: Project) => {
    Alert.alert(
      'Supprimer le projet',
      `Êtes-vous sûr de vouloir supprimer "${project.title}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(project.id);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le projet.');
            }
          },
        },
      ]
    );
  };

  const renderProject = ({ item }: { item: Project }) => (
    <ProjectCard
      project={item}
      draftCoverUri={draftCovers[item.id]}
      onPress={() => router.push(`/(editor)/${item.id}`)}
      onDelete={() => handleDelete(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Memoriz</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              filter === f.key && styles.filterChipActive,
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Projects list */}
      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={64} color={Colors.border} />
            <Text style={styles.emptyTitle}>Aucun souvenir</Text>
            <Text style={styles.emptyText}>
              Créez votre premier album ou magazine !
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ═══ Helpers ═══
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ═══ Project Card Component ═══
function ProjectCard({
  project,
  draftCoverUri,
  onPress,
  onDelete,
}: {
  project: Project;
  draftCoverUri?: string;
  onPress: () => void;
  onDelete: () => void;
}) {
  const statusBadge = getStatusBadge(project.status);
  const formatLabel = getFormatLabel(project);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Cover image / preview */}
      {(() => {
        const coverUri = getCoverUri(project, draftCoverUri);
        const overlayContent = (
          <>
            {/* Delete button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.white} />
            </TouchableOpacity>

            {/* Status badge */}
            <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusBadge.dotColor }]} />
              <Text style={[styles.statusText, { color: statusBadge.textColor }]}>
                {statusBadge.label}
              </Text>
            </View>
          </>
        );

        if (coverUri) {
          return (
            <ImageBackground
              source={{ uri: coverUri }}
              style={styles.cardImage}
              imageStyle={styles.cardImageRounded}
              resizeMode="cover"
            >
              {overlayContent}
            </ImageBackground>
          );
        }

        return (
          <LinearGradient
            colors={getProjectColors(project.product_type)}
            style={styles.cardImage}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {overlayContent}
          </LinearGradient>
        );
      })()}

      {/* Card info */}
      <View style={styles.cardInfo}>
        <View style={styles.cardTitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{project.title}</Text>
            <Text style={styles.cardMeta}>
              {formatLabel} • {project.page_count} Pages
            </Text>
          </View>
          <Text style={styles.cardDate}>
            {formatRelativeDate(project.updated_at)}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.avatarGroup}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={14} color={Colors.white} />
            </View>
          </View>

          {project.status === 'draft' ? (
            <TouchableOpacity style={styles.continueButton} onPress={onPress}>
              <Text style={styles.continueText}>Continuer</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.reorderButton} onPress={onPress}>
              <Text style={styles.reorderText}>Commander à nouveau</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'draft':
      return {
        label: 'Brouillon',
        bg: Colors.badgeDraft,
        textColor: Colors.badgeDraftText,
        dotColor: Colors.badgeDraftText,
      };
    case 'ordered':
      return {
        label: 'Commandé',
        bg: Colors.badgeOrdered,
        textColor: Colors.badgeOrderedText,
        dotColor: Colors.badgeOrderedText,
      };
    default:
      return {
        label: 'Livré',
        bg: Colors.badgeOrdered,
        textColor: Colors.badgeOrderedText,
        dotColor: Colors.success,
      };
  }
}

function getFormatLabel(project: Project) {
  const types: Record<string, string> = {
    album: 'Album',
    magazine: 'Magazine',
  };
  const formats: Record<string, string> = {
    square: 'Carré',
    a4_portrait: 'A4 Portrait',
    a4_landscape: 'A4 Paysage',
  };
  const bindings: Record<string, string> = {
    hardcover: 'Rigide',
    softcover: 'Souple',
    lay_flat: 'Ouverture à plat',
  };
  return `${types[project.product_type] || ''} ${formats[project.format] || ''}`;
}

/**
 * Extracts a cover image URI from the project.
 * Priority: cover_image_url > draft cover > any page in pages_data > null
 */
function getCoverUri(project: Project, draftCoverUri?: string): string | null {
  // 1. Explicit cover image URL
  if (project.cover_image_url) return project.cover_image_url;

  // 2. Cover from local draft
  if (draftCoverUri) return draftCoverUri;

  // 3. Try to extract from pages_data (search ALL pages)
  try {
    const pagesData = project.pages_data as any;
    if (Array.isArray(pagesData)) {
      for (const page of pagesData) {
        // Check slots
        if (Array.isArray(page?.slots)) {
          for (const slot of page.slots) {
            if (slot?.photoUri) return slot.photoUri;
          }
        }
        // Check elements (free-form overlay images)
        if (Array.isArray(page?.elements)) {
          for (const el of page.elements) {
            if (el?.type === 'image' && el?.imageUri) return el.imageUri;
          }
        }
      }
    }
  } catch {
    // Ignore parse errors
  }

  return null;
}

function getProjectColors(type: string) {
  switch (type) {
    case 'magazine':
      return ['#6BB5FF', '#4ECDC4'] as const;
    default:
      return ['#FF6B8A', '#FF9A5C'] as const;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },

  // Filters
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundSoft,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100,
  },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  cardImage: {
    height: 180,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.md,
    overflow: 'hidden',
  },
  cardImageRounded: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  cardInfo: {
    padding: Spacing.lg,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardMeta: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  cardDate: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarGroup: {
    flexDirection: 'row',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  continueText: {
    ...Typography.buttonSmall,
    color: Colors.white,
  },
  reorderButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  reorderText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
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
