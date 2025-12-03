import { XMoney } from '../../src/XMoney';
import { Transactions } from '../../src/resources/Transactions';

describe('Transactions Resource', () => {
    let sdk: XMoney;
    let transactions: Transactions;

    beforeEach(() => {
        sdk = new XMoney('sk_test_123');
        transactions = sdk.transactions;
        // Mock the request methods
        (sdk as any).request = jest.fn();
        (sdk as any).requestPaginated = jest.fn();
    });

    describe('list', () => {
        it('should call requestPaginated with correct params', async () => {
            const params = { page: 1 };
            const mockResponse = { data: [], pagination: {} };
            (sdk as any).requestPaginated.mockResolvedValue(mockResponse);

            await transactions.list(params);

            expect(sdk.requestPaginated).toHaveBeenCalledWith('GET', '/transaction', undefined, params);
        });
    });

    describe('retrieve', () => {
        it('should call request with correct params', async () => {
            const id = 123;
            const mockResponse = { id };
            (sdk as any).request.mockResolvedValue(mockResponse);

            await transactions.retrieve(id);

            expect(sdk.request).toHaveBeenCalledWith('GET', `/transaction/${id}`);
        });
    });

    describe('capture', () => {
        it('should call request with correct params', async () => {
            const id = 123;
            const data = { amount: 100 };
            (sdk as any).request.mockResolvedValue(undefined);

            await transactions.capture(id, data);

            expect(sdk.request).toHaveBeenCalledWith('PUT', `/transaction/${id}`, data);
        });
    });

    describe('refund', () => {
        it('should call request with correct params', async () => {
            const id = 123;
            const data: any = { amount: 100, reason: 'customer-demand' };
            (sdk as any).request.mockResolvedValue(undefined);

            await transactions.refund(id, data);

            expect(sdk.request).toHaveBeenCalledWith('DELETE', `/transaction/${id}`, data);
        });
    });
});
