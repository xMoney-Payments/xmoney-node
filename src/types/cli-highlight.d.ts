declare module 'cli-highlight' {
    export interface HighlightOptions {
        language?: string;
        ignoreIllegals?: boolean;
        theme?: { [key: string]: any };
    }
    export function highlight(code: string, options?: HighlightOptions): string;
}
