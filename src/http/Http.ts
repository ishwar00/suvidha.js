import { z } from "zod";
import { StatusCodes } from "./statusCodes";

type Headers = Record<string, string>;
type Meta = {
    reason?: unknown;
    description?: string;
} & Record<string, unknown>;

type Protocol = {
    body: string | Record<string, unknown>;
    status: number;
    headers?: Headers;
    meta?: Meta;
};

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
    // TODO: document
    export class End {
        constructor(protected readonly protocol: Protocol) {
            this.protocol.headers = this.protocol.headers ?? {};
            this.protocol.meta = this.protocol.meta ?? {};
        }

        meta(meta: Meta) {
            this.protocol.meta = meta;
            return this;
        }

        headers(headers: Headers) {
            this.protocol.headers = headers;
            return this;
        }

        header(key: string, value: string) {
            this.protocol.headers![key] = value;
            return this;
        }

        getStatus() {
            return this.protocol.status;
        }

        getBody() {
            return this.protocol.body;
        }

        getMeta() {
            return this.protocol.meta!;
        }

        getHeaders() {
            return this.protocol.headers!;
        }
    }

    // 1xx Informational
    export class Continue extends End {
        constructor(body: Protocol["body"]) {
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
        constructor(body: Protocol["body"]) {
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
        constructor(body: Protocol["body"]) {
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
        constructor(body: Protocol["body"]) {
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
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.BAD_REQUEST,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new BadRequest(_);
        }
    }

    export class Unauthorized extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.UNAUTHORIZED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new Unauthorized(_);
        }
    }

    export class PaymentRequired extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.PAYMENT_REQUIRED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new PaymentRequired(_);
        }
    }

    export class Forbidden extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.FORBIDDEN,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new Forbidden(_);
        }
    }

    export class NotFound extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.NOT_FOUND,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new NotFound(_);
        }
    }

    export class MethodNotAllowed extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.METHOD_NOT_ALLOWED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new MethodNotAllowed(_);
        }
    }

    export class NotAcceptable extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.NOT_ACCEPTABLE,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new NotAcceptable(_);
        }
    }

    export class ProxyAuthenticationRequired extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.PROXY_AUTHENTICATION_REQUIRED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new ProxyAuthenticationRequired(_);
        }
    }

    export class RequestTimeout extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.REQUEST_TIMEOUT,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new RequestTimeout(_);
        }
    }

    export class Conflict extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.CONFLICT,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new Conflict(_);
        }
    }

    export class Gone extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.GONE,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new Gone(_);
        }
    }

    export class LengthRequired extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.LENGTH_REQUIRED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new LengthRequired(_);
        }
    }

    export class PreconditionFailed extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.PRECONDITION_FAILED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new PreconditionFailed(_);
        }
    }

    export class PayloadTooLarge extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.PAYLOAD_TOO_LARGE,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new PayloadTooLarge(_);
        }
    }

    export class UriTooLong extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.URI_TOO_LONG,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new UriTooLong(_);
        }
    }

    export class UnsupportedMediaType extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.UNSUPPORTED_MEDIA_TYPE,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new UnsupportedMediaType(_);
        }
    }

    export class RangeNotSatisfiable extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.RANGE_NOT_SATISFIABLE,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new RangeNotSatisfiable(_);
        }
    }

    export class ExpectationFailed extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.EXPECTATION_FAILED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new ExpectationFailed(_);
        }
    }

    export class ImATeapot extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.IM_A_TEAPOT,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new ImATeapot(_);
        }
    }

    export class MisdirectedRequest extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.MISDIRECTED_REQUEST,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new MisdirectedRequest(_);
        }
    }

    export class UnprocessableEntity extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.UNPROCESSABLE_ENTITY,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new UnprocessableEntity(_);
        }
    }

    export class Locked extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.LOCKED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new Locked(_);
        }
    }

    export class FailedDependency extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.FAILED_DEPENDENCY,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new FailedDependency(_);
        }
    }

    export class TooEarly extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.TOO_EARLY,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new TooEarly(_);
        }
    }

    export class UpgradeRequired extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.UPGRADE_REQUIRED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new UpgradeRequired(_);
        }
    }

    export class PreconditionRequired extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.PRECONDITION_REQUIRED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new PreconditionRequired(_);
        }
    }

    export class TooManyRequests extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.TOO_MANY_REQUESTS,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new TooManyRequests(_);
        }
    }

    export class RequestHeaderFieldsTooLarge extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.REQUEST_HEADER_FIELDS_TOO_LARGE,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new RequestHeaderFieldsTooLarge(_);
        }
    }

    export class UnavailableForLegalReasons extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
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
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.INTERNAL_SERVER_ERROR,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new InternalServerError(_);
        }
    }

    export class NotImplemented extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.NOT_IMPLEMENTED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new NotImplemented(_);
        }
    }

    export class BadGateway extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.BAD_GATEWAY,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new BadGateway(_);
        }
    }

    export class ServiceUnavailable extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.SERVICE_UNAVAILABLE,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new ServiceUnavailable(_);
        }
    }

    export class GatewayTimeout extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.GATEWAY_TIMEOUT,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new GatewayTimeout(_);
        }
    }

    export class HttpVersionNotSupported extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.HTTP_VERSION_NOT_SUPPORTED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new HttpVersionNotSupported(_);
        }
    }

    export class VariantAlsoNegotiates extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.VARIANT_ALSO_NEGOTIATES,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new VariantAlsoNegotiates(_);
        }
    }

    export class InsufficientStorage extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.INSUFFICIENT_STORAGE,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new InsufficientStorage(_);
        }
    }

    export class LoopDetected extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.LOOP_DETECTED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new LoopDetected(_);
        }
    }

    export class NotExtended extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.NOT_EXTENDED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new NotExtended(_);
        }
    }

    export class NetworkAuthenticationRequired extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
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
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.BANDWIDTH_LIMIT_EXCEEDED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new BandwidthLimitExceeded(_);
        }
    }

    export class SiteIsOverloaded extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.SITE_IS_OVERLOADED,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new SiteIsOverloaded(_);
        }
    }

    export class SiteIsFrozen extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.SITE_IS_FROZEN,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new SiteIsFrozen(_);
        }
    }

    export class NetworkReadTimeoutError extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.NETWORK_READ_TIMEOUT_ERROR,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new NetworkReadTimeoutError(_);
        }
    }

    export class NetworkConnectTimeoutError extends End {
        constructor(protocolOrBody: Protocol["body"]) {
            const protocol = {
                body: protocolOrBody,
                status: StatusCodes.NETWORK_CONNECT_TIMEOUT_ERROR,
            };
            super(protocol);
        }

        static body(_: Protocol["body"]) {
            return new NetworkConnectTimeoutError(_);
        }
    }
}
