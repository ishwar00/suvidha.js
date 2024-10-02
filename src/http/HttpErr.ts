import { getReasonPhrase, StatusCodes as HttpStatus } from "http-status-codes";

export interface HttpErrOptions {
    cause?: unknown;
    description?: string;
}

export type ErrObject = {
    message?: string;
} & Record<string, any>;

export interface IHttpError {
    get message(): string;
    get statusCode(): number;
    get body(): string | ErrObject;
    get cause(): unknown | undefined;
}

export function isKeyObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && !Array.isArray(value) && value !== null;
}

export class HttpErr extends Error implements IHttpError {
    constructor(
        private readonly errMessageOrObject: string | ErrObject,
        private readonly status: HttpStatus,
        private readonly options?: HttpErrOptions,
    ) {
        super();
        super.message = this.message;
    }

    override get message() {
        if (typeof this.errMessageOrObject === "string") {
            return this.errMessageOrObject;
        } else {
            return (
                this.errMessageOrObject["message"] ??
                getReasonPhrase(this.status)
            );
        }
    }

    override get name() {
        return this.constructor.name;
    }

    get cause() {
        return this.options?.cause;
    }

    get body() {
        return this.errMessageOrObject;
    }

    get statusCode(): HttpStatus {
        return this.status;
    }
}
