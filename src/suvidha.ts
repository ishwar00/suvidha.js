import { z, ZodError } from "zod";
import { Response, Request, NextFunction, RequestHandler } from "express";
import * as core from "express-serve-static-core";
import { Conn, Handlers } from "./Handlers";
import { _Readonly, Merge } from "./utils.type";

/**
 * Extends the standard Express.js `Request` object with a `context` property.
 * This allows you to store and access request-specific data throughout the
 * request lifecycle, particularly useful for middleware communication and
 * data sharing between middleware and request handler.
 *
 * @template C The type of the context object. Defaults to an empty object `{}`.
 * @template P The type of the route parameters. Defaults to `Record<string, any>`.
 * @template ResBody The type of the response body. Defaults to `any`.
 * @template ReqBody The type of the request body. Defaults to `any`.
 * @template ReqQuery The type of the request query parameters. Defaults to
 *           `core.Query` from Express.js.
 *
 * @extends Express.js Request object
 */
export interface CtxRequest<
    C extends Context = {},
    P extends Record<string, any> = Record<string, any>,
    ResBody extends any = any,
    ReqBody extends any = any,
    ReqQuery extends core.Query = core.Query,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
    /**
     * An object for storing request-specific data. This is typically used
     * to share data between middleware and handlers. The data stored here
     * is type-safe according to the generic type `C`.
     */
    context: C;
}

export type Context = Record<string | symbol, any>;

type DataRef = "body" | "query" | "params";

export class Suvidha<
    B extends any = any,
    P extends core.ParamsDictionary = core.ParamsDictionary,
    Q extends core.Query = core.Query,
    C extends Context = {},
    Built extends keyof Suvidha = never,
> {
    private readonly useHandlers: ((
        req: CtxRequest<any, any, any, any, any>,
        res: Response,
    ) => any)[] = [];
    private readonly order: (DataRef | number)[] = [];
    private schemaMap: Record<DataRef, z.ZodType<any>> = {
        body: z.any(),
        params: z.any(),
        query: z.any(),
    };

    constructor(private readonly handlers: Handlers) {}

    static create(handlers: Handlers) {
        return new Suvidha(handlers);
    }

    params<T extends z.ZodTypeAny>(
        schema: T,
    ): Omit<Suvidha<B, z.infer<T>, Q, C, Built>, Built | "params"> {
        this.schemaMap["params"] = schema;
        this.order.push("params");
        return this;
    }

    body<T extends z.ZodTypeAny>(
        schema: T,
    ): Omit<Suvidha<z.infer<T>, P, Q, C, Built>, Built | "body"> {
        this.schemaMap["body"] = schema;
        this.order.push("body");
        return this;
    }

    query<T extends z.ZodTypeAny>(
        schema: T,
    ): Omit<Suvidha<B, P, z.infer<T>, C, Built>, Built | "query"> {
        this.schemaMap["query"] = schema;
        this.order.push("query");
        return this;
    }

    use<T extends Context>(
        middleware: (
            req: CtxRequest<
                _Readonly<C>,
                _Readonly<P>,
                any,
                _Readonly<B>,
                _Readonly<Q>
            >,
            res: Response,
        ) => Promise<T> | T,
    ) {
        this.order.push(this.useHandlers.length);
        this.useHandlers.push(middleware);
        /**
         * This wild cast is required because C and Merge<C, T> are not necessarily
         * the subtype of each other.
         */
        return this as any as Suvidha<B, P, Q, Merge<C, T>, Built>;
    }

    private assertZodError(err: unknown): asserts err is ZodError {
        if (err instanceof ZodError) {
            return;
        }
        throw new Error(
            "Suvidha internal error: data validation layer did not throw ZodError." +
                "\n Please create an issue at https://github.com/ishwar00/suvidha.js/issues" +
                "\n ====== Error Log ======\n" +
                err,
        );
    }

    private async parse(ref: DataRef, conn: Conn, next: NextFunction) {
        try {
            conn.req[ref] = this.schemaMap[ref].parse(conn.req[ref]);
        } catch (err: unknown) {
            this.assertZodError(err);
            await this.handlers.onSchemaErr(err, conn, next);

            if (!conn.res.headersSent) {
                console.warn(
                    "Suvidha: onSchemaErr() did not complete the data validation error response. Re-throwing the error.",
                );
                throw err;
            }
        }
    }

    private initializeContext<R>(
        req: any,
    ): asserts req is CtxRequest<
        _Readonly<C>,
        _Readonly<P>,
        R,
        _Readonly<B>,
        _Readonly<Q>
    > {
        (req as CtxRequest<{}, P, R, B, Q>).context = {};
    }

    handler<Reply>(
        handler: (
            req: CtxRequest<
                _Readonly<C>,
                _Readonly<P>,
                Reply,
                _Readonly<B>,
                _Readonly<Q>
            >,
            res: Response<Reply>,
            next: core.NextFunction,
        ) => Reply,
    ): RequestHandler<P, Reply, B, Q> {
        return async (
            req: Request<P, Reply, B, Q>,
            res: Response,
            next: core.NextFunction,
        ) => {
            this.initializeContext<Reply>(req);
            const conn = { req, res };
            try {
                for (const ref of this.order) {
                    if (typeof ref === "string") {
                        await this.parse(ref, conn, next);
                    } else {
                        const useFn = this.useHandlers[ref]!;
                        req.context = {
                            ...req.context,
                            ...(await useFn(req, res)),
                        };
                    }

                    /* If any of the middleware completes the response */
                    if (res.headersSent) return;
                }

                const output = await handler(req, res, next);

                if (res.headersSent) {
                    if (output !== undefined) {
                        await this.handlers.onPostResponse(output, conn, next);
                    }
                    return;
                }
                await this.handlers.onComplete(output, conn, next);
            } catch (err: unknown) {
                if (res.headersSent) {
                    return await this.handlers.onPostResponse(err, conn, next);
                }
                return await this.handlers.onErr(err, conn, next);
            }
        };
    }
}
