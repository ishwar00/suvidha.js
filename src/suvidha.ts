import { z, ZodError } from "zod";
import { Response, Request } from "express";
import * as core from "express-serve-static-core";
import { Conn, Handlers } from "./Handlers";
import { _Readonly, Merge } from "./utils.type";

export interface CtxRequest<
    C extends Record<string, any>,
    R extends any,
    B extends any = any,
    P extends Record<string, any> = Record<string, any>,
    Q extends core.Query = core.Query,
> extends Request<P, R, B, Q> {
    context: C;
}

export type Context = Record<string | symbol, any>;

export class Suvidha<
    B extends any = any,
    P extends core.ParamsDictionary = core.ParamsDictionary,
    Q extends core.Query = core.Query,
    C extends Context = {},
    Built extends keyof Suvidha = never,
> {
    private bodySchema: z.ZodType<B> = z.any();
    private paramsSchema: z.ZodType<P> = z.any();
    private querySchema: z.ZodType<Q> = z.any();
    private useHandlers: ((conn: Conn<any, any, any, any>) => any)[] = [];

    constructor(private readonly handlers: Handlers) { }

    static create(handlers: Handlers) {
        return new Suvidha(handlers);
    }

    params<T extends z.ZodTypeAny>(
        schema: T,
    ): Omit<Suvidha<B, z.infer<T>, Q, C, Built>, Built | "params"> {
        this.paramsSchema = schema;
        return this;
    }

    body<T extends z.ZodTypeAny>(
        schema: T,
    ): Omit<Suvidha<z.infer<T>, P, Q, C, Built>, Built | "body"> {
        this.bodySchema = schema;
        return this;
    }

    query<T extends z.ZodTypeAny>(
        schema: T,
    ): Omit<Suvidha<B, P, z.infer<T>, C, Built>, Built | "query"> {
        this.querySchema = schema;
        return this;
    }

    use<T extends Context>(
        middleware: (
            conn: Conn<_Readonly<C>, _Readonly<B>, _Readonly<P>, _Readonly<Q>>,
        ) => Promise<T> | T,
    ) {
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

    private async parse(conn: Conn) {
        try {
            const { body, params, query } = conn.req;
            conn.req.body = this.bodySchema.parse(body);
            conn.req.query = this.querySchema.parse(query);
            conn.req.params = this.paramsSchema.parse(params);
        } catch (err: unknown) {
            this.assertZodError(err);
            await this.handlers.onSchemaErr(err, conn);

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
        R,
        _Readonly<B>,
        _Readonly<P>,
        _Readonly<Q>
    > {
        (req as CtxRequest<{}, R, B, P, Q>).context = {};
    }

    handler<Reply>(
        handler: (
            req: CtxRequest<
                _Readonly<C>,
                Reply,
                _Readonly<B>,
                _Readonly<P>,
                _Readonly<Q>
            >,
            res: Response,
            next: core.NextFunction,
        ) => Reply,
    ) {
        // TODO: return typed express handler
        // this will help if someone wants to add post response hook
        return async (
            req: Request<P, Reply, B, Q>,
            res: Response,
            next: core.NextFunction,
        ) => {
            this.initializeContext<Reply>(req);
            const conn = { req, res };
            try {
                await this.parse(conn);
                /* If validation layer completes the response, don't next layers */
                if (res.headersSent) return;

                for (const useFn of this.useHandlers) {
                    req.context = {
                        ...req.context,
                        ...(await useFn(conn)),
                    };
                    /* If any of the middleware completes the response */
                    if (res.headersSent) return;
                }

                const output = await handler(req, res, next);

                if (res.headersSent) {
                    if (output !== undefined) {
                        await this.handlers.onDualResponseDetected(
                            output,
                            conn,
                            next,
                        );
                    }
                    return;
                }
                await this.handlers.onComplete(output, conn, next);
            } catch (err: unknown) {
                if (res.headersSent) {
                    return await this.handlers.onDualResponseDetected(
                        err,
                        conn,
                        next,
                    );
                }
                return await this.handlers.onErr(err, conn, next);
            }
        };
    }
}
