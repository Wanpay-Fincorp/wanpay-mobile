# WanPay — Mobile App

React Native (Expo) mobile wallet and financial growth platform for Nigerian entrepreneurs.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo 54 (React Native 0.81) |
| Routing | Expo Router 6 (file-based) |
| Styling | Tailwind CSS via `twrnc` |
| Icons | Ionicons (`@expo/vector-icons`) |
| Secure Storage | `expo-secure-store` |
| HTTP Client | Custom fetch wrapper |
| Auth | JWT (access + refresh tokens) + PIN |
| Biometrics | `expo-local-authentication` (unused) |

## Screen Map (27 Routes)

| Route | Screen | Purpose |
|-------|--------|---------|
| `/` | Redirect | → `/welcome` |
| `/welcome` | Welcome | Onboarding with Login/Signup CTAs |
| `/login` | Login | Phone + PIN login |
| `/signup` | Signup | Name, phone, email registration |
| `/otp` | OTP | 6-digit OTP verification |
| `/createPin` | Create PIN | 4-digit transaction PIN setup |
| `/(tabs)` | Tab Layout | Bottom tab navigator (6 tabs) |
| `/(tabs)/` | Home | Balance, quick actions, recent txns |
| `/(tabs)/transfer` | Transfer | Send money (bank list, validation, PIN) |
| `/(tabs)/bills` | Bills | Bill categories overview |
| `/(tabs)/history` | History | Transaction list (paginated, filterable) |
| `/(tabs)/grants` | Growth Hub | Grants, business aids, training |
| `/(tabs)/profile` | Profile | User settings & management |
| `/bills/airtime` | Airtime | Buy airtime |
| `/bills/data` | Data | Buy data bundles |
| `/bills/electricity` | Electricity | Pay electricity bills |
| `/bills/tv` | TV | TV subscriptions (DSTV, GOtv) |
| `/bills/internet` | Internet | Broadband/internet plans |
| `/bills/education` | Education | Education payments (WAEC, JAMB) |
| `/profile/personal-information` | Personal Info | Edit name, email, address |
| `/profile/security-settings` | Security | Change PIN, biometric, 2FA |
| `/profile/transaction-limits` | Limits | View current transaction limits |
| `/profile/increase-limits` | Increase Limits | Request limit increase |
| `/profile/notifications` | Notifications | Toggle notification preferences |
| `/profile/manage-cards` | Cards | View/manage virtual cards |
| `/profile/bvn-verification` | BVN | BVN identity verification |
| `/profile/help-support` | Help | FAQ + contact support |

## Setup

```bash
# Install dependencies
npm install

# Create environment file
# Add your backend URL:
# EXPO_PUBLIC_API_URL=http://192.168.x.x:4000/api/v1

# Start dev server
npx expo start
```

Scan the QR code with **Expo Go** (Android/iOS) to run on your device.

### Builds

```bash
# Android APK
npx eas build --platform android --profile preview

# iOS IPA (requires Apple Developer account)
npx eas build --platform ios --profile preview

# Production
npx eas build --platform all --profile production
```

## Project Structure

```
wanpay/
├── app/                    # Expo Router pages
│   ├── _layout.tsx         # Root stack navigator
│   ├── index.tsx           # Entry → redirects to /welcome
│   ├── welcome.tsx         # Onboarding screen
│   ├── login.tsx
│   ├── signup.tsx
│   ├── otp.tsx
│   ├── createPin.tsx
│   ├── (tabs)/             # Bottom tab navigator
│   │   ├── _layout.tsx
│   │   ├── index.tsx       # Home
│   │   ├── transfer.tsx
│   │   ├── bills.tsx
│   │   ├── history.tsx
│   │   ├── grants.tsx
│   │   └── profile.tsx
│   ├── bills/              # Bill payment sub-screens
│   └── profile/            # Profile sub-screens
├── components/             # Shared components
│   ├── ui/                 # UI primitives (Button, Input, etc.)
│   ├── BalanceCard.tsx
│   ├── TransactionItem.tsx
│   ├── QuickAction.tsx
│   └── ...
├── constants/              # Colors, theme tokens
├── hooks/                  # Custom hooks
├── lib/
│   ├── api.ts              # HTTP client (fetch + token mgmt)
│   └── types.ts            # TypeScript interfaces
└── assets/                 # Images, fonts
```

## Action To Do (ATD)

### 🔴 Critical

- ~~**Hardcoded API URL**~~ ✅ switched to `process.env.EXPO_PUBLIC_API_URL` with IP fallback + `.env.example`
- ~~**No auth route guards**~~ ✅ added `useAuth()` redirects to `(tabs)/_layout`, `welcome`, `login`, `signup`
- ~~**Missing `modal` screen**~~ ✅ removed from `_layout.tsx`
- ~~**"Add Money" is UI-only**~~ ✅ wired with placeholder alert
- ~~**"Receive" quick action navigates to itself**~~ ✅ wired with placeholder alert
- ~~**ThemeProvider commented out**~~ ✅ uncommented in `_layout.tsx`
- ~~**No persistent state management**~~ ✅ added `contexts/AuthContext.tsx` — wraps app, provides `user`/`token`/`signIn`/`signOut`/`refreshUser`
- [ ] **Zero tests** — no Jest, no React Native Testing Library

### 🟡 Moderate

- ~~"Coming soon" placeholders: 2FA, Add Card, Training section~~ ✅ already handled
- [ ] UI primitives (`Button`, `Input`) defined but unused — screens use inline styles
- [ ] `expo-local-authentication` and `expo-ssl-pinning` installed but unused
- ~~`console.log` in production code~~ ✅ fixed
- ~~Type duplication~~ ✅ consolidated to `@/lib/types`
- ~~Stale grant deadlines~~ ✅ updated to 2026
- ~~`RefreshableScrollView` with no-op `onRefresh`~~ ✅ made optional
- ~~`use-grants.ts` imports from screen file~~ ✅ fixed

### 🟢 Minor

- ~~Tailwind build pipeline~~ ✅ removed dead files + scripts
- ~~Notification bell icon~~ ✅ wired to `/profile/notifications`
- ~~Settings gear icon~~ ✅ wired to `/profile/security-settings`
- ~~Tier 3 upgrade button~~ ✅ wired to `/profile/increase-limits`
