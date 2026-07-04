import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from 'twrnc';
import { PRIMARY_COLOR, CHARCOAL, LIGHT_GRAY, VIBRANT_ORANGE, DEEP_PURPLE, SUCCESS_GREEN } from '@/constants/customConstants';
import RefreshableScrollView from '@/components/RefreshableScrollView';

interface BillCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  route: string;
}

const BILL_CATEGORIES: BillCategory[] = [
  { id: '1', name: 'Airtime',      icon: 'call-outline',   iconColor: DEEP_PURPLE,   route: '/bills/airtime' },
  { id: '2', name: 'Data',         icon: 'wifi-outline',   iconColor: PRIMARY_COLOR,  route: '/bills/data' },
  { id: '3', name: 'Electricity',  icon: 'flash-outline',  iconColor: VIBRANT_ORANGE, route: '/bills/electricity' },
  { id: '4', name: 'TV',           icon: 'tv-outline',     iconColor: '#EF4444',      route: '/bills/tv' },
  { id: '5', name: 'Internet',     icon: 'globe-outline',  iconColor: '#06B6D4',      route: '/bills/internet' },
  { id: '6', name: 'Education',    icon: 'school-outline', iconColor: SUCCESS_GREEN,   route: '/bills/education' },
];

const recentBills = [
  { id: '1', name: 'MTN Airtime',  amount: 1000,  date: 'Nov 5, 2024', icon: 'call-outline',  iconColor: DEEP_PURPLE },
  { id: '2', name: 'EKEDC',        amount: 5000,  date: 'Nov 3, 2024', icon: 'flash-outline', iconColor: VIBRANT_ORANGE },
  { id: '3', name: 'DSTV Compact', amount: 10500, date: 'Nov 1, 2024', icon: 'tv-outline',    iconColor: '#EF4444' },
];

export default function BillsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={tw`flex-1 bg-[${LIGHT_GRAY}]`}>
      <StatusBar style="dark" />
      <RefreshableScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-28`}>
        <View style={tw`px-5 pt-16 mb-8`}>
          <Text style={tw`text-[${CHARCOAL}] text-[24px] font-bold tracking-tight`}>Pay bills</Text>
          <Text style={tw`text-gray-400 text-[13px] mt-1`}>Quick and easy bill payments</Text>
        </View>

        <View style={tw`px-5 mb-8`}>
          <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-4`}>Services</Text>
          <View style={tw`flex-row flex-wrap justify-between gap-3`}>
            {BILL_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={tw`w-[48%] bg-white rounded-2xl p-5 items-center`}
                activeOpacity={0.8}
                onPress={() => router.push(cat.route as any)}
              >
                <View style={[tw`w-14 h-14 rounded-2xl items-center justify-center mb-3`, { backgroundColor: `${cat.iconColor}15` }]}>
                  <Ionicons name={cat.icon} size={24} color={cat.iconColor} />
                </View>
                <Text style={tw`text-[${CHARCOAL}] text-[14px] font-semibold text-center`}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={tw`px-5`}>
          <Text style={tw`text-gray-500 text-[12px] font-semibold tracking-wider uppercase mb-4`}>Recent payments</Text>
          {recentBills.length === 0 ? (
            <View style={tw`bg-white rounded-2xl p-10 items-center`}>
              <View style={tw`w-16 h-16 rounded-2xl bg-[${LIGHT_GRAY}] items-center justify-center mb-4`}>
                <Ionicons name="receipt-outline" size={28} color="#D1D5DB" />
              </View>
              <Text style={tw`text-[${CHARCOAL}] text-[15px] font-semibold`}>No recent payments</Text>
              <Text style={tw`text-gray-400 text-[13px] mt-1.5`}>Your bill payments will appear here</Text>
            </View>
          ) : (
            <View style={tw`gap-2.5`}>
              {recentBills.map(bill => (
                <TouchableOpacity
                  key={bill.id}
                  style={tw`bg-white rounded-2xl p-4 flex-row items-center gap-3`}
                  activeOpacity={0.75}
                >
                  <View style={[tw`w-11 h-11 rounded-2xl items-center justify-center`, { backgroundColor: `${bill.iconColor}15` }]}>
                    <Ionicons name={bill.icon as any} size={20} color={bill.iconColor} />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-[${CHARCOAL}] text-[14px] font-semibold`}>{bill.name}</Text>
                    <Text style={tw`text-gray-400 text-[12px] mt-0.5`}>{bill.date}</Text>
                  </View>
                  <Text style={tw`text-[${CHARCOAL}] text-[15px] font-bold`}>₦{bill.amount.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </RefreshableScrollView>
    </SafeAreaView>
  );
}
