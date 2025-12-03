import { XMoney } from '../../src/XMoney';
import { Cards } from '../../src/resources/Cards';

describe('Cards Resource', () => {
    let sdk: XMoney;
    let cards: Cards;

    beforeEach(() => {
        sdk = new XMoney('sk_test_123');
        cards = sdk.cards;
        // Mock the request methods
        (sdk as any).request = jest.fn();
        (sdk as any).requestPaginated = jest.fn();
    });

    describe('list', () => {
        it('should call requestPaginated with correct params', async () => {
            const params = { customerId: 123, page: 1 };
            const mockResponse = { data: [], pagination: {} };
            (sdk as any).requestPaginated.mockResolvedValue(mockResponse);

            await cards.list(params);

            expect(sdk.requestPaginated).toHaveBeenCalledWith('GET', '/card', undefined, params);
        });
    });

    describe('retrieve', () => {
        it('should call request with correct params', async () => {
            const id = 456;
            const customerId = 123;
            const mockResponse = { id, customerId };
            (sdk as any).request.mockResolvedValue(mockResponse);

            await cards.retrieve(id, customerId);

            expect(sdk.request).toHaveBeenCalledWith('GET', `/card/${id}`, undefined, { customerId });
        });
    });

    describe('delete', () => {
        it('should call request with correct params', async () => {
            const id = 789;
            (sdk as any).request.mockResolvedValue(undefined);

            await cards.delete(id);

            expect(sdk.request).toHaveBeenCalledWith('DELETE', `/card/${id}`);
        });
    });
});
