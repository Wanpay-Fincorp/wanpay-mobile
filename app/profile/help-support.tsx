import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { DARK_BG } from '@/constants/customConstants';
import { api } from '@/lib/api';
import type { Faq } from '@/lib/types';
import RefreshableScrollView from '@/components/RefreshableScrollView';

export default function HelpSupportScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'faq' | 'contact'>('faq');
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFaqs();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFaqs();
    setRefreshing(false);
  };

  const loadFaqs = async () => {
    setFaqLoading(true);
    try {
      const data = await api.get<Faq[]>('/faqs');
      setFaqs(data || []);
    } catch {
      setFaqs([]);
    } finally {
      setFaqLoading(false);
    }
  };

  const handleSubmitTicket = async () => {
    if (!contactForm.subject.trim()) { Alert.alert('Error', 'Please enter a subject.'); return; }
    if (!contactForm.message.trim()) { Alert.alert('Error', 'Please enter a message.'); return; }

    setSubmitting(true);
    try {
      await api.post('/support/tickets', {
        subject: contactForm.subject,
        message: contactForm.message,
      });
      Alert.alert('Success', 'Your support ticket has been submitted. We will get back to you within 24 hours.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[${DARK_BG}]`}>
      <View style={tw`px-3 py-4 border-b border-white/7`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => router.back()} style={tw`mr-4`} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
          <View>
            <Text style={tw`text-xl font-bold text-white`}>Help & Support</Text>
            <Text style={tw`text-xs text-white/40`}>Get help with your account</Text>
          </View>
        </View>
      </View>

      <View style={tw`flex-row px-3 pt-4 pb-3`}>
        {(['faq', 'contact'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={tw`flex-1 py-3 rounded-xl mr-2 ${activeTab === tab ? 'bg-blue-600' : 'bg-white/5 border border-white/10'}`}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={tw`text-center font-semibold ${activeTab === tab ? 'text-white' : 'text-white/40'}`}>{tab === 'faq' ? 'FAQ' : 'Contact Us'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'faq' ? (
        <RefreshableScrollView style={tw`flex-1 px-3 pt-3`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-8`} refreshing={refreshing} onRefresh={onRefresh}>
          {faqLoading ? (
            <View style={tw`items-center py-10`}>
              <ActivityIndicator color="rgba(255,255,255,0.3)" />
            </View>
          ) : faqs.length === 0 ? (
            <View style={tw`items-center py-10`}>
              <Ionicons name="help-circle-outline" size={64} color="rgba(255,255,255,0.1)" />
              <Text style={tw`text-white/30 text-lg mt-4`}>No FAQs available</Text>
              <TouchableOpacity style={tw`bg-blue-600 px-6 py-3 rounded-xl mt-6`} onPress={loadFaqs} activeOpacity={0.8}>
                <Text style={tw`text-white font-bold`}>Reload</Text>
              </TouchableOpacity>
            </View>
          ) : (
            faqs.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={tw`bg-white/4 border border-white/7 rounded-2xl mb-3 overflow-hidden`}
                onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                activeOpacity={0.75}
              >
                <View style={tw`flex-row items-center justify-between px-5 py-4`}>
                  <Text style={tw`text-white font-semibold flex-1 mr-4`}>{faq.question}</Text>
                  <Ionicons name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'} size={18} color="rgba(255,255,255,0.35)" />
                </View>
                {expandedFaq === faq.id && (
                  <View style={tw`px-5 pb-4`}>
                    <Text style={tw`text-white/50 text-sm leading-relaxed`}>{faq.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </RefreshableScrollView>
      ) : (
        <RefreshableScrollView style={tw`flex-1 px-3 pt-3`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-8`} refreshing={refreshing} onRefresh={onRefresh}>
          <View style={tw`bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-6`}>
            <View style={tw`flex-row items-center mb-2`}>
              <Ionicons name="information-circle" size={20} color="#60a5fa" />
              <Text style={tw`text-blue-300 font-semibold ml-2`}>Need More Help?</Text>
            </View>
            <Text style={tw`text-xs text-white/40`}>Our support team typically responds within 24 hours. For urgent matters, please call our support line.</Text>
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Subject</Text>
            <View style={tw`bg-white/5 border border-white/10 rounded-2xl px-4 h-[52px] justify-center`}>
              <TextInput style={tw`text-[14px] text-white`} value={contactForm.subject} onChangeText={(text) => setContactForm({ ...contactForm, subject: text })} placeholder="What's this about?" placeholderTextColor="rgba(255,255,255,0.2)" />
            </View>
          </View>

          <View style={tw`mb-6`}>
            <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide mb-2`}>Message</Text>
            <View style={tw`bg-white/5 border border-white/10 rounded-2xl px-4 pt-4`}>
              <TextInput style={tw`text-[14px] text-white`} value={contactForm.message} onChangeText={(text) => setContactForm({ ...contactForm, message: text })} placeholder="Describe your issue in detail..." placeholderTextColor="rgba(255,255,255,0.2)" multiline textAlignVertical="top" />
            </View>
          </View>

          <TouchableOpacity style={tw`bg-blue-600 py-4 rounded-xl ${submitting ? 'opacity-60' : ''} mb-6`} onPress={handleSubmitTicket} disabled={submitting} activeOpacity={0.8}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white text-center font-bold text-lg`}>Submit Ticket</Text>}
          </TouchableOpacity>

          <View style={tw`bg-white/4 border border-white/7 rounded-2xl p-5 mb-4`}>
            <View style={tw`flex-row items-center mb-3`}>
              <Ionicons name="call-outline" size={20} color="#60a5fa" />
              <Text style={tw`text-white font-semibold ml-3`}>Phone Support</Text>
            </View>
            <Text style={tw`text-blue-400 text-sm mb-1`}>+234 800 123 4567</Text>
            <Text style={tw`text-white/40 text-xs`}>Available Mon-Fri, 8AM-6PM (WAT)</Text>
          </View>

          <View style={tw`bg-white/4 border border-white/7 rounded-2xl p-5`}>
            <View style={tw`flex-row items-center mb-3`}>
              <Ionicons name="mail-outline" size={20} color="#60a5fa" />
              <Text style={tw`text-white font-semibold ml-3`}>Email Support</Text>
            </View>
            <Text style={tw`text-blue-400 text-sm`}>support@wanpay.ng</Text>
          </View>
        </RefreshableScrollView>
      )}
    </SafeAreaView>
  );
}
