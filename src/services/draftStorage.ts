/**
 * Service de stockage local persistant pour les brouillons de l'éditeur.
 *
 * Stratégie :
 *  - Chaque projet a son propre espace « draft:<projectId> »
 *  - Les données (pages, photos, metadata) sont sérialisées en JSON
 *  - TTL = 365 jours — les drafts expirés sont nettoyés au lancement
 *  - Sync Supabase uniquement au moment de la commande
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PageData } from '../types';

// ─────────── Constants ───────────

const DRAFT_PREFIX = 'draft:';
const DRAFT_INDEX_KEY = 'draft:__index__';
const TTL_MS = 365 * 24 * 60 * 60 * 1000; // 1 an

// ─────────── Types ───────────

export interface DraftMetadata {
  projectId: string;
  format: string;
  updatedAt: number; // epoch ms
  pageCount: number;
}

export interface DraftData {
  metadata: DraftMetadata;
  pages: PageData[];
  availablePhotos: string[];
}

// ─────────── Helpers ───────────

function draftKey(projectId: string): string {
  return `${DRAFT_PREFIX}${projectId}`;
}

// ─────────── Public API ───────────

/**
 * Sauvegarde le brouillon de l'éditeur en local.
 */
export async function saveDraft(
  projectId: string,
  format: string,
  pages: PageData[],
  availablePhotos: string[] = [],
): Promise<void> {
  const draft: DraftData = {
    metadata: {
      projectId,
      format,
      updatedAt: Date.now(),
      pageCount: pages.length,
    },
    pages,
    availablePhotos,
  };

  // Sauvegarde atomique : données + mise à jour de l'index
  const index = await getDraftIndex();
  index[projectId] = draft.metadata;

  await AsyncStorage.multiSet([
    [draftKey(projectId), JSON.stringify(draft)],
    [DRAFT_INDEX_KEY, JSON.stringify(index)],
  ]);
}

/**
 * Charge un brouillon depuis le stockage local.
 * Retourne null si le draft n'existe pas ou a expiré.
 */
export async function loadDraft(projectId: string): Promise<DraftData | null> {
  try {
    const raw = await AsyncStorage.getItem(draftKey(projectId));
    if (!raw) return null;

    const draft: DraftData = JSON.parse(raw);

    // Vérifie le TTL
    if (Date.now() - draft.metadata.updatedAt > TTL_MS) {
      await deleteDraft(projectId);
      return null;
    }

    return draft;
  } catch {
    return null;
  }
}

/**
 * Supprime un brouillon du stockage local.
 */
export async function deleteDraft(projectId: string): Promise<void> {
  const index = await getDraftIndex();
  delete index[projectId];

  await AsyncStorage.multiSet([
    [DRAFT_INDEX_KEY, JSON.stringify(index)],
  ]);
  await AsyncStorage.removeItem(draftKey(projectId));
}

/**
 * Liste tous les brouillons sauvegardés localement.
 */
export async function listDrafts(): Promise<DraftMetadata[]> {
  const index = await getDraftIndex();
  return Object.values(index).sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Nettoie les brouillons expirés (> 1 an).
 * À appeler au démarrage de l'app.
 */
export async function cleanExpiredDrafts(): Promise<number> {
  const index = await getDraftIndex();
  const now = Date.now();
  const expired: string[] = [];

  for (const [id, meta] of Object.entries(index)) {
    if (now - meta.updatedAt > TTL_MS) {
      expired.push(id);
    }
  }

  if (expired.length > 0) {
    const keysToRemove = expired.map(draftKey);
    await AsyncStorage.multiRemove(keysToRemove);

    for (const id of expired) {
      delete index[id];
    }
    await AsyncStorage.setItem(DRAFT_INDEX_KEY, JSON.stringify(index));
  }

  return expired.length;
}

// ─────────── Private ───────────

async function getDraftIndex(): Promise<Record<string, DraftMetadata>> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_INDEX_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
