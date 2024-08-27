import { getReasonPhrase, StatusCodes as HttpStatus } from "http-status-codes";

export interface HttpErrOptions {
    cause?: unknown;
    description?: string;
}

export interface IHttpError {
    getMessage(): string;
    getStatus(): number;
    getBody(): Record<string, any> | undefined;
    getCause(): any;
}

export function isKeyObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && !Array.isArray(value) && value !== null;
}

export class HttpErr extends Error implements IHttpError {
    private cause: any = null;

    constructor(
        private readonly response: string | Record<string, any>,
        private readonly statusCode: HttpStatus,
        private readonly options?: HttpErrOptions,
    ) {
        super();
        this.initMessage();
        this.initName();
        this.initCause();
    }

    private initMessage(): void {
        if (typeof this.response === "string") {
            this.message = this.response;
        } else {
            this.message =
                this.response["message"] ?? getReasonPhrase(this.statusCode);
        }
    }

    private initName(): void {
        this.name = this.constructor.name;
    }

    private initCause(): void {
        if (this.options?.cause) {
            this.cause = this.options.cause;
            return;
        }
    }

    getBody(): Record<string, any> | undefined {
        if (isKeyObject(this.response)) {
            return this.response;
        }
        return undefined;
    }

    getMessage(): string {
        return this.message;
    }

    getStatus(): HttpStatus {
        return this.statusCode;
    }

    getCause(): any {
        return this.cause;
    }
}
