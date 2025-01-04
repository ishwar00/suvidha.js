import { z, ZodError } from "zod";
import { Response, Request, NextFunction } from "express";
import * as core from "express-serve-static-core";
import { Connection, Handlers } from "./Handlers";

interface ContextRequest<
    T extends Record<string, any>,
    R extends any,
    B extends any = any,
    P extends core.ParamsDictionary = core.ParamsDictionary,
    Q extends core.Query = core.Query,
> extends Request<P, R, B, Q> {
    context: T;
}

type TContext = Record<string | symbol, any>;

export class Suvidha<
    B extends any = any,
    P extends core.ParamsDictionary = core.ParamsDictionary,
    Q extends core.Query = core.Query,
    C extends TContext = {},
    Built extends keyof Suvidha = never,
> {
    private bodySchema: z.ZodType<B> = z.any();
    private paramsSchema: z.ZodType<P> = z.any();
    private querySchema: z.ZodType<Q> = z.any();
    private contextHandler: (conn: Connection) => Promise<C> | C = () => {
        return {} as any;
    };

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

    context<T extends C>(
        fn: (conn: Connection) => Promise<T> | T,
    ): Omit<Suvidha<B, P, Q, T, Built>, Built | "context"> {
        this.contextHandler = fn;
        return this as unknown as Suvidha<B, P, Q, T, Built>;
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

    private _assertRquestConetext<R>(
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
            const conn = { req, res };
            try {
                await this.parse(conn, next);
                this._assertRquestConetext(req);
                req.context = await this.contextHandler(conn);
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
