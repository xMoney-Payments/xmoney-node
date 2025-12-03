import { XMoney } from './XMoney';

export class AutoPager<T> implements AsyncIterableIterator<T> {
    private client: XMoney;
    private method: string;
    private url: string;
    private params: any;
    private buffer: T[];
    private currentPage: number;
    private hasMore: boolean;

    constructor(client: XMoney, method: string, url: string, params: any) {
        this.client = client;
        this.method = method;
        this.url = url;
        this.params = { ...params };
        this.buffer = [];
        this.currentPage = this.params.page || 1;
        this.hasMore = true;
    }

    public [Symbol.asyncIterator](): AsyncIterableIterator<T> {
        return this;
    }

    public async next(): Promise<IteratorResult<T>> {
        if (this.buffer.length > 0) {
            return { value: this.buffer.shift()!, done: false };
        }

        if (!this.hasMore) {
            return { value: undefined, done: true };
        }

        await this.fetchNextPage();

        if (this.buffer.length > 0) {
            return { value: this.buffer.shift()!, done: false };
        }

        return { value: undefined, done: true };
    }

    private async fetchNextPage(): Promise<void> {
        this.params.page = this.currentPage;
        const response = await this.client.requestPaginated<T>(this.method, this.url, undefined, this.params);

        this.buffer = response.data;

        const { pagination } = response;
        if (pagination.currentPageNumber >= pagination.pageCount) {
            this.hasMore = false;
        } else {
            this.currentPage++;
        }
    }
}
