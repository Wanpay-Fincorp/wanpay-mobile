import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { DARK_BG } from '@/constants/customConstants';
import { api } from '@/lib/api';
import RefreshableScrollView from '@/components/RefreshableScrollView';

export default function BvnVerificationScreen() {
  const router = useRouter();
  const [bvn, setBvn] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!/^\d{11}$/.test(bvn)) e.bvn = 'BVN must be exactly 11 digits';
    if (!dateOfBirth.trim()) e.dateOfBirth = 'Date of birth is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleVerify = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await api.post<{ verified: boolean; kycLevel: string }>('/users/verify-bvn', { bvn, dateOfBirth });
      Alert.alert(
        'BVN Verified',
        `Your identity has been verified. Account upgraded to ${result.kycLevel.replace('_', ' ')}.`,
        [{ text: 'Continue', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Unable to verify BVN. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[${DARK_BG}]`}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <View style={tw`px-3 py-4 border-b border-white/7`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity onPress={() => router.back()} style={tw`mr-4`} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.75)" />
            </TouchableOpacity>
            <View>
              <Text style={tw`text-xl font-bold text-white`}>BVN Verification</Text>
              <Text style={tw`text-xs text-white/40`}>Verify your identity to unlock higher limits</Text>
            </View>
          </View>
        </View>

        <RefreshableScrollView style={tw`flex-1 px-3 pt-6`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-8`}>
          <View style={tw`bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl mb-6`}>
            <View style={tw`flex-row items-center mb-2`}>
              <Ionicons name="shield-checkmark" size={20} color="#10b981" />
              <Text style={tw`text-emerald-300 font-semibold ml-2`}>Why verify your BVN?</Text>
            </View>
            <Text style={tw`text-xs text-white/40 mb-1`}>• Upgrade your account from Tier 1 to Tier 2</Text>
            <Text style={tw`text-xs text-white/40 mb-1`}>• Unlock higher transaction limits</Text>
            <Text style={tw`text-xs text-white/40`}>• Comply with CBN KYC requirements</Text>
          </View>

          <View style={tw`bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-6`}>
            <View style={tw`flex-row items-center mb-2`}>
              <Ionicons name="information-circle" size={20} color="#60a5fa" />
              <Text style={tw`text-blue-300 font-semibold ml-2`}>Your data is safe</Text>
            </View>
            <Text style={tw`text-xs text-white/40`}>Your BVN is encrypted and used solely for identity verification as required by the Central Bank of Nigeria.</Text>
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>BVN</Text>
            <View style={[tw`bg-white/5 border ${errors.bvn ? 'border-red-500/70' : 'border-white/10'} rounded-2xl px-4 justify-center`, { height: 52 }]}>
              <TextInput style={tw`text-[14px] text-white tracking-widest`} value={bvn} onChangeText={(t) => { setBvn(t.replace(/[^0-9]/g, '').slice(0, 11)); if (errors.bvn) setErrors({ ...errors, bvn: '' }); }} placeholder="Enter 11-digit BVN" placeholderTextColor="rgba(255,255,255,0.2)" keyboardType="number-pad" maxLength={11} />
            </View>
            {errors.bvn ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.bvn}</Text> : null}
          </View>

          <View style={tw`mb-6`}>
            <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Date of Birth</Text>
            <View style={[tw`bg-white/5 border ${errors.dateOfBirth ? 'border-red-500/70' : 'border-white/10'} rounded-2xl px-4 justify-center`, { height: 52 }]}>
              <TextInput style={tw`text-[14px] text-white`} value={dateOfBirth} onChangeText={(t) => { setDateOfBirth(t); if (errors.dateOfBirth) setErrors({ ...errors, dateOfBirth: '' }); }} placeholder="DD/MM/YYYY" placeholderTextColor="rgba(255,255,255,0.2)" />
            </View>
            {errors.dateOfBirth ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.dateOfBirth}</Text> : null}
          </View>

          <TouchableOpacity style={tw`bg-emerald-600 py-4 rounded-xl ${loading ? 'opacity-60' : ''} mb-6`} onPress={handleVerify} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white text-center font-bold text-lg`}>Verify BVN</Text>}
          </TouchableOpacity>

          <View style={tw`bg-white/4 border border-white/7 rounded-2xl p-5`}>
            <Text style={tw`text-white/45 text-xs font-semibold uppercase mb-3`}>What happens next?</Text>
            <View style={tw`flex-row items-start mb-3`}>
              <View style={tw`w-6 h-6 rounded-full bg-emerald-500/20 items-center justify-center mr-3 mt-0.5`}>
                <Text style={tw`text-emerald-400 text-xs font-bold`}>1</Text>
              </View>
              <Text style={tw`text-white/50 text-sm flex-1`}>Enter your 11-digit BVN and date of birth</Text>
            </View>
            <View style={tw`flex-row items-start mb-3`}>
              <View style={tw`w-6 h-6 rounded-full bg-emerald-500/20 items-center justify-center mr-3 mt-0.5`}>
                <Text style={tw`text-emerald-400 text-xs font-bold`}>2</Text>
              </View>
              <Text style={tw`text-white/50 text-sm flex-1`}>Your identity is verified against the NIBSS database</Text>
            </View>
            <View style={tw`flex-row items-start`}>
              <View style={tw`w-6 h-6 rounded-full bg-emerald-500/20 items-center justify-center mr-3 mt-0.5`}>
                <Text style={tw`text-emerald-400 text-xs font-bold`}>3</Text>
              </View>
              <Text style={tw`text-white/50 text-sm flex-1`}>Your account is upgraded to Tier 2 with higher limits</Text>
            </View>
          </View>
        </RefreshableScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
