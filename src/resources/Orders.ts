import { XMoneyResource } from '../XMoneyResource';
import { Pagination } from '../types';

export interface OrderCreateRequest {
  amount: number;
  currency: string;
  orderType: 'purchase' | 'recurring' | 'managed' | 'credit';
  customerId: number;
  siteId?: number;
  description?: string;
  externalOrderId?: string;
  intervalType?: 'day' | 'month';
  intervalValue?: number;
  retryPayment?: string;
  trialAmount?: number;
  firstBillDate?: string;
  backUrl?: string;
  transactionMethod?: 'card' | 'wallet';
  cardTransactionMode?: 'auth' | 'authAndCapture' | 'credit';
  cardId?: number;
  cardNumber?: string;
  cardExpiryDate?: string;
  cardCvv?: string;
  cardHolderName?: string;
  cardHolderCountry?: string;
  cardHolderState?: string;
  saveCard?: boolean;
  invoiceEmail?: string;
  ip?: string;
  threeDSecureData?: string;
  externalCustomData?: string;
  level3Data?: string;
}

export interface OrderRebillRequest {
  customerId: number;
  amount: number;
  transactionOption?: string;
}

export interface Order {
  id: number;
  siteId: number;
  externalOrderId?: string;
  orderType: string;
  amount: number;
  currency: string;
  status: string;
  created: string;
  updated: string;
  // Add other fields as per spec
}

export interface OrderListParams {
  externalOrderId?: string;
  customerId?: number;
  orderType?: string;
  orderStatus?: string;
  reason?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  page?: number;
  perPage?: number;
  reverseSorting?: boolean;
}

export class Orders extends XMoneyResource {
  public async create(data: OrderCreateRequest): Promise<Order> {
    return this.client.request<Order>('POST', '/order', data);
  }

  public async list(params: OrderListParams): Promise<{ data: Order[]; pagination: Pagination }> {
    return this.client.requestPaginated<Order>('GET', '/order', undefined, params);
  }

  public listAutoPaging(params: OrderListParams): AsyncIterableIterator<Order> {
    return this.client.requestAutoPaginated<Order>('GET', '/order', params);
  }

  public async retrieve(id: number): Promise<Order> {
    return this.client.request<Order>('GET', `/order/${id}`);
  }

  public async rebill(id: number, data: OrderRebillRequest): Promise<Order> {
    return this.client.request<Order>('POST', `/order-rebill/${id}`, data);
  }

  public async cancel(id: number): Promise<void> {
    return this.client.request<void>('DELETE', `/order/${id}`);
  }
}
