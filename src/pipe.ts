import * as core from "express-serve-static-core";
import { Connection, Handlers } from "./Handlers";
import { NextFunction, Request, RequestHandler } from "express";
import { z, ZodError } from "zod";

export class Pipe<
    B extends any = any,
    P extends core.ParamsDictionary = core.ParamsDictionary,
    Q extends core.Query = core.Query,
    Built extends keyof Pipe = never,
> {
    private bodySchema: z.ZodType<B> = z.any();
    private paramsSchema: z.ZodType<P> = z.any();
    private querySchema: z.ZodType<Q> = z.any();

    constructor(private readonly onSchemaErr?: Handlers["onSchemaErr"]) {}

    params<T extends z.ZodTypeAny>(schema: T) {
        this.paramsSchema = schema;
        type K = Built | "params";
        return this as Omit<Pipe<B, z.infer<T>, Q, K>, K>;
    }

    body<T extends z.ZodTypeAny>(schema: T) {
        this.bodySchema = schema;
        type K = Built | "body";
        return this as Omit<Pipe<z.infer<T>, P, Q, K>, K>;
    }

    query<T extends z.ZodTypeAny>(schema: T) {
        this.querySchema = schema;
        type K = Built | "query";
        return this as Omit<Pipe<B, P, z.infer<T>, K>, K>;
    }

    private validateData(req: Request) {
        const { body, params, query } = req;
        req.body = this.bodySchema.parse(body);
        req.query = this.querySchema.parse(query);
        req.params = this.paramsSchema.parse(params);
    }

    validate(
        onSchemaErr?: (
            err: ZodError,
            conn: Connection,
            next: NextFunction,
        ) => void,
    ) {
        const handler: RequestHandler<P, any, B, Q> = (req, res, next) => {
            try {
                this.validateData(req);
                next();
            } catch (err: unknown) {
                if (err instanceof ZodError) {
                    const onErr = onSchemaErr ?? this.onSchemaErr;
                    return onErr ? onErr(err, { req, res }, next) : next(err);
                }

                throw Error(
                    "This is not a ZodError, something is wrong. Please report this issue." +
                        `\n === Raw Error Dump ===\n ${JSON.stringify(err)}`,
                );
            }
        };

        return handler;
    }
}
