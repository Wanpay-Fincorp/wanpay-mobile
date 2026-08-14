import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from 'twrnc';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { LIGHT_GRAY } from '@/constants/customConstants';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [pin, setPin] = useState('');
  const [reason, setReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleDelete = () => {
    if (pin.length !== 4) {
      Alert.alert('Error', 'Enter your 4-digit PIN to continue.');
      return;
    }

    Alert.alert(
      'Delete Account',
      'This will permanently deactivate your account and you will lose access to all WanPay services. This action cannot be undone.\n\nAre you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete my account', style: 'destructive', onPress: async () => {
            setDeleting(true);
            try {
              await api.delete('/users/me', {
                currentPin: pin,
                reason: reason || undefined,
              });
              await signOut();
              Alert.alert('Account Deleted', 'Your account has been deleted. We are sorry to see you go.');
              router.replace('/welcome');
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete account. Please try again.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 pb-8 bg-[${LIGHT_GRAY}]`}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <View style={tw`px-3 pt-12 pb-4`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity onPress={() => router.back()} style={tw`rounded-full bg-white border border-gray-200 w-10 h-10 items-center justify-center mr-4`} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={22} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text style={tw`text-xl font-bold text-gray-900`}>Delete Account</Text>
              <Text style={tw`text-xs text-gray-500`}>Permanently delete your account</Text>
            </View>
          </View>
        </View>

        <View style={tw`flex-1 px-4 pb-28`}>
          <View style={tw`bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex-row items-start gap-3`}>
            <Ionicons name="warning-outline" size={22} color="#EF4444" style={tw`mt-0.5`} />
            <View style={tw`flex-1`}>
              <Text style={tw`text-red-700 font-bold text-[15px] mb-1`}>Read before you continue</Text>
              <Text style={tw`text-red-600 text-[13px] leading-5`}>
                Deleting your account permanently disables access to your wallet, savings, and all WanPay services. Transaction history is retained for regulatory purposes.
              </Text>
            </View>
          </View>

          <View style={tw`bg-white border border-gray-200 rounded-2xl p-5 mb-6`}>
            <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Confirm with your transaction PIN</Text>
            <View style={tw`bg-[${LIGHT_GRAY}] border border-gray-200 rounded-2xl px-4 h-[52px] flex-row items-center`}>
              <TextInput
                style={tw`flex-1 text-[14px] text-gray-900`}
                value={pin}
                onChangeText={(text) => setPin(text.replace(/[^0-9]/g, '').slice(0, 4))}
                placeholder="Enter your PIN"
                placeholderTextColor="#E5E7EB"
                keyboardType="number-pad"
                secureTextEntry={!showPin}
                maxLength={4}
              />
              <TouchableOpacity onPress={() => setShowPin(!showPin)}>
                <Ionicons name={showPin ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={tw`bg-white border border-gray-200 rounded-2xl p-5 mb-8`}>
            <Text style={tw`text-gray-600 text-[12px] font-semibold tracking-wide mb-2`}>Reason (optional)</Text>
            <TextInput
              style={tw`text-[14px] text-gray-900 h-20`}
              value={reason}
              onChangeText={setReason}
              placeholder="Tell us why you're leaving"
              placeholderTextColor="#E5E7EB"
              multiline
              maxLength={500}
            />
          </View>

          <TouchableOpacity
            style={tw`bg-red-600 rounded-xl py-4 items-center ${deleting ? 'opacity-60' : ''}`}
            activeOpacity={0.85}
            onPress={handleDelete}
            disabled={deleting}
          >
            <Text style={tw`text-white font-semibold text-base`}>{deleting ? 'Deleting...' : 'Delete my account'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}