import { XMoneyResource } from '../XMoneyResource';
import { Pagination } from '../types';

export interface Transaction {
  id: number;
  siteId?: number;
  externalOrderId?: string;
  amount: number;
  currency: string;
  originalAmount?: number;
  originalCurrency?: string;
  refundedAmount?: number;
  description?: string;
  customerCountry?: string;
  creationDate?: string;
  creationTimestamp?: number;
  transactionSource?: string;
  cardProviderId?: number;
  cardProvider?: string;
  cardProviderName?: string;
  cardHolderName?: string;
  cardHolderCountry?: string;
  cardHolderState?: string;
  cardType?: string;
  cardNumber?: string;
  cardExpiryDate?: string;
  email?: string;
  cardId?: number;
  cardStatus?: string;
  backUrl?: string;
  cardDescriptor?: string;
  externalCustomData?: string;
  fraudScore?: number;
  transactionOption?: string;
  splitStatus?: string;
  relatedTransactionIds?: number[];
}

export interface TransactionListParams {
  orderId?: number;
  customerId?: number;
  email?: string;
  transactionMethod?: 'card' | 'wallet' | 'transfer';
  currency?: string;
  amountFrom?: number;
  amountTo?: number;
  transactionType?: 'deposit' | 'refund' | 'credit' | 'chargeback' | 'representment';
  transactionStatus?: string[];
  dateType?: 'creation' | 'approval' | 'refund' | 'cancellation' | 'charge-back';
  createdAtFrom?: string;
  createdAtTo?: string;
  source?: string[];
  cardType?: 'visa' | 'mastercard' | 'maestro';
  cardNumber?: string;
  country?: string;
  page?: number;
  perPage?: number;
  reverseSorting?: boolean;
}

export interface TransactionCaptureRequest {
  amount: number;
}

export interface TransactionRefundRequest {
  reason?:
  | 'fraud-confirm'
  | 'highly-suspicious'
  | 'duplicated-transaction'
  | 'customer-demand'
  | 'test-transaction'
  | 'card-expired';
  message?: string;
  amount?: number;
}

export class Transactions extends XMoneyResource {
  public async list(
    params: TransactionListParams,
  ): Promise<{ data: Transaction[]; pagination: Pagination }> {
    return this.client.requestPaginated<Transaction>('GET', '/transaction', undefined, params);
  }

  public listAutoPaging(params: TransactionListParams): AsyncIterableIterator<Transaction> {
    return this.client.requestAutoPaginated<Transaction>('GET', '/transaction', params);
  }

  public async retrieve(id: number): Promise<Transaction> {
    return this.client.request<Transaction>('GET', `/transaction/${id}`);
  }

  public async capture(id: number, data: TransactionCaptureRequest): Promise<void> {
    return this.client.request<void>('PUT', `/transaction/${id}`, data);
  }

  public async refund(id: number, data: TransactionRefundRequest): Promise<void> {
    return this.client.request<void>('DELETE', `/transaction/${id}`, data);
  }
}
