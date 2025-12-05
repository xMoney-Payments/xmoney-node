import { XMoneyResource } from '../XMoneyResource';
import { Pagination } from '../types';

export interface BinInfo {
  bin: string;
  brand?: string;
  type?: string;
  level?: string;
  countryCode?: string;
  bank?: string;
}

export interface Card {
  id: number;
  customerId: number;
  type?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  nameOnCard?: string;
  cardHolderCountry?: string;
  cardHolderState?: string;
  cardProvider?: string;
  hasToken?: boolean;
  cardStatus?: string;
  binInfo?: BinInfo;
}

export interface CardListParams {
  customerId: number;
  orderId?: number;
  hasToken?: 'yes' | 'no';
  cardStatus?: 'all' | 'deleted';
  page?: number;
  perPage?: number;
  reverseSorting?: boolean;
}

export class Cards extends XMoneyResource {
  public async list(params: CardListParams): Promise<{ data: Card[]; pagination: Pagination }> {
    return this.client.requestPaginated<Card>('GET', '/card', undefined, params);
  }

  public listAutoPaging(params: CardListParams): AsyncIterableIterator<Card> {
    return this.client.requestAutoPaginated<Card>('GET', '/card', params);
  }

  public async retrieve(id: number, customerId: number): Promise<Card> {
    return this.client.request<Card>('GET', `/card/${id}`, undefined, { customerId });
  }

  public async delete(id: number): Promise<void> {
    return this.client.request<void>('DELETE', `/card/${id}`);
  }
}
