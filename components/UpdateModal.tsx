import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

interface UpdateModalProps {
  visible: boolean;
  updating: boolean;
  error?: string | null;
  onUpdate: () => void;
  onDismiss: () => void;
}

export default function UpdateModal({ visible, updating, error, onUpdate, onDismiss }: UpdateModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={tw`flex-1 bg-black/40 justify-end`}>
        <TouchableOpacity style={tw`flex-1`} activeOpacity={1} onPress={onDismiss} disabled={updating} />
        <View style={tw`bg-white rounded-t-3xl p-6 pb-10`}>
          <View style={tw`w-10 h-1 bg-gray-300 rounded-full self-center mb-6`} />
          <View style={tw`w-16 h-16 rounded-2xl bg-blue-100 items-center justify-center self-center mb-4`}>
            <Ionicons name="cloud-download-outline" size={30} color="#2563EB" />
          </View>
          <Text style={tw`text-gray-900 text-lg font-bold text-center`}>A new version is available</Text>
          <Text style={tw`text-gray-500 text-[13px] mt-1.5 text-center leading-5`}>
            Update WanPay now to get the latest features, improvements and security fixes.
          </Text>

          {error ? (
            <Text style={tw`text-red-600 text-[12px] mt-3 text-center`}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={tw`bg-blue-600 rounded-xl py-4 mt-6 items-center ${updating ? 'opacity-60' : ''}`}
            activeOpacity={0.85}
            onPress={onUpdate}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={tw`text-white font-semibold text-base`}>Update now</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={tw`mt-3 py-3 items-center`} activeOpacity={0.7} onPress={onDismiss} disabled={updating}>
            <Text style={tw`text-gray-500 text-[14px]`}>Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}