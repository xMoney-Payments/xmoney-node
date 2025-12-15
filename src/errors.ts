export type XMoneyErrorType = 'Validation' | 'Exception';

export interface XMoneyErrorItem {
  code: number;
  message: string;
  type: XMoneyErrorType;
  field?: string;
}

export interface XMoneyAPIErrorResponse {
  code: number;
  message: string;
  errors: XMoneyErrorItem[];
  [key: string]: unknown;
}

export class XMoneyError extends Error {
  readonly type: string;
  readonly raw: unknown;
  readonly statusCode?: number;
  readonly errors?: XMoneyErrorItem[];

  constructor(raw: Partial<XMoneyAPIErrorResponse> = {}) {
    super(raw.message || 'Unknown Error');
    this.type = this.constructor.name;
    this.statusCode = raw.code;
    this.errors = raw.errors;
    this.raw = raw;
  }
}

export class APIConnectionError extends XMoneyError { }

export class AuthenticationError extends XMoneyError { }

export class InvalidRequestError extends XMoneyError { }

export class APIError extends XMoneyError { }
