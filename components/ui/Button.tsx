import React from "react";
import { ActivityIndicator, GestureResponderEvent, Text, TouchableOpacity, ViewStyle } from "react-native";
import tw from "twrnc";

type ButtonVariant = "primary" | "secondary" | "outline";

interface ButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  style?: ViewStyle | ViewStyle[];
}

const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  accessibilityLabel,
  testID,
  style
}) => {
  const baseBtn = tw`w-full py-4 rounded-xl items-center justify-center`;
  const variantBtn =
    variant === "primary"
      ? tw`bg-blue-600`
      : variant === "secondary"
      ? tw`bg-white`
      : tw`bg-transparent border-2 border-white`;
  const disabledStyle = disabled ? tw`opacity-50` : tw``;

  const baseText = tw`font-bold text-lg`;
  const variantText =
    variant === "primary"
      ? tw`text-white`
      : variant === "secondary"
      ? tw`text-blue-600`
      : tw`text-white`;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      testID={testID}
      activeOpacity={disabled ? 1 : 0.8}
      style={[baseBtn, variantBtn, disabledStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : variant === "secondary" ? "#2563eb" : "#fff"} />
      ) : (
        <Text style={[baseText, variantText]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;