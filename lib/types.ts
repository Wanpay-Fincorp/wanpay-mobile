export interface User {
  id: string;
  phone: string;
  fullName: string | null;
  email: string | null;
  dateOfBirth: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
  avatarUrl: string | null;
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  status: string;
  isVerified: boolean;
  isTwoFactorEnabled: boolean;
  isBiometricEnabled: boolean;
  accountNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  balance: number;
  ledgerBalance: number;
  accountNumber: string | null;
}

export interface Transaction {
  id: string;
  type: 'SENT' | 'RECEIVED' | 'BILLS' | 'FUNDING' | 'WITHDRAWAL';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  amount: number;
  fee: number;
  reference: string;
  description: string | null;
  recipientName: string | null;
  recipientAccount: string | null;
  recipientBank: string | null;
  recipientBankCode: string | null;
  billCategory: string | null;
  billProvider: string | null;
  billRecipient: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Bank {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface AccountValidation {
  accountName: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
  user: User;
}

export interface OtpResponse {
  message: string;
  expiresIn: number;
}

export interface OtpVerifyResponse {
  userId: string;
  isNewUser: boolean;
  message: string;
}

export interface BillProvider {
  id: string;
  category: string;
  name: string;
  code: string;
  color: string | null;
  isActive: boolean;
}

export interface BillPlan {
  id: string;
  providerId: string;
  name: string;
  price: number;
  validity: string | null;
  speed: string | null;
}

export interface BillValidation {
  customerName: string;
  address?: string;
}

export interface Card {
  id: string;
  type: 'DEBIT' | 'CREDIT' | 'VIRTUAL';
  last4: string;
  holderName: string;
  expiryDate: string;
  bin: string | null;
  isDefault: boolean;
  status: 'ACTIVE' | 'BLOCKED' | 'EXPIRED';
  createdAt: string;
}

export interface TransactionLimit {
  id: string;
  tier: string;
  type: string;
  maxAmount: number;
}

export interface LimitIncreaseRequest {
  id: string;
  limitType: string;
  currentAmount: number;
  requestedAmount: number;
  status: string;
  createdAt: string;
}

export interface NotificationSetting {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  transactionAlerts: boolean;
  paymentReminders: boolean;
  billPaymentAlerts: boolean;
  balanceUpdates: boolean;
  securityAlerts: boolean;
  promotionalNotifications: boolean;
  grantOpportunities: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  response: string | null;
  createdAt: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Grant {
  id: string;
  title: string;
  organization: string;
  amount: string;
  category: string;
  deadline: string;
  status: string;
  description: string;
  requirements: string[];
  eligibility: string[];
  applicationLink: string | null;
}

export interface GrantCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface UserLimits {
  tier: string;
  dailyTransfer: { current: number; max: number };
  monthlyTransfer: { current: number; max: number };
  singleTransaction: { current: number; max: number };
  dailyBillPayment: { current: number; max: number };
  atmWithdrawal?: { current: number; max: number };
}
