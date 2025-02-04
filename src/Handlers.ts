import { NextFunction, Response } from "express";
import { ZodError } from "zod";
import { ContextRequest } from "./suvidha";

export type Connection<
    Ctx extends Record<string, any> = {},
    Body = any,
    Params extends Record<string, any> = Record<string, any>,
    Query extends Record<string, any> = Record<string, any>,
    Reply extends any = any,
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

    onSchemaErr(err: ZodError, conn: Connection): Promise<never> | never;

    onComplete(
        output: unknown,
        conn: Connection,
        next: NextFunction,
    ): Promise<void> | void;

    onDualResponseDetected(
        data: unknown,
        conn: Connection,
        next: NextFunction,
    ): Promise<void> | void;
}
