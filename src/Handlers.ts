import { NextFunction, Request, Response } from "express";
import * as core from "express-serve-static-core";
import { ZodError } from "zod";

export type Connection<B = any, P = core.ParamsDictionary, Q = core.Query> = {
    req: Request<P, any, B, Q>;
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
