import { DARK_BG } from '@/constants/customConstants';
import { useGrantsData } from '@/hooks/use-grants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import tw from 'twrnc';
import RefreshableScrollView from '@/components/RefreshableScrollView';
import type { Grant, GrantCategory } from '@/lib/types';

const GROWTH_SECTIONS = [
  { id: 'grants',           label: 'Grants',           description: 'Browse verified local and international grant opportunities.' },
  { id: 'business-aids',   label: 'Business Aids',     description: 'Explore government programmes and private funds for Nigerian MSMEs.' },
  { id: 'training-support', label: 'Training & Support', description: 'Find accelerators, mentorship, and growth services for your team.' },
] as const;

type GrowthSectionId = typeof GROWTH_SECTIONS[number]['id'];

interface GrowthResourceItem { title: string; description?: string; bullets?: string[]; }
interface GrowthResourceSection { id: string; title: string; summary?: string; items: GrowthResourceItem[]; }

const BUSINESS_AIDS_RESOURCES: GrowthResourceSection[] = [
  {
    id: 'federal-state', title: 'Federal & State Government Grants',
    items: [
      { title: 'Lagos State Employment Trust Fund (LSETF)', description: 'Up to ₦5,000,000 for Lagos-based businesses focused on job creation. Open year-round with rolling assessments.' },
      { title: 'Federal Government Youth Investment Fund (YIF)', description: 'Up to ₦3,000,000 for youth (ages 18–35) with viable business ideas. Applications are ongoing nationwide.' },
      { title: 'Digital and Creative Enterprises (iDiCE) Program', description: 'Promotes investment in technology and creative startups in partnership with the Bank of Industry.' },
      { title: 'Skill-Up Artisans Program', description: 'Supports artisans and SMEs with hands-on training, certification, and access to specialised equipment.' },
    ],
  },
  {
    id: 'private-international', title: 'Private & International Grants',
    items: [
      { title: 'Tony Elumelu Foundation Entrepreneurship Programme', description: '$5,000 in seed funding, mentorship, and business training for African entrepreneurs. Applications open annually via TEFConnect.' },
      { title: "Africa's Young Entrepreneur Empowerment Nigeria (AYEEN)", description: 'Awards grants ranging from hundreds of thousands to millions of naira to innovative entrepreneurs across Nigeria.' },
      { title: 'GroFin Fund', description: '$100,000 – $1,500,000 in patient capital for small and growing businesses in healthcare, education, agriculture, and manufacturing.' },
      { title: 'Shell LiveWIRE Nigeria', description: 'Up to ₦10,000,000 for young entrepreneurs in energy, technology, and agriculture, alongside incubation support.' },
      { title: 'AWIEF Growth Accelerator', description: '$10,000 – $25,000 grants, business development training, and investor readiness support for women entrepreneurs.' },
      { title: 'USAID Power Africa Off-Grid Energy Challenge', description: 'Up to $100,000 for renewable energy companies delivering off-grid solutions to underserved communities.' },
    ],
  },
  {
    id: 'pan-african', title: 'Pan-African Opportunities',
    items: [
      { title: 'Anzisha Prize', description: 'Up to $25,000 for young entrepreneurs (ages 15–22) leading community-driven innovation and job creation.' },
      { title: 'African Entrepreneurship Award', description: 'Mentorship and funding to innovative, tech-driven African businesses addressing critical local challenges.' },
    ],
  },
  {
    id: 'application-tips', title: 'Application Tips',
    summary: 'Position your business to stand out during competitive grant rounds.',
    items: [
      {
        title: 'Best Practices',
        bullets: [
          'Visit official programme websites for the latest eligibility requirements and timelines.',
          'Align your business model with the stated focus areas, impact goals, and documentation needs.',
          'Prepare financial statements, pitch decks, and proof of traction ahead of deadlines.',
        ],
      },
    ],
  },
  {
    id: 'women-focused', title: 'For Women',
    items: [
      { title: 'AWIEF Grants', description: '$10,000 – $25,000 plus mentorship for innovative women-led businesses operating in Africa for at least three years.' },
      { title: 'Womenpreneur Pitch-a-Ton Africa (Access Bank)', description: 'Training, mentorship, and grants up to ₦5,000,000 for Nigerian women entrepreneurs.' },
      { title: 'Women in Tech Africa (WiTA) Funding', description: 'Capital, global exposure, and mentorship to women-led technology startups across Africa.' },
      { title: 'Cherie Blair Foundation for Women', description: 'Mentoring, training, and financial support to women entrepreneurs in marginalised communities.' },
      { title: 'Female Entrepreneurs Grant by Aliko Dangote Foundation', description: '₦100,000 – ₦1,000,000 to low-income women in Nigeria to expand or stabilise their businesses.' },
      { title: 'Flourish Africa Grant', description: 'Grants and comprehensive skills-building programmes to help Nigerian women scale startups and established ventures.' },
    ],
  },
  {
    id: 'geo-political', title: 'Grants by Geo-Political Zone',
    items: [
      { title: 'North-West (Kano, Kaduna, Sokoto, Katsina…)', bullets: ['Development Bank of Nigeria (DBN) Entrepreneurship Grant for MSMEs in agriculture and technology.', 'Youth Empowerment Nigeria (YEN): Skill acquisition and seed grants for young entrepreneurs.', 'National Directorate of Employment (NDE) Grants for micro-businesses across youth and women.'] },
      { title: 'North-East (Borno, Yobe, Adamawa, Bauchi…)', bullets: ['North-East Development Commission (NEDC): Grants for conflict-affected communities.', "Women's Entrepreneurship Grant Programme: Financial support and mentorship for women in the North-East."] },
      { title: 'North-Central (Abuja, Kogi, Kwara, Benue…)', bullets: ['Tony Elumelu Foundation: $5,000 seed capital for high-potential ventures.', 'Youth Investment Fund (YIF): Up to ₦3,000,000 for young entrepreneurs.', 'Industrial Training Fund (ITF): Grants and capacity-building for artisans and SMEs.'] },
      { title: 'South-West (Lagos, Ogun, Oyo, Ekiti, Ondo…)', bullets: ['LSETF: Grants up to ₦5,000,000 alongside capacity-building for MSMEs.', 'Womenpreneur Pitch-a-Ton Africa: Grants up to ₦5,000,000 for women entrepreneurs.', 'iDiCE Program: Grants and accelerator support for tech and creative startups.'] },
      { title: 'South-East (Anambra, Enugu, Imo, Ebonyi, Abia)', bullets: ['Shell LiveWIRE Nigeria: Up to ₦10,000,000 for youth and women in oil-producing communities.', 'Innoson Kiara Academy Grants: Technical training and business development funds.', 'GroFin Fund: $100,000 – $1,500,000 for MSMEs in key sectors.'] },
      { title: 'South-South (Rivers, Delta, Akwa Ibom, Bayelsa, Cross River)', bullets: ['NDDC Grants: Funding for MSMEs and community-led projects across the Niger Delta.', 'Women Entrepreneurship Fund (Shell LiveWIRE): Up to ₦10,000,000 plus mentorship.'] },
    ],
  },
];

export default function GrowthHubScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeSection, setActiveSection] = useState<GrowthSectionId>('grants');
  const { grants, categories } = useGrantsData();

  const handleSectionChange = (sectionId: GrowthSectionId) => {
    setActiveSection(sectionId);
    setShowFilterModal(false);
    if (sectionId !== 'grants') {
      setSelectedCategory('all');
      setFilterStatus('all');
      setSearchQuery('');
      setSelectedGrant(null);
    }
  };

  const filteredGrants = useMemo(() => {
    let filtered = grants;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(g =>
        g.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'social-impact' && g.category === 'Social Impact') ||
        (selectedCategory === 'innovation' && g.category === 'Innovation')
      );
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter(g =>
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus !== 'all') filtered = filtered.filter(g => g.status === filterStatus);
    return filtered;
  }, [grants, selectedCategory, searchQuery, filterStatus]);

  const sectionSubtitle = useMemo(() => {
    if (activeSection === 'business-aids') return 'Discover incentives and tools to strengthen your business.';
    if (activeSection === 'training-support') return 'Access accelerators, mentorship, and skill-building.';
    return `${filteredGrants.length} grant opportunities available`;
  }, [activeSection, filteredGrants.length]);

  const getStatusStyle = (status: string) => {
    if (status === 'open') return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: '#10b981', label: 'Open' };
    if (status === 'closing-soon') return { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: '#f59e0b', label: 'Closing soon' };
    return { bg: 'bg-white/10', text: 'text-white/40', dot: '#6b7280', label: 'Closed' };
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[${DARK_BG}]`}>
      <StatusBar style="light" />

      {/* ── Header ── */}
      <View style={tw`bg-violet-700 px-5 pt-8 pb-5`}>
        <View style={tw`flex-row justify-between items-start mb-4`}>
          <View style={tw`flex-1 mr-3`}>
            <Text style={tw`text-white text-[22px] font-bold tracking-tight`}>Growth Hub</Text>
            <Text style={tw`text-white/55 text-[12px] mt-1`}>{sectionSubtitle}</Text>
          </View>
          {activeSection === 'grants' && (
            <TouchableOpacity
              style={tw`w-[38px] h-[38px] rounded-xl bg-white/15 border border-white/15 items-center justify-center`}
              onPress={() => setShowFilterModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="filter" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Search */}
        <View style={tw`bg-white/12 border border-white/15 rounded-2xl px-4 h-[46px] flex-row items-center`}>
          <Ionicons name="search-outline" size={17} color="rgba(255,255,255,0.4)" />
          <TextInput
            style={tw`flex-1 ml-2.5 text-white text-[14px]`}
            placeholder={activeSection === 'grants' ? 'Search grants...' : 'Search resources...'}
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            editable={activeSection === 'grants'}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Section tabs ── */}
      <View style={tw`bg-[#0a0a18] border-b border-white/7`}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`px-5 gap-2`} style={tw`py-3`}>
          {GROWTH_SECTIONS.map(section => {
            const isActive = activeSection === section.id;
            return (
              <TouchableOpacity
                key={section.id}
                style={tw`px-4 py-2 rounded-full ${isActive ? 'bg-violet-600' : 'bg-white/7 border border-white/10'}`}
                onPress={() => handleSectionChange(section.id)}
                activeOpacity={0.7}
              >
                <Text style={tw`text-[13px] font-semibold ${isActive ? 'text-white' : 'text-white/45'}`}>
                  {section.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {activeSection === 'grants' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`px-5 gap-2 pb-3`}>
            {categories.map(category => {
              const isSelected = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={tw`flex-row items-center px-3.5 py-2 rounded-full ${isSelected ? 'bg-violet-600' : 'bg-white/5 border border-white/10'}`}
                  onPress={() => setSelectedCategory(category.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={category.icon} size={15} color={isSelected ? '#fff' : category.color} style={tw`mr-1.5`} />
                  <Text style={tw`text-[12px] font-semibold ${isSelected ? 'text-white' : 'text-white/50'}`}>{category.name}</Text>
                  <View style={tw`ml-1.5 px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20' : 'bg-white/8'}`}>
                    <Text style={tw`text-[11px] font-bold ${isSelected ? 'text-white' : 'text-white/40'}`}>{category.count}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* ── Content ── */}
      <View style={tw`flex-1`}>

        {/* Grants list */}
        {activeSection === 'grants' && (
          <RefreshableScrollView style={tw`flex-1 px-5 pt-4`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-10`}>
            {filteredGrants.length > 0 ? filteredGrants.map(grant => {
              const s = getStatusStyle(grant.status);
              return (
                <TouchableOpacity
                  key={grant.id}
                  style={tw`bg-white/4 border border-white/7 rounded-2xl p-4 mb-3`}
                  onPress={() => setSelectedGrant(grant)}
                  activeOpacity={0.75}
                >
                  <View style={tw`flex-row justify-between items-start mb-3`}>
                    <View style={tw`flex-1 mr-3`}>
                      <Text style={tw`text-white text-[14px] font-semibold leading-5 mb-0.5`}>{grant.title}</Text>
                      <Text style={tw`text-white/40 text-[12px]`}>{grant.organization}</Text>
                    </View>
                    <View style={tw`flex-row items-center px-2.5 py-1 rounded-full ${s.bg}`}>
                      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: s.dot, marginRight: 5 }} />
                      <Text style={tw`text-[11px] font-semibold ${s.text}`}>{s.label}</Text>
                    </View>
                  </View>

                  <View style={tw`flex-row items-center gap-2 mb-3`}>
                    <View style={tw`bg-violet-500/15 border border-violet-500/20 px-3 py-1 rounded-full`}>
                      <Text style={tw`text-violet-300 font-bold text-[12px]`}>{grant.amount}</Text>
                    </View>
                    <View style={tw`bg-white/7 border border-white/10 px-3 py-1 rounded-full`}>
                      <Text style={tw`text-white/45 text-[11px] font-semibold`}>{grant.category}</Text>
                    </View>
                  </View>

                  <View style={tw`flex-row items-center gap-1.5`}>
                    <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.3)" />
                    <Text style={tw`text-white/30 text-[12px]`}>Deadline: {grant.deadline}</Text>
                  </View>
                </TouchableOpacity>
              );
            }) : (
              <View style={tw`bg-white/4 border border-white/7 rounded-2xl p-10 items-center mt-6`}>
                <Ionicons name="search-outline" size={48} color="rgba(255,255,255,0.15)" />
                <Text style={tw`text-white/30 text-[14px] mt-4`}>No grants found</Text>
                <Text style={tw`text-white/20 text-[12px] mt-1`}>Try adjusting your search or filters</Text>
              </View>
            )}
          </RefreshableScrollView>
        )}

        {/* Business aids */}
        {activeSection === 'business-aids' && (
          <RefreshableScrollView style={tw`flex-1 px-5 pt-4`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-10`}>
            {BUSINESS_AIDS_RESOURCES.map(section => (
              <View key={section.id} style={tw`mb-7`}>
                <Text style={tw`text-white text-[15px] font-bold tracking-tight mb-1`}>{section.title}</Text>
                {section.summary && <Text style={tw`text-white/35 text-[12px] leading-5 mb-3`}>{section.summary}</Text>}
                <View style={tw`gap-2.5`}>
                  {section.items.map((item, i) => (
                    <View key={i} style={tw`bg-white/4 border border-white/7 rounded-2xl p-4`}>
                      <Text style={tw`text-white text-[13px] font-semibold mb-1.5`}>{item.title}</Text>
                      {item.description && (
                        <Text style={tw`text-white/40 text-[12px] leading-5`}>{item.description}</Text>
                      )}
                      {item.bullets && (
                        <View style={tw`mt-2 gap-2`}>
                          {item.bullets.map((bullet, bi) => (
                            <View key={bi} style={tw`flex-row items-start gap-2`}>
                              <View style={tw`w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0`} />
                              <Text style={tw`text-white/40 text-[12px] flex-1 leading-5`}>{bullet}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </RefreshableScrollView>
        )}

        {/* Training & support */}
        {activeSection === 'training-support' && (
          <RefreshableScrollView style={tw`flex-1 px-5 pt-4`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-10`}>
            <View style={tw`bg-white/4 border border-white/7 rounded-2xl p-5`}>
              <View style={tw`w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 items-center justify-center mb-3`}>
                <Ionicons name="time-outline" size={20} color="#a78bfa" />
              </View>
              <Text style={tw`text-white text-[14px] font-semibold mb-2`}>Coming soon</Text>
              <Text style={tw`text-white/35 text-[13px] leading-5`}>
                We are curating a catalogue of accelerators, mentorship programmes, and digital training resources.
                Check back soon for the latest opportunities designed to help your business scale.
              </Text>
            </View>
          </RefreshableScrollView>
        )}
      </View>

      {/* ── Grant detail modal ── */}
      <Modal visible={selectedGrant !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedGrant(null)}>
        {selectedGrant && (
          <SafeAreaView style={tw`flex-1 bg-[${DARK_BG}]`}>
            <StatusBar style="light" />

            {/* Modal header */}
            <View style={tw`px-5 py-4 border-b border-white/7 flex-row justify-between items-center`}>
              <Text style={tw`text-white text-[17px] font-bold tracking-tight`}>Grant details</Text>
              <TouchableOpacity
                onPress={() => setSelectedGrant(null)}
                style={tw`w-[34px] h-[34px] rounded-xl bg-white/7 items-center justify-center`}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>

            <RefreshableScrollView style={tw`flex-1 px-5 pt-5`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-8`}>
              <Text style={tw`text-white text-[20px] font-bold tracking-tight leading-7 mb-1`}>{selectedGrant.title}</Text>
              <Text style={tw`text-white/40 text-[13px] mb-5`}>{selectedGrant.organization}</Text>

              {/* Amount & deadline */}
              <View style={tw`flex-row gap-3 mb-6`}>
                <View style={tw`flex-1 bg-violet-500/15 border border-violet-500/20 rounded-2xl p-4`}>
                  <Text style={tw`text-violet-300 font-bold text-[16px] text-center`}>{selectedGrant.amount}</Text>
                  <Text style={tw`text-violet-400/60 text-[11px] text-center mt-1`}>Grant amount</Text>
                </View>
                <View style={tw`flex-1 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4`}>
                  <Text style={tw`text-amber-300 font-bold text-[16px] text-center`}>{selectedGrant.deadline}</Text>
                  <Text style={tw`text-amber-400/60 text-[11px] text-center mt-1`}>Deadline</Text>
                </View>
              </View>

              {/* Description */}
              <View style={tw`mb-5`}>
                <Text style={tw`text-white text-[13px] font-semibold mb-2`}>Description</Text>
                <Text style={tw`text-white/45 text-[13px] leading-6`}>{selectedGrant.description}</Text>
              </View>

              {/* Requirements */}
              <View style={tw`mb-5`}>
                <Text style={tw`text-white text-[13px] font-semibold mb-2`}>Requirements</Text>
                <View style={tw`bg-blue-500/10 border border-blue-500/15 rounded-2xl p-4 gap-2.5`}>
                  {selectedGrant.requirements.map((req, i) => (
                    <View key={i} style={tw`flex-row items-start gap-2`}>
                      <Ionicons name="checkmark-circle" size={16} color="#60a5fa" style={tw`mt-0.5`} />
                      <Text style={tw`text-white/55 text-[13px] flex-1 leading-5`}>{req}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Eligibility */}
              <View style={tw`mb-4`}>
                <Text style={tw`text-white text-[13px] font-semibold mb-2`}>Eligibility</Text>
                <View style={tw`flex-row flex-wrap gap-2`}>
                  {selectedGrant.eligibility.map((item, i) => (
                    <View key={i} style={tw`bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full`}>
                      <Text style={tw`text-emerald-400 text-[12px] font-semibold`}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </RefreshableScrollView>

            {/* Apply button */}
            <View style={tw`px-5 py-4 border-t border-white/7`}>
              <TouchableOpacity
                style={tw`bg-violet-600 h-[52px] rounded-2xl flex-row items-center justify-center gap-2 mb-3`}
                activeOpacity={0.85}
                onPress={() => alert(selectedGrant.applicationLink ? `Opening: ${selectedGrant.applicationLink}` : 'Application link not available')}
              >
                <Ionicons name="paper-plane-outline" size={17} color="#fff" />
                <Text style={tw`text-white font-semibold text-[15px]`}>Apply now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={tw`py-2 items-center`} onPress={() => setSelectedGrant(null)} activeOpacity={0.7}>
                <Text style={tw`text-white/35 text-[13px] font-semibold`}>Close</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </Modal>

      {/* ── Filter modal ── */}
      <Modal visible={showFilterModal} animationType="slide" transparent>
        <View style={tw`flex-1 justify-end bg-black/60`}>
          <View style={tw`bg-[#0f0f1e] border-t border-white/10 rounded-t-3xl pt-6 pb-10`}>
            <View style={tw`px-5 pb-4 border-b border-white/7 flex-row justify-between items-center`}>
              <Text style={tw`text-white text-[17px] font-bold tracking-tight`}>Filter grants</Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={tw`w-[34px] h-[34px] rounded-xl bg-white/7 items-center justify-center`}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>

            <View style={tw`px-5 pt-5`}>
              <Text style={tw`text-white/55 text-[12px] font-semibold tracking-wide uppercase mb-3`}>Status</Text>
              <View style={tw`gap-2.5 mb-6`}>
                {[
                  { value: 'all', label: 'All statuses' },
                  { value: 'open', label: 'Open' },
                  { value: 'closing-soon', label: 'Closing soon' },
                  { value: 'closed', label: 'Closed' },
                ].map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={tw`border ${filterStatus === option.value ? 'border-violet-500/60 bg-violet-500/10' : 'border-white/10 bg-white/4'} rounded-2xl px-4 h-[48px] flex-row items-center`}
                    onPress={() => setFilterStatus(option.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={tw`text-[14px] font-semibold ${filterStatus === option.value ? 'text-violet-300' : 'text-white/45'}`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={tw`bg-violet-600 h-[52px] rounded-2xl items-center justify-center`}
                onPress={() => setShowFilterModal(false)}
                activeOpacity={0.85}
              >
                <Text style={tw`text-white font-semibold text-[15px]`}>Apply filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}