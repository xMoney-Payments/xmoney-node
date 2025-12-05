import { XMoney } from '../../src/XMoney';
import { Customers } from '../../src/resources/Customers';
import { InvalidRequestError, APIError } from '../../src/errors';

describe('Customers Resource', () => {
    let sdk: XMoney;
    let customers: Customers;

    beforeEach(() => {
        sdk = new XMoney('sk_test_123');
        customers = sdk.customers;
        // Mock the request methods
        (sdk as any).request = jest.fn();
        (sdk as any).requestPaginated = jest.fn();
    });

    describe('create', () => {
        it('should call request with correct params', async () => {
            const data = { identifier: 'cust_123', email: 'test@example.com' };
            const mockResponse = { id: 1, ...data };
            (sdk as any).request.mockResolvedValue(mockResponse);

            await customers.create(data);

            expect(sdk.request).toHaveBeenCalledWith('POST', '/customer', data);
        });

        it('should throw InvalidRequestError when validation fails', async () => {
            const data = { identifier: 'cust_123', email: 'invalid-email' };
            const errorResponse = new InvalidRequestError({
                code: 400,
                message: 'Bad Request',
                errors: [{
                    code: 1651,
                    message: 'Invalid email address provided',
                    type: 'Validation',
                    field: 'email'
                }]
            });

            (sdk as any).request.mockRejectedValue(errorResponse);

            await expect(customers.create(data)).rejects.toThrow(InvalidRequestError);
        });

        it('should throw APIError when customer already exists', async () => {
            const data = { identifier: 'cust_123', email: 'test@example.com' };
            // Use 409 Conflict scenario, potentially mapped to APIError or a specific ConflictError if it existed.
            // Based on current errors.ts, 409 usually falls back to generic APIError or we can use InvalidRequestError if API semantics imply it.
            // Let's assume generic logic maps it to APIError if not 400/401. 
            // Actually, the default handleError (implied) usually maps unknown status to APIError.
            const errorResponse = new APIError({
                code: 409,
                message: 'Conflict',
                errors: [{
                    code: 1627,
                    message: 'Customer already exists',
                    type: 'Exception'
                }]
            });

            (sdk as any).request.mockRejectedValue(errorResponse);

            await expect(customers.create(data)).rejects.toThrow(APIError);
        });
    });

    describe('list', () => {
        it('should call requestPaginated with correct params', async () => {
            const params = { page: 1 };
            const mockResponse = { data: [], pagination: {} };
            (sdk as any).requestPaginated.mockResolvedValue(mockResponse);

            await customers.list(params);

            expect(sdk.requestPaginated).toHaveBeenCalledWith('GET', '/customer', undefined, params);
        });
    });

    describe('retrieve', () => {
        it('should call request with correct params', async () => {
            const id = 123;
            const mockResponse = { id };
            (sdk as any).request.mockResolvedValue(mockResponse);

            await customers.retrieve(id);

            expect(sdk.request).toHaveBeenCalledWith('GET', `/customer/${id}`);
        });
    });

    describe('update', () => {
        it('should call request with correct params', async () => {
            const id = 123;
            const data = { firstName: 'John' };
            const mockResponse = { id, ...data };
            (sdk as any).request.mockResolvedValue(mockResponse);

            await customers.update(id, data);

            expect(sdk.request).toHaveBeenCalledWith('PUT', `/customer/${id}`, data);
        });
    });

    describe('delete', () => {
        it('should call request with correct params', async () => {
            const id = 123;
            (sdk as any).request.mockResolvedValue(undefined);

            await customers.delete(id);

            expect(sdk.request).toHaveBeenCalledWith('DELETE', `/customer/${id}`);
        });
    });
});
