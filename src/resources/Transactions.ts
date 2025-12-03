import { XMoneyResource } from '../XMoneyResource';
import { Pagination } from '../types';

export interface Transaction {
    id: number;
    // Add other fields as per spec
}

export interface TransactionListParams {
    orderId?: number;
    customerId?: number;
    email?: string;
    transactionMethod?: 'card' | 'wallet' | 'transfer';
    currency?: string;
    amountFrom?: number;
    amountTo?: number;
    transactionType?: string;
    transactionStatus?: string[];
    dateType?: string;
    createdAtFrom?: string;
    createdAtTo?: string;
    source?: string[];
    cardType?: string;
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
    reason?: 'fraud-confirm' | 'highly-suspicious' | 'duplicated-transaction' | 'customer-demand' | 'test-transaction' | 'card-expired';
    message?: string;
    amount?: number;
}

export class Transactions extends XMoneyResource {

    public async list(params: TransactionListParams): Promise<{ data: Transaction[], pagination: Pagination }> {
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
