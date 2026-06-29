import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  SafeAreaView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import tw from 'twrnc';
import { DARK_BG } from '@/constants/customConstants';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/lib/types';
import RefreshableScrollView from '@/components/RefreshableScrollView';

export default function PersonalInformationScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const loadProfile = async () => {
    setFetching(true);
    try {
      const userData = await api.get<User>('/users/me').catch(() => user);
      if (userData) {
        setFormData({
          fullName: userData.fullName || '',
          phoneNumber: userData.phone || '',
          email: user.email || '',
          dateOfBirth: user.dateOfBirth || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          postalCode: user.postalCode || '',
          country: user.country || 'Nigeria',
        });
      }
    } catch {
      // silently fail
    } finally {
      setFetching(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const user = await api.put<User>('/users/me', {
        fullName: formData.fullName,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth || undefined,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
      });
      if (user) await refreshUser();
      setEditing(false);
      Alert.alert('Success', 'Your personal information has been updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const inputStyle = (hasError: boolean) =>
    tw`bg-gray-50 border ${hasError ? 'border-red-500/70' : 'border-gray-200'} rounded-2xl px-4 justify-center`;

  if (fetching) {
    return (
      <SafeAreaView style={tw`flex-1 pb-8 bg-[${DARK_BG}]`}>
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator color="#9CA3AF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 pb-8 bg-[${DARK_BG}]`}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <View style={tw`px-3 pt-12 pb-4 border-b border-gray-200`}>
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center`}>
              <TouchableOpacity onPress={() => router.back()} style={tw`mr-4`} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
              <View>
                <Text style={tw`text-xl font-bold text-gray-900`}>Personal Information</Text>
                <Text style={tw`text-xs text-gray-400`}>Manage your account details</Text>
              </View>
            </View>
            {!editing ? (
              <TouchableOpacity onPress={() => setEditing(true)} style={tw`bg-blue-500/20 px-4 py-2 rounded-full`} activeOpacity={0.7}>
                <Ionicons name="pencil" size={18} color="#60a5fa" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => { setEditing(false); setErrors({}); }} style={tw`px-4 py-2`} activeOpacity={0.7}>
                <Text style={tw`text-blue-600 font-semibold`}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <RefreshableScrollView style={tw`flex-1 px-3 pt-6`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-8`} refreshing={refreshing} onRefresh={onRefresh}>
          <View style={tw`items-center mb-8`}>
            <View style={tw`bg-blue-600 w-24 h-24 rounded-full items-center justify-center mb-4`}>
              <Text style={tw`text-white text-3xl font-semibold`}>
                {formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
              </Text>
            </View>
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Full Name</Text>
            <View style={[inputStyle(!!errors.fullName), { height: 52 }]}>
              <TextInput style={tw`text-[14px] text-gray-900`} value={formData.fullName} onChangeText={(text) => handleChange('fullName', text)} editable={editing} placeholder="Enter your full name" placeholderTextColor="#E5E7EB" />
            </View>
            {errors.fullName ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.fullName}</Text> : null}
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Email Address</Text>
            <View style={[inputStyle(!!errors.email), { height: 52 }]}>
              <TextInput style={tw`text-[14px] text-gray-900`} value={formData.email} onChangeText={(text) => handleChange('email', text)} editable={editing} keyboardType="email-address" autoCapitalize="none" placeholder="Enter your email" placeholderTextColor="#E5E7EB" />
            </View>
            {errors.email ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.email}</Text> : null}
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Phone Number</Text>
            <View style={[inputStyle(!!errors.phoneNumber), { height: 52 }]}>
              <TextInput style={tw`text-[14px] text-gray-900`} value={formData.phoneNumber} editable={false} keyboardType="phone-pad" placeholderTextColor="#E5E7EB" />
            </View>
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Date of Birth</Text>
            <View style={[tw`bg-gray-50 border border-gray-200 rounded-2xl px-4 justify-center`, { height: 52 }]}>
              <TextInput style={tw`text-[14px] text-gray-900`} value={formData.dateOfBirth} onChangeText={(text) => handleChange('dateOfBirth', text)} editable={editing} placeholder="DD/MM/YYYY" placeholderTextColor="#E5E7EB" />
            </View>
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Address</Text>
            <View style={[inputStyle(!!errors.address), { height: 52 }]}>
              <TextInput style={tw`text-[14px] text-gray-900`} value={formData.address} onChangeText={(text) => handleChange('address', text)} editable={editing} placeholder="Enter your address" placeholderTextColor="#E5E7EB" />
            </View>
            {errors.address ? <Text style={tw`text-red-400 text-[11px] mt-1.5 ml-1`}>{errors.address}</Text> : null}
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>City</Text>
            <View style={[tw`bg-gray-50 border border-gray-200 rounded-2xl px-4 justify-center`, { height: 52 }]}>
              <TextInput style={tw`text-[14px] text-gray-900`} value={formData.city} onChangeText={(text) => handleChange('city', text)} editable={editing} placeholder="Enter your city" placeholderTextColor="#E5E7EB" />
            </View>
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>State</Text>
            <View style={[tw`bg-gray-50 border border-gray-200 rounded-2xl px-4 justify-center`, { height: 52 }]}>
              <TextInput style={tw`text-[14px] text-gray-900`} value={formData.state} onChangeText={(text) => handleChange('state', text)} editable={editing} placeholder="Enter your state" placeholderTextColor="#E5E7EB" />
            </View>
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Postal Code</Text>
            <View style={[tw`bg-gray-50 border border-gray-200 rounded-2xl px-4 justify-center`, { height: 52 }]}>
              <TextInput style={tw`text-[14px] text-gray-900`} value={formData.postalCode} onChangeText={(text) => handleChange('postalCode', text)} editable={editing} placeholder="Enter postal code" placeholderTextColor="#E5E7EB" />
            </View>
          </View>

          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Country</Text>
            <View style={[tw`bg-gray-50 border border-gray-200 rounded-2xl px-4 justify-center`, { height: 52 }]}>
              <TextInput style={tw`text-[14px] text-gray-900`} value={formData.country} editable={false} placeholderTextColor="#E5E7EB" />
            </View>
          </View>

          {editing && (
            <TouchableOpacity style={tw`bg-blue-600 py-4 rounded-xl mb-6`} onPress={handleSave} disabled={loading} activeOpacity={0.8}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white text-center font-bold text-lg`}>Save Changes</Text>}
            </TouchableOpacity>
          )}

          <View style={tw`bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl`}>
            <View style={tw`flex-row items-center mb-2`}>
              <Ionicons name="information-circle" size={20} color="#60a5fa" />
              <Text style={tw`text-blue-300 font-semibold ml-2`}>Verification Required</Text>
            </View>
            <Text style={tw`text-xs text-gray-400`}>Some changes may require identity verification. You'll be notified if additional documents are needed.</Text>
          </View>
        </RefreshableScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
