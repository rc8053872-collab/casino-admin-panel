export type KycStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'NEEDS_INFORMATION';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type VerificationType =
  | 'Identity'
  | 'PAN'
  | 'Bank'
  | 'Full KYC'
  | 'Identity + PAN';

export type WithdrawalStatus = 'Enabled' | 'Locked';

export type KycCheckStatus =
  | 'VERIFIED'
  | 'PENDING'
  | 'REJECTED'
  | 'NEEDS_INFORMATION'
  | 'FAILED';

export interface KycCheckItem {
  type: 'Identity' | 'Age' | 'PAN' | 'Address' | 'Bank';
  status: KycCheckStatus;
  matchScore?: number;
  details?: string;
  verifiedAt?: string;
}

export interface KycRiskProfile {
  score: number; // 0 - 100
  level: RiskLevel;
  duplicateAccount: boolean;
  suspiciousActivity: boolean;
  multipleDevices: boolean;
  withdrawalRisk: 'Low' | 'Medium' | 'High';
  flags: string[];
}

export interface KycHistoryEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details?: string;
  previousStatus?: KycStatus;
  newStatus?: KycStatus;
}

export interface KycPlayer {
  id: string; // e.g. 'PLR-10892'
  playerId: string; // '#10892'
  name: string; // 'Rahul Sharma'
  avatar: string; // 'RS'
  panMasked: string; // 'XXXXXX4821'
  aadhaarMasked: string; // 'XXXX XXXX 4821'
  phoneMasked: string; // '+91 98XXX X4921'
  emailMasked: string; // 'r****@example.com'
  joinedDate: string; // '15 Sep 2026'
  walletBalance: number; // 18420
  kycStatus: KycStatus;
  riskLevel: RiskLevel;
  riskScore: number;
  withdrawalStatus: WithdrawalStatus;
  verificationType: string;
  submittedDate: string; // '06 Oct 2026'
  verifiedDate?: string;
  nameMatchScore: number; // e.g. 98%
  dobMatch: 'Matched' | 'Mismatched' | 'Pending';
  checks: Record<'Identity' | 'Age' | 'PAN' | 'Address' | 'Bank', KycCheckStatus>;
  riskDetails: KycRiskProfile;
  history: KycHistoryEvent[];
  notes?: string;
  rejectionReason?: string;
  infoRequested?: string[];
}

export interface KycStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  riskReview: number;
  needsInformation: number;
}

export interface KycFilterParams {
  search?: string;
  status?: string;
  risk?: string;
  dateRange?: string; // 'today' | '7d' | '30d' | 'all' | 'custom'
  verificationType?: string;
}

export type KycModalType = 'approve' | 'reject' | 'request_info' | null;
