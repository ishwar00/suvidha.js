import { HttpResponse, HttpResponseOptions } from "../HttpResponse";
import { getReasonPhrase, StatusCodes as HttpStatus } from "http-status-codes";

export class Ok extends HttpResponse {
    constructor(
        body: string | Record<string, any> = getReasonPhrase(HttpStatus.OK),
        options?: HttpResponseOptions,
    ) {
        super(body, HttpStatus.OK, options);
    }
}

export class Created extends HttpResponse {
    constructor(
        body: string | Record<string, any> = getReasonPhrase(
            HttpStatus.CREATED,
        ),
        options?: HttpResponseOptions,
    ) {
        super(body, HttpStatus.CREATED, options);
    }
}

export class Accepted extends HttpResponse {
    constructor(
        body: string | Record<string, any> = getReasonPhrase(
            HttpStatus.ACCEPTED,
        ),
        options?: HttpResponseOptions,
    ) {
        super(body, HttpStatus.ACCEPTED, options);
    }
}

export class NoContent extends HttpResponse {
    constructor(options?: HttpResponseOptions) {
        super(null, HttpStatus.NO_CONTENT, options);
    }
}

export class PartialContent extends HttpResponse {
    constructor(
        body: string | Record<string, any> = getReasonPhrase(
            HttpStatus.PARTIAL_CONTENT,
        ),
        options?: HttpResponseOptions,
    ) {
        super(body, HttpStatus.PARTIAL_CONTENT, options);
    }
}
