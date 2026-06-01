/**
 * Valkyria Launcher Core Types
 */

export type ScreenType = 'LOADING' | 'DASHBOARD' | 'RECARGA' | 'SALDO';

export interface LauncherOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  actionType: 'ROUTE' | 'EXTERNAL_LINK';
  target: string; // url or path
  badge?: string;
}

export interface RechargePackage {
  id: string;
  amount: number;
  bonus: string;
  price: string;
  currency: string;
  popular?: boolean;
}

export type PaymentMethod = 'CREDIT_CARD' | 'CRYPTO' | 'MOBILE_PAY' | 'VALK_TOKEN';

export interface RechargeTransaction {
  id: string;
  packageId: string;
  amount: number;
  price: string;
  method: PaymentMethod;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  timestamp: string;
  hash: string;
}
