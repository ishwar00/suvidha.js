import { z } from "zod";
import { Response, Request } from "express";
import * as core from "express-serve-static-core";
import { Handlers } from "./Handlers";

class Suvidha<B = any, P = core.ParamsDictionary, Q = core.Query> {
    private bodySchema: z.ZodType<B> = z.any();
    private paramsSchema: z.ZodType<P> = z.any();
    private querySchema: z.ZodType<Q> = z.any();

    private constructor(private readonly handlers: Handlers) {}

    static create(handlers: Handlers) {
        return new Suvidha(handlers);
    }

    params<T extends z.ZodTypeAny>(
        schema: T,
    ): Omit<Suvidha<B, z.infer<T>, Q>, "params"> {
        this.paramsSchema = schema;
        return this;
    }

    body<T extends z.ZodTypeAny>(
        schema: T,
    ): Omit<Suvidha<z.infer<T>, P, Q>, "body"> {
        this.bodySchema = schema;
        return this;
    }

    query<T extends z.ZodTypeAny>(
        schema: T,
    ): Omit<Suvidha<B, P, z.infer<T>>, "query"> {
        this.querySchema = schema;
        return this;
    }

    parse(req: Readonly<Request>) {
        const { body, params, query } = req;

        this.bodySchema.parse(body);
        this.querySchema.parse(query);
        this.paramsSchema.parse(params);
    }

    handler<R>(
        handler: (
            req: Request<P, R, B, Q>,
            res: Response,
            next: core.NextFunction,
        ) => R,
    ) {
        return async (req: Request, res: Response, next: core.NextFunction) => {
            const ctx = { req, res };
            try {
                this.parse(req);
                const output = await handler(req as any, res, next);
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
