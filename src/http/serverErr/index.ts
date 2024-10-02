import { HttpErr, HttpErrOptions } from "../HttpErr";
import { getReasonPhrase, StatusCodes as HttpStatus } from "http-status-codes";

export class InternalServerError extends HttpErr {
    constructor(
        errBody: string | Record<string, any> = getReasonPhrase(
            HttpStatus.INTERNAL_SERVER_ERROR,
        ),
        errOptions?: HttpErrOptions,
    ) {
        super(errBody, HttpStatus.INTERNAL_SERVER_ERROR, errOptions);
    }
}

export class NotImplemented extends HttpErr {
    constructor(
        errBody: string | Record<string, any> = getReasonPhrase(
            HttpStatus.NOT_IMPLEMENTED,
        ),
        errOptions?: HttpErrOptions,
    ) {
        super(errBody, HttpStatus.NOT_IMPLEMENTED, errOptions);
    }
}

export class BadGateway extends HttpErr {
    constructor(
        errBody: string | Record<string, any> = getReasonPhrase(
            HttpStatus.BAD_GATEWAY,
        ),
        errOptions?: HttpErrOptions,
    ) {
        super(errBody, HttpStatus.BAD_GATEWAY, errOptions);
    }
}

export class ServiceUnavailable extends HttpErr {
    constructor(
        errBody: string | Record<string, any> = getReasonPhrase(
            HttpStatus.SERVICE_UNAVAILABLE,
        ),
        errOptions?: HttpErrOptions,
    ) {
        super(errBody, HttpStatus.SERVICE_UNAVAILABLE, errOptions);
    }
}

export class GatewayTimeout extends HttpErr {
    constructor(
        errBody: string | Record<string, any> = getReasonPhrase(
            HttpStatus.GATEWAY_TIMEOUT,
        ),
        errOptions?: HttpErrOptions,
    ) {
        super(errBody, HttpStatus.GATEWAY_TIMEOUT, errOptions);
    }
}
