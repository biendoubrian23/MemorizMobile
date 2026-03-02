import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';
import { useAuthStore } from '../../../src/store/authStore';
import { useProjectStore } from '../../../src/store/projectStore';
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
  const { projects, filter, isLoading, fetchProjects, setFilter, getFilteredProjects } =
    useProjectStore();

  useEffect(() => {
    if (user?.id) {
      fetchProjects(user.id);
    }
  }, [user?.id]);

  const filteredProjects = getFilteredProjects();

  const handleRefresh = () => {
    if (user?.id) fetchProjects(user.id);
  };

  const renderProject = ({ item }: { item: Project }) => (
    <ProjectCard
      project={item}
      onPress={() => router.push(`/(editor)/${item.id}`)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Souvenirs</Text>
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

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(app)/create/setup')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={22} color={Colors.white} />
        <Text style={styles.fabText}>Créer</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ═══ Project Card Component ═══
function ProjectCard({
  project,
  onPress,
}: {
  project: Project;
  onPress: () => void;
}) {
  const statusBadge = getStatusBadge(project.status);
  const formatLabel = getFormatLabel(project);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Cover image */}
      <LinearGradient
        colors={getProjectColors(project.product_type)}
        style={styles.cardImage}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusBadge.dotColor }]} />
          <Text style={[styles.statusText, { color: statusBadge.textColor }]}>
            {statusBadge.label}
          </Text>
        </View>
      </LinearGradient>

      {/* Card info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{project.title}</Text>
        <Text style={styles.cardMeta}>
          {formatLabel} • {project.page_count} Pages
        </Text>

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
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: Spacing.md,
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
  cardTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardMeta: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
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

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    shadowColor: Colors.accent,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: {
    ...Typography.button,
    color: Colors.white,
  },
});
