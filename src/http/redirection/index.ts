import { HttpResponse, HttpResponseOptions } from "../HttpResponse";
import { getReasonPhrase, StatusCodes as HttpStatus } from "http-status-codes";

// 301 Moved Permanently
export class MovedPermanently extends HttpResponse {
    constructor(
        body: string | Record<string, any> = getReasonPhrase(
            HttpStatus.MOVED_PERMANENTLY,
        ),
        options?: HttpResponseOptions,
    ) {
        super(body, HttpStatus.MOVED_PERMANENTLY, options);
    }
}

// 302 Found
export class Found extends HttpResponse {
    constructor(
        body: string | Record<string, any> = getReasonPhrase(
            HttpStatus.MOVED_TEMPORARILY,
        ),
        options?: HttpResponseOptions,
    ) {
        super(body, HttpStatus.MOVED_TEMPORARILY, options);
    }
}

// 303 See Other
export class SeeOther extends HttpResponse {
    constructor(
        body: string | Record<string, any> = getReasonPhrase(
            HttpStatus.SEE_OTHER,
        ),
        options?: HttpResponseOptions,
    ) {
        super(body, HttpStatus.SEE_OTHER, options);
    }
}

// 307 Temporary Redirect
export class TemporaryRedirect extends HttpResponse {
    constructor(
        body: string | Record<string, any> = getReasonPhrase(
            HttpStatus.TEMPORARY_REDIRECT,
        ),
        options?: HttpResponseOptions,
    ) {
        super(body, HttpStatus.TEMPORARY_REDIRECT, options);
    }
}

// 308 Permanent Redirect
export class PermanentRedirect extends HttpResponse {
    constructor(
        body: string | Record<string, any> = getReasonPhrase(
            HttpStatus.PERMANENT_REDIRECT,
        ),
        options?: HttpResponseOptions,
    ) {
        super(body, HttpStatus.PERMANENT_REDIRECT, options);
    }
}
