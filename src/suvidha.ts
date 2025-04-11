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
 * `core.Query` from Express.js.
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

/**
 * A utility class for building Express.js route handlers with built-in
 * data validation and middleware support. It allows you to define Zod
 * schemas for request parameters, body, and query, and chain middleware
 * functions that can enrich the request context.
 *
 * @template B The expected type of the request body after validation. Defaults to `any`.
 * @template P The expected type of the route parameters after validation. Defaults to `core.ParamsDictionary`.
 * @template Q The expected type of the request query parameters after validation. Defaults to `core.Query`.
 * @template C The type of the request context object that will be available in middlewares and handlers. Defaults to `{}`.
 * @template Built A type representing the methods of `Suvidha` that have already been called (used internally to enforce chaining order). Defaults to `never`.
 */
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

    /**
     * Creates a new instance of the `Suvidha` class.
     * @param handlers An object conforming to the {@link Handlers} interface,
     * containing handler functions for different lifecycle events (e.g., error handling, completion).
     */
    constructor(private readonly handlers: Handlers) {}

    /**
     * Creates a new `Suvidha` instance. This is the preferred way to instantiate the class.
     * @param handlers An object conforming to the {@link Handlers} interface,
     * containing handler functions for different lifecycle events.
     * @returns A new `Suvidha` instance.
     */
    static create(handlers: Handlers) {
        return new Suvidha(handlers);
    }

    /**
     * Defines the Zod schema for the route parameters.
     * @template T A Zod schema type for the parameters.
     * @param schema The Zod schema to validate the route parameters against.
     * @returns An object that allows chaining other `Suvidha` methods, excluding `params`.
     */
    params<T extends z.ZodTypeAny>(
        schema: T,
    ): Omit<Suvidha<B, z.infer<T>, Q, C, Built>, Built | "params"> {
        this.schemaMap["params"] = schema;
        this.order.push("params");
        return this;
    }

    /**
     * Defines the Zod schema for the request body.
     * @template T A Zod schema type for the request body.
     * @param schema The Zod schema to validate the request body against.
     * @returns An object that allows chaining other `Suvidha` methods, excluding `body`.
     */
    body<T extends z.ZodTypeAny>(
        schema: T,
    ): Omit<Suvidha<z.infer<T>, P, Q, C, Built>, Built | "body"> {
        this.schemaMap["body"] = schema;
        this.order.push("body");
        return this;
    }

    /**
     * Defines the Zod schema for the request query parameters.
     * @template T A Zod schema type for the query parameters.
     * @param schema The Zod schema to validate the request query parameters against.
     * @returns An object that allows chaining other `Suvidha` methods, excluding `query`.
     */
    query<T extends z.ZodTypeAny>(
        schema: T,
    ): Omit<Suvidha<B, P, z.infer<T>, C, Built>, Built | "query"> {
        this.schemaMap["query"] = schema;
        this.order.push("query");
        return this;
    }

    /**
     * Acts as an Express.js middleware. It executes the configured
     * middleware functions and validates request data based on the defined
     * Zod schemas. This method returns a typed `RequestHandler`, ensuring that
     * subsequent middleware or the route handler will receive a `Request` object
     * where `req.body`, `req.params`, and `req.query` are typed according to the
     * schemas defined earlier in the `Suvidha` chain. Finally, it calls the
     * next middleware in the Express.js chain using the `next()` function.
     *
     * @template Reply The expected type of the response body (though this middleware doesn't send a specific response).
     * @returns A typed Express.js `RequestHandler` function.
     */
    next<Reply>(): RequestHandler<P, Reply, B, Q> {
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
                        // After parsing, req[ref] will be of the typed schema
                        if (ref === "body") req.body = conn.req.body;
                        if (ref === "params") req.params = conn.req.params;
                        if (ref === "query") req.query = conn.req.query;
                    } else {
                        const useFn = this.useHandlers[ref]!;
                        req.context = {
                            ...req.context,
                            ...(await useFn(req, res)),
                        };
                    }

                    /* If any of the middlewares completes the response */
                    if (res.headersSent) return;
                }

                /**
                 * Calls the next middleware function in the Express.js route chain.
                 * Due to the Zod validation, subsequent middleware or the route
                 * handler will have access to `req.body`, `req.params`, and
                 * `req.query` that are typed according to the defined schemas.
                 */
                next();
            } catch (err: unknown) {
                if (res.headersSent) {
                    return await this.handlers.onPostResponse(err, conn, next);
                }
                return await this.handlers.onErr(err, conn, next);
            }
        };
    }

    /**
     * Adds middleware to the pipeline. Middleware can access `req`, `res`, and contribute to `req.context`
     * by returning an object that is merged into it (like JavaScript object merge).
     *
     * @template T The type of the context object returned by the middleware.
     * @param middleware An asynchronous or synchronous function that takes a
     * `CtxRequest` (with the current context), a `Response`, and
     * returns a context object to be merged into the current context.
     * @returns An object that allows chaining other `Suvidha` methods. The context
     * type `C` is merged with the context type `T` returned by the middleware.
     */
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

    /**
     * Asserts that an error is a `ZodError`. If not, it throws an internal error.
     * @param err The error to check.
     * @throws {Error} If the error is not an instance of `ZodError`.
     */
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

    /**
     * Parses and validates the specified request data (`body`, `query`, or `params`)
     * against its defined Zod schema.
     * @param ref A string indicating the request data to parse ('body', 'query', or 'params').
     * @param conn An object containing the `req` and `res` objects.
     * @param next The Express.js `NextFunction`.
     */
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

    /**
     * Initializes the `context` property on the request object.
     * @template R The expected type of the response body.
     * @param req The Express.js `Request` object (which will be cast to {@link CtxRequest}).
     * @throws This method uses the `asserts` keyword and does not explicitly throw,
     * but it narrows the type of `req` to {@link CtxRequest} with an empty initial context.
     */
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

    /**
     * Builds the final Express.js `RequestHandler` that executes the configured
     * middlewares, validates the request data, and then calls the provided route handler.
     *
     * @template Reply The expected type of the response body.
     * @param handler An asynchronous or synchronous function that takes a
     * `CtxRequest` (with the accumulated context), a `Response`, and
     * the `NextFunction`. It should return the response body or call
     * `res.send()`, `res.json()`, etc.
     * @returns An Express.js `RequestHandler` function.
     */
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
        ) => Reply | Promise<Reply>,
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
                        // After parsing, req[ref] will be of the typed schema
                        if (ref === "body") req.body = conn.req.body;
                        if (ref === "params") req.params = conn.req.params;
                        if (ref === "query") req.query = conn.req.query;
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
