import { DARK_BG } from "@/constants/customConstants";
import { Ionicons } from "@expo/vector-icons";

import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "twrnc";
import RefreshableScrollView from "@/components/RefreshableScrollView";

/* ────────────────────────────────────────────────────────────────────────
 * TYPES
 * ────────────────────────────────────────────────────────────────────── */

type GrantStatus = "open" | "closing-soon" | "closed";
type GrantCategoryId = "state" | "federal" | "private" | "women" | "youth";

interface Grant {
  id: string;
  title: string;
  organization: string;
  categoryId: GrantCategoryId;
  category: string; // display label
  amount: string;
  deadline: string;
  status: GrantStatus;
  description: string;
  requirements: string[];
  eligibility: string[];
  applicationLink?: string;
  contact?: string;
}

interface GrantCategory {
  id: GrantCategoryId | "all";
  name: string;
  icon: string;
  color: string;
  count: number;
}

/* ────────────────────────────────────────────────────────────────────────
 * GRANTS DATA
 * Source: Grants & Aid Directory — Lagos & Abuja, Nigeria, 2026 Edition
 * (Prepared by ReBrandU, June 2026). Verify deadlines/portals before applying.
 * ────────────────────────────────────────────────────────────────────── */

const GRANTS_DATA: Grant[] = [
  {
    id: "lagos-cares-2026",
    title: "Lagos CARES Grant (2026, Q2 Phase)",
    organization: "Lagos State Employment Trust Fund (LSETF)",
    categoryId: "state",
    category: "State Government",
    amount: "Up to ₦1,000,000",
    deadline: "Rolling — confirm current window",
    status: "open",
    description:
      "Non-repayable grant with three components: a Credit Grant (co-financing up to 40% of a performing business loan), an Operations Grant (up to 50% of documented monthly operating costs for 6 months), and an IT Enhancement Grant (laptops, internet, e-commerce tools, software).",
    requirements: [
      "LASRRA ID",
      "Valid government ID (NIN, passport, voter\u2019s card or driver\u2019s licence)",
      "BVN linked to an active bank account",
      "Recent passport photograph",
      "6 months of bank statements",
      "CAC documents and tax receipts where applicable",
    ],
    eligibility: [
      "Lagos residents",
      "MSME owners",
      "Youth & women-led businesses",
      "1+ year operating",
    ],
    applicationLink: "https://apply.lsetf.ng",
    contact: "+234 1 7000 945 · lagoscares@lsetf.ng",
  },
  {
    id: "lsetf-loan",
    title: "LSETF Loan Programme",
    organization: "Lagos State Employment Trust Fund (LSETF)",
    categoryId: "state",
    category: "State Government",
    amount: "₦50,000 – ₦5,000,000",
    deadline: "Open year-round",
    status: "open",
    description:
      "Micro, SME and TACT loan categories at 5–9% interest per annum, with 12–36 month repayment terms and a 5% equity contribution requirement.",
    requirements: [
      "LASRRA ID",
      "Tax ID",
      "BVN",
      "Bank statements",
      "Business registration documents",
      "Passport photographs",
    ],
    eligibility: ["Lagos residents", "Existing or early-stage SMEs"],
    applicationLink: "https://lsetf.ng",
  },
  {
    id: "wbcl-growth-grant",
    title: "WBCL Lagos Business Growth Grant",
    organization: "Women's Business Collective Lagos (WBCL)",
    categoryId: "women",
    category: "Women-Focused",
    amount: "₦350,000",
    deadline: "Last cycle closed 21 May 2026",
    status: "closed",
    description:
      "Supports established women-owned SMEs in Lagos that are seeking to scale their operations.",
    requirements: ["Business registration", "Proof of Lagos operations"],
    eligibility: ["Women-owned businesses", "Established SMEs in Lagos"],
  },
  {
    id: "abuja-yef-2nd-edition",
    title: "Abuja Young Entrepreneurs' Fund Competition (2nd Edition)",
    organization:
      "Abuja Enterprise Agency (AEA) & Abuja Investment Company Ltd (AICL)",
    categoryId: "state",
    category: "State Government",
    amount: "Funding + mentorship + investor pitch access",
    deadline: "Last window closed 13 May 2026",
    status: "closed",
    description:
      "Funding, mentorship, training and investor pitch opportunities for young entrepreneurs in the FCT, prioritising ICT, fashion-focused creative industries, and agriculture.",
    requirements: [
      "Business idea or early-stage venture",
      "FCT-based operations",
    ],
    eligibility: [
      "Nigerians aged 18–35",
      "Based in or able to operate within the FCT",
    ],
    applicationLink: "https://www.Ayehunt.com",
  },
  {
    id: "nysc-yeep",
    title:
      "NYSC / Activate Success Youth Entrepreneurship & Empowerment Programme (YEEP)",
    organization:
      "NYSC, Activate Success International Foundation & Flutterwave",
    categoryId: "youth",
    category: "Youth",
    amount: "₦500,000 (recent cohort)",
    deadline: "Watch for next cohort announcement",
    status: "closing-soon",
    description:
      "Direct business grants plus training and mentorship delivered through the SAED (Skills Acquisition and Entrepreneurship Development) programme.",
    requirements: ["Active participation in SAED training"],
    eligibility: ["NYSC corps members"],
  },
  {
    id: "cedf",
    title: "Creative Economy Development Fund (CEDF)",
    organization:
      "Federal Ministry of Arts, Culture, Tourism and the Creative Economy",
    categoryId: "federal",
    category: "Federal Government",
    amount: "TBD — funding bands still being rolled out",
    deadline: "Portal launch pending",
    status: "closed",
    description:
      "Funding support for emerging creatives alongside strengthened IP protection frameworks for creators.",
    requirements: [],
    eligibility: ["Nigerian creatives and creative-sector businesses"],
  },
  {
    id: "tef-teep",
    title: "Tony Elumelu Foundation Entrepreneurship Programme (TEEP)",
    organization: "Tony Elumelu Foundation",
    categoryId: "private",
    category: "Private & International",
    amount: "$5,000 non-refundable seed capital",
    deadline: "Opens January, closes March annually",
    status: "closed",
    description:
      "Seed capital plus business management training and mentorship for entrepreneurs across all 54 African countries.",
    requirements: [
      "Business plan/description",
      "Basic personal identification",
    ],
    eligibility: ["Business idea or business less than 3 years old"],
    applicationLink: "https://tefconnect.com",
  },
  {
    id: "boi-yes",
    title:
      "Bank of Industry (BOI) Youth Entrepreneurship Support (YES) Programme",
    organization: "Bank of Industry",
    categoryId: "federal",
    category: "Federal Government",
    amount: "Up to ₦10,000,000",
    deadline: "Open year-round",
    status: "open",
    description:
      "Loans with flexible terms and low interest rates for youth-led businesses.",
    requirements: ["Viable business idea or existing business"],
    eligibility: ["Nigerian youths aged 18–35"],
    applicationLink: "https://www.boi.ng",
  },
  {
    id: "smedan-cgs-growher",
    title: "SMEDAN Conditional Grant Scheme (CGS) & GrowHer Accelerator",
    organization:
      "Small and Medium Enterprises Development Agency of Nigeria (SMEDAN)",
    categoryId: "women",
    category: "Women-Focused",
    amount: "Financial & equipment assistance (varies)",
    deadline: "Per call-for-applications",
    status: "open",
    description:
      "CGS supports micro/small businesses, traders and artisans; GrowHer (currently Cohort 3) is a dedicated accelerator for women-led businesses.",
    requirements: [],
    eligibility: [
      "Micro & small business owners nationwide",
      "Women entrepreneurs (GrowHer)",
    ],
    applicationLink: "https://smedan.gov.ng",
  },
  {
    id: "student-vc-grant",
    title: "Student Venture Capital Grant",
    organization: "Federal Ministry of Education",
    categoryId: "federal",
    category: "Federal Government",
    amount: "Up to ₦50,000,000 (equity-free)",
    deadline: "Portal not yet live",
    status: "closed",
    description:
      "Equity-free funding for innovative student-led enterprises and startups.",
    requirements: [],
    eligibility: ["Nigerian tertiary students with scalable business concepts"],
  },
  {
    id: "petty-traders-grant",
    title: "Petty Traders Grant Support Programme",
    organization: "Federal Government intervention scheme",
    categoryId: "federal",
    category: "Federal Government",
    amount: "₦10,000 – ₦100,000",
    deadline: "Check active registration windows",
    status: "closing-soon",
    description:
      "Non-repayable grant for micro-traders, food vendors and basic service providers, with minimal paperwork and no business registration required.",
    requirements: ["Minimal — no CAC registration required"],
    eligibility: ["Grassroots/informal traders"],
  },
  {
    id: "nddc-youth-fund",
    title: "NDDC Youth Entrepreneurship Fund",
    organization: "Niger Delta Development Commission (NDDC)",
    categoryId: "federal",
    category: "Federal Government",
    amount: "₦30 billion committed (fund pool)",
    deadline: "Ongoing",
    status: "open",
    description:
      "Youth entrepreneurship support fund dedicated to the Niger Delta region.",
    requirements: [],
    eligibility: [
      "Youth from Abia, Akwa Ibom, Bayelsa, Cross River, Delta, Edo, Imo, Ondo & Rivers states",
    ],
    applicationLink: "https://nddc.gov.ng",
  },
  {
    id: "afdb-100m",
    title: "AfDB $100 Million Loan for Youth & Women-Led Enterprises",
    organization: "African Development Bank & Federal Government of Nigeria",
    categoryId: "private",
    category: "Private & International",
    amount: "$100,000,000 (fund pool)",
    deadline: "Ongoing",
    status: "open",
    description:
      "Targets over 38,000 youth-led and women-led businesses with capital access and business development support.",
    requirements: [],
    eligibility: ["Youth-led businesses", "Women-led businesses"],
    applicationLink: "https://www.afdb.org",
  },
  {
    id: "niya-startup-grants",
    title: "Nigerian Youth Academy (NiYA) Startup Grants",
    organization: "NiYA — Federal Ministry of Youth Development",
    categoryId: "youth",
    category: "Youth",
    amount: "₦1,000,000 (startups) / ₦500,000 (informal sector)",
    deadline: "Ongoing",
    status: "open",
    description:
      "₦1,000,000 grants for 200 youth-led startups and ₦500,000 grants for 100 informal sector beneficiaries.",
    requirements: [],
    eligibility: ["Nigerian youth (18–35)"],
    applicationLink: "https://yid.fmyd.gov.ng/project-initiatives",
  },
  {
    id: "yif",
    title: "Youth Investment Fund (YIF)",
    organization: "Federal Ministry of Youth Development",
    categoryId: "youth",
    category: "Youth",
    amount: "Varies by business plan",
    deadline: "Open year-round",
    status: "open",
    description:
      "Financial support helping young entrepreneurs start, sustain and scale their businesses.",
    requirements: [],
    eligibility: ["Nigerian youth (18–35)"],
    applicationLink: "https://yif.gov.ng",
  },
];

const GRANTS_CATEGORY_META: Record<
  GrantCategoryId,
  { name: string; icon: string; color: string }
> = {
  state: { name: "State", icon: "business-outline", color: "#34d399" },
  federal: { name: "Federal", icon: "flag-outline", color: "#60a5fa" },
  private: {
    name: "Private & Int\u2019l",
    icon: "globe-outline",
    color: "#f59e0b",
  },
  women: { name: "Women", icon: "female-outline", color: "#f472b6" },
  youth: { name: "Youth", icon: "people-outline", color: "#a78bfa" },
};

/* ────────────────────────────────────────────────────────────────────────
 * BUSINESS AIDS / RESOURCE SECTIONS
 * (Abuja, federal-wide, and reference-checklist content that doesn't fit
 * the card-based grants list above)
 * ────────────────────────────────────────────────────────────────────── */

const GROWTH_SECTIONS = [
  {
    id: "grants",
    label: "Grants",
    description: "Browse verified local and international grant opportunities.",
  },
  {
    id: "business-aids",
    label: "Business Aids",
    description:
      "Explore government programmes and private funds for Nigerian MSMEs.",
  },
  {
    id: "training-support",
    label: "Training & Support",
    description:
      "Find accelerators, mentorship, and growth services for your team.",
  },
] as const;

type GrowthSectionId = (typeof GROWTH_SECTIONS)[number]["id"];

interface GrowthResourceItem {
  title: string;
  description?: string;
  bullets?: string[];
}
interface GrowthResourceSection {
  id: string;
  title: string;
  summary?: string;
  items: GrowthResourceItem[];
}

const BUSINESS_AIDS_RESOURCES: GrowthResourceSection[] = [
  {
    id: "twenty-federal-programs",
    title: "20 Key Federal Youth Programs",
    summary:
      "Active federal initiatives every Nigerian youth (18–35) should know about.",
    items: [
      {
        title: "Nigerian Education Loan Fund (NELF)",
        description:
          "Interest-free tertiary education loan, repayable 3 years after graduation and once employed. Portal: portal.nelf.gov.ng",
      },
      {
        title: "Technical and Vocational Education Training (TVET)",
        description:
          "Free education plus a ₦45,000 monthly stipend per enrolled student. Portal: tvet.education.gov.ng",
      },
      {
        title: "3 Million Technical Talent (3MTT) Programme",
        description:
          "Nationwide IT skills training targeting 3 million people, with employment facilitation on completion. Portal: 3mtt.nitda.gov.ng",
      },
      {
        title: "NiYA Startup Grants",
        description:
          "₦1,000,000 for 200 youth-led startups; ₦500,000 for 100 informal sector beneficiaries. Portal: yid.fmyd.gov.ng/project-initiatives",
      },
      {
        title: "NiYA Gig Digital Work Platform",
        description:
          "Connects Nigerian youth to paid gig opportunities locally and globally. Portal: gigs.niya.gov.ng",
      },
      {
        title: "Youth Investment Fund (YIF)",
        description:
          "Financial support to start, sustain and scale youth-led businesses. Portal: yif.gov.ng",
      },
      {
        title: "National Youth Development Bank (NYDB)",
        description:
          "Dedicated bank providing capital access and financial services for young entrepreneurs. Portal: nydb.gov.ng",
      },
      {
        title: "Digital Literacy for All",
        description:
          "Free training and certification, targeting 70% digital literacy nationwide by 2027. Portal: digitalliteracy.gov.ng",
      },
      {
        title: "Labour Employment and Empowerment Programme (LEEP)",
        description:
          "Targets 2.5 million jobs through training, skills development and entrepreneurship support. Portal: leep.gov.ng",
      },
      {
        title: "NDE Renewed Hope Employment Initiative",
        description:
          "Vocational skills training with starter packs on completion; 33,000+ youth trained to date. Portal: nde.gov.ng",
      },
      {
        title: "CNG-Powered Tricycle Empowerment Scheme",
        description:
          "2,000 CNG-powered tricycles distributed as a livelihood and clean-energy initiative. Portal: cngtricycle.gov.ng",
      },
      {
        title: "Yo! Health Youth Initiative",
        description:
          "National campaign promoting health, wellness and healthy lifestyle choices. Portal: yohealth.gov.ng",
      },
      {
        title: "Ministry of Steel Development Youth Bootcamp",
        description:
          "Hands-on training in metallurgy, welding and mechanical design, with manufacturing-sector employment pathways. Portal: steeldevelopment.gov.ng",
      },
      {
        title: "Nigeria Health Fellowship",
        description:
          "Trains and employs 774 youth (one per LGA) to strengthen the national healthcare workforce. Portal: healthfellowship.gov.ng",
      },
      {
        title: "Reimagining Hope Creative Residency",
        description:
          "Funding, mentorship and industry placement for young creatives in film, music, fashion and tech. Portal: reimagininghope.gov.ng",
      },
      {
        title: "NextGen Resilience Corps",
        description:
          "Youth mobilization on climate action, environmental sustainability and locally-led innovation. Portal: nextgenresilience.gov.ng",
      },
      {
        title: "Stockholm Junior Water Prize (SJWP) Nigeria",
        description:
          "Annual competition for teenagers on water management innovation, with winners advancing to the global SJWP. Portal: sjwpnigeria.gov.ng",
      },
      {
        title: "SMEDAN Creative & Garment Studios",
        description:
          "Workspaces, equipment and market linkages for youth in the creative economy and fashion industry. Portal: smedan.gov.ng",
      },
      {
        title: "NDDC Youth Entrepreneurship Fund",
        description:
          "₦30 billion committed to youth entrepreneurship in the nine Niger Delta states. Portal: nddc.gov.ng",
      },
      {
        title: "AfDB $100M Loan for Youth & Women-Led Enterprises",
        description:
          "Targets 38,000+ youth- and women-led businesses with capital and business development support. Portal: afdb.org",
      },
    ],
  },
  {
    id: "application-tips",
    title: "Application Tips",
    summary:
      "Position your application to stand out and avoid common rejection causes.",
    items: [
      {
        title: "Before you apply",
        bullets: [
          "Confirm current deadlines and portal links directly with the organizing body — programs are frequently updated, paused or relaunched.",
          'Never pay an "application fee". Legitimate government and foundation grants do not charge to apply.',
          "Submit only one application per person/business per programme — duplicates trigger fraud flags.",
        ],
      },
      {
        title: "Common rejection causes to avoid",
        bullets: [
          "Incorrect or missing documents",
          "Mismatched names across documents",
          "Wrong BVN details",
          "Blurry or cut-off scans",
          "Multiple/duplicate submissions for the same program",
        ],
      },
    ],
  },
  {
    id: "general-checklist",
    title: "General Requirements Checklist",
    summary:
      "Prepare these in advance to speed up almost any application in this directory.",
    items: [
      {
        title: "Documents most programs ask for",
        bullets: [
          "Valid government ID — NIN, passport, voter\u2019s card, or driver\u2019s licence",
          "Bank Verification Number (BVN) linked to an active account",
          "Proof of residency (LASRRA ID for Lagos-specific programs)",
          "CAC business registration (required for larger grants; not always required for micro-grants)",
          "6 months of bank statements (personal or business)",
          "Recent, digital passport photographs",
          "A clear business plan or pitch with realistic financial projections",
          "Age verification where the program is youth-targeted (commonly 18–35)",
        ],
      },
    ],
  },
];

/* ────────────────────────────────────────────────────────────────────────
 * COMPONENT
 * ────────────────────────────────────────────────────────────────────── */

export default function GrowthHubScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    GrantCategoryId | "all"
  >("all");
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | GrantStatus>("all");
  const [activeSection, setActiveSection] = useState<GrowthSectionId>("grants");

  const categories: GrantCategory[] = useMemo(() => {
    const counts = GRANTS_DATA.reduce<Record<string, number>>((acc, g) => {
      acc[g.categoryId] = (acc[g.categoryId] ?? 0) + 1;
      return acc;
    }, {});
    const all: GrantCategory = {
      id: "all",
      name: "All",
      icon: "apps-outline",
      color: "#a78bfa",
      count: GRANTS_DATA.length,
    };
    const rest: GrantCategory[] = (
      Object.keys(GRANTS_CATEGORY_META) as GrantCategoryId[]
    )
      .filter((id) => counts[id] > 0)
      .map((id) => ({ id, count: counts[id], ...GRANTS_CATEGORY_META[id] }));
    return [all, ...rest];
  }, []);

  const handleSectionChange = (sectionId: GrowthSectionId) => {
    setActiveSection(sectionId);
    setShowFilterModal(false);
    if (sectionId !== "grants") {
      setSelectedCategory("all");
      setFilterStatus("all");
      setSearchQuery("");
      setSelectedGrant(null);
    }
  };

  const filteredGrants = useMemo(() => {
    let filtered = GRANTS_DATA;
    if (selectedCategory !== "all") {
      filtered = filtered.filter((g) => g.categoryId === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.organization.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q),
      );
    }
    if (filterStatus !== "all")
      filtered = filtered.filter((g) => g.status === filterStatus);
    return filtered;
  }, [selectedCategory, searchQuery, filterStatus]);

  const sectionSubtitle = useMemo(() => {
    if (activeSection === "business-aids")
      return "Discover incentives and tools to strengthen your business.";
    if (activeSection === "training-support")
      return "Access accelerators, mentorship, and skill-building.";
    return `${filteredGrants.length} grant opportunit${filteredGrants.length === 1 ? "y" : "ies"} available`;
  }, [activeSection, filteredGrants.length]);

  const getStatusStyle = (status: GrantStatus) => {
    if (status === "open")
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        dot: "#10b981",
        label: "Open",
      };
    if (status === "closing-soon")
      return {
        bg: "bg-amber-100",
        text: "text-amber-700",
        dot: "#f59e0b",
        label: "Closing soon",
      };
    return {
      bg: "bg-gray-100",
      text: "text-gray-500",
      dot: "#6b7280",
      label: "Closed",
    };
  };

  const handleApply = (grant: Grant) => {
    if (grant.applicationLink) {
      Linking.openURL(grant.applicationLink).catch(() =>
        alert(`Visit: ${grant.applicationLink}`),
      );
    } else {
      alert("No application portal listed yet — check back for updates.");
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 pb-8 bg-[${DARK_BG}]`}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View style={tw`bg-violet-700 px-5 pt-16 pb-5`}>
        <View style={tw`flex-row justify-between items-start mb-4`}>
          <View style={tw`flex-1 mr-3`}>
            <Text style={tw`text-white text-[22px] font-bold tracking-tight`}>
              Growth Hub
            </Text>
            <Text style={tw`text-white/55 text-[12px] mt-1`}>
              {sectionSubtitle}
            </Text>
          </View>
          {activeSection === "grants" && (
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
        <View
          style={tw`bg-white/12 border border-white/15 rounded-2xl px-4 h-[46px] flex-row items-center`}
        >
          <Ionicons
            name="search-outline"
            size={17}
            color="rgba(255,255,255,0.4)"
          />
          <TextInput
            style={tw`flex-1 ml-2.5 text-white text-[14px]`}
            placeholder={
              activeSection === "grants"
                ? "Search grants..."
                : "Search resources..."
            }
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            editable={activeSection === "grants"}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color="rgba(255,255,255,0.4)"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Section tabs ── */}
      <View style={tw`bg-[#0a0a18] border-b border-white/7`}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`px-5 gap-2`}
          style={tw`py-3`}
        >
          {GROWTH_SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <TouchableOpacity
                key={section.id}
                style={tw`px-4 py-2 rounded-full ${isActive ? "bg-violet-600" : "bg-white/7 border border-white/10"}`}
                onPress={() => handleSectionChange(section.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={tw`text-[13px] font-semibold ${isActive ? "text-white" : "text-white/45"}`}
                >
                  {section.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {activeSection === "grants" && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`px-5 gap-2 pb-3`}
          >
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={tw`flex-row items-center px-3.5 py-2 rounded-full ${isSelected ? "bg-violet-600" : "bg-white/5 border border-white/10"}`}
                  onPress={() => setSelectedCategory(category.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={15}
                    color={isSelected ? "#fff" : category.color}
                    style={tw`mr-1.5`}
                  />
                  <Text
                    style={tw`text-[12px] font-semibold ${isSelected ? "text-white" : "text-white/50"}`}
                  >
                    {category.name}
                  </Text>
                  <View
                    style={tw`ml-1.5 px-1.5 py-0.5 rounded-full ${isSelected ? "bg-white/20" : "bg-white/8"}`}
                  >
                    <Text
                      style={tw`text-[11px] font-bold ${isSelected ? "text-white" : "text-white/40"}`}
                    >
                      {category.count}
                    </Text>
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
        {activeSection === "grants" && (
          <RefreshableScrollView
            style={tw`flex-1 px-5 pt-4`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-24`}
          >
            {filteredGrants.length > 0 ? (
              filteredGrants.map((grant) => {
                const s = getStatusStyle(grant.status);
                return (
                  <TouchableOpacity
                    key={grant.id}
                    style={tw`bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-3`}
                    onPress={() => setSelectedGrant(grant)}
                    activeOpacity={0.75}
                  >
                    <View style={tw`flex-row justify-between items-start mb-3`}>
                      <View style={tw`flex-1 mr-3`}>
                        <Text
                          style={tw`text-gray-900 text-[14px] font-semibold leading-5 mb-0.5`}
                        >
                          {grant.title}
                        </Text>
                        <Text style={tw`text-gray-400 text-[12px]`}>
                          {grant.organization}
                        </Text>
                      </View>
                      <View
                        style={tw`flex-row items-center px-2.5 py-1 rounded-full ${s.bg}`}
                      >
                        <View
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: 3,
                            backgroundColor: s.dot,
                            marginRight: 5,
                          }}
                        />
                        <Text style={tw`text-[11px] font-semibold ${s.text}`}>
                          {s.label}
                        </Text>
                      </View>
                    </View>

                    <View style={tw`flex-row items-center gap-2 mb-3`}>
                      <View
                        style={tw`bg-violet-100 border border-violet-200 px-3 py-1 rounded-full`}
                      >
                        <Text style={tw`text-violet-700 font-bold text-[12px]`}>
                          {grant.amount}
                        </Text>
                      </View>
                      <View
                        style={tw`bg-gray-100 border border-gray-200 px-3 py-1 rounded-full`}
                      >
                        <Text
                          style={tw`text-gray-500 text-[11px] font-semibold`}
                        >
                          {grant.category}
                        </Text>
                      </View>
                    </View>

                    <View style={tw`flex-row items-center gap-1.5`}>
                      <Ionicons
                        name="calendar-outline"
                        size={13}
                        color="#9CA3AF"
                      />
                      <Text style={tw`text-gray-500 text-[12px]`}>
                        {grant.deadline}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View
                style={tw`bg-gray-50 border border-gray-200 rounded-2xl p-10 items-center mt-6`}
              >
                <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                <Text style={tw`text-gray-500 text-[14px] mt-4`}>
                  No grants found
                </Text>
                <Text style={tw`text-gray-400 text-[12px] mt-1`}>
                  Try adjusting your search or filters
                </Text>
              </View>
            )}

            <View
              style={tw`bg-blue-500/10 border border-blue-500/15 rounded-2xl p-4 mt-1 flex-row gap-2.5`}
            >
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#60a5fa"
                style={tw`mt-0.5`}
              />
              <Text style={tw`text-gray-500 text-[11.5px] flex-1 leading-4.5`}>
                Programs are frequently updated, paused, or relaunched. Always
                confirm current deadlines and portal links directly with the
                organizing body, and never pay an application fee -- legitimate
                government and foundation grants dont charge to apply.
              </Text>
            </View>
          </RefreshableScrollView>
        )}

        {/* Business aids */}
        {activeSection === "business-aids" && (
          <RefreshableScrollView
            style={tw`flex-1 px-5 pt-4`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-24`}
          >
            {BUSINESS_AIDS_RESOURCES.map((section) => (
              <View key={section.id} style={tw`mb-7`}>
                <Text
                  style={tw`text-gray-900 text-[15px] font-bold tracking-tight mb-1`}
                >
                  {section.title}
                </Text>
                {section.summary && (
                  <Text style={tw`text-gray-400 text-[12px] leading-5 mb-3`}>
                    {section.summary}
                  </Text>
                )}
                <View style={tw`gap-2.5`}>
                  {section.items.map((item, i) => (
                    <View
                      key={i}
                      style={tw`bg-gray-50 border border-gray-200 rounded-2xl p-4`}
                    >
                      <Text
                        style={tw`text-gray-900 text-[13px] font-semibold mb-1.5`}
                      >
                        {item.title}
                      </Text>
                      {item.description && (
                        <Text style={tw`text-gray-400 text-[12px] leading-5`}>
                          {item.description}
                        </Text>
                      )}
                      {item.bullets && (
                        <View style={tw`mt-2 gap-2`}>
                          {item.bullets.map((bullet, bi) => (
                            <View
                              key={bi}
                              style={tw`flex-row items-start gap-2`}
                            >
                              <View
                                style={tw`w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0`}
                              />
                              <Text
                                style={tw`text-gray-400 text-[12px] flex-1 leading-5`}
                              >
                                {bullet}
                              </Text>
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
        {activeSection === "training-support" && (
          <RefreshableScrollView
            style={tw`flex-1 px-5 pt-4`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-24`}
          >
            <View style={tw`bg-gray-50 border border-gray-200 rounded-2xl p-5`}>
              <View
                style={tw`w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 items-center justify-center mb-3`}
              >
                <Ionicons name="time-outline" size={20} color="#a78bfa" />
              </View>
              <Text style={tw`text-gray-900 text-[14px] font-semibold mb-2`}>
                Coming soon
              </Text>
              <Text style={tw`text-gray-400 text-[13px] leading-5`}>
                We are curating a catalogue of accelerators, mentorship
                programmes, and digital training resources. Check back soon for
                the latest opportunities designed to help your business scale.
              </Text>
            </View>
          </RefreshableScrollView>
        )}
      </View>

      {/* ── Grant detail modal ── */}
      <Modal
        visible={selectedGrant !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedGrant(null)}
      >
        {selectedGrant && (
          <SafeAreaView style={tw`flex-1 pb-8 bg-[${DARK_BG}]`}>
            <StatusBar style="dark" />

            {/* Modal header */}
            <View
              style={tw`px-5 py-4 border-b border-gray-200 flex-row justify-between items-center`}
            >
              <Text
                style={tw`text-gray-900 text-[17px] font-bold tracking-tight`}
              >
                Grant details
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedGrant(null)}
                style={tw`w-[34px] h-[34px] rounded-xl bg-gray-100 items-center justify-center`}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color="#374151" />
              </TouchableOpacity>
            </View>

            <RefreshableScrollView
              style={tw`flex-1 px-5 pt-5`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={tw`pb-8`}
            >
              <Text
                style={tw`text-gray-900 text-[20px] font-bold tracking-tight leading-7 mb-1`}
              >
                {selectedGrant.title}
              </Text>
              <Text style={tw`text-gray-400 text-[13px] mb-5`}>
                {selectedGrant.organization}
              </Text>

              {/* Amount & deadline */}
              <View style={tw`flex-row gap-3 mb-6`}>
                <View
                  style={tw`flex-1 bg-violet-100 border border-violet-200 rounded-2xl p-4`}
                >
                  <Text
                    style={tw`text-violet-700 font-bold text-[15px] text-center`}
                  >
                    {selectedGrant.amount}
                  </Text>
                  <Text
                    style={tw`text-violet-500 text-[11px] text-center mt-1`}
                  >
                    Grant amount
                  </Text>
                </View>
                <View
                  style={tw`flex-1 bg-amber-50 border border-amber-200 rounded-2xl p-4`}
                >
                  <Text
                    style={tw`text-amber-700 font-bold text-[13px] text-center`}
                  >
                    {selectedGrant.deadline}
                  </Text>
                  <Text style={tw`text-amber-600 text-[11px] text-center mt-1`}>
                    Deadline
                  </Text>
                </View>
              </View>

              {/* Description */}
              <View style={tw`mb-5`}>
                <Text style={tw`text-gray-900 text-[13px] font-semibold mb-2`}>
                  Description
                </Text>
                <Text style={tw`text-gray-400 text-[13px] leading-6`}>
                  {selectedGrant.description}
                </Text>
              </View>

              {/* Requirements */}
              {selectedGrant.requirements.length > 0 && (
                <View style={tw`mb-5`}>
                  <Text
                    style={tw`text-gray-900 text-[13px] font-semibold mb-2`}
                  >
                    Requirements
                  </Text>
                  <View
                    style={tw`bg-blue-500/10 border border-blue-500/15 rounded-2xl p-4 gap-2.5`}
                  >
                    {selectedGrant.requirements.map((req, i) => (
                      <View key={i} style={tw`flex-row items-start gap-2`}>
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="#60a5fa"
                          style={tw`mt-0.5`}
                        />
                        <Text
                          style={tw`text-gray-600 text-[13px] flex-1 leading-5`}
                        >
                          {req}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Eligibility */}
              <View style={tw`mb-5`}>
                <Text style={tw`text-gray-900 text-[13px] font-semibold mb-2`}>
                  Eligibility
                </Text>
                <View style={tw`flex-row flex-wrap gap-2`}>
                  {selectedGrant.eligibility.map((item, i) => (
                    <View
                      key={i}
                      style={tw`bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full`}
                    >
                      <Text
                        style={tw`text-emerald-700 text-[12px] font-semibold`}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Contact */}
              {selectedGrant.contact && (
                <View style={tw`flex-row items-center gap-2 mb-2`}>
                  <Ionicons name="call-outline" size={14} color="#9CA3AF" />
                  <Text style={tw`text-gray-500 text-[12px]`}>
                    {selectedGrant.contact}
                  </Text>
                </View>
              )}
            </RefreshableScrollView>

            {/* Apply button */}
            <View style={tw`px-5 py-4 border-t border-gray-200`}>
              <TouchableOpacity
                style={tw`bg-violet-600 h-[52px] rounded-2xl flex-row items-center justify-center gap-2 mb-3`}
                activeOpacity={0.85}
                onPress={() => handleApply(selectedGrant)}
              >
                <Ionicons name="paper-plane-outline" size={17} color="#fff" />
                <Text style={tw`text-white font-semibold text-[15px]`}>
                  Apply now
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`py-2 items-center`}
                onPress={() => setSelectedGrant(null)}
                activeOpacity={0.7}
              >
                <Text style={tw`text-gray-400 text-[13px] font-semibold`}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </Modal>

      {/* ── Filter modal ── */}
      <Modal visible={showFilterModal} animationType="slide" transparent>
        <View style={tw`flex-1 justify-end bg-black/60`}>
          <View
            style={tw`bg-gray-50 border-t border-gray-200 rounded-t-3xl pt-6 pb-10`}
          >
            <View
              style={tw`px-5 pb-4 border-b border-gray-200 flex-row justify-between items-center`}
            >
              <Text
                style={tw`text-gray-900 text-[17px] font-bold tracking-tight`}
              >
                Filter grants
              </Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={tw`w-[34px] h-[34px] rounded-xl bg-gray-100 items-center justify-center`}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={tw`px-5 pt-5`}>
              <Text
                style={tw`text-gray-600 text-[12px] font-semibold tracking-wide uppercase mb-3`}
              >
                Status
              </Text>
              <View style={tw`gap-2.5 mb-6`}>
                {[
                  { value: "all", label: "All statuses" },
                  { value: "open", label: "Open" },
                  { value: "closing-soon", label: "Closing soon" },
                  { value: "closed", label: "Closed" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={tw`border ${filterStatus === option.value ? "border-violet-500 bg-violet-100" : "border-gray-200 bg-gray-50"} rounded-2xl px-4 h-[48px] flex-row items-center`}
                    onPress={() =>
                      setFilterStatus(option.value as "all" | GrantStatus)
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={tw`text-[14px] font-semibold ${filterStatus === option.value ? "text-violet-700" : "text-gray-500"}`}
                    >
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
                <Text style={tw`text-white font-semibold text-[15px]`}>
                  Apply filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
