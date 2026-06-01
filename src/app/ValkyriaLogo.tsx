import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Polygon, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface ValkyriaLogoProps {
  style?: any;
}

export default function ValkyriaLogo({ style }: ValkyriaLogoProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Background neon soft blur glow a*/}
      <View style={styles.glowBg} />

      {/* Futuristic Cyberpunk Valkyria Winged Logo SVG */}
      <Svg
        viewBox="0 0 100 100"
        style={styles.svg}
      >
        <Defs>
          <LinearGradient id="neonOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#ff7700" />
            <Stop offset="50%" stopColor="#ff5500" />
            <Stop offset="100%" stopColor="#cc2200" />
          </LinearGradient>
        </Defs>

        {/* Central Core-Headdress of Valkyria */}
        <Path
          d="M 50 20 L 53 38 L 50 48 L 47 38 Z"
          fill="url(#neonOrangeGrad)"
        />

        {/* Central Inner V design */}
        <Path
          d="M 50 48 L 42 63 L 50 58 L 58 63 Z"
          fill="none"
          stroke="url(#neonOrangeGrad)"
          strokeWidth="1.5"
        />

        {/* Cyberpunk Outer left wing */}
        <Polygon
          points="43 25, 23 25, 10 38, 30 38, 22 52, 40 42"
          fill="url(#neonOrangeGrad)"
        />

        {/* Cyberpunk Outer right wing */}
        <Polygon
          points="57 25, 77 25, 90 38, 70 38, 78 52, 60 42"
          fill="url(#neonOrangeGrad)"
        />

        {/* Lower V Blade Wing Left */}
        <Path
          d="M 41 45 L 26 55 L 43 51 M 43 51 L 32 68 L 46 56"
          stroke="url(#neonOrangeGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Lower V Blade Wing Right */}
        <Path
          d="M 59 45 L 74 55 L 57 51 M 57 51 L 68 68 L 54 56"
          stroke="url(#neonOrangeGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Glowing HUD circular ring in background */}
        <Circle
          cx="50"
          cy="50"
          r="41"
          stroke="rgba(255, 85, 0, 0.25)"
          strokeWidth="1"
          strokeDasharray="4, 12, 16, 8"
          fill="none"
        />

        {/* Inner HUD split ring */}
        <Circle
          cx="50"
          cy="50"
          r="34"
          stroke="rgba(255, 85, 0, 0.4)"
          strokeWidth="0.75"
          strokeDasharray="40 180"
          fill="none"
        />
      </Svg>

      {/* Cyberpunk brackets elements */}
      <View style={[styles.corner, styles.topPreBorder, styles.leftPreBorder]} />
      <View style={[styles.corner, styles.topPreBorder, styles.rightPreBorder]} />
      <View style={[styles.corner, styles.bottomPreBorder, styles.leftPreBorder]} />
      <View style={[styles.corner, styles.bottomPreBorder, styles.rightPreBorder]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBg: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    backgroundColor: 'rgba(255, 85, 0, 0.15)',
    borderRadius: 999,
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  corner: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderColor: '#ff5500',
    opacity: 0.7,
  },
  topPreBorder: {
    top: 0,
    borderTopWidth: 1.5,
  },
  bottomPreBorder: {
    bottom: 0,
    borderBottomWidth: 1.5,
  },
  leftPreBorder: {
    left: 0,
    borderLeftWidth: 1.5,
  },
  rightPreBorder: {
    right: 0,
    borderRightWidth: 1.5,
  },
});
