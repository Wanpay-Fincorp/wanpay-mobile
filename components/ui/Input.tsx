import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TextInput, TouchableOpacity, View, ViewStyle } from "react-native";
import tw from "twrnc";

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: string;
  maxLength?: number;
  accessibilityLabel?: string;
  prefix?: string;
  icon?: string;
  secure?: boolean;
  secureShown?: boolean;
  showToggle?: boolean;
  toggleSecure?: () => void;
  helperText?: string;
  errorText?: string;
  errored?: boolean;
  containerStyle?: ViewStyle | ViewStyle[];
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength,
  accessibilityLabel,
  prefix,
  icon,
  secure = false,
  secureShown = false,
  showToggle = false,
  toggleSecure,
  helperText,
  errorText,
  errored = false,
  containerStyle
}) => {
  const showError = !!errorText && errored;
  const help = showError ? errorText : helperText;

  return (
    <View style={containerStyle}>
      <Text style={tw`text-sm font-semibold mb-2 text-gray-700`}>{label}</Text>
      <View style={tw`border border-gray-300 rounded-xl px-4 py-3 mb-1 flex-row items-center`}>
        {icon ? <Ionicons name={icon as any} size={20} color="#666" style={tw`mr-2`} /> : null}
        {prefix ? <Text style={tw`text-gray-600 mr-2`}>{prefix}</Text> : null}
        <TextInput
          style={tw`flex-1`}
          placeholder={placeholder}
          keyboardType={keyboardType as any}
          maxLength={maxLength}
          value={value}
          onChangeText={onChangeText}
          accessibilityLabel={accessibilityLabel || label}
          secureTextEntry={secure && !secureShown}
        />
        {showToggle ? (
          <TouchableOpacity onPress={toggleSecure} accessibilityRole="button" accessibilityLabel={secureShown ? "Hide" : "Show"}>
            <Ionicons name={secureShown ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>
      {help ? (
        <Text style={tw`${showError ? "text-red-600" : "text-gray-500"} text-xs mb-4`}>{help}</Text>
      ) : null}
    </View>
  );
};

export default Input;