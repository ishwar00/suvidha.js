import { z, ZodError } from "zod";
import { Response, Request, NextFunction } from "express";
import * as core from "express-serve-static-core";
import { Connection, Handlers } from "./Handlers";

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

    private async parse(ctx: Connection, next: NextFunction) {
        try {
            const { body, params, query } = ctx.req;
            ctx.req.body = this.bodySchema.parse(body);
            ctx.req.query = this.querySchema.parse(query);
            ctx.req.params = this.paramsSchema.parse(params);
        } catch (err: unknown) {
            if (err instanceof ZodError) {
                await this.handlers.onSchemaErr(err, ctx, next);
            }
            throw Error(
                "This is not a ZodError, something is wrong. Please report this issue." +
                    `\n === Raw Error Dump ===\n ${JSON.stringify(err)}`,
            );
        }
    }

    prayog<R>(
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
                await this.parse(ctx, next);
                const output = await handler(req, res, next);
                res.writableEnded
                    ? await this.handlers.onUncaughtData(output, ctx, next)
                    : await this.handlers.onComplete(output, ctx, next);
            } catch (err: unknown) {
                res.writableEnded
                    ? await this.handlers.onUncaughtData(err, ctx, next)
                    : await this.handlers.onErr(err, ctx, next);
            }
        };
    }
}
