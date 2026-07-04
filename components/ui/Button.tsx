import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle | ViewStyle[];
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; border: string; gradient?: readonly [string, string] }> = {
  primary: { bg: '', text: 'text-white', border: '', gradient: ['#2563EB', '#1D4ED8'] as const },
  secondary: { bg: 'bg-gray-50', text: 'text-blue-600', border: 'border border-gray-200' },
  outline: { bg: 'bg-transparent', text: 'text-blue-600', border: 'border-2 border-blue-500' },
  ghost: { bg: 'bg-transparent', text: 'text-blue-600', border: '' },
  danger: { bg: '', text: 'text-white', border: '', gradient: ['#EF4444', '#DC2626'] as const },
};

const SIZE_STYLES: Record<ButtonSize, { height: string; padding: string; textSize: string; iconSize: number }> = {
  sm: { height: 'h-[40px]', padding: 'px-4', textSize: 'text-[13px]', iconSize: 16 },
  md: { height: 'h-[48px]', padding: 'px-5', textSize: 'text-[14px]', iconSize: 18 },
  lg: { height: 'h-[56px]', padding: 'px-6', textSize: 'text-[15px]', iconSize: 20 },
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  style,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const vs = VARIANT_STYLES[variant];
  const ss = SIZE_STYLES[size];
  const hasGradient = !!vs.gradient;
  const isDisabled = disabled || loading;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      damping: 20,
      stiffness: 300,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 200,
    }).start();
  }, [scaleAnim]);

  const container = tw`${ss.height} ${ss.padding} ${fullWidth ? '' : 'self-start'} rounded-xl items-center justify-center flex-row gap-2 ${vs.bg} ${vs.border}`;
  const textStyle = tw`${ss.textSize} font-semibold ${vs.text}`;

  const content = (
    <View style={container}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#fff' : '#2563EB'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={ss.iconSize}
              color={variant === 'primary' || variant === 'danger' ? '#fff' : '#2563EB'}
            />
          )}
          {label ? <Text style={textStyle}>{label}</Text> : null}
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={ss.iconSize}
              color={variant === 'primary' || variant === 'danger' ? '#fff' : '#2563EB'}
            />
          )}
        </>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[fullWidth ? tw`` : tw`self-start`, isDisabled ? tw`opacity-50` : null] as any}
    >
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style as any]}>
        {hasGradient ? (
          <LinearGradient colors={vs.gradient!} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 12 }}>
            {content}
          </LinearGradient>
        ) : (
          content
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}
