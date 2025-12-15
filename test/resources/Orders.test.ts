import { XMoney } from '../../src/XMoney';
import { Orders } from '../../src/resources/Orders';

describe('Orders Resource', () => {
    let sdk: XMoney;
    let orders: Orders;

    beforeEach(() => {
        sdk = new XMoney('sk_test_123');
        orders = sdk.orders;
        // Mock the request methods
        (sdk as any).request = jest.fn();
        (sdk as any).requestPaginated = jest.fn();
    });

    describe('create', () => {
        it('should call request with correct params', async () => {
            const data: any = { amount: 100, currency: 'USD', orderType: 'purchase', customerId: 1 };
            const mockResponse = { id: 1, ...data };
            (sdk as any).request.mockResolvedValue(mockResponse);

            await orders.create(data);

            expect(sdk.request).toHaveBeenCalledWith('POST', '/order', data);
        });
    });

    describe('list', () => {
        it('should call requestPaginated with correct params', async () => {
            const params = { page: 1 };
            const mockResponse = { data: [], pagination: {} };
            (sdk as any).requestPaginated.mockResolvedValue(mockResponse);

            await orders.list(params);

            expect(sdk.requestPaginated).toHaveBeenCalledWith('GET', '/order', undefined, params);
        });
    });

    describe('retrieve', () => {
        it('should call request with correct params', async () => {
            const id = 123;
            const mockResponse = { id };
            (sdk as any).request.mockResolvedValue(mockResponse);

            await orders.retrieve(id);

            expect(sdk.request).toHaveBeenCalledWith('GET', `/order/${id}`);
        });
    });

    describe('rebill', () => {
        it('should call request with correct params', async () => {
            const id = 123;
            const data = { customerId: 456, amount: 100 };
            const mockResponse = { id, ...data };
            (sdk as any).request.mockResolvedValue(mockResponse);

            await orders.rebill(id, data);

            expect(sdk.request).toHaveBeenCalledWith('PATCH', `/order-rebill/${id}`, data);
        });
    });

    describe('cancel', () => {
        it('should call request with correct params', async () => {
            const id = 123;
            const params: any = { reason: 'customer-demand', message: 'Requested by user', terminateOrder: 'yes' };
            (sdk as any).request.mockResolvedValue(undefined);

            await orders.cancel(id, params);

            expect(sdk.request).toHaveBeenCalledWith('DELETE', `/order/${id}`, params);
        });

        it('should call request without params when optional', async () => {
            const id = 123;
            (sdk as any).request.mockResolvedValue(undefined);

            await orders.cancel(id);

            expect(sdk.request).toHaveBeenCalledWith('DELETE', `/order/${id}`, undefined);
        });
    });
});
