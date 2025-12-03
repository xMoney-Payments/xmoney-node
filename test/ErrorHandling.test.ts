import axios from 'axios';
import { XMoney } from '../src/XMoney';
import {
    InvalidRequestError,
    AuthenticationError,
    APIError,
    APIConnectionError,
} from '../src/errors';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Error Handling', () => {
    let sdk: XMoney;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup axios create mock
        mockedAxios.create.mockReturnValue(mockedAxios);

        // Setup interceptors mock
        mockedAxios.interceptors = {
            response: {
                use: jest.fn(),
                eject: jest.fn(),
                clear: jest.fn(),
            } as any,
            request: {
                use: jest.fn(),
                eject: jest.fn(),
                clear: jest.fn(),
            } as any,
        };

        sdk = new XMoney('sk_test_123');

        // We need to manually trigger the error handling logic since we can't easily
        // trigger the interceptor in a unit test without more complex mocking.
        // Instead, we'll test the private handleError method by exposing it or 
        // by mocking the client.request method which calls handleError in the catch block (if we had one).
        // However, in our implementation, the interceptor handles the error.
        // So we will mock the client.request to throw an error that mimics an axios error,
        // and since our XMoney class attaches the interceptor, we might need to test the interceptor logic directly
        // or rely on integration tests.

        // A better approach for unit testing the SDK wrapper is to mock the axios instance 
        // and verify that the SDK methods throw the correct errors when axios rejects.
        // But since the error handling is in an interceptor, we need to make sure the interceptor is applied.

        // Let's look at how XMoney is implemented. It uses `this.client.interceptors.response.use`.
        // To test this, we can extract the error handler or test the public methods which eventually use the client.
    });

    // Since testing interceptors with jest mock is tricky, let's test the public methods
    // and mock the axios request to fail. 
    // BUT, the interceptor is what transforms the error. 
    // If we mock axios.request to reject, the interceptor MIGHT NOT run if we just mock the function.
    // We need to simulate the interceptor behavior or test the logic in isolation.

    // Given the complexity of mocking axios interceptors perfectly, 
    // and that we want to verify the SDK's behavior, 
    // let's try to mock the `client.request` to throw the *transformed* error 
    // OR we can refactor XMoney to make error handling testable.

    // Actually, we can test the `handleError` logic if we can access it.
    // Or we can just assume the interceptor works (it's standard axios) and test that 
    // IF the interceptor throws XMoneyError, the SDK propagates it.

    // Wait, the `XMoney` class defines the interceptor in the constructor.
    // When we call `sdk.orders.list()`, it calls `sdk.requestPaginated`, which calls `client.request`.
    // If `client.request` fails, the interceptor should catch it.

    // Let's try to mock `client.request` to return a rejected promise with a raw axios error,
    // and see if we can get the interceptor to fire. 
    // Usually, mocked axios methods don't trigger interceptors unless we use a library like `nock` or `axios-mock-adapter`.

    // For now, let's write a test that verifies the `handleError` logic by casting sdk to any
    // and calling the private method, as that's the core logic we want to verify.

    it('should throw InvalidRequestError for 400', () => {
        const error = {
            response: {
                status: 400,
                data: { message: 'Bad Request' }
            }
        };

        expect(() => (sdk as any).handleError(error)).toThrow(InvalidRequestError);
    });

    it('should throw AuthenticationError for 401', () => {
        const error = {
            response: {
                status: 401,
                data: { message: 'Unauthorized' }
            }
        };

        expect(() => (sdk as any).handleError(error)).toThrow(AuthenticationError);
    });

    it('should throw APIError for 500', () => {
        const error = {
            response: {
                status: 500,
                data: { message: 'Server Error' }
            }
        };

        expect(() => (sdk as any).handleError(error)).toThrow(APIError);
    });

    it('should throw APIConnectionError for network error', () => {
        const error = {
            message: 'Network Error'
        };

        expect(() => (sdk as any).handleError(error)).toThrow(APIConnectionError);
    });

    it('should extract error message from array', () => {
        const error = {
            response: {
                status: 400,
                data: {
                    error: [{ message: 'Specific error' }]
                }
            }
        };

        try {
            (sdk as any).handleError(error);
        } catch (e: any) {
            expect(e).toBeInstanceOf(InvalidRequestError);
            expect(e.message).toBe('Specific error');
        }
    });
});
