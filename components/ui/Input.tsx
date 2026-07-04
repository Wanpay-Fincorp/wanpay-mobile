import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import tw from 'twrnc';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'phone-pad' | 'email-address';
  maxLength?: number;
  secureTextEntry?: boolean;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  leftIcon?: React.ComponentProps<typeof Ionicons>['name'];
  rightIcon?: React.ComponentProps<typeof Ionicons>['name'];
  onRightIconPress?: () => void;
  prefix?: string;
  error?: string;
  hint?: string;
  containerStyle?: any;
  inputStyle?: any;
  onBlur?: () => void;
  onFocus?: () => void;
}

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  placeholderTextColor = '#9CA3AF',
  keyboardType = 'default',
  maxLength,
  secureTextEntry = false,
  multiline = false,
  autoCapitalize = 'none',
  editable = true,
  leftIcon,
  rightIcon,
  onRightIconPress,
  prefix,
  error,
  hint,
  containerStyle,
  inputStyle,
  onBlur,
  onFocus,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, borderAnim]);

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 7, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -7, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [error, shakeAnim]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: error ? ['#EF4444', '#EF4444'] : ['#E5E7EB', '#2563EB'],
  });

  const bgColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F9FAFB', '#FFFFFF'],
  });

  return (
    <Animated.View style={[{ transform: [{ translateX: shakeAnim }] }, containerStyle]}>
      {label ? (
        <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>{label}</Text>
      ) : null}
      <Animated.View
        style={[
          tw`rounded-2xl px-4 flex-row items-center`,
          multiline ? tw`py-3` : tw`h-[52px]`,
          {
            borderWidth: 1.5,
            borderColor: borderColor as any,
            backgroundColor: editable ? bgColor : '#F3F4F6',
          },
        ]}
      >
        {leftIcon ? (
          <Ionicons name={leftIcon} size={18} color="#9CA3AF" style={tw`mr-2.5`} />
        ) : null}
        {prefix ? (
          <Text style={tw`text-gray-500 text-[14px] font-semibold mr-2`}>{prefix}</Text>
        ) : null}
        <TextInput
          style={[
            tw`flex-1 text-[14px] text-gray-900`,
            multiline ? tw`min-h-[80px]` : tw`h-full`,
            { outlineStyle: 'none' },
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          keyboardType={keyboardType}
          maxLength={maxLength}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          editable={editable}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} activeOpacity={0.7} style={tw`ml-2`}>
            <Ionicons name={rightIcon} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </Animated.View>
      {error ? (
        <Text style={tw`text-red-500 text-[11px] mt-1.5 ml-1 font-medium`}>{error}</Text>
      ) : hint ? (
        <Text style={tw`text-gray-400 text-[11px] mt-1.5 ml-1`}>{hint}</Text>
      ) : null}
    </Animated.View>
  );
}
