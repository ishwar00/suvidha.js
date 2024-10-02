import { ErrObject, HttpErr, HttpErrOptions } from "../HttpErr";
import { getReasonPhrase, StatusCodes as HttpStatus } from "http-status-codes";

export class BadRequestErr extends HttpErr {
    constructor(
        errBody: string | ErrObject = getReasonPhrase(HttpStatus.BAD_REQUEST),
        errOptions?: HttpErrOptions,
    ) {
        super(errBody, HttpStatus.BAD_REQUEST, errOptions);
    }
}

export class UnauthorizedErr extends HttpErr {
    constructor(
        errBody: string | ErrObject = getReasonPhrase(HttpStatus.UNAUTHORIZED),
        errOptions?: HttpErrOptions,
    ) {
        super(errBody, HttpStatus.UNAUTHORIZED, errOptions);
    }
}

export class ForbiddenErr extends HttpErr {
    constructor(
        errBody: string | ErrObject = getReasonPhrase(HttpStatus.FORBIDDEN),
        errOptions?: HttpErrOptions,
    ) {
        super(errBody, HttpStatus.FORBIDDEN, errOptions);
    }
}

export class NotFoundErr extends HttpErr {
    constructor(
        errBody: string | ErrObject = getReasonPhrase(HttpStatus.NOT_FOUND),
        errOptions?: HttpErrOptions,
    ) {
        super(errBody, HttpStatus.NOT_FOUND, errOptions);
    }
}

export class MethodNotAllowedErr extends HttpErr {
    constructor(
        errBody: string | ErrObject = getReasonPhrase(
            HttpStatus.METHOD_NOT_ALLOWED,
        ),
        errOptions?: HttpErrOptions,
    ) {
        super(errBody, HttpStatus.METHOD_NOT_ALLOWED, errOptions);
    }
}

export class ConflictErr extends HttpErr {
    constructor(
        errBody: string | ErrObject = getReasonPhrase(HttpStatus.CONFLICT),
        errOptions?: HttpErrOptions,
    ) {
        super(errBody, HttpStatus.CONFLICT, errOptions);
    }
}

export class GoneErr extends HttpErr {
    constructor(
        errBody: string | ErrObject = getReasonPhrase(HttpStatus.GONE),
        errOptions?: HttpErrOptions,
    ) {
        super(errBody, HttpStatus.GONE, errOptions);
    }
}

export class UnprocessableEntityErr extends HttpErr {
    constructor(
        errBody: string | ErrObject = getReasonPhrase(
            HttpStatus.UNPROCESSABLE_ENTITY,
        ),
        errOptions?: HttpErrOptions,
    ) {
        super(errBody, HttpStatus.UNPROCESSABLE_ENTITY, errOptions);
    }
}

export class TooManyRequestsErr extends HttpErr {
    constructor(
        errBody: string | ErrObject = getReasonPhrase(
            HttpStatus.TOO_MANY_REQUESTS,
        ),
        errOptions?: HttpErrOptions,
    ) {
        super(errBody, HttpStatus.TOO_MANY_REQUESTS, errOptions);
    }
}
