import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { PageElement } from '../../../src/types';

const HANDLE_SIZE = 20;
const ROTATION_HANDLE_OFFSET = 28;
const SELECTION_COLOR = '#7C3AED';

interface DraggableElementProps {
  element: PageElement;
  isSelected: boolean;
  pageWidth: number;
  pageHeight: number;
  onSelect: () => void;
  onDelete: () => void;
  onPositionChange: (x: number, y: number) => void;
  onSizeChange: (width: number, height: number) => void;
  onRotationChange: (rotation: number) => void;
}

export default function DraggableElement({
  element,
  isSelected,
  pageWidth,
  pageHeight,
  onSelect,
  onDelete,
  onPositionChange,
  onSizeChange,
  onRotationChange,
}: DraggableElementProps) {
  const { x, y, width, height, locked, type, zIndex, rotation = 0 } = element;

  const elemW = (width / 100) * pageWidth;
  const elemH = (height / 100) * pageHeight;

  // ── Shared animated values ──
  // Drag offset (px)
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);

  // Resize: position offset (px) + size delta (px)
  const resizePosX = useSharedValue(0);
  const resizePosY = useSharedValue(0);
  const resizeDeltaW = useSharedValue(0);
  const resizeDeltaH = useSharedValue(0);

  // Rotation delta (degrees)
  const rotDelta = useSharedValue(0);

  // Reset all animated offsets when element props change
  useEffect(() => {
    dragX.value = 0;
    dragY.value = 0;
    resizePosX.value = 0;
    resizePosY.value = 0;
    resizeDeltaW.value = 0;
    resizeDeltaH.value = 0;
    rotDelta.value = 0;
  }, [x, y, width, height, rotation]);

  // ── Commit callbacks (JS thread, called only onEnd) ──
  const commitPosition = useCallback(
    (nx: number, ny: number) => {
      onPositionChange(
        Math.max(0, Math.min(100 - width, nx)),
        Math.max(0, Math.min(100 - height, ny)),
      );
    },
    [width, height, onPositionChange],
  );

  const commitSize = useCallback(
    (nw: number, nh: number) => {
      onSizeChange(Math.max(8, Math.min(100, nw)), Math.max(4, Math.min(100, nh)));
    },
    [onSizeChange],
  );

  const commitTLResize = useCallback(
    (dx: number, dy: number) => {
      const dxPct = (dx / pageWidth) * 100;
      const dyPct = (dy / pageHeight) * 100;
      onPositionChange(Math.max(0, x + dxPct), Math.max(0, y + dyPct));
      onSizeChange(Math.max(8, width - dxPct), Math.max(4, height - dyPct));
    },
    [x, y, width, height, pageWidth, pageHeight, onPositionChange, onSizeChange],
  );

  const commitTRResize = useCallback(
    (dx: number, dy: number) => {
      const dyPct = (dy / pageHeight) * 100;
      onPositionChange(x, Math.max(0, y + dyPct));
      onSizeChange(Math.max(8, width + (dx / pageWidth) * 100), Math.max(4, height - dyPct));
    },
    [x, y, width, height, pageWidth, pageHeight, onPositionChange, onSizeChange],
  );

  const commitBLResize = useCallback(
    (dx: number, dy: number) => {
      const dxPct = (dx / pageWidth) * 100;
      onPositionChange(Math.max(0, x + dxPct), y);
      onSizeChange(Math.max(8, width - dxPct), Math.max(4, height + (dy / pageHeight) * 100));
    },
    [x, y, width, height, pageWidth, pageHeight, onPositionChange, onSizeChange],
  );

  const commitRotation = useCallback(
    (dx: number) => {
      onRotationChange(Math.round((rotation + dx) % 360));
    },
    [rotation, onRotationChange],
  );

  // ═══════════════════════════════════════
  //  Gestures
  // ═══════════════════════════════════════

  // Tap to select
  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(onSelect)();
  });

  // Pan to drag
  const panGesture = Gesture.Pan()
    .enabled(!locked)
    .minDistance(8)
    .onStart(() => {
      runOnJS(onSelect)();
    })
    .onUpdate((e) => {
      dragX.value = e.translationX;
      dragY.value = e.translationY;
    })
    .onEnd((e) => {
      const nx = x + (e.translationX / pageWidth) * 100;
      const ny = y + (e.translationY / pageHeight) * 100;
      dragX.value = 0;
      dragY.value = 0;
      runOnJS(commitPosition)(nx, ny);
    });

  const composedGesture = Gesture.Race(tapGesture, panGesture);

  // ── RESIZE: all 4 corners update shared values in real-time ──

  // Bottom-right: size grows, position stays
  const resizeBRPan = Gesture.Pan()
    .hitSlop({ top: 12, bottom: 12, left: 12, right: 12 })
    .onUpdate((e) => {
      resizeDeltaW.value = e.translationX;
      resizeDeltaH.value = e.translationY;
    })
    .onEnd((e) => {
      resizeDeltaW.value = 0;
      resizeDeltaH.value = 0;
      const nw = width + (e.translationX / pageWidth) * 100;
      const nh = height + (e.translationY / pageHeight) * 100;
      runOnJS(commitSize)(nw, nh);
    });

  // Top-left: position moves + size shrinks (inverse)
  const resizeTLPan = Gesture.Pan()
    .hitSlop({ top: 12, bottom: 12, left: 12, right: 12 })
    .onUpdate((e) => {
      resizePosX.value = e.translationX;
      resizePosY.value = e.translationY;
      resizeDeltaW.value = -e.translationX;
      resizeDeltaH.value = -e.translationY;
    })
    .onEnd((e) => {
      resizePosX.value = 0;
      resizePosY.value = 0;
      resizeDeltaW.value = 0;
      resizeDeltaH.value = 0;
      runOnJS(commitTLResize)(e.translationX, e.translationY);
    });

  // Top-right: Y position moves up + width grows, height shrinks
  const resizeTRPan = Gesture.Pan()
    .hitSlop({ top: 12, bottom: 12, left: 12, right: 12 })
    .onUpdate((e) => {
      resizePosY.value = e.translationY;
      resizeDeltaW.value = e.translationX;
      resizeDeltaH.value = -e.translationY;
    })
    .onEnd((e) => {
      resizePosY.value = 0;
      resizeDeltaW.value = 0;
      resizeDeltaH.value = 0;
      runOnJS(commitTRResize)(e.translationX, e.translationY);
    });

  // Bottom-left: X position moves left + width shrinks, height grows
  const resizeBLPan = Gesture.Pan()
    .hitSlop({ top: 12, bottom: 12, left: 12, right: 12 })
    .onUpdate((e) => {
      resizePosX.value = e.translationX;
      resizeDeltaW.value = -e.translationX;
      resizeDeltaH.value = e.translationY;
    })
    .onEnd((e) => {
      resizePosX.value = 0;
      resizeDeltaW.value = 0;
      resizeDeltaH.value = 0;
      runOnJS(commitBLResize)(e.translationX, e.translationY);
    });

  // ── ROTATION: real-time ──
  const rotationPan = Gesture.Pan()
    .hitSlop({ top: 12, bottom: 12, left: 12, right: 12 })
    .onUpdate((e) => {
      // 1px horizontal drag = 1 degree rotation
      rotDelta.value = e.translationX;
    })
    .onEnd((e) => {
      rotDelta.value = 0;
      runOnJS(commitRotation)(e.translationX);
    });

  // ═══════════════════════════════════════
  //  Animated Styles (real-time feedback)
  // ═══════════════════════════════════════

  // Position: base + drag offset + resize position offset
  const positionStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dragX.value + resizePosX.value },
      { translateY: dragY.value + resizePosY.value },
    ],
  }));

  // Size: base element size + resize deltas
  const sizeStyle = useAnimatedStyle(() => ({
    width: Math.max(24, elemW + resizeDeltaW.value),
    height: Math.max(12, elemH + resizeDeltaH.value),
  }));

  // Rotation: base rotation + live delta
  const baseRot = rotation;
  const contentRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${baseRot + rotDelta.value}deg` }],
  }));

  const borderRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${baseRot + rotDelta.value}deg` }],
  }));

  // ── Render content ──
  const renderContent = () => {
    if (type === 'image' && element.imageUri) {
      return (
        <Image
          source={{ uri: element.imageUri }}
          style={[styles.image, { borderRadius: element.borderRadius || 0 }]}
          resizeMode="cover"
        />
      );
    }
    if (type === 'text') {
      return (
        <View
          style={[
            styles.textWrap,
            element.backgroundColor
              ? { backgroundColor: element.backgroundColor }
              : null,
          ]}
        >
          <Text
            style={[
              {
                fontSize: element.fontSize || 16,
                fontFamily:
                  element.fontFamily && element.fontFamily !== 'System'
                    ? element.fontFamily
                    : undefined,
                fontWeight: element.fontWeight || 'normal',
                fontStyle: element.fontStyle || 'normal',
                textDecorationLine: element.textDecorationLine || 'none',
                textTransform: element.textTransform || 'none',
                textAlign: element.textAlign || 'center',
                color: element.color || '#1B2541',
                lineHeight: element.lineHeight,
                letterSpacing: element.letterSpacing,
              } as any,
            ]}
          >
            {element.text || 'Tapez ici...'}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: `${x}%` as any,
          top: `${y}%` as any,
          zIndex: zIndex + 100,
        },
        positionStyle,
      ]}
      onStartShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
    >
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[sizeStyle, { overflow: 'visible' }]}>
          {/* Visible content (with animated real-time rotation) */}
          <Animated.View
            style={[
              styles.content,
              { opacity: element.opacity ?? 1 },
              contentRotationStyle,
            ]}
          >
            {renderContent()}
          </Animated.View>

          {/* Selection UI */}
          {isSelected && (
            <View style={styles.selectionOverlay} pointerEvents="box-none">
              <Animated.View style={[styles.selectionBorder, borderRotationStyle]} />

              {/* Delete cross button (top-right) */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={onDelete}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <View style={styles.deleteBtnInner}>
                  <Text style={styles.deleteBtnText}>×</Text>
                </View>
              </TouchableOpacity>

              {/* ── Corner resize handles ── */}
              <GestureDetector gesture={resizeTLPan}>
                <Animated.View style={[styles.resizeHandle, { top: -6, left: -6 }]} />
              </GestureDetector>

              <GestureDetector gesture={resizeTRPan}>
                <Animated.View style={[styles.resizeHandle, { top: -6, right: -6 }]} />
              </GestureDetector>

              <GestureDetector gesture={resizeBLPan}>
                <Animated.View style={[styles.resizeHandle, { bottom: -6, left: -6 }]} />
              </GestureDetector>

              <GestureDetector gesture={resizeBRPan}>
                <Animated.View style={[styles.resizeHandle, { bottom: -6, right: -6 }]} />
              </GestureDetector>

              {/* ── Rotation handle (below center) ── */}
              <View style={styles.rotationContainer}>
                <View style={styles.rotationLine} />
                <GestureDetector gesture={rotationPan}>
                  <Animated.View style={styles.rotationHandle}>
                    <Ionicons name="refresh-outline" size={14} color="#fff" />
                  </Animated.View>
                </GestureDetector>
              </View>
            </View>
          )}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: 4,
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'visible',
  },
  selectionBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: SELECTION_COLOR,
    borderRadius: 2,
  },
  resizeHandle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: '#fff',
    borderWidth: 2.5,
    borderColor: SELECTION_COLOR,
    zIndex: 50,
  },
  deleteBtn: {
    position: 'absolute',
    top: -14,
    right: -14,
    zIndex: 999,
  },
  deleteBtnInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: -1,
  },
  rotationContainer: {
    position: 'absolute',
    bottom: -ROTATION_HANDLE_OFFSET - 6,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  rotationLine: {
    width: 1.5,
    height: ROTATION_HANDLE_OFFSET - 12,
    backgroundColor: SELECTION_COLOR,
  },
  rotationHandle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: SELECTION_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
