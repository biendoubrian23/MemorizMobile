import React, { useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { Colors } from '../../../src/theme';

interface DraggableSliderProps {
  min: number;
  max: number;
  value: number;
  step?: number;
  onValueChange: (value: number) => void;
  fillColor?: string;
  thumbColor?: string;
}

export default function DraggableSlider({
  min,
  max,
  value,
  step = 1,
  onValueChange,
  fillColor = Colors.accent,
  thumbColor = Colors.accent,
}: DraggableSliderProps) {
  const trackRef = useRef<View>(null);
  const trackPageX = useRef(0);
  const trackWidth = useRef(0);
  // Use ref for callback to avoid stale closures in PanResponder
  const onValueChangeRef = useRef(onValueChange);
  onValueChangeRef.current = onValueChange;
  const minRef = useRef(min);
  minRef.current = min;
  const maxRef = useRef(max);
  maxRef.current = max;
  const stepRef = useRef(step);
  stepRef.current = step;

  const clampAndSnap = useCallback((pageX: number) => {
    const x = pageX - trackPageX.current;
    const ratio = Math.max(0, Math.min(1, x / (trackWidth.current || 1)));
    const raw = minRef.current + ratio * (maxRef.current - minRef.current);
    const s = stepRef.current;
    const snapped = s > 0 ? Math.round(raw / s) * s : raw;
    const clamped = Math.max(minRef.current, Math.min(maxRef.current, snapped));
    // Round to avoid floating point glitches
    const rounded = s >= 1 ? Math.round(clamped) : +clamped.toFixed(2);
    onValueChangeRef.current(rounded);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        trackRef.current?.measureInWindow((x, _y, w) => {
          if (x != null) trackPageX.current = x;
          if (w != null && w > 0) trackWidth.current = w;
          clampAndSnap(e.nativeEvent.pageX);
        });
      },
      onPanResponderMove: (e) => {
        clampAndSnap(e.nativeEvent.pageX);
      },
    }),
  ).current;

  const fillPercent = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <View
      ref={trackRef}
      style={styles.track}
      onLayout={(e: LayoutChangeEvent) => {
        trackWidth.current = e.nativeEvent.layout.width;
        trackRef.current?.measureInWindow((x) => {
          if (x != null) trackPageX.current = x;
        });
      }}
      {...panResponder.panHandlers}
    >
      <View style={styles.trackBg} />
      <View style={[styles.trackFill, { width: `${fillPercent}%`, backgroundColor: fillColor }]} />
      <View
        style={[
          styles.thumb,
          { left: `${fillPercent}%`, backgroundColor: thumbColor },
        ]}
      />
    </View>
  );
}

const TRACK_H = 4;
const THUMB_SIZE = 14;

const styles = StyleSheet.create({
  track: {
    flex: 1,
    height: THUMB_SIZE + 8, // hit target
    justifyContent: 'center',
    position: 'relative',
  },
  trackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: (THUMB_SIZE + 8 - TRACK_H) / 2,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    backgroundColor: Colors.borderLight,
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: (THUMB_SIZE + 8 - TRACK_H) / 2,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
  },
  thumb: {
    position: 'absolute',
    top: 4,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    marginLeft: -(THUMB_SIZE / 2),
    borderWidth: 1.5,
    borderColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
