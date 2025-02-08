import { z, ZodError } from "zod";
import { Response, Request } from "express";
import * as core from "express-serve-static-core";
import { Connection, Handlers } from "./Handlers";
import { _Readonly, Merge } from "./utils.type";

export interface ContextRequest<
    T extends Record<string, any>,
    R extends any,
    B extends any = any,
    P extends Record<string, any> = Record<string, any>,
    Q extends core.Query = core.Query,
> extends Request<P, R, B, Q> {
    context: T;
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
    private useHandlers: ((conn: Connection<any, any, any, any>) => any)[] = [];

    constructor(private readonly handlers: Handlers) {}

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
        fn: (
            conn: Connection<
                _Readonly<C>,
                _Readonly<B>,
                _Readonly<P>,
                _Readonly<Q>
            >,
        ) => Promise<T> | T,
    ) {
        this.useHandlers.push(fn);
        /**
         * This wild cast is required because C and Merge<C, T> are not necessarily
         * the subtype of each other.
         */
        return this as any as Suvidha<B, P, Q, Merge<C, T>, Built>;
    }

    private async parse(conn: Connection) {
        try {
            const { body, params, query } = conn.req;
            conn.req.body = this.bodySchema.parse(body);
            conn.req.query = this.querySchema.parse(query);
            conn.req.params = this.paramsSchema.parse(params);
        } catch (err: unknown) {
            if (err instanceof ZodError) {
                await this.handlers.onSchemaErr(err, conn);
            }
            throw err;
        }
    }

    private initializeContext<R>(
        req: any,
    ): asserts req is ContextRequest<
        _Readonly<C>,
        R,
        _Readonly<B>,
        _Readonly<P>,
        _Readonly<Q>
    > {
        (req as ContextRequest<{}, R, B, P, Q>).context = {};
    }

    handler<Reply>(
        handler: (
            req: ContextRequest<
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
        return async (
            req: Request<P, Reply, B, Q>,
            res: Response,
            next: core.NextFunction,
        ) => {
            this.initializeContext<Reply>(req);
            const conn = { req, res };
            try {
                await this.parse(conn);

                for (const useFn of this.useHandlers) {
                    conn.req.context = {
                        ...conn.req.context,
                        ...(await useFn(conn)),
                    };
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
                res.headersSent
                    ? await this.handlers.onDualResponseDetected(
                          err,
                          conn,
                          next,
                      )
                    : await this.handlers.onErr(err, conn, next);
            }
        };
    }
}
