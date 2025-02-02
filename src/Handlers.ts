import { NextFunction, Response } from "express";
import * as core from "express-serve-static-core";
import { ZodError } from "zod";
import { ContextRequest } from "./suvidha";

export type Connection<
    Ctx extends Record<string, any> = {},
    Reply extends any = any,
    Body = any,
    Params extends core.ParamsDictionary = core.ParamsDictionary,
    Query extends core.Query = core.Query,
> = {
    req: ContextRequest<Ctx, Reply, Body, Params, Query>;
    res: Response;
};

// TODO: document
export interface Handlers {
    onErr(
        err: unknown,
        conn: Connection,
        next: NextFunction,
    ): Promise<void> | void;

    onSchemaErr(
        err: ZodError,
        conn: Connection,
        next: NextFunction,
    ): Promise<void> | void;

    onComplete(
        output: unknown,
        conn: Connection,
        next: NextFunction,
    ): Promise<void> | void;

    onUncaughtData(
        data: unknown,
        conn: Connection,
        next: NextFunction,
    ): Promise<void> | void;
}
