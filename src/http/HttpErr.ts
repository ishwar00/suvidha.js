import { getReasonPhrase, StatusCodes as HttpStatus } from "http-status-codes";

export interface HttpErrOptions {
    cause?: unknown;
    description?: string;
}

export interface IHttpError {
    get message(): string;
    get statusCode(): number;
    get body(): Record<string, any> | undefined;
    get cause(): any;
}

export function isKeyObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && !Array.isArray(value) && value !== null;
}

export class HttpErr extends Error implements IHttpError {
    private _cause: any = null;
    private _message: any = null;

    constructor(
        private readonly _body: string | Record<string, any>,
        private readonly _statusCode: HttpStatus,
        private readonly options?: HttpErrOptions,
    ) {
        super();
        this.initMessage();
        this.initName();
        this.initCause();
    }

    private initMessage(): void {
        if (typeof this._body === "string") {
            this._message = this._body;
        } else {
            this._message =
                this._body["message"] ?? getReasonPhrase(this._statusCode);
        }
    }

    private initName(): void {
        this.name = this.constructor.name;
    }

    private initCause(): void {
        if (this.options?.cause) {
            this._cause = this.options.cause;
            return;
        }
    }

    get body(): Record<string, any> | undefined {
        if (isKeyObject(this._body)) {
            return this._body;
        }
        return undefined;
    }

    override get message(): string {
        return this._message;
    }

    get statusCode(): HttpStatus {
        return this._statusCode;
    }

    get cause(): any {
        return this._cause;
    }
}
