import { XMoneyResource } from '../XMoneyResource';
import { Pagination } from '../types';

export interface Card {
  id: number;
  // Add other fields as per spec
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
