import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "twrnc";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { AuthTokens } from "@/lib/types";
import Button from "@/components/ui/Button";

const GOLD = "#C9A227";

interface DotProps {
  filled: boolean;
  active: boolean;
  error?: boolean;
}

function PinDot({ filled, active, error }: DotProps) {
  const scaleAnim = useRef(new Animated.Value(filled ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: filled ? 1 : 0,
      damping: 10,
      stiffness: 200,
      useNativeDriver: true,
    }).start();
  }, [filled, scaleAnim]);

  return (
    <Animated.View
      style={{
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: "#F9FAFB",
        borderWidth: 1.5,
        borderColor: error ? "#EF4444" : filled ? GOLD : active ? GOLD : "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
        transform: [{ scale: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }],
      }}
    >
      {filled && (
        <Animated.View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: GOLD,
            transform: [{ scale: scaleAnim }],
          }}
        />
      )}
    </Animated.View>
  );
}

export default function CreatePinScreen() {
  const router = useRouter();
  const { userId, purpose } = useLocalSearchParams<{ userId: string; purpose?: string }>();
  const isReset = purpose === 'forgot_pin';
  const { signIn } = useAuth();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ pin: "", confirmPin: "" });
  const [activeField, setActiveField] = useState<"pin" | "confirm">("pin");

  const pinRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const validatePin = () => {
    const newErrors: { pin: string; confirmPin: string } = { pin: "", confirmPin: "" };
    let isValid = true;
    if (pin.length !== 4) {
      newErrors.pin = "PIN must be exactly 4 digits";
      isValid = false;
    }
    if (confirmPin.length !== 4) {
      newErrors.confirmPin = "Confirm PIN must be 4 digits";
      isValid = false;
    } else if (pin !== confirmPin) {
      newErrors.confirmPin = "PINs do not match";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handlePinChange = (value: string, field: "pin" | "confirm") => {
    const numeric = value.replace(/[^0-9]/g, "").slice(0, 4);
    if (field === "pin") {
      setPin(numeric);
      if (errors.pin) setErrors((prev) => ({ ...prev, pin: "" }));
      if (numeric.length === 4) {
        confirmRef.current?.focus();
        setActiveField("confirm");
      }
    } else {
      setConfirmPin(numeric);
      if (errors.confirmPin) setErrors((prev) => ({ ...prev, confirmPin: "" }));
    }
  };

  const focusField = (field: "pin" | "confirm") => {
    setActiveField(field);
    if (field === "pin") pinRef.current?.focus();
    else confirmRef.current?.focus();
  };

  const handleComplete = async () => {
    if (!validatePin()) return;
    setIsSubmitting(true);
    try {
      if (isReset) {
        await api.post("/auth/reset-pin", { userId, pin }, false);
        Alert.alert("PIN Reset", "Your PIN has been reset successfully. Please log in with your new PIN.", [
          { text: "Go to Login", onPress: () => router.replace("/login") },
        ]);
      } else {
        const tokens = await api.post<AuthTokens>("/auth/create-pin", { pin, userId });
        if (tokens.user) await signIn(tokens.token, tokens.refreshToken, tokens.user);
        Alert.alert("PIN Created", "Your account is now secured.", [
          { text: "Continue", onPress: () => router.replace("/(tabs)") },
        ]);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || (isReset ? "Unable to reset PIN. Please try again." : "Unable to create PIN. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPinInput = (
    label: string,
    field: "pin" | "confirm",
    value: string,
    error: string | undefined,
    show: boolean,
    onToggleShow: () => void,
    ref: React.RefObject<TextInput | null>,
    autoFocus: boolean,
  ) => (
    <View style={tw`mb-6`}>
      <Text style={tw`text-gray-500 text-[11px] font-bold tracking-wider uppercase mb-2.5 ml-1`}>
        {label}
      </Text>
      <Pressable
        onPress={() => focusField(field)}
        style={({ pressed }) => [
          tw`flex-row items-center bg-gray-50 border rounded-2xl px-4 h-[76px]`,
          {
            borderColor: error ? "#EF4444" : activeField === field ? GOLD : "#E5E7EB",
            borderWidth: 1.5,
            opacity: pressed ? 0.95 : 1,
          },
        ]}
      >
        <View style={tw`flex-1 flex-row items-center justify-center gap-3`}>
          {[0, 1, 2, 3].map((i) => (
            <PinDot
              key={i}
              filled={i < value.length}
              active={activeField === field && i === value.length}
              error={!!error}
            />
          ))}
        </View>
        <TextInput
          ref={ref}
          style={tw`absolute w-0 h-0 overflow-hidden`}
          autoFocus={autoFocus}
          autoComplete="off"
          secureTextEntry={!show}
          keyboardType="number-pad"
          maxLength={4}
          value={value}
          onChangeText={(v) => handlePinChange(v, field)}
          onFocus={() => setActiveField(field)}
        />
        <TouchableOpacity onPress={onToggleShow} activeOpacity={0.6} style={tw`ml-3`}>
          <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={22} color="#9CA3AF" />
        </TouchableOpacity>
      </Pressable>
      {error ? (
        <Text style={tw`text-red-500 text-[11px] mt-1.5 ml-1 font-medium`}>{error}</Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={tw`flex-1`}>
        <View style={tw`flex-1 px-6`}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={tw`mt-2 mb-5 w-11 h-11 rounded-xl bg-gray-100 items-center justify-center`}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#4B5563" />
          </TouchableOpacity>

          <View style={tw`flex-row items-center mb-8`}>
            <View style={{ width: 4, height: 40, backgroundColor: GOLD, borderRadius: 2, marginRight: 14 }} />
            <View style={tw`flex-1`}>
              <Text style={tw`text-gray-900 text-[26px] font-bold tracking-tight`}>
                {isReset ? 'Reset your PIN' : 'Create your PIN'}
              </Text>
              <Text style={tw`text-gray-500 text-[13px] mt-1 leading-5`}>
                {isReset ? 'Choose a new PIN to secure your account.' : 'Authorises transactions on your WanPay account.'}
              </Text>
            </View>
          </View>

          <View style={{
            flexDirection: 'row', gap: 10, borderLeftColor: GOLD, backgroundColor: 'rgba(201,162,39,0.08)', borderWidth: 1, borderColor: 'rgba(201,162,39,0.2)', borderLeftWidth: 3, borderRadius: 12, padding: 14, marginBottom: 28,
          }}>
            <Ionicons name="information-circle" size={18} color={GOLD} style={{ marginTop: 1 }} />
            <Text style={tw`text-gray-500 text-[12px] leading-5 flex-1`}>
              Avoid obvious patterns like{' '}
              <Text style={{ color: GOLD, fontWeight: '600' }}>1234</Text> or{' '}
              <Text style={{ color: GOLD, fontWeight: '600' }}>1111</Text>.
              Choose something memorable but unique.
            </Text>
          </View>

          {renderPinInput("Enter PIN", "pin", pin, errors.pin, showPin, () => setShowPin(!showPin), pinRef, true)}

          {renderPinInput("Confirm PIN", "confirm", confirmPin, errors.confirmPin, showConfirmPin, () => setShowConfirmPin(!showConfirmPin), confirmRef, false)}

          <Button
            label="Create PIN"
            onPress={handleComplete}
            disabled={isSubmitting}
            loading={isSubmitting}
            variant="primary"
            size="lg"
            icon="shield-checkmark-outline"
          />

          <View style={tw`mt-6 flex-row items-center justify-center gap-2`}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={tw`text-gray-400 text-[12px]`}>
              Encrypted end-to-end — never stored in plain text
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
