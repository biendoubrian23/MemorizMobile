import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../../src/theme';

interface Props {
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onLockToggle: () => void;
  isLocked: boolean;
}

const BUTTONS = (isLocked: boolean) => [
  { icon: 'trash-outline', label: 'Supprimer', key: 'delete', color: '#EF4444' },
  { icon: 'copy-outline', label: 'Dupliquer', key: 'duplicate' },
  { icon: 'arrow-up-outline', label: 'Avancer', key: 'forward' },
  { icon: 'arrow-down-outline', label: 'Reculer', key: 'backward' },
  {
    icon: isLocked ? 'lock-closed' : 'lock-open-outline',
    label: isLocked ? 'Déverr.' : 'Verrouiller',
    key: 'lock',
  },
];

export default function ElementToolbar({
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onLockToggle,
  isLocked,
}: Props) {
  const actions: Record<string, () => void> = {
    delete: onDelete,
    duplicate: onDuplicate,
    forward: onBringForward,
    backward: onSendBackward,
    lock: onLockToggle,
  };

  return (
    <View style={styles.container}>
      {BUTTONS(isLocked).map((btn) => (
        <TouchableOpacity key={btn.key} style={styles.btn} onPress={actions[btn.key]}>
          <Ionicons
            name={btn.icon as any}
            size={20}
            color={btn.color || Colors.textPrimary}
          />
          <Text style={[styles.label, btn.color ? { color: btn.color } : null]}>
            {btn.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 16,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  btn: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
  },
  label: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
