import React from 'react';
import { Image, ImageStyle, StyleProp, View, ViewStyle, StyleSheet } from 'react-native';

// Shared absolute-fill style for overlays
const overlay: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

interface FilteredImageProps {
  uri: string;
  brightness?: number;   // -100 to 100
  contrast?: number;     // -100 to 100
  saturation?: number;   // -100 to 100
  warmth?: number;       // -100 to 100
  sharpness?: number;    // 0 to 100
  vignette?: number;     // 0 to 100
  imageStyle?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

/**
 * Pure-JS filtered image using stacked overlays.
 * Works in Expo Go — no native modules needed.
 *
 * Technique:
 * - Brightness: white overlay (bright) / black overlay (dark) with
 *   exponential opacity for more visible effect
 * - Contrast: gray overlay to flatten, or sharpen via brightness+saturation boost
 * - Saturation: render a second desaturated image on top (grayscale via tintColor)
 *   blended with opacity
 * - Warmth: orange tint (warm) / blue tint (cool)
 * - Sharpness: subtle contrast increase (visual hint)
 * - Vignette: inset shadow via multiple border layers
 */
export default function FilteredImage({
  uri,
  brightness = 0,
  contrast = 0,
  saturation = 0,
  warmth = 0,
  sharpness = 0,
  vignette = 0,
  imageStyle,
  containerStyle,
  resizeMode = 'cover',
}: FilteredImageProps) {
  const hasAny =
    brightness !== 0 ||
    contrast !== 0 ||
    saturation !== 0 ||
    warmth !== 0 ||
    sharpness > 0 ||
    vignette > 0;

  // ── Brightness overlay ──────────────────────────────────
  // Exponential curve so small values still show visible change
  const brightnessOverlays: React.ReactNode[] = [];
  if (brightness > 0) {
    // White overlay, stronger curve: opacity 0→0.65
    const t = brightness / 100;
    const opacity = t * t * 0.4 + t * 0.25; // quadratic + linear
    brightnessOverlays.push(
      <View
        key="bright"
        style={[overlay, { backgroundColor: `rgba(255,255,255,${opacity.toFixed(3)})` }]}
        pointerEvents="none"
      />,
    );
  } else if (brightness < 0) {
    const t = Math.abs(brightness) / 100;
    const opacity = t * t * 0.45 + t * 0.25;
    brightnessOverlays.push(
      <View
        key="dark"
        style={[overlay, { backgroundColor: `rgba(0,0,0,${opacity.toFixed(3)})` }]}
        pointerEvents="none"
      />,
    );
  }

  // ── Contrast overlay ────────────────────────────────────
  // Negative contrast: gray overlay washes out the image
  // Positive contrast: darken midtones + boost brightness slightly
  const contrastOverlays: React.ReactNode[] = [];
  if (contrast < 0) {
    const t = Math.abs(contrast) / 100;
    const opacity = t * t * 0.35 + t * 0.2;
    contrastOverlays.push(
      <View
        key="contrast-low"
        style={[overlay, { backgroundColor: `rgba(128,128,128,${opacity.toFixed(3)})` }]}
        pointerEvents="none"
      />,
    );
  } else if (contrast > 0) {
    // Simulate higher contrast: darken shadows + brighten highlights
    const t = contrast / 100;
    // Dark layer for shadows
    contrastOverlays.push(
      <View
        key="contrast-dark"
        style={[overlay, { backgroundColor: `rgba(0,0,0,${(t * 0.15).toFixed(3)})` }]}
        pointerEvents="none"
      />,
    );
    // Bright center glow
    contrastOverlays.push(
      <View
        key="contrast-bright"
        style={[
          overlay,
          {
            backgroundColor: `rgba(255,255,255,${(t * 0.08).toFixed(3)})`,
            // Smaller area = center highlight
            top: '15%',
            left: '15%',
            right: '15%',
            bottom: '15%',
            borderRadius: 999,
          },
        ]}
        pointerEvents="none"
      />,
    );
  }

  // ── Saturation ──────────────────────────────────────────
  // Desaturation: reduce image opacity + place gray bg behind
  // Over-saturation: warm tint to simulate vivid colors
  let imageOpacity = 1;
  const saturationOverlays: React.ReactNode[] = [];

  if (saturation < 0) {
    // Desaturate by blending toward gray
    const t = Math.abs(saturation) / 100; // 0→1
    // Reduce color vibrancy by lowering image opacity over a mid-gray bg
    imageOpacity = 1 - t * 0.7; // at -100 → 0.3 opacity
    saturationOverlays.push(
      <View
        key="desat-bg"
        style={[
          overlay,
          {
            backgroundColor: `rgba(140,140,140,${(t * 0.55).toFixed(3)})`,
            zIndex: -1,
          },
        ]}
        pointerEvents="none"
      />,
    );
  } else if (saturation > 0) {
    // Boost saturation: add a subtle warm tint to make colors pop
    const t = saturation / 100;
    // Layer 1: slight color boost via semi-transparent color overlay
    saturationOverlays.push(
      <View
        key="sat-boost"
        style={[
          overlay,
          {
            backgroundColor: `rgba(255,100,50,${(t * 0.08).toFixed(3)})`,
          },
        ]}
        pointerEvents="none"
      />,
    );
  }

  // ── Warmth overlay ──────────────────────────────────────
  const warmthOverlays: React.ReactNode[] = [];
  if (warmth > 0) {
    // Warm: orange/amber tint
    const t = warmth / 100;
    const opacity = t * t * 0.18 + t * 0.12;
    warmthOverlays.push(
      <View
        key="warm"
        style={[overlay, { backgroundColor: `rgba(255,140,30,${opacity.toFixed(3)})` }]}
        pointerEvents="none"
      />,
    );
  } else if (warmth < 0) {
    // Cool: blue tint
    const t = Math.abs(warmth) / 100;
    const opacity = t * t * 0.18 + t * 0.12;
    warmthOverlays.push(
      <View
        key="cool"
        style={[overlay, { backgroundColor: `rgba(30,100,255,${opacity.toFixed(3)})` }]}
        pointerEvents="none"
      />,
    );
  }

  // ── Sharpness ───────────────────────────────────────────
  // Simulate with a very subtle dark edge overlay
  const sharpnessOverlays: React.ReactNode[] = [];
  if (sharpness > 0) {
    const t = sharpness / 100;
    // Slight contrast boost simulation
    sharpnessOverlays.push(
      <View
        key="sharp"
        style={[overlay, { backgroundColor: `rgba(0,0,0,${(t * 0.06).toFixed(3)})` }]}
        pointerEvents="none"
      />,
    );
  }

  // ── Vignette ────────────────────────────────────────────
  // Multiple inset shadow layers for smooth radial darkening
  const vignetteOverlays: React.ReactNode[] = [];
  if (vignette > 0) {
    const t = vignette / 100;
    // Outer ring
    vignetteOverlays.push(
      <View
        key="vig-outer"
        style={[
          overlay,
          {
            borderWidth: Math.max(3, t * 25),
            borderColor: `rgba(0,0,0,${(t * 0.6).toFixed(3)})`,
            borderRadius: 999,
          },
        ]}
        pointerEvents="none"
      />,
    );
    // Inner softer ring
    if (t > 0.3) {
      vignetteOverlays.push(
        <View
          key="vig-inner"
          style={[
            overlay,
            {
              borderWidth: Math.max(2, t * 12),
              borderColor: `rgba(0,0,0,${(t * 0.25).toFixed(3)})`,
              borderRadius: 999,
              top: 4,
              left: 4,
              right: 4,
              bottom: 4,
            },
          ]}
          pointerEvents="none"
        />,
      );
    }
  }

  if (!hasAny) {
    return (
      <View style={containerStyle}>
        <Image source={{ uri }} style={imageStyle} resizeMode={resizeMode} />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {/* Gray background for desaturation blending */}
      {saturation < 0 && saturationOverlays}
      <Image
        source={{ uri }}
        style={[imageStyle, imageOpacity < 1 ? { opacity: imageOpacity } : undefined]}
        resizeMode={resizeMode}
      />
      {brightnessOverlays}
      {contrastOverlays}
      {saturation > 0 && saturationOverlays}
      {warmthOverlays}
      {sharpnessOverlays}
      {vignetteOverlays}
    </View>
  );
}
