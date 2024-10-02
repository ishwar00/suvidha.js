import { z, ZodError } from "zod";
import { Response, Request } from "express";
import * as core from "express-serve-static-core";
import { Context, Handlers } from "./Handlers";

export { DefaultHandlers } from "./defaultHandlers";
export * from "./http";

export class Suvidha<
    B extends any = any,
    P extends core.ParamsDictionary = core.ParamsDictionary,
    Q extends core.Query = core.Query,
    Built extends keyof Suvidha = never,
> {
    private bodySchema: z.ZodType<B> = z.any();
    private paramsSchema: z.ZodType<P> = z.any();
    private querySchema: z.ZodType<Q> = z.any();

    constructor(private readonly handlers: Handlers) {}

    static create(handlers: Handlers) {
        return new Suvidha(handlers);
    }

    params<T extends z.ZodTypeAny>(schema: T) {
        this.paramsSchema = schema;
        type K = Built | "params";
        return this as Omit<Suvidha<B, z.infer<T>, Q, K>, K>;
    }

    body<T extends z.ZodTypeAny>(schema: T) {
        this.bodySchema = schema;
        type K = Built | "body";
        return this as Omit<Suvidha<z.infer<T>, P, Q, K>, K>;
    }

    query<T extends z.ZodTypeAny>(schema: T) {
        this.querySchema = schema;
        type K = Built | "query";
        return this as Omit<Suvidha<B, P, z.infer<T>, K>, K>;
    }

    private async parse(ctx: Context) {
        try {
            const { body, params, query } = ctx.req;
            ctx.req.body = this.bodySchema.parse(body);
            ctx.req.query = this.querySchema.parse(query);
            ctx.req.params = this.paramsSchema.parse(params);
        } catch (err: unknown) {
            if (err instanceof ZodError) {
                await this.handlers.onSchemaErr(err, ctx);
            }
            // TODO: Handle this path with class asking for creating issue in GitHub
        }
    }

    handler<R>(
        handler: (
            req: Request<P, R, B, Q>,
            res: Response,
            next: core.NextFunction,
        ) => R,
    ) {
        return async (
            req: Request<P, R, B, Q>,
            res: Response,
            next: core.NextFunction,
        ) => {
            const ctx = { req, res };
            try {
                await this.parse(ctx);
                const output = await handler(req, res, next);
                res.writableEnded
                    ? await this.handlers.onUncaughtData(output, ctx)
                    : await this.handlers.onComplete(output, ctx);
            } catch (err: unknown) {
                res.writableEnded
                    ? await this.handlers.onUncaughtData(err, ctx)
                    : await this.handlers.onErr(err, ctx);
            }
        };
    }
}
