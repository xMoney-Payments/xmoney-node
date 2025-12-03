export class XMoneyError extends Error {
    readonly type: string;
    readonly raw: any;
    readonly statusCode?: number;

    constructor(raw: any = {}) {
        super(raw.message || 'Unknown Error');
        this.type = this.constructor.name;
        this.raw = raw;
        this.statusCode = raw.statusCode;
    }
}

export class APIConnectionError extends XMoneyError { }

export class AuthenticationError extends XMoneyError { }

export class InvalidRequestError extends XMoneyError { }

export class APIError extends XMoneyError { }
