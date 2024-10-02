import { Request, Response } from "express";
import * as core from "express-serve-static-core";
import { ZodError } from "zod";

export type Context<B = any, P = core.ParamsDictionary, Q = core.Query> = {
    req: Request<P, any, B, Q>;
    res: Response;
};

export interface Handlers {
    onErr(err: unknown, ctx: Context): Promise<void> | void;
    onSchemaErr(err: ZodError, ctx: Context): Promise<void> | void;
    onComplete(output: unknown, ctx: Context): Promise<void> | void;
    onUncaughtData(data: unknown, ctx: Context): Promise<void> | void;
}
