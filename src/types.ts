export interface XMoneyConfig {
    secretKey: string; 
    baseUrl?: string;
    timeout?: number;
}

export interface Pagination {
    currentPageNumber: number;
    totalItemCount: number;
    itemCountPerPage: number;
    currentItemCount: number;
    pageCount: number;
}

export interface APIErrorDetails {
    code?: number;
    message?: string;
    type?: string;
    field?: string;
}

export interface APIResponse<T> {
    code: number;
    message: string;
    data?: T;
    pagination?: Pagination;
    error?: APIErrorDetails[];
}

export type TransactionStatus =
    | 'start'
    | 'in-progress'
    | '3d-pending'
    | 'complete-ok'
    | 'complete-failed'
    | 'refund-ok'
    | 'void-ok';

export interface WebhookPayload {
    transactionStatus: TransactionStatus;
    orderId: number;
    externalOrderId: string;
    transactionId: number;
    transactionMethod: string;
    customerId: number;
    identifier: string;
    amount: number;
    currency: string;
    customData?: any;
    timestamp: number;
    cardId?: number | null;
    errors?: APIErrorDetails[];
}
