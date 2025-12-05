import axios, { AxiosInstance } from 'axios';
import { XMoneyConfig, APIResponse, Pagination } from './types';
import { Orders } from './resources/Orders';
import { Transactions } from './resources/Transactions';
import { Customers } from './resources/Customers';
import { Cards } from './resources/Cards';
import { APIConnectionError, APIError, AuthenticationError, InvalidRequestError } from './errors';
import { AutoPager } from './AutoPager';

import { Checkout } from './resources/Checkout';
import { Webhooks } from './resources/Webhooks';
import {
  LIVE_ENV,
  TEST_ENV,
  LIVE_ENV_URL,
  TEST_ENV_URL,
  LIVE_ENV_API_URL,
  TEST_ENV_API_URL,
} from './constants';
import { isValidSecretKey } from './utils';

export class XMoney {
  private readonly client: AxiosInstance;
  private readonly secretKey: string;
  private readonly apiKey: string;
  public readonly orders: Orders;
  public readonly transactions: Transactions;
  public readonly customers: Customers;
  public readonly cards: Cards;
  public readonly checkout: Checkout;
  public readonly webhooks: Webhooks;

  constructor(config: XMoneyConfig | string) {
    let secretKey: string;
    let baseUrl: string | undefined;
    let timeout: number | undefined;

    if (typeof config === 'string') {
      secretKey = config;
    } else {
      secretKey = config.secretKey;
      baseUrl = config.baseUrl;
      timeout = config.timeout;
    }

    this.secretKey = secretKey;

    if (!isValidSecretKey(this.secretKey)) {
      throw new Error(
        `Invalid secret key. It must start with 'sk_${TEST_ENV}_' or 'sk_${LIVE_ENV}_'.`,
      );
    }

    const detectedBaseUrl = this.getApiBaseUrl(secretKey);
    const apiKey = this.extractTokenFromSecretKey(secretKey);
    this.apiKey = apiKey;

    this.client = axios.create({
      baseURL: baseUrl || detectedBaseUrl,
      timeout: timeout || 10000,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: any) => {
        this.handleError(error);
        throw error;
      },
    );

    this.orders = new Orders(this);
    this.transactions = new Transactions(this);
    this.customers = new Customers(this);
    this.cards = new Cards(this);
    this.checkout = new Checkout(this);
    this.webhooks = new Webhooks(this);
  }

  private detectEnvironment(secretKey: string): 'live' | 'test' {
    return secretKey.startsWith(`sk_${LIVE_ENV}_`) ? LIVE_ENV : TEST_ENV;
  }

  private getApiBaseUrl(secretKey: string): string {
    const env = this.detectEnvironment(secretKey);

    if (env === LIVE_ENV) {
      return LIVE_ENV_API_URL;
    }

    return TEST_ENV_API_URL;
  }

  private extractTokenFromSecretKey(secretKey: string): string {
    const regexp = new RegExp(`^sk_(${TEST_ENV}|${LIVE_ENV})_(.+)$`);
    const match = secretKey.match(regexp);

    return match ? match[2] : secretKey;
  }

  private getSecureUrl(secretKey: string): string {
    const env = this.detectEnvironment(secretKey);

    if (env === LIVE_ENV) {
      return LIVE_ENV_URL;
    }

    return TEST_ENV_URL;
  }

  public getBaseUrl(): string {
    return this.client.defaults.baseURL || '';
  }

  public getSecureBaseUrl(): string {
    return this.getSecureUrl(this.secretKey);
  }

  public getSecretKey(): string {
    return this.secretKey;
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public async request<T>(method: string, url: string, data?: any, params?: any): Promise<T> {
    const response = await this.client.request<APIResponse<T>>({
      method,
      url,
      data,
      params,
    });

    if (response.data.code && response.data.code >= 400) {
      // Manually throw if the API returns 200 but with an error code in the body
      const errorProps = {
        message: response.data.message || 'Unknown API Error',
        statusCode: response.data.code,
        error: response.data.error,
      };
      throw new APIError(errorProps);
    }

    return response.data.data as T;
  }

  public async requestPaginated<T>(
    method: string,
    url: string,
    data?: any,
    params?: any,
  ): Promise<{ data: T[]; pagination: Pagination }> {
    const response = await this.client.request<APIResponse<T[]>>({
      method,
      url,
      data,
      params,
    });

    if (response.data.code && response.data.code >= 400) {
      const errorProps = {
        message: response.data.message || 'Unknown API Error',
        statusCode: response.data.code,
        error: response.data.error,
      };
      throw new APIError(errorProps);
    }

    return {
      data: response.data.data || [],
      pagination: response.data.pagination!,
    };
  }

  public requestAutoPaginated<T>(
    method: string,
    url: string,
    params?: any,
  ): AsyncIterableIterator<T> {
    return new AutoPager<T>(this, method, url, params);
  }

  private handleError(error: any): void {
    if (!error.response) {
      throw new APIConnectionError({
        message: error.message || 'Connection to xMoney API failed',
      });
    }

    const statusCode = error.response.status;
    const rawError = error.response.data || {};

    // Normalize error message
    let message = rawError.message;
    if (rawError.error && Array.isArray(rawError.error) && rawError.error.length > 0) {
      message = rawError.error[0].message;
    }

    const errorProps = {
      message: message || error.message,
      statusCode,
      ...rawError,
    };

    switch (statusCode) {
      case 400:
      case 404:
      case 422:
        throw new InvalidRequestError(errorProps);
      case 401:
      case 403:
        throw new AuthenticationError(errorProps);
      default:
        throw new APIError(errorProps);
    }
  }
}
