import QRCode from 'qrcode';
import type {
  PaymentMethodItem,
  GatewayOverviewKpis,
  UpiConfigData,
  PaymentSettingsData,
  AadhaarKycRecord,
  MultiQrItem,
} from '../types/paymentGateway';

const PAYMENT_METHODS_KEY = 'game_admin_payment_methods_v1';
const UPI_CONFIG_KEY = 'game_admin_upi_config_v1';
const PAYMENT_SETTINGS_KEY = 'game_admin_payment_settings_v1';
const AADHAAR_KYC_KEY = 'game_admin_aadhaar_kyc_v1';

const INITIAL_METHODS: PaymentMethodItem[] = [
  {
    id: 'method-upi',
    category: 'upi',
    name: 'UPI',
    status: 'active',
    subMethods: ['UPI Intent', 'UPI QR'],
    successRate: 99.1,
    todayVolume: 584000,
    todayTxnCount: 1240,
    settlementSpeed: 'Instant (Real-Time)',
    settlementCycle: 'instant',
    lastSyncAt: 'Just now',
    isSandbox: true,
    providerName: 'Sandbox UPI Gateway (Simulated)',
    feePercentage: 0.0,
    minAmount: 100,
    maxAmount: 100000,
    description: 'Instant mobile UPI collection via PhonePe, GPay, Paytm and QR codes.',
  },
  {
    id: 'method-bank',
    category: 'bank_transfer',
    name: 'BANK TRANSFER',
    status: 'active',
    subMethods: ['IMPS', 'NEFT', 'RTGS'],
    successRate: 97.8,
    todayVolume: 258000,
    todayTxnCount: 184,
    settlementSpeed: 'T+1 Working Day',
    settlementCycle: 't1',
    lastSyncAt: '3 min ago',
    isSandbox: true,
    providerName: 'Sandbox Node (Virtual Accounts)',
    feePercentage: 0.25,
    minAmount: 500,
    maxAmount: 500000,
    description: 'Direct account-to-account settlements with auto-reconciled UTR references.',
  },
  {
    id: 'method-card',
    category: 'card',
    name: 'CARD',
    status: 'disabled',
    subMethods: ['Credit Cards', 'Debit Cards'],
    successRate: 0.0,
    todayVolume: 0,
    todayTxnCount: 0,
    settlementSpeed: 'T+2 Days (Standard)',
    settlementCycle: 't2',
    lastSyncAt: 'Never connected',
    isSandbox: true,
    providerName: 'PCI-DSS Provider (Pending)',
    feePercentage: 1.85,
    minAmount: 200,
    maxAmount: 50000,
    description: 'Card acquiring rails are disabled until merchant MID is authorized.',
  },
  {
    id: 'method-other',
    category: 'other',
    name: 'OTHER',
    status: 'configured',
    subMethods: ['NetBanking (54 Banks)', 'Wallet Aggregator'],
    successRate: 96.4,
    todayVolume: 0,
    todayTxnCount: 0,
    settlementSpeed: 'T+1 End of Day',
    settlementCycle: 't1',
    lastSyncAt: 'Yesterday 18:30',
    isSandbox: true,
    providerName: 'Aggregator Switchboard',
    feePercentage: 1.2,
    minAmount: 100,
    maxAmount: 200000,
    description: 'Supplementary payment rails configured for high-availability failover.',
  },
];

const INITIAL_UPI_CONFIG: UpiConfigData = {
  vpa: 'payments@demo',
  merchantName: 'GAME ADMIN DEMO OPS',
  accountNumberMasked: '••••••••9841',
  ifscCode: 'HDFC0001824',
  bankName: 'HDFC Bank - Commercial Branch',
  status: 'active',
  isSandbox: true,
  dailyCollectionLimit: 1000000,
  currentDayCollected: 584000,
  perTxnMin: 100,
  perTxnMax: 100000,
  qrValidityMinutes: 15,
  autoVerifyDelaySec: 3,
};

const INITIAL_SETTINGS: PaymentSettingsData = {
  environment: 'sandbox',
  defaultSettlementCycle: 'instant',
  webhookUrl: 'https://api.gameadmin.internal/v1/payments/webhook',
  webhookSecret: 'whsec_sand_9f82k39a82fbc89e3204981',
  autoReconciliation: true,
  reconciliationIntervalMinutes: 5,
  minDepositAmount: 100,
  maxDepositAmount: 100000,
  minWithdrawalAmount: 500,
  maxWithdrawalAmount: 200000,
  requireAadhaarForHighValue: true,
  aadhaarThresholdAmount: 50000,
  enabledProviders: {
    upi: true,
    imps: true,
    neft: true,
    cards: false,
    netbanking: true,
  },
  keys: {
    razorpayKeyId: 'rzp_test_sand_948271049281',
    razorpayKeySecret: '••••••••••••••••••••••••••••••••',
    cashfreeAppId: 'CF_SANDBOX_74829104',
    cashfreeSecretKey: '••••••••••••••••••••••••••••••••',
    customUpiGatewayKey: 'upi_sec_sand_948194821',
  },
};

const INITIAL_AADHAAR_RECORDS: AadhaarKycRecord[] = [
  {
    id: 'aadhaar-1',
    playerId: 'PLR-10482',
    playerName: 'Rohit Kumar',
    aadhaarNumberMasked: 'XXXX-XXXX-4921',
    aadhaarLastFour: '4921',
    dob: '1992-05-14',
    gender: 'M',
    state: 'Maharashtra',
    verificationSource: 'UIDAI_OTP',
    status: 'verified',
    verifiedAt: '2026-08-12 15:45',
    verifiedBy: 'System Auto-UIDAI',
    notes: 'Aadhaar biometric OTP verified with NSDL backend.',
  },
  {
    id: 'aadhaar-2',
    playerId: 'PLR-10821',
    playerName: 'Priya Sharma',
    aadhaarNumberMasked: 'XXXX-XXXX-8832',
    aadhaarLastFour: '8832',
    dob: '1995-11-20',
    gender: 'F',
    state: 'Delhi NCR',
    verificationSource: 'UIDAI_OTP',
    status: 'verified',
    verifiedAt: '2026-09-01 10:15',
    verifiedBy: 'System Auto-UIDAI',
    notes: 'Aadhaar XML authenticated. Ready for high-volume deposits.',
  },
];

class PaymentGatewayService {
  // ── Payment Methods ──
  public getPaymentMethods(): PaymentMethodItem[] {
    try {
      const raw = localStorage.getItem(PAYMENT_METHODS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed reading payment methods from localStorage', e);
    }
    this.savePaymentMethods(INITIAL_METHODS);
    return INITIAL_METHODS;
  }

  public savePaymentMethods(methods: PaymentMethodItem[]): void {
    try {
      localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(methods));
    } catch (e) {
      console.error('Failed saving payment methods', e);
    }
  }

  public updateMethodStatus(id: string, status: PaymentMethodItem['status']): PaymentMethodItem[] {
    const list = this.getPaymentMethods().map((m) =>
      m.id === id ? { ...m, status, lastSyncAt: 'Just now' } : m
    );
    this.savePaymentMethods(list);
    return list;
  }

  public updateMethod(updated: PaymentMethodItem): PaymentMethodItem[] {
    const list = this.getPaymentMethods().map((m) =>
      m.id === updated.id ? { ...updated, lastSyncAt: 'Just now' } : m
    );
    this.savePaymentMethods(list);
    return list;
  }

  public addPaymentMethod(item: Omit<PaymentMethodItem, 'id' | 'lastSyncAt'>): PaymentMethodItem[] {
    const list = this.getPaymentMethods();
    const newItem: PaymentMethodItem = {
      ...item,
      id: `method-${Date.now()}`,
      lastSyncAt: 'Just now',
    };
    const updated = [...list, newItem];
    this.savePaymentMethods(updated);
    return updated;
  }

  // ── Overview KPIs ──
  public getOverviewKpis(): GatewayOverviewKpis {
    const methods = this.getPaymentMethods();
    const activeGateways = methods.filter((m) => m.status === 'active').length;
    const upi = methods.find((m) => m.category === 'upi');

    return {
      activeGateways,
      totalGateways: methods.length,
      upiCollectionStatus: upi?.status === 'active' ? 'active' : 'offline',
      todayDepositsVolume: 842000,
      todayDepositsGrowth: 14.8,
      successRate: 98.6,
      pendingSettlementAmount: 42000,
      pendingSettlementCount: 14,
    };
  }

  // ── UPI Configuration ──
  public getUpiConfig(): UpiConfigData {
    try {
      const raw = localStorage.getItem(UPI_CONFIG_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed reading UPI config from localStorage', e);
    }
    this.saveUpiConfig(INITIAL_UPI_CONFIG);
    return INITIAL_UPI_CONFIG;
  }

  public saveUpiConfig(config: UpiConfigData): void {
    try {
      localStorage.setItem(UPI_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed saving UPI config', e);
    }
  }

  public updateUpiVpa(newVpa: string): UpiConfigData {
    const current = this.getUpiConfig();
    const updated = { ...current, vpa: newVpa.trim() };
    this.saveUpiConfig(updated);
    return updated;
  }

  // ── QR Code Generation ──
  public buildUpiPayUri(amount?: number, note = 'Game Deposit Demo'): string {
    const config = this.getUpiConfig();
    const cleanVpa = config.vpa || 'payments@demo';
    const merchant = encodeURIComponent(config.merchantName || 'GAME ADMIN DEMO');
    const tn = encodeURIComponent(note);

    let uri = `upi://pay?pa=${cleanVpa}&pn=${merchant}&cu=INR&tn=${tn}`;
    if (amount && amount > 0) {
      uri += `&am=${amount.toFixed(2)}`;
    }
    return uri;
  }

  public async generateQrDataUrl(amount?: number, note?: string): Promise<string> {
    const uri = this.buildUpiPayUri(amount, note);
    try {
      return await QRCode.toDataURL(uri, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      });
    } catch (err) {
      console.error('Failed generating QR code', err);
      // Fallback empty SVG
      return '';
    }
  }

  // ── Multi-QR Batch Generation ──
  public async generateMultiQrs(
    items: Array<{ id: string; amount: number; label: string; note?: string }>
  ): Promise<MultiQrItem[]> {
    const promises = items.map(async (item) => {
      const uri = this.buildUpiPayUri(item.amount, item.note || `Deposit ₹${item.amount}`);
      let dataUrl = '';
      try {
        dataUrl = await QRCode.toDataURL(uri, {
          width: 320,
          margin: 2,
          color: {
            dark: '#0F172A',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        });
      } catch (err) {
        console.error(`Failed to generate QR for ₹${item.amount}`, err);
      }

      return {
        ...item,
        uri,
        dataUrl,
      };
    });

    return Promise.all(promises);
  }

  public downloadQrPng(dataUrl: string, filename: string): void {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ── Settings ──
  public getPaymentSettings(): PaymentSettingsData {
    try {
      const raw = localStorage.getItem(PAYMENT_SETTINGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed reading payment settings', e);
    }
    this.savePaymentSettings(INITIAL_SETTINGS);
    return INITIAL_SETTINGS;
  }

  public savePaymentSettings(settings: PaymentSettingsData): void {
    try {
      localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed saving payment settings', e);
    }
  }

  // ── Aadhaar KYC Management ──
  public getAadhaarRecords(): AadhaarKycRecord[] {
    try {
      const raw = localStorage.getItem(AADHAAR_KYC_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed reading Aadhaar KYC from storage', e);
    }
    this.saveAadhaarRecords(INITIAL_AADHAAR_RECORDS);
    return INITIAL_AADHAAR_RECORDS;
  }

  public saveAadhaarRecords(records: AadhaarKycRecord[]): void {
    try {
      localStorage.setItem(AADHAAR_KYC_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed saving Aadhaar KYC', e);
    }
  }

  public addAadhaarRecord(record: {
    playerId: string;
    playerName: string;
    aadhaarNumber: string; // 12 digits
    dob: string;
    gender: 'M' | 'F' | 'O';
    state: string;
    notes?: string;
  }): AadhaarKycRecord {
    const list = this.getAadhaarRecords();
    const cleanNum = record.aadhaarNumber.replace(/\D/g, '');
    const lastFour = cleanNum.slice(-4) || '9999';
    const masked = `XXXX-XXXX-${lastFour}`;

    const newRecord: AadhaarKycRecord = {
      id: `aadhaar-${Date.now()}`,
      playerId: record.playerId,
      playerName: record.playerName,
      aadhaarNumberMasked: masked,
      aadhaarLastFour: lastFour,
      dob: record.dob,
      gender: record.gender,
      state: record.state,
      verificationSource: 'UIDAI_OTP',
      status: 'verified',
      verifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      verifiedBy: 'Admin Verification System',
      notes: record.notes || 'Aadhaar identity card validated for wallet deposit compliance.',
    };

    const updated = [newRecord, ...list.filter((r) => r.playerId !== record.playerId)];
    this.saveAadhaarRecords(updated);
    return newRecord;
  }

  public isAadhaarVerified(playerId: string): boolean {
    const records = this.getAadhaarRecords();
    return records.some((r) => r.playerId === playerId && r.status === 'verified');
  }

  public getPlayerAadhaar(playerId: string): AadhaarKycRecord | undefined {
    const records = this.getAadhaarRecords();
    return records.find((r) => r.playerId === playerId);
  }
}

export const paymentGatewayService = new PaymentGatewayService();
