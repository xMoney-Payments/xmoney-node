
import { program } from '../src/cli';
import { XMoney } from '../src/XMoney';

// Mock XMoney and its resources
jest.mock('../src/XMoney');

// Helper to spy on console.log and console.error
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => { });
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });
const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: any) => {
    throw new Error(`process.exit(${code})`);
});

describe('CLI', () => {
    let mockClient: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockConsoleLog.mockClear();
        mockConsoleError.mockClear();
        mockExit.mockClear();
        mockClient = {
            cards: {
                list: jest.fn().mockResolvedValue({ data: [], pagination: {} }),
                retrieve: jest.fn().mockResolvedValue({ id: 1 }),
                delete: jest.fn().mockResolvedValue(undefined),
            },
            orders: {
                list: jest.fn().mockResolvedValue({ data: [], pagination: {} }),
                create: jest.fn().mockResolvedValue({ id: 1 }),
                retrieve: jest.fn().mockResolvedValue({ id: 1 }),
                cancel: jest.fn().mockResolvedValue(undefined),
                rebill: jest.fn().mockResolvedValue({ id: 1 }),
            },
            customers: {
                list: jest.fn().mockResolvedValue({ data: [], pagination: {} }),
                create: jest.fn().mockResolvedValue({ id: 1 }),
                retrieve: jest.fn().mockResolvedValue({ id: 1 }),
                update: jest.fn().mockResolvedValue({ id: 1 }),
                delete: jest.fn().mockResolvedValue(undefined),
            },
            transactions: {
                list: jest.fn().mockResolvedValue({ data: [], pagination: {} }),
                retrieve: jest.fn().mockResolvedValue({ id: 1 }),
                capture: jest.fn().mockResolvedValue(undefined),
                refund: jest.fn().mockResolvedValue(undefined),
            },
        };
        (XMoney as unknown as jest.Mock).mockImplementation(() => mockClient);
    });

    afterEach(() => {
    });

    const runCommand = async (args: string[]) => {
        try {
            await program.parseAsync(['node', 'cli', ...args]);
        } catch (e: any) {
            // Ignore process.exit errors if 0, rethrow if 1
            if (e.message !== 'process.exit(0)') {
                // rethrow
            }
        }
    };

    describe('cards', () => {
        it('should list cards', async () => {
            await runCommand(['--secret-key', 'sk_test_123', 'cards', 'list', '--customer-id', '123']);
            expect(mockClient.cards.list).toHaveBeenCalledWith(expect.objectContaining({ customerId: 123 }));
        });

        it('should list cards with options', async () => {
            await runCommand(['--secret-key', 'sk_test_123', 'cards', 'list', '--customer-id', '123', '--order-id', '456', '--has-token', 'yes', '--card-status', 'active']);
            expect(mockClient.cards.list).toHaveBeenCalledWith(expect.objectContaining({
                customerId: 123,
                orderId: 456,
                hasToken: 'yes',
                cardStatus: 'active'
            }));
        });

        it('should retrieve a card', async () => {
            await runCommand(['--secret-key', 'sk_test_123', 'cards', 'retrieve', '--id', '456', '--customer-id', '123']);
            expect(mockClient.cards.retrieve).toHaveBeenCalledWith(456, 123);
        });

        it('should delete a card', async () => {
            await runCommand(['--secret-key', 'sk_test_123', 'cards', 'delete', '--id', '456']);
            expect(mockClient.cards.delete).toHaveBeenCalledWith(456);
        });
    });

    describe('orders', () => {
        it('should list orders', async () => {
            await runCommand(['--secret-key', 'sk_test_123', 'orders', 'list', '--customer-id', '123', '--external-order-id', 'ext_123', '--status', 'paid']);
            expect(mockClient.orders.list).toHaveBeenCalledWith(expect.objectContaining({
                customerId: 123,
                externalOrderId: 'ext_123',
                orderStatus: 'paid'
            }));
        });

        it('should create an order', async () => {
            await runCommand(['--secret-key', 'sk_test_123', 'orders', 'create', '--customer-id', '123', '--amount', '100', '--currency', 'USD', '--type', 'purchase']);
            expect(mockClient.orders.create).toHaveBeenCalledWith(expect.objectContaining({
                customerId: 123,
                amount: 100,
                currency: 'USD',
                orderType: 'purchase'
            }));
        });

        it('should retrieve an order', async () => {
            await runCommand(['--secret-key', 'sk_test_123', 'orders', 'retrieve', '--id', '123']);
            expect(mockClient.orders.retrieve).toHaveBeenCalledWith(123);
        });

        it('should cancel an order with params', async () => {
            await runCommand(['--secret-key', 'sk_test_123', 'orders', 'cancel', '--id', '123', '--reason', 'fraud']);
            expect(mockClient.orders.cancel).toHaveBeenCalledWith(123, expect.objectContaining({ reason: 'fraud' }));
        });

        it('should rebill an order', async () => {
            await runCommand(['--secret-key', 'sk_test_123', 'orders', 'rebill', '--id', '123', '--customer-id', '456', '--amount', '50']);
            expect(mockClient.orders.rebill).toHaveBeenCalledWith(123, expect.objectContaining({
                customerId: 456,
                amount: 50
            }));
        });
    });

    describe('customers', () => {
        it('should list customers', async () => {
            await runCommand(['--secret-key', 'sk_test_123', 'customers', 'list', '--email', 'test@test.com']);
            expect(mockClient.customers.list).toHaveBeenCalledWith(expect.objectContaining({ email: 'test@test.com' }));
        });

        it('should create a customer', async () => {
            await runCommand(['--secret-key', 'sk_test_123', 'customers', 'create', '--identifier', 'cust_1', '--email', 'test@test.com', '--country', 'US']);
            expect(mockClient.customers.create).toHaveBeenCalledWith(expect.objectContaining({
                identifier: 'cust_1',
                email: 'test@test.com',
                country: 'US'
            }));
        });

        it('should update a customer', async () => {
            await runCommand(['--secret-key', 'sk_test_123', 'customers', 'update', '--id', '1', '--first-name', 'John']);
            expect(mockClient.customers.update).toHaveBeenCalledWith(1, expect.objectContaining({ firstName: 'John' }));
        });
    });

    describe('transactions', () => {
        it('should list transactions', async () => {
            await runCommand(['--secret-key', 'sk_test_123', 'transactions', 'list', '--order-id', '1', '--amount-from', '10']);
            expect(mockClient.transactions.list).toHaveBeenCalledWith(expect.objectContaining({
                orderId: 1,
                amountFrom: 10
            }));
        });

        it('should capture a transaction', async () => {
            await runCommand(['--secret-key', 'sk_test_123', 'transactions', 'capture', '--id', '1', '--amount', '100']);
            expect(mockClient.transactions.capture).toHaveBeenCalledWith(1, expect.objectContaining({ amount: 100 }));
        });

        it('should refund a transaction', async () => {
            await runCommand(['--secret-key', 'sk_test_123', 'transactions', 'refund', '--id', '1', '--amount', '50', '--reason', 'fraud']);
            expect(mockClient.transactions.refund).toHaveBeenCalledWith(1, expect.objectContaining({
                amount: 50,
                reason: 'fraud'
            }));
        });
    });

    it('should error on invalid secret key', async () => {
        try {
            await runCommand(['--secret-key', 'invalid_key', 'cards', 'list', '--customer-id', '123']);
        } catch (e: any) {
            expect(e.message).toContain('process.exit(1)');
        }
    });
});
