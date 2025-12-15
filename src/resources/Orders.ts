import { XMoneyResource } from '../XMoneyResource';
import { Pagination } from '../types';

export interface OrderCreateRequest {
  amount: number;
  currency: string;
  orderType: 'purchase' | 'recurring' | 'managed';
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
  transactionMethod?: 'card';
  cardTransactionMode?: 'auth' | 'authAndCapture';
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

export interface OrderCancelParams {
  reason?: 'fraud-confirm' | 'highly-suspicious' | 'duplicated-transaction' | 'customer-demand' | 'test-transaction';
  message?: string;
  terminateOrder?: 'yes';
}

export interface Order {
  id: number;
  siteId: number;
  customerId: number;
  externalOrderId?: string;
  orderType: string;
  orderStatus: string;
  amount: number;
  currency: string;
  description?: string;
  invoiceEmail?: string;
  createdAt: string;
  intervalType?: 'day' | 'month';
  intervalValue?: number;
  retryPayment?: string;
  nextDueDate?: string;
  transactionMethod?: string;
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
    return this.client.request<Order>('PATCH', `/order-rebill/${id}`, data);
  }

  public async cancel(id: number, params?: OrderCancelParams): Promise<void> {
    return this.client.request<void>('DELETE', `/order/${id}`, params);
  }
}
