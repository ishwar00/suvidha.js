import { getReasonPhrase, StatusCodes as HttpStatus } from "http-status-codes";

export interface HttpResponseOptions {
    headers?: Record<string, string>;
}

export class HttpResponse {
    public readonly headers: Record<string, string>;

    constructor(
        readonly body: unknown,
        readonly statusCode: HttpStatus,
        readonly options?: HttpResponseOptions,
    ) {
        this.headers = options?.headers ?? {};
    }

    message() {
        return getReasonPhrase(this.statusCode);
    }

    public setHeader(name: string, value: string): this {
        this.headers[name] = value;
        return this;
    }

    public getHeader(name: string): string | undefined {
        return this.headers[name];
    }
}
