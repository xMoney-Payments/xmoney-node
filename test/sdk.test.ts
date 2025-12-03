import { XMoney } from '../src/XMoney';
import { LIVE_ENV_API_URL, TEST_ENV_API_URL } from '../src/constants';

describe('XMoney SDK', () => {
    it('should instantiate correctly', () => {
        const sdk = new XMoney({ secretKey: 'sk_test_api_key' });
        expect(sdk).toBeDefined();
        expect(sdk.orders).toBeDefined();
        expect(sdk.transactions).toBeDefined();
        expect(sdk.customers).toBeDefined();
        expect(sdk.cards).toBeDefined();
    });

    it('should detect test environment from secret key', () => {
        const sdk = new XMoney({ secretKey: 'sk_test_123' });
        expect((sdk as any).client.defaults.baseURL).toBe(TEST_ENV_API_URL);
    });

    it('should detect live environment from secret key', () => {
        const sdk = new XMoney({ secretKey: 'sk_live_123' });
        expect((sdk as any).client.defaults.baseURL).toBe(LIVE_ENV_API_URL);
    });

    it('should throw error for invalid secret key', () => {
        expect(() => new XMoney({ secretKey: 'invalid_key' })).toThrow("Invalid secret key. It must start with 'sk_test_' or 'sk_live_'.");
    });

    // Add more tests as needed
});
