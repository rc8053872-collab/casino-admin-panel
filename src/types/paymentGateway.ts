export type GatewayStatus = 'active' | 'disabled' | 'configured' | 'maintenance';

export type PaymentMethodCategory = 'upi' | 'bank_transfer' | 'card' | 'other';

export type SettlementCycle = 'instant' | 't1' | 't2' | 'batch_daily';

export type DepositPipelineStatus =
  | 'Pending'
  | 'Processing'
  | 'Success'
  | 'Failed'
  | 'Expired'
  | 'Refunded';

export type WithdrawalPipelineStatus =
  | 'Requested'
  | 'KycCheck'
  | 'AdminReview'
  | 'ProviderQueue'
  | 'Processing'
  | 'Settled'
  | 'Rejected';

export interface PaymentMethodItem {
  id: string;
  category: PaymentMethodCategory;
  name: string;
  status: GatewayStatus;
  subMethods: string[];
  successRate: number;
  todayVolume: number;
  todayTxnCount: number;
  settlementSpeed: string;
  settlementCycle: SettlementCycle;
  lastSyncAt: string;
  isSandbox: boolean;
  providerName: string;
  feePercentage: number;
  minAmount: number;
  maxAmount: number;
  description: string;
}

export interface GatewayOverviewKpis {
  activeGateways: number;
  totalGateways: number;
  upiCollectionStatus: 'active' | 'offline' | 'degraded';
  todayDepositsVolume: number;
  todayDepositsGrowth: number;
  successRate: number;
  pendingSettlementAmount: number;
  pendingSettlementCount: number;
}

export interface UpiConfigData {
  vpa: string;
  merchantName: string;
  accountNumberMasked: string;
  ifscCode: string;
  bankName: string;
  status: 'active' | 'paused' | 'testing';
  isSandbox: boolean;
  dailyCollectionLimit: number;
  currentDayCollected: number;
  perTxnMin: number;
  perTxnMax: number;
  qrValidityMinutes: number;
  autoVerifyDelaySec: number;
}

export interface PaymentSettingsData {
  environment: 'sandbox' | 'production';
  defaultSettlementCycle: SettlementCycle;
  webhookUrl: string;
  webhookSecret: string;
  autoReconciliation: boolean;
  reconciliationIntervalMinutes: number;
  minDepositAmount: number;
  maxDepositAmount: number;
  minWithdrawalAmount: number;
  maxWithdrawalAmount: number;
  requireAadhaarForHighValue: boolean;
  aadhaarThresholdAmount: number;
  enabledProviders: {
    upi: boolean;
    imps: boolean;
    neft: boolean;
    cards: boolean;
    netbanking: boolean;
  };
  keys: {
    razorpayKeyId: string;
    razorpayKeySecret: string;
    cashfreeAppId: string;
    cashfreeSecretKey: string;
    customUpiGatewayKey: string;
  };
}

export interface AadhaarKycRecord {
  id: string;
  playerId: string;
  playerName: string;
  aadhaarNumberMasked: string;
  aadhaarLastFour: string;
  dob: string;
  gender: 'M' | 'F' | 'O';
  state: string;
  verificationSource: 'UIDAI_OTP' | 'OFFLINE_XML' | 'MANUAL_ADMIN_DOC';
  status: 'verified' | 'pending' | 'rejected';
  verifiedAt: string;
  verifiedBy: string;
  frontDocUrl?: string;
  backDocUrl?: string;
  notes?: string;
}

export interface MultiQrItem {
  id: string;
  amount: number;
  label: string;
  note?: string;
  dataUrl?: string;
  uri?: string;
}
