declare module 'cli-highlight' {
  export interface HighlightOptions {
    language?: string;
    ignoreIllegals?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    theme?: { [key: string]: any };
  }
  export function highlight(code: string, options?: HighlightOptions): string;
}
