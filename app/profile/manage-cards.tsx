import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import tw from 'twrnc';
import { LIGHT_GRAY } from '@/constants/customConstants';
import { api } from '@/lib/api';
import type { Card } from '@/lib/types';
import RefreshableScrollView from '@/components/RefreshableScrollView';

export default function ManageCardsScreen() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCards();
    setRefreshing(false);
  };

  const loadCards = async () => {
    setLoading(true);
    try {
      const data = await api.get<Card[]>('/cards');
      setCards(data || []);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDefault = async (cardId: string) => {
    try {
      await api.put(`/cards/${cardId}/default`, {});
      await loadCards();
      Alert.alert('Success', 'Default card updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update default card.');
    }
  };

  const handleBlockCard = async (cardId: string) => {
    Alert.alert('Block Card', 'Are you sure you want to block this card? This action can be reversed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block', style: 'destructive', onPress: async () => {
          try {
            await api.put(`/cards/${cardId}/block`, {});
            await loadCards();
            Alert.alert('Success', 'Card has been blocked.');
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to block card.');
          }
        },
      },
    ]);
  };

  const handleAddCard = async () => {
    try {
      const res = await api.post<{ authorizationUrl: string }>('/cards', {});
      if (res?.authorizationUrl) {
        await WebBrowser.openBrowserAsync(res.authorizationUrl);
        await loadCards();
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to initiate card addition.');
    }
  };

  const getCardTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'visa': return 'card';
      case 'mastercard': return 'card';
      default: return 'card-outline';
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 pb-8 bg-[${LIGHT_GRAY}]`}>
      <View style={tw`px-3 pt-12 pb-4 border-b border-gray-200`}>
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity onPress={() => router.back()} style={tw`rounded-full bg-white border border-gray-200 w-10 h-10 items-center justify-center mr-4`} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={22} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text style={tw`text-xl font-bold text-gray-900`}>Manage Cards</Text>
              <Text style={tw`text-xs text-gray-500`}>View and manage your cards</Text>
            </View>
          </View>
          <TouchableOpacity style={tw`bg-blue-600 w-9 h-9 rounded-full items-center justify-center`} onPress={handleAddCard} activeOpacity={0.7}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <RefreshableScrollView style={tw`flex-1 px-3 pt-6`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-28`} refreshing={refreshing} onRefresh={onRefresh}>
        {loading ? (
          <View style={tw`items-center py-10`}>
            <ActivityIndicator color="#D1D5DB" />
          </View>
        ) : cards.length === 0 ? (
          <View style={tw`items-center py-10`}>
            <Ionicons name="card-outline" size={64} color="#D1D5DB" />
            <Text style={tw`text-gray-700 text-lg mt-4`}>No cards found</Text>
            <Text style={tw`text-gray-500 text-sm mt-2`}>Add a card to get started</Text>
            <TouchableOpacity style={tw`bg-blue-600 px-6 py-3 rounded-xl mt-6`} onPress={handleAddCard} activeOpacity={0.8}>
              <Text style={tw`text-white font-bold`}>Add Card</Text>
            </TouchableOpacity>
          </View>
        ) : (
          cards.map((card, index) => (
            <View key={card.id || index} style={tw`bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden`}>
              <View style={tw`bg-blue-600 p-5`}>
                <View style={tw`flex-row justify-between items-start mb-6`}>
                  <Ionicons name={getCardTypeIcon(card.type) as any} size={36} color="rgba(255,255,255,0.8)" />
                  <View style={tw`${card.isDefault ? 'bg-emerald-500/30 border border-emerald-400/40' : 'bg-white/15'} px-3 py-1 rounded-full`}>
                    <Text style={tw`text-white text-xs font-semibold`}>{card.isDefault ? 'Default' : 'Secondary'}</Text>
                  </View>
                </View>
                <Text style={tw`text-white text-xl tracking-widest mb-4`}>{card.last4 ? `**** **** **** ${card.last4}` : '**** **** **** 0000'}</Text>
                <View style={tw`flex-row justify-between`}>
                  <Text style={tw`text-white/70 text-xs uppercase`}>{card.holderName || 'Card Holder'}</Text>
                  <View style={tw`items-end`}>
                    <Text style={tw`text-white/70 text-xs uppercase mb-1`}>Expires</Text>
                    <Text style={tw`text-white text-sm`}>{card.expiryDate || '**/**'}</Text>
                  </View>
                </View>
              </View>
              <View style={tw`px-5 py-4`}>
                <View style={tw`flex-row items-center justify-between mb-1`}>
                  <Text style={tw`text-gray-500 text-xs`}>Status</Text>
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`${card.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'} w-2 h-2 rounded-full mr-2`} />
                    <Text style={tw`${card.status === 'ACTIVE' ? 'text-emerald-600' : 'text-red-500'} text-sm capitalize`}>{card.status === 'ACTIVE' ? 'active' : card.status === 'BLOCKED' ? 'blocked' : 'expired'}</Text>
                  </View>
                </View>
                <View style={tw`border-t border-gray-200 my-4`}>
                  <View style={tw`flex-row justify-between mt-4`}>
                    <TouchableOpacity style={tw`flex-row items-center`} onPress={() => handleToggleDefault(card.id)} activeOpacity={0.7}>
                      <Ionicons name={card.isDefault ? 'star' : 'star-outline'} size={18} color={card.isDefault ? '#f59e0b' : '#9CA3AF'} />
                      <Text style={tw`text-gray-600 text-sm ml-2`}>{card.isDefault ? 'Default' : 'Set as Default'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={tw`flex-row items-center`} onPress={() => handleBlockCard(card.id)} activeOpacity={0.7}>
                      <Ionicons name="lock-closed-outline" size={18} color="#ef4444" />
                      <Text style={tw`text-red-500 text-sm ml-2`}>{card.status === 'BLOCKED' ? 'Blocked' : 'Block'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </RefreshableScrollView>
    </SafeAreaView>
  );
}
