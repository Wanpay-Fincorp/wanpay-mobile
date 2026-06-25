import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { DARK_BG } from '@/constants/customConstants';
import { api } from '@/lib/api';
import RefreshableScrollView from '@/components/RefreshableScrollView';

export default function IncreaseLimitsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    dailyLimit: '',
    monthlyLimit: '',
    singleLimit: '',
    reason: '',
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.dailyLimit.trim()) newErrors.dailyLimit = 'Please enter desired daily limit';
    if (!formData.monthlyLimit.trim()) newErrors.monthlyLimit = 'Please enter desired monthly limit';
    if (!formData.singleLimit.trim()) newErrors.singleLimit = 'Please enter desired single transaction limit';
    if (!formData.reason.trim()) newErrors.reason = 'Please provide a reason for increase';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await api.post('/users/limits/request', {
        dailyLimit: parseInt(formData.dailyLimit) * 100,
        monthlyLimit: parseInt(formData.monthlyLimit) * 100,
        singleLimit: parseInt(formData.singleLimit) * 100,
        reason: formData.reason,
      });
      Alert.alert('Request Submitted', 'Your limit increase request has been submitted successfully. We will review and get back to you within 24-48 hours.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError: boolean) =>
    tw`bg-white/5 border ${hasError ? 'border-red-500/70' : 'border-white/10'} rounded-2xl px-4 justify-center`;

  return (
    <SafeAreaView style={tw`flex-1 bg-[${DARK_BG}]`}>
      <View style={tw`px-3 py-4 border-b border-white/7`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => router.back()} style={tw`mr-4`} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
          <View>
            <Text style={tw`text-xl font-bold text-white`}>Request Limit Increase</Text>
            <Text style={tw`text-xs text-white/40`}>Submit a request for higher transaction limits</Text>
          </View>
        </View>
      </View>

      <RefreshableScrollView style={tw`flex-1 px-3 pt-6`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-8`}>
        <View style={tw`bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-6`}>
          <View style={tw`flex-row items-center mb-2`}>
            <Ionicons name="information-circle" size={20} color="#60a5fa" />
            <Text style={tw`text-blue-300 font-semibold ml-2`}>Important</Text>
          </View>
          <Text style={tw`text-xs text-white/40`}>Limit increase requests are subject to review. You may be required to submit additional verification documents. Processing time is typically 24-48 hours.</Text>
        </View>

        <View style={tw`mb-5`}>
          <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Desired Daily Limit (₦)</Text>
          <View style={[inputStyle(!!errors.dailyLimit), { height: 52 }]}>
            <TextInput style={tw`text-[14px] text-white`} value={formData.dailyLimit} onChangeText={(text) => { setFormData({ ...formData, dailyLimit: text.replace(/[^0-9]/g, '') }); if (errors.dailyLimit) setErrors({ ...errors, dailyLimit: '' }); }} placeholder="e.g. 10000000" placeholderTextColor="rgba(255,255,255,0.2)" keyboardType="number-pad" />
          </View>
          {errors.dailyLimit ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.dailyLimit}</Text> : null}
        </View>

        <View style={tw`mb-5`}>
          <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Desired Monthly Limit (₦)</Text>
          <View style={[inputStyle(!!errors.monthlyLimit), { height: 52 }]}>
            <TextInput style={tw`text-[14px] text-white`} value={formData.monthlyLimit} onChangeText={(text) => { setFormData({ ...formData, monthlyLimit: text.replace(/[^0-9]/g, '') }); if (errors.monthlyLimit) setErrors({ ...errors, monthlyLimit: '' }); }} placeholder="e.g. 100000000" placeholderTextColor="rgba(255,255,255,0.2)" keyboardType="number-pad" />
          </View>
          {errors.monthlyLimit ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.monthlyLimit}</Text> : null}
        </View>

        <View style={tw`mb-5`}>
          <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Desired Single Transaction Limit (₦)</Text>
          <View style={[inputStyle(!!errors.singleLimit), { height: 52 }]}>
            <TextInput style={tw`text-[14px] text-white`} value={formData.singleLimit} onChangeText={(text) => { setFormData({ ...formData, singleLimit: text.replace(/[^0-9]/g, '') }); if (errors.singleLimit) setErrors({ ...errors, singleLimit: '' }); }} placeholder="e.g. 20000000" placeholderTextColor="rgba(255,255,255,0.2)" keyboardType="number-pad" />
          </View>
          {errors.singleLimit ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.singleLimit}</Text> : null}
        </View>

        <View style={tw`mb-6`}>
          <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Reason for Increase</Text>
          <View style={[tw`bg-white/5 border ${errors.reason ? 'border-red-500/70' : 'border-white/10'} rounded-2xl px-4 pt-4`, { minHeight: 120 }]}>
            <TextInput style={tw`text-[14px] text-white`} value={formData.reason} onChangeText={(text) => { setFormData({ ...formData, reason: text }); if (errors.reason) setErrors({ ...errors, reason: '' }); }} placeholder="Please provide a detailed reason for requesting higher limits..." placeholderTextColor="rgba(255,255,255,0.2)" multiline textAlignVertical="top" />
          </View>
          {errors.reason ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.reason}</Text> : null}
        </View>

        <TouchableOpacity style={tw`bg-blue-600 py-4 rounded-xl ${loading ? 'opacity-60' : ''} mb-6`} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white text-center font-bold text-lg`}>Submit Request</Text>}
        </TouchableOpacity>
      </RefreshableScrollView>
    </SafeAreaView>
  );
}
