import { CHARCOAL, ELECTRIC_BLUE, LIGHT_GRAY, PRIMARY_COLOR, SUCCESS_GREEN } from '@/constants/customConstants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { api } from '@/lib/api';

export default function OTPScreen() {
  const router = useRouter();
  const { phone, purpose: rawPurpose } = useLocalSearchParams<{ phone: string; purpose?: string }>();
  const purpose = rawPurpose || 'signup';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0 && !canResend) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  const handleOtpChange = (value: string, index: number) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);
    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (index === 5 && numericValue) {
      const complete = [...newOtp];
      complete[index] = numericValue;
      if (complete.every((d) => d !== '')) {
        handleVerify(complete.join(''));
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the complete 6-digit code');
      return;
    }
    setLoading(true);
    try {
      if (!phone) {
        Alert.alert('Error', 'Phone number not found. Please sign up again.');
        router.push('/signup');
        return;
      }
      const result = await api.post<any>('/auth/verify-otp', { phone, otp: code, purpose }, false);
      if (purpose === 'forgot_pin') {
        router.push({ pathname: '/createPin', params: { userId: result.userId, purpose: 'forgot_pin' } });
      } else {
        router.push({ pathname: '/createPin', params: { userId: result.userId } });
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Invalid verification code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResendTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    try {
      if (phone) {
        await api.post('/auth/send-otp', { phone, purpose }, false);
      }
    } catch {
      // silently fail
    }
  };

  const isOtpComplete = otp.every((d) => d !== '');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? 25 : 0 }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 24 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: 16, marginBottom: 24, width: 40, height: 40, borderRadius: 12,
              backgroundColor: LIGHT_GRAY, alignItems: 'center', justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={CHARCOAL} />
          </TouchableOpacity>
          <View style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${PRIMARY_COLOR}15`, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="chatbubble-ellipses" size={22} color={PRIMARY_COLOR} />
              </View>
              <Text style={{ fontSize: 28, fontWeight: '700', color: CHARCOAL, letterSpacing: -0.5 }}>Verify Phone</Text>
            </View>
            <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 22 }}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={{ fontWeight: '700', color: CHARCOAL }}>{phone || '+234 801 234 5678'}</Text>
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            {otp.map((digit, idx) => {
              const isFilled = digit !== '';
              const isActive = !isFilled && otp.slice(0, idx).every((d) => d !== '');
              return (
                <TextInput
                  key={idx}
                  ref={(ref) => { inputRefs.current[idx] = ref; }}
                  style={{
                    width: 48, height: 56, borderRadius: 14,
                    borderWidth: isFilled ? 2 : 1.5,
                    borderColor: isFilled ? PRIMARY_COLOR : isActive ? ELECTRIC_BLUE : '#D1D5DB',
                    backgroundColor: isFilled ? `${PRIMARY_COLOR}10` : LIGHT_GRAY,
                    textAlign: 'center', fontSize: 22, fontWeight: '700', color: CHARCOAL,
                  }}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, idx)}
                  onKeyPress={(e) => handleKeyPress(e, idx)}
                  selectTextOnFocus
                />
              );
            })}
          </View>
          <Text style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 28, paddingLeft: 2 }}>
            Check your SMS inbox — the code expires in 10 minutes.
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>Didn't receive it? </Text>
            <TouchableOpacity onPress={handleResend} disabled={!canResend} activeOpacity={0.7}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: canResend ? PRIMARY_COLOR : '#9CA3AF' }}>
                {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: isOtpComplete && !loading ? PRIMARY_COLOR : `${PRIMARY_COLOR}60`,
              paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
              shadowColor: PRIMARY_COLOR, shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isOtpComplete ? 0.25 : 0, shadowRadius: 12, elevation: isOtpComplete ? 4 : 0,
            }}
            onPress={() => handleVerify()}
            disabled={loading || !isOtpComplete}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16, letterSpacing: 0.2 }}>Verify</Text>
            )}
          </TouchableOpacity>
          <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Ionicons name="shield-checkmark" size={14} color={SUCCESS_GREEN} />
            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>We'll never share your code with anyone</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
