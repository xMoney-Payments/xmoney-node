import { XMoney } from '../src/XMoney';
import { Cards } from '../src/resources/Cards';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AutoPagination', () => {
    let client: XMoney;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedAxios.create.mockReturnThis();
        mockedAxios.interceptors = {
            response: { use: jest.fn() },
            request: { use: jest.fn() },
        } as any;
        client = new XMoney('sk_test_123');
    });

    it('should iterate over multiple pages', async () => {
        const page1 = {
            code: 200,
            message: 'Success',
            data: [{ id: 1 }, { id: 2 }],
            pagination: {
                currentPageNumber: 1,
                pageCount: 2,
                totalItemCount: 4,
                itemCountPerPage: 2,
                currentItemCount: 2
            }
        };

        const page2 = {
            code: 200,
            message: 'Success',
            data: [{ id: 3 }, { id: 4 }],
            pagination: {
                currentPageNumber: 2,
                pageCount: 2,
                totalItemCount: 4,
                itemCountPerPage: 2,
                currentItemCount: 2
            }
        };

        mockedAxios.request
            .mockResolvedValueOnce({ data: page1 })
            .mockResolvedValueOnce({ data: page2 });

        const items = [];
        for await (const item of client.cards.listAutoPaging({ customerId: 1 })) {
            items.push(item);
        }

        expect(items).toHaveLength(4);
        expect(items[0].id).toBe(1);
        expect(items[3].id).toBe(4);
        expect(mockedAxios.request).toHaveBeenCalledTimes(2);
    });

    it('should handle single page', async () => {
        const page1 = {
            code: 200,
            message: 'Success',
            data: [{ id: 1 }],
            pagination: {
                currentPageNumber: 1,
                pageCount: 1,
                totalItemCount: 1,
                itemCountPerPage: 2,
                currentItemCount: 1
            }
        };

        mockedAxios.request.mockResolvedValueOnce({ data: page1 });

        const items = [];
        for await (const item of client.cards.listAutoPaging({ customerId: 1 })) {
            items.push(item);
        }

        expect(items).toHaveLength(1);
        expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    });
});
