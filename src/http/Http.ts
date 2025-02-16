import { z } from "zod";
import { StatusCodes } from "./statusCodes";

export type Headers = Record<string, string>;
export type Meta = unknown;

/**
 * The `Protocol` type defines the structure of an HTTP response. It can be used
 * to construct responses either directly as a plain object or indirectly
 * through the `Http` classes.
 *
 * @property {any} body - The response body.  This can be a string, an object, or any other data that you want to send in the response.
 * @property {number} status - The HTTP status code (e.g., 200, 404, 500).
 * @property {Headers} [headers] - Optional response headers.  This is a record (object) where the keys are header names and the values are header values.
 * @property {Meta} [meta] - Optional metadata associated with the response. This can be any data you want to include that's not part of the main response body.
 */
export interface Protocol {
    body: any;
    status: number;
    headers?: Headers;
    meta?: Meta;
}

const ProtocolSchema = z.object({
    body: z.union([z.string(), z.record(z.unknown())]),
    status: z.number(),
    headers: z.record(z.string()).optional(),
    meta: z.record(z.unknown()).optional(),
});

export function isProtocol(obj: unknown): obj is Protocol {
    return ProtocolSchema.strict().safeParse(obj).success;
}

export namespace Http {
    /**
     * The `Http.End` class is the base class for all HTTP response classes.
     * It encapsulates the core properties of an HTTP response, including the body,
     * status code, headers, and metadata. You typically won't use `Http.End` directly,
     * but it's important to understand its structure as it's the foundation for
     * other more specific response classes.
     */
    export class End {
        /**
         * @param {Protocol} protocol - The protocol object containing the response details.
         */
        constructor(protected readonly protocol: Protocol) {
            this.protocol.headers = this.protocol.headers ?? {};
            this.protocol.meta = this.protocol.meta ?? {};
        }

        /**
         * Sets the metadata for the response.
         * @param {Meta} meta - The metadata object.
         * @returns {Http.End} - The current Http.End instance for chaining.
         */
        meta(meta: Meta): Http.End {
            this.protocol.meta = meta;
            return this;
        }

        /**
         * Sets the headers for the response.
         * @param {Headers} headers - The headers object.
         * @returns {Http.End} - The current Http.End instance for chaining.
         */
        headers(headers: Headers): Http.End {
            this.protocol.headers = headers;
            return this;
        }

        /**
         * Sets a single header for the response.
         * @param {string} key - The header key.
         * @param {string} value - The header value.
         * @returns {Http.End} - The current Http.End instance for chaining.
         */
        header(key: string, value: string): Http.End {
            this.protocol.headers![key] = value;
            return this;
        }

        /**
         * Gets the HTTP status code.
         * @returns {number} - The HTTP status code.
         */
        getStatus(): number {
            return this.protocol.status;
        }
        /**
         * Gets the response body.
         * @returns {any} - The response body.
         */
        getBody(): any {
            return this.protocol.body;
        }

        /**
         * Gets the response metadata.
         * @returns {Meta} - The metadata object.
         */
        getMeta(): Meta {
            return this.protocol.meta!;
        }

        /**
         * Gets the response headers.
         * @returns {Headers} - The headers object.
         */
        getHeaders(): Headers {
            return this.protocol.headers!;
        }
    }

    // 1xx Informational
    export class Continue extends End {
        constructor(body: Protocol["body"] = "Continue") {
            const protocol = {
                body,
                status: StatusCodes.CONTINUE,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new Continue(_);
        }
    }

    export class SwitchingProtocols extends End {
        constructor(body: Protocol["body"] = "Switching Protocols") {
            const protocol = {
                body,
                status: StatusCodes.SWITCHING_PROTOCOLS,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new SwitchingProtocols(_);
        }
    }

    export class Processing extends End {
        constructor(body: Protocol["body"] = "Processing") {
            const protocol = {
                body,
                status: StatusCodes.PROCESSING,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new Processing(_);
        }
    }

    export class EarlyHints extends End {
        constructor(body: Protocol["body"] = "Early Hints") {
            const protocol = {
                body,
                status: StatusCodes.EARLY_HINTS,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new EarlyHints(_);
        }
    }
    // 2xx Success
    export class Ok extends End {
        constructor(body: Protocol["body"]) {
            const protocol = {
                body,
                status: StatusCodes.OK,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new Ok(_);
        }
    }

    export class Created extends End {
        constructor(body: Protocol["body"]) {
            const protocol = {
                body,
                status: StatusCodes.CREATED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new Created(_);
        }
    }

    export class Accepted extends End {
        constructor(body: Protocol["body"]) {
            const protocol = {
                body,
                status: StatusCodes.ACCEPTED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new Accepted(_);
        }
    }

    export class NonAuthoritativeInformation extends End {
        constructor(body: Protocol["body"]) {
            const protocol = {
                body,
                status: StatusCodes.NON_AUTHORITATIVE_INFORMATION,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new NonAuthoritativeInformation(_);
        }
    }

    export class NoContent extends End {
        constructor(body: Protocol["body"]) {
            const protocol = {
                body,
                status: StatusCodes.NO_CONTENT,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new NoContent(_);
        }
    }

    export class ResetContent extends End {
        constructor(body: Protocol["body"]) {
            const protocol = {
                body,
                status: StatusCodes.RESET_CONTENT,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new ResetContent(_);
        }
    }

    export class PartialContent extends End {
        constructor(body: Protocol["body"]) {
            const protocol = {
                body,
                status: StatusCodes.PARTIAL_CONTENT,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new PartialContent(_);
        }
    }

    export class MultiStatus extends End {
        constructor(body: Protocol["body"]) {
            const protocol = {
                body,
                status: StatusCodes.MULTI_STATUS,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new MultiStatus(_);
        }
    }

    export class AlreadyReported extends End {
        constructor(body: Protocol["body"]) {
            const protocol = {
                body,
                status: StatusCodes.ALREADY_REPORTED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new AlreadyReported(_);
        }
    }

    export class ImUsed extends End {
        constructor(body: Protocol["body"]) {
            const protocol = {
                body,
                status: StatusCodes.IM_USED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new ImUsed(_);
        }
    }

    // 3xx Redirection
    export class MultipleChoices extends End {
        constructor(body: Protocol["body"]) {
            const protocol = {
                body,
                status: StatusCodes.MULTIPLE_CHOICES,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new MultipleChoices(_);
        }
    }

    export class MovedPermanently extends End {
        constructor(body: Protocol["body"]) {
            const protocol = {
                body,
                status: StatusCodes.MOVED_PERMANENTLY,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new MovedPermanently(_);
        }
    }

    export class Found extends End {
        constructor(body: Protocol["body"]) {
            const protocol = {
                body,
                status: StatusCodes.FOUND,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new Found(_);
        }
    }

    export class SeeOther extends End {
        constructor(body: Protocol["body"]) {
            const protocol = {
                body,
                status: StatusCodes.SEE_OTHER,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new SeeOther(_);
        }
    }

    export class NotModified extends End {
        constructor(body: Protocol["body"]) {
            const protocol = {
                body,
                status: StatusCodes.NOT_MODIFIED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new NotModified(_);
        }
    }

    export class UseProxy extends End {
        constructor(body: Protocol["body"]) {
            const protocol = {
                body,
                status: StatusCodes.USE_PROXY,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new UseProxy(_);
        }
    }

    export class TemporaryRedirect extends End {
        constructor(body: Protocol["body"]) {
            const protocol = {
                body,
                status: StatusCodes.TEMPORARY_REDIRECT,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new TemporaryRedirect(_);
        }
    }

    export class PermanentRedirect extends End {
        constructor(body: Protocol["body"]) {
            const protocol = {
                body,
                status: StatusCodes.PERMANENT_REDIRECT,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new PermanentRedirect(_);
        }
    }

    // 4xx Client Error
    export class BadRequest extends End {
        constructor(body: Protocol["body"] = "Bad Request") {
            const protocol = {
                body,
                status: StatusCodes.BAD_REQUEST,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new BadRequest(_);
        }
    }

    export class Unauthorized extends End {
        constructor(body: Protocol["body"] = "Unauthorized") {
            const protocol = {
                body,
                status: StatusCodes.UNAUTHORIZED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new Unauthorized(_);
        }
    }

    export class PaymentRequired extends End {
        constructor(body: Protocol["body"] = "Payment Required") {
            const protocol = {
                body,
                status: StatusCodes.PAYMENT_REQUIRED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new PaymentRequired(_);
        }
    }

    export class Forbidden extends End {
        constructor(body: Protocol["body"] = "Forbidden") {
            const protocol = {
                body,
                status: StatusCodes.FORBIDDEN,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new Forbidden(_);
        }
    }

    export class NotFound extends End {
        constructor(body: Protocol["body"] = "Not Found") {
            const protocol = {
                body,
                status: StatusCodes.NOT_FOUND,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new NotFound(_);
        }
    }

    export class MethodNotAllowed extends End {
        constructor(body: Protocol["body"] = "Method Not Allowed") {
            const protocol = {
                body,
                status: StatusCodes.METHOD_NOT_ALLOWED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new MethodNotAllowed(_);
        }
    }

    export class NotAcceptable extends End {
        constructor(body: Protocol["body"] = "Not Acceptable") {
            const protocol = {
                body,
                status: StatusCodes.NOT_ACCEPTABLE,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new NotAcceptable(_);
        }
    }

    export class ProxyAuthenticationRequired extends End {
        constructor(body: Protocol["body"] = "Proxy Authentication Required") {
            const protocol = {
                body,
                status: StatusCodes.PROXY_AUTHENTICATION_REQUIRED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new ProxyAuthenticationRequired(_);
        }
    }

    export class RequestTimeout extends End {
        constructor(body: Protocol["body"] = "Request Timeout") {
            const protocol = {
                body,
                status: StatusCodes.REQUEST_TIMEOUT,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new RequestTimeout(_);
        }
    }

    export class Conflict extends End {
        constructor(body: Protocol["body"] = "Conflict") {
            const protocol = {
                body,
                status: StatusCodes.CONFLICT,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new Conflict(_);
        }
    }

    export class Gone extends End {
        constructor(body: Protocol["body"] = "Gone") {
            const protocol = {
                body,
                status: StatusCodes.GONE,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new Gone(_);
        }
    }

    export class LengthRequired extends End {
        constructor(body: Protocol["body"] = "Length Required") {
            const protocol = {
                body,
                status: StatusCodes.LENGTH_REQUIRED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new LengthRequired(_);
        }
    }

    export class PreconditionFailed extends End {
        constructor(body: Protocol["body"] = "Precondition Failed") {
            const protocol = {
                body,
                status: StatusCodes.PRECONDITION_FAILED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new PreconditionFailed(_);
        }
    }

    export class PayloadTooLarge extends End {
        constructor(body: Protocol["body"] = "Payload Too Large") {
            const protocol = {
                body,
                status: StatusCodes.PAYLOAD_TOO_LARGE,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new PayloadTooLarge(_);
        }
    }

    export class UriTooLong extends End {
        constructor(body: Protocol["body"] = "URI Too Long") {
            const protocol = {
                body,
                status: StatusCodes.URI_TOO_LONG,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new UriTooLong(_);
        }
    }

    export class UnsupportedMediaType extends End {
        constructor(body: Protocol["body"] = "Unsupported Media Type") {
            const protocol = {
                body,
                status: StatusCodes.UNSUPPORTED_MEDIA_TYPE,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new UnsupportedMediaType(_);
        }
    }

    export class RangeNotSatisfiable extends End {
        constructor(body: Protocol["body"] = "Range Not Satisfiable") {
            const protocol = {
                body,
                status: StatusCodes.RANGE_NOT_SATISFIABLE,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new RangeNotSatisfiable(_);
        }
    }

    export class ExpectationFailed extends End {
        constructor(body: Protocol["body"] = "Expectation Failed") {
            const protocol = {
                body,
                status: StatusCodes.EXPECTATION_FAILED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new ExpectationFailed(_);
        }
    }

    export class ImATeapot extends End {
        constructor(body: Protocol["body"] = "I'm a Teapot") {
            const protocol = {
                body,
                status: StatusCodes.IM_A_TEAPOT,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new ImATeapot(_);
        }
    }

    export class MisdirectedRequest extends End {
        constructor(body: Protocol["body"] = "Misdirected Request") {
            const protocol = {
                body,
                status: StatusCodes.MISDIRECTED_REQUEST,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new MisdirectedRequest(_);
        }
    }

    export class UnprocessableEntity extends End {
        constructor(body: Protocol["body"] = "Unprocessable Entity") {
            const protocol = {
                body,
                status: StatusCodes.UNPROCESSABLE_ENTITY,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new UnprocessableEntity(_);
        }
    }

    export class Locked extends End {
        constructor(body: Protocol["body"] = "Locked") {
            const protocol = {
                body,
                status: StatusCodes.LOCKED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new Locked(_);
        }
    }

    export class FailedDependency extends End {
        constructor(body: Protocol["body"] = "Failed Dependency") {
            const protocol = {
                body,
                status: StatusCodes.FAILED_DEPENDENCY,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new FailedDependency(_);
        }
    }

    export class TooEarly extends End {
        constructor(body: Protocol["body"] = "Too Early") {
            const protocol = {
                body,
                status: StatusCodes.TOO_EARLY,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new TooEarly(_);
        }
    }

    export class UpgradeRequired extends End {
        constructor(body: Protocol["body"] = "Upgrade Required") {
            const protocol = {
                body,
                status: StatusCodes.UPGRADE_REQUIRED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new UpgradeRequired(_);
        }
    }

    export class PreconditionRequired extends End {
        constructor(body: Protocol["body"] = "Precondition Required") {
            const protocol = {
                body,
                status: StatusCodes.PRECONDITION_REQUIRED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new PreconditionRequired(_);
        }
    }

    export class TooManyRequests extends End {
        constructor(body: Protocol["body"] = "Too Many Requests") {
            const protocol = {
                body,
                status: StatusCodes.TOO_MANY_REQUESTS,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new TooManyRequests(_);
        }
    }

    export class RequestHeaderFieldsTooLarge extends End {
        constructor(
            body: Protocol["body"] = "Request Header Fields Too Large",
        ) {
            const protocol = {
                body,
                status: StatusCodes.REQUEST_HEADER_FIELDS_TOO_LARGE,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new RequestHeaderFieldsTooLarge(_);
        }
    }

    export class UnavailableForLegalReasons extends End {
        constructor(body: Protocol["body"] = "Unavailable for Legal Reasons") {
            const protocol = {
                body,
                status: StatusCodes.UNAVAILABLE_FOR_LEGAL_REASONS,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new UnavailableForLegalReasons(_);
        }
    }

    // 5xx Server Error
    export class InternalServerError extends End {
        constructor(body: Protocol["body"] = "Internal Server Error") {
            const protocol = {
                body,
                status: StatusCodes.INTERNAL_SERVER_ERROR,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new InternalServerError(_);
        }
    }

    export class NotImplemented extends End {
        constructor(body: Protocol["body"] = "Not Implemented") {
            const protocol = {
                body,
                status: StatusCodes.NOT_IMPLEMENTED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new NotImplemented(_);
        }
    }

    export class BadGateway extends End {
        constructor(body: Protocol["body"] = "Bad Gateway") {
            const protocol = {
                body,
                status: StatusCodes.BAD_GATEWAY,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new BadGateway(_);
        }
    }

    export class ServiceUnavailable extends End {
        constructor(body: Protocol["body"] = "Service Unavailable") {
            const protocol = {
                body,
                status: StatusCodes.SERVICE_UNAVAILABLE,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new ServiceUnavailable(_);
        }
    }

    export class GatewayTimeout extends End {
        constructor(body: Protocol["body"] = "Gateway Timeout") {
            const protocol = {
                body,
                status: StatusCodes.GATEWAY_TIMEOUT,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new GatewayTimeout(_);
        }
    }

    export class HttpVersionNotSupported extends End {
        constructor(body: Protocol["body"] = "HTTP Version Not Supported") {
            const protocol = {
                body,
                status: StatusCodes.HTTP_VERSION_NOT_SUPPORTED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new HttpVersionNotSupported(_);
        }
    }

    export class VariantAlsoNegotiates extends End {
        constructor(body: Protocol["body"] = "Variant Also Negotiates") {
            const protocol = {
                body,
                status: StatusCodes.VARIANT_ALSO_NEGOTIATES,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new VariantAlsoNegotiates(_);
        }
    }

    export class InsufficientStorage extends End {
        constructor(body: Protocol["body"] = "Insufficient Storage") {
            const protocol = {
                body,
                status: StatusCodes.INSUFFICIENT_STORAGE,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new InsufficientStorage(_);
        }
    }

    export class LoopDetected extends End {
        constructor(body: Protocol["body"] = "Loop Detected") {
            const protocol = {
                body,
                status: StatusCodes.LOOP_DETECTED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new LoopDetected(_);
        }
    }

    export class NotExtended extends End {
        constructor(body: Protocol["body"] = "Not Extended") {
            const protocol = {
                body,
                status: StatusCodes.NOT_EXTENDED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new NotExtended(_);
        }
    }

    export class NetworkAuthenticationRequired extends End {
        constructor(
            body: Protocol["body"] = "Network Authentication Required",
        ) {
            const protocol = {
                body,
                status: StatusCodes.NETWORK_AUTHENTICATION_REQUIRED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new NetworkAuthenticationRequired(_);
        }
    }

    // Widely used non-standard codes (server-related)
    export class BandwidthLimitExceeded extends End {
        constructor(body: Protocol["body"] = "Bandwidth Limit Exceeded") {
            const protocol = {
                body,
                status: StatusCodes.BANDWIDTH_LIMIT_EXCEEDED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new BandwidthLimitExceeded(_);
        }
    }

    export class SiteIsOverloaded extends End {
        constructor(body: Protocol["body"] = "Site Is Overloaded") {
            const protocol = {
                body,
                status: StatusCodes.SITE_IS_OVERLOADED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new SiteIsOverloaded(_);
        }
    }

    export class SiteIsFrozen extends End {
        constructor(body: Protocol["body"] = "Site Is Frozen") {
            const protocol = {
                body,
                status: StatusCodes.SITE_IS_FROZEN,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new SiteIsFrozen(_);
        }
    }

    export class NetworkReadTimeoutError extends End {
        constructor(body: Protocol["body"] = "Network Read Timeout Error") {
            const protocol = {
                body,
                status: StatusCodes.NETWORK_READ_TIMEOUT_ERROR,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new NetworkReadTimeoutError(_);
        }
    }

    export class NetworkConnectTimeoutError extends End {
        constructor(body: Protocol["body"] = "Network Connect Timeout Error") {
            const protocol = {
                body,
                status: StatusCodes.NETWORK_CONNECT_TIMEOUT_ERROR,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new NetworkConnectTimeoutError(_);
        }
    }
}
