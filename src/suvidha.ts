import { z, ZodError } from "zod";
import { Response, Request, NextFunction } from "express";
import * as core from "express-serve-static-core";
import { Connection, Handlers } from "./Handlers";

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

/**
 * Merges two types just like spread operator
 */
export type Merge<T, U> = Compute<Omit<T, CommonKeys<T, U>> & U>;

/**
 * Force TS to resolve composed types
 * Use Case: for display purpose, we want to show all the properties of a type
 * ref: https://github.com/microsoft/vscode/issues/94679#issuecomment-755194161
 */
type Compute<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

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
    private useHandlers: ((conn: Connection<any, B, P, Q>) => any)[] = [];

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
        fn: (conn: Connection<C, B, P, Q>) => Promise<T> | T,
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
    ): asserts req is ContextRequest<C, R, B, P, Q> {
        (req as ContextRequest<{}, R, B, P, Q>).context = {};
    }

    handler<Reply>(
        handler: (
            req: ContextRequest<
                Readonly<C>,
                Reply,
                Readonly<B>,
                Readonly<P>,
                Readonly<Q>
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

                let context = {};
                for (const useFn of this.useHandlers) {
                    context = { ...context, ...(await useFn(conn)) };
                }
                req.context = context as C;

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
