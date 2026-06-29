import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from 'twrnc';
import { DARK_BG } from '@/constants/customConstants';
import RefreshableScrollView from '@/components/RefreshableScrollView';

interface BillCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  route: string;
}

export default function BillsScreen() {
  const router = useRouter();

  const billCategories: BillCategory[] = [
    { id: '1', name: 'Airtime',         icon: 'call-outline',      iconColor: '#a78bfa', bgColor: 'bg-violet-500/15', route: '/bills/airtime' },
    { id: '2', name: 'Data',            icon: 'wifi-outline',      iconColor: '#60a5fa', bgColor: 'bg-blue-500/15',   route: '/bills/data' },
    { id: '3', name: 'Electricity',     icon: 'flash-outline',     iconColor: '#fbbf24', bgColor: 'bg-amber-500/15', route: '/bills/electricity' },
    { id: '4', name: 'TV Subscription', icon: 'tv-outline',        iconColor: '#f87171', bgColor: 'bg-red-500/15',   route: '/bills/tv' },
    { id: '6', name: 'Internet',        icon: 'globe-outline',     iconColor: '#22d3ee', bgColor: 'bg-cyan-500/15',  route: '/bills/internet' },
    { id: '5', name: 'More',       icon: 'ellipsis-vertical',    iconColor: '#34d399', bgColor: 'bg-emerald-500/15', route: '/bills/education' },
  ];

  const recentBills = [
    { id: '1', name: 'MTN Airtime',   amount: 1000,  date: 'Nov 5, 2024',  icon: 'call-outline',  iconColor: '#a78bfa', bgColor: 'bg-violet-500/10' },
    { id: '2', name: 'EKEDC',         amount: 5000,  date: 'Nov 3, 2024',  icon: 'flash-outline', iconColor: '#fbbf24', bgColor: 'bg-amber-500/10' },
    { id: '3', name: 'DSTV Compact',  amount: 10500, date: 'Nov 1, 2024',  icon: 'tv-outline',    iconColor: '#f87171', bgColor: 'bg-red-500/10' },
  ];

  return (
    <SafeAreaView style={tw`flex-1 pt-4 pb-8 bg-[${DARK_BG}]`}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={tw`px-5 pt-8 pb-5 border-b border-gray-200`}>
        <Text style={tw`text-gray-900 text-[22px] font-bold tracking-tight`}>Pay bills</Text>
        <Text style={tw`text-gray-400 text-[12px] mt-1`}>Quick and easy payments</Text>
      </View>

      <RefreshableScrollView style={tw`flex-1 px-5`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pt-6 pb-24`}>

        {/* Categories */}
        <Text style={tw`text-gray-900 text-[14px] font-semibold tracking-tight mb-4`}>Services</Text>
        <View style={tw`flex-row flex-wrap justify-between mb-6`}>
          {billCategories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={tw`w-[48%] bg-gray-50 border border-gray-200 rounded-2xl p-4 items-center mb-3`}
              activeOpacity={0.75}
              onPress={() => router.push(cat.route as any)}
            >
              <View style={tw`w-14 h-14 rounded-2xl items-center justify-center mb-3 ${cat.bgColor} border border-gray-200`}>
                <Ionicons name={cat.icon} size={24} color={cat.iconColor} />
              </View>
              <Text style={tw`text-gray-900 text-[13px] font-semibold text-center`}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent bills */}
        <Text style={tw`text-gray-900 text-[14px] font-semibold tracking-tight mb-4`}>Recent bills</Text>
        {recentBills.map(bill => (
          <TouchableOpacity
            key={bill.id}
            style={tw`bg-gray-50 border border-gray-200 rounded-2xl p-3.5 mb-2.5 flex-row justify-between items-center`}
            activeOpacity={0.75}
          >
            <View style={tw`flex-row items-center gap-3`}>
              <View style={tw`w-[42px] h-[42px] rounded-[14px] items-center justify-center ${bill.bgColor}`}>
                <Ionicons name={bill.icon as any} size={18} color={bill.iconColor} />
              </View>
              <View>
                <Text style={tw`text-gray-900 text-[13px] font-semibold mb-0.5`}>{bill.name}</Text>
                <Text style={tw`text-gray-300 text-[11px]`}>{bill.date}</Text>
              </View>
            </View>
            <Text style={tw`text-gray-800 text-[13px] font-bold`}>₦{bill.amount.toLocaleString()}</Text>
          </TouchableOpacity>
        ))}

      </RefreshableScrollView>
    </SafeAreaView>
  );
}
