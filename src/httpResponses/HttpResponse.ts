export interface HttpResponseOptions {
    headers?: Record<string, string>;
}

export class HttpResponse {
    public readonly headers: Record<string, string>;

    constructor(
        readonly body: string | Record<string, any> | null,
        readonly statusCode: number,
        readonly options?: HttpResponseOptions,
    ) {
        this.headers = options?.headers ?? {};
    }

    public setHeader(name: string, value: string): this {
        this.headers[name] = value;
        return this;
    }

    public getHeader(name: string): string | undefined {
        return this.headers[name];
    }
}
