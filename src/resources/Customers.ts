import { XMoneyResource } from '../XMoneyResource';
import { Pagination } from '../types';

export interface Customer {
    id: number;
    identifier: string;
    email: string;
    // Add other fields as per spec
}

export interface CustomerCreateRequest {
    identifier: string;
    email: string;
    siteId?: number;
    firstName?: string;
    lastName?: string;
    country?: string;
    state?: string;
    city?: string;
    zipCode?: string;
    address?: string;
    phone?: string;
}

export interface CustomerUpdateRequest {
    identifier?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    country?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
}

export interface CustomerListParams {
    identifier?: string;
    email?: string;
    country?: string;
    createdAtFrom?: string;
    createdAtTo?: string;
    page?: number;
    perPage?: number;
    reverseSorting?: boolean;
}

export class Customers extends XMoneyResource {

    public async create(data: CustomerCreateRequest): Promise<Customer> {
        return this.client.request<Customer>('POST', '/customer', data);
    }

    public async list(params: CustomerListParams): Promise<{ data: Customer[], pagination: Pagination }> {
        return this.client.requestPaginated<Customer>('GET', '/customer', undefined, params);
    }

    public listAutoPaging(params: CustomerListParams): AsyncIterableIterator<Customer> {
        return this.client.requestAutoPaginated<Customer>('GET', '/customer', params);
    }

    public async retrieve(id: number): Promise<Customer> {
        return this.client.request<Customer>('GET', `/customer/${id}`);
    }

    public async update(id: number, data: CustomerUpdateRequest): Promise<Customer> {
        return this.client.request<Customer>('PUT', `/customer/${id}`, data);
    }

    public async delete(id: number): Promise<void> {
        return this.client.request<void>('DELETE', `/customer/${id}`);
    }
}
