import { z, ZodError } from "zod";
import { Response, Request, NextFunction } from "express";
import * as core from "express-serve-static-core";
import { Connection, Handlers } from "./Handlers";

export interface ContextRequest<
    T extends Record<string, any>,
    R extends any,
    B extends any = any,
    P extends core.ParamsDictionary = core.ParamsDictionary,
    Q extends core.Query = core.Query,
> extends Request<P, R, B, Q> {
    context: T;
}

export type Context = Record<string | symbol, any>;

/**
 * Returns the keys of T that are present in U
 */
export type CommonKeys<T, U> = keyof Filter<{
    [P in keyof T]: P extends keyof U ? T[P] : never;
}>;

/**
 * Filters out keys from T that are never
 */
export type Filter<T> = {
    [P in keyof T as T[P] extends never ? never : P]: T[P];
};

export type Merge<T, U> = Omit<T, CommonKeys<T, U>> & U;

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
    private middlewareHandlers: ((conn: Connection<any>) => any)[] = [
        () => {
            return {};
        },
    ];

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

    middleware<T extends Context>(
        fn: (conn: Connection<C>) => Promise<T> | T,
    ): Omit<Suvidha<B, P, Q, Merge<C, T>, Built>, Built | "context"> {
        this.middlewareHandlers.push(fn);
        // This cast is required to cast T to C, which are incompatible types
        return this as unknown as Suvidha<B, P, Q, Merge<C, T>, Built>;
    }

    private async parse(conn: Connection, next: NextFunction) {
        try {
            const { body, params, query } = conn.req;
            conn.req.body = this.bodySchema.parse(body);
            conn.req.query = this.querySchema.parse(query);
            conn.req.params = this.paramsSchema.parse(params);
        } catch (err: unknown) {
            if (err instanceof ZodError) {
                await this.handlers.onSchemaErr(err, conn, next);
            }
            throw Error(
                "This is not a ZodError, something is wrong. Please report this issue." +
                    `\n === Raw Error Dump ===\n ${err}`,
            );
        }
    }

    private _assertRequestContext<R>(
        req: any,
    ): asserts req is ContextRequest<C, R, B, P, Q> {
        (req as ContextRequest<{}, R, B, P, Q>).context = {};
    }

    prayog<R>(
        handler: (
            req: ContextRequest<C, R, B, P, Q>,
            res: Response,
            next: core.NextFunction,
        ) => R,
    ) {
        return async (
            req: Request<P, R, B, Q>,
            res: Response,
            next: core.NextFunction,
        ) => {
            this._assertRequestContext(req);
            const conn = { req, res };
            try {
                await this.parse(conn, next);

                let context = {};
                for (const middleware of this.middlewareHandlers) {
                    context = { ...context, ...(await middleware(conn)) };
                }
                req.context = context as C;

                const output = await handler(req, res, next);

                res.writableEnded
                    ? await this.handlers.onUncaughtData(output, conn, next)
                    : await this.handlers.onComplete(output, conn, next);
            } catch (err: unknown) {
                res.writableEnded
                    ? await this.handlers.onUncaughtData(err, conn, next)
                    : await this.handlers.onErr(err, conn, next);
            }
        };
    }
}
