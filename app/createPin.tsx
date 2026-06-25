import { PRIMARY_COLOR, VIBRANT_ORANGE } from "@/constants/customConstants";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

type PinErrors = { pin: string; confirmPin: string };

const GOLD = VIBRANT_ORANGE || "#C9A227";
const ACCENT = PRIMARY_COLOR || "#2563EB";

const DOT_SIZE = 56;
const DOT_GAP = 8;

function PinDots({ value, error }: { value: string; error?: string }) {
  return (
    <View style={[tw`flex-row items-center justify-center`, { gap: DOT_GAP }]}>
      {[0, 1, 2, 3].map((i) => {
        const filled = i < value.length;
        return (
          <View
            key={i}
            style={{
              width: DOT_SIZE,
              height: DOT_SIZE,
              borderRadius: 14,
              backgroundColor: "#1C2333",
              borderWidth: 1.5,
              borderColor: error ? "#EF4444" : filled ? GOLD : "#1E293B",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {filled && (
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: GOLD,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

export default function CreatePinScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { signIn } = useAuth();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<PinErrors>({ pin: "", confirmPin: "" });
  const [activeField, setActiveField] = useState<"pin" | "confirm">("pin");

  const pinRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const validatePin = () => {
    const newErrors: PinErrors = { pin: "", confirmPin: "" };
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
      const tokens = await api.post<AuthTokens>("/auth/create-pin", { pin, userId });
      if (tokens.user) await signIn(tokens.token, tokens.refreshToken, tokens.user);
      Alert.alert("PIN Created", "Your account is now secured.", [
        { text: "Continue", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Unable to create PIN. Please try again.");
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
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: "#64748B",
          letterSpacing: 1.2,
          textTransform: "uppercase",
          marginBottom: 10,
          marginLeft: 2,
        }}
      >
        {label}
      </Text>
      <Pressable
        onPress={() => focusField(field)}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#111827",
          borderWidth: 1.5,
          borderColor: error ? "#EF4444" : activeField === field ? GOLD : "#1E293B",
          borderRadius: 16,
          paddingHorizontal: 16,
          height: 72,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <View style={tw`flex-1 items-center justify-center`}>
          <PinDots value={value} error={error} />
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
          <Ionicons
            name={show ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#64748B"
          />
        </TouchableOpacity>
      </Pressable>
      {error ? (
        <Text
          style={{
            color: "#EF4444",
            fontSize: 11,
            marginTop: 6,
            marginLeft: 4,
            fontWeight: "500",
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#0D1117",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={tw`flex-1`}
      >
        <View style={tw`flex-1 px-6`}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 42,
              height: 42,
              marginTop: 8,
              marginBottom: 20,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              backgroundColor: "#1C2333",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#94A3B8" />
          </TouchableOpacity>

          <View style={tw`flex-row items-center mb-8`}>
            <View
              style={{
                width: 4,
                height: 36,
                backgroundColor: GOLD,
                borderRadius: 2,
                marginRight: 14,
              }}
            />
            <View style={tw`flex-1`}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: "#F1F5F9",
                  letterSpacing: -0.5,
                }}
              >
                Create your PIN
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#64748B",
                  marginTop: 4,
                  lineHeight: 20,
                }}
              >
                Authorises transactions on your WanPay account.
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              backgroundColor: "rgba(201, 162, 39, 0.08)",
              borderWidth: 1,
              borderColor: "rgba(201, 162, 39, 0.2)",
              borderLeftWidth: 3,
              borderLeftColor: GOLD,
              borderRadius: 12,
              padding: 14,
              marginBottom: 28,
              gap: 10,
            }}
          >
            <Ionicons name="information-circle" size={18} color={GOLD} style={{ marginTop: 1 }} />
            <Text style={{ fontSize: 12, color: "#94A3B8", lineHeight: 19, flex: 1 }}>
              Avoid obvious patterns like{" "}
              <Text style={{ color: GOLD, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
                1234
              </Text>{" "}
              or{" "}
              <Text style={{ color: GOLD, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
                1111
              </Text>
              . Choose something memorable but unique.
            </Text>
          </View>

          {renderPinInput("Enter PIN", "pin", pin, errors.pin, showPin, () => setShowPin(!showPin), pinRef, true)}

          {renderPinInput("Confirm PIN", "confirm", confirmPin, errors.confirmPin, showConfirmPin, () => setShowConfirmPin(!showConfirmPin), confirmRef, false)}

          <TouchableOpacity
            style={{
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              backgroundColor: GOLD,
              opacity: isSubmitting ? 0.6 : 1,
              marginTop: 4,
            }}
            onPress={handleComplete}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#0D1117" />
            ) : (
              <Text
                style={{
                  color: "#0D1117",
                  fontWeight: "800",
                  fontSize: 16,
                  letterSpacing: 0.3,
                }}
              >
                Create PIN
              </Text>
            )}
          </TouchableOpacity>

          <View style={tw`mt-6 flex-row items-center justify-center gap-2`}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={{ color: "#475569", fontSize: 11.5 }}>
              Encrypted end-to-end — never stored in plain text
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
