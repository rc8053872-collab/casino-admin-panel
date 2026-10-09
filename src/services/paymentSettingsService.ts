import { adminRequest } from '../lib/adminApi';

export interface PaymentSettingsRecord {
  configured: boolean;
  upiId: string | null;
  qrCodeUrl: string | null;
  withdrawFeePercent?: number;
  updatedAt: string | null;
}

export const paymentSettingsService = {
  get: () => adminRequest<PaymentSettingsRecord>('/admin/payments/settings'),
  save: (settings: { upiId: string; qrCodeUrl: string; withdrawFeePercent?: number }) =>
    adminRequest<PaymentSettingsRecord>('/admin/payments/settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    })
};
