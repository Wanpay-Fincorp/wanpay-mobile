import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { LIGHT_GRAY } from '@/constants/customConstants';
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
    tw`bg-[${LIGHT_GRAY}] border ${hasError ? 'border-red-500/70' : 'border-gray-200'} rounded-2xl px-4 justify-center`;

  return (
    <SafeAreaView style={tw`flex-1 pb-8 bg-[${LIGHT_GRAY}]`}>
      <View style={tw`px-3 pt-12 pb-4 border-b border-gray-200`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => router.back()} style={tw`rounded-full bg-white border border-gray-200 w-10 h-10 items-center justify-center mr-4`} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text style={tw`text-xl font-bold text-gray-900`}>Request Limit Increase</Text>
            <Text style={tw`text-xs text-gray-400`}>Submit a request for higher transaction limits</Text>
          </View>
        </View>
      </View>

      <RefreshableScrollView style={tw`flex-1 px-3 pt-6`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-28`}>
        <View style={tw`bg-white border border-gray-200 p-4 rounded-xl mb-6`}>
          <View style={tw`flex-row items-center mb-2`}>
            <Ionicons name="information-circle" size={20} color="#6B7280" />
            <Text style={tw`text-gray-500 font-semibold ml-2`}>Important</Text>
          </View>
          <Text style={tw`text-xs text-gray-400`}>Limit increase requests are subject to review. You may be required to submit additional verification documents. Processing time is typically 24-48 hours.</Text>
        </View>

        <View style={tw`mb-5`}>
          <Text style={tw`text-gray-500 text-[11px] font-semibold tracking-wider uppercase mb-2`}>Desired Daily Limit (₦)</Text>
          <View style={[inputStyle(!!errors.dailyLimit), { height: 52 }]}>
            <TextInput style={tw`text-[14px] text-gray-900`} value={formData.dailyLimit} onChangeText={(text) => { setFormData({ ...formData, dailyLimit: text.replace(/[^0-9]/g, '') }); if (errors.dailyLimit) setErrors({ ...errors, dailyLimit: '' }); }} placeholder="e.g. 10000000" placeholderTextColor="#E5E7EB" keyboardType="number-pad" />
          </View>
          {errors.dailyLimit ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.dailyLimit}</Text> : null}
        </View>

        <View style={tw`mb-5`}>
          <Text style={tw`text-gray-500 text-[11px] font-semibold tracking-wider uppercase mb-2`}>Desired Monthly Limit (₦)</Text>
          <View style={[inputStyle(!!errors.monthlyLimit), { height: 52 }]}>
            <TextInput style={tw`text-[14px] text-gray-900`} value={formData.monthlyLimit} onChangeText={(text) => { setFormData({ ...formData, monthlyLimit: text.replace(/[^0-9]/g, '') }); if (errors.monthlyLimit) setErrors({ ...errors, monthlyLimit: '' }); }} placeholder="e.g. 100000000" placeholderTextColor="#E5E7EB" keyboardType="number-pad" />
          </View>
          {errors.monthlyLimit ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.monthlyLimit}</Text> : null}
        </View>

        <View style={tw`mb-5`}>
          <Text style={tw`text-gray-500 text-[11px] font-semibold tracking-wider uppercase mb-2`}>Desired Single Transaction Limit (₦)</Text>
          <View style={[inputStyle(!!errors.singleLimit), { height: 52 }]}>
            <TextInput style={tw`text-[14px] text-gray-900`} value={formData.singleLimit} onChangeText={(text) => { setFormData({ ...formData, singleLimit: text.replace(/[^0-9]/g, '') }); if (errors.singleLimit) setErrors({ ...errors, singleLimit: '' }); }} placeholder="e.g. 20000000" placeholderTextColor="#E5E7EB" keyboardType="number-pad" />
          </View>
          {errors.singleLimit ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.singleLimit}</Text> : null}
        </View>

        <View style={tw`mb-6`}>
          <Text style={tw`text-gray-500 text-[11px] font-semibold tracking-wider uppercase mb-2`}>Reason for Increase</Text>
          <View style={[tw`bg-[${LIGHT_GRAY}] border ${errors.reason ? 'border-red-500/70' : 'border-gray-200'} rounded-2xl px-4 pt-4`, { minHeight: 120 }]}>
            <TextInput style={tw`text-[14px] text-gray-900`} value={formData.reason} onChangeText={(text) => { setFormData({ ...formData, reason: text }); if (errors.reason) setErrors({ ...errors, reason: '' }); }} placeholder="Please provide a detailed reason for requesting higher limits..." placeholderTextColor="#E5E7EB" multiline textAlignVertical="top" />
          </View>
          {errors.reason ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.reason}</Text> : null}
        </View>

        <TouchableOpacity style={tw`bg-blue-600 h-[52px] rounded-2xl items-center justify-center ${loading ? 'opacity-60' : ''} mb-6`} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white font-bold text-lg`}>Submit Request</Text>}
        </TouchableOpacity>
      </RefreshableScrollView>
    </SafeAreaView>
  );
}
