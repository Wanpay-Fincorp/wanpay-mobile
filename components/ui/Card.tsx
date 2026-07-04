import React from 'react';
import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import { Shadows } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'gradient' | 'outlined';
  gradientColors?: readonly [string, string, ...string[]];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  padding?: string;
  style?: ViewStyle | ViewStyle[];
}

export default function Card({
  children,
  variant = 'default',
  gradientColors,
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 0 },
  padding = 'p-5',
  style,
}: CardProps) {
  const baseStyle = [tw`rounded-2xl ${padding}`, Shadows.md, style];

  if (variant === 'gradient' && gradientColors) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={gradientStart}
        end={gradientEnd}
        style={baseStyle as any}
      >
        {children}
      </LinearGradient>
    );
  }

  if (variant === 'elevated') {
    return (
      <View style={[tw`bg-white rounded-2xl ${padding}`, Shadows.lg, style]}>
        {children}
      </View>
    );
  }

  if (variant === 'outlined') {
    return (
      <View style={[tw`bg-white rounded-2xl ${padding} border border-gray-200`, style]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[tw`bg-white rounded-2xl ${padding} border border-gray-100`, Shadows.sm, style]}>
      {children}
    </View>
  );
}
