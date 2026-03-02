import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { Colors, Typography } from '../../theme';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: TextStyle;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  color = Colors.primary,
  style,
}) => {
  return (
    <Text style={[styles.logo, styles[size], { color }, style]}>
      Memoriz.
    </Text>
  );
};

const styles = StyleSheet.create({
  logo: {
    fontWeight: '700',
    fontStyle: 'italic',
  },
  sm: {
    fontSize: 18,
  },
  md: {
    fontSize: 24,
  },
  lg: {
    fontSize: 32,
  },
});
