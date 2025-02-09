import { NextFunction, Response } from "express";
import { ZodError } from "zod";
import { CtxRequest } from "./suvidha";

/**
 * Connection
 */
export type Conn<
    Ctx extends Record<string, any> = {},
    Body = any,
    Params extends Record<string, any> = Record<string, any>,
    Query extends Record<string, any> = Record<string, any>,
    Reply extends any = any,
> = {
    req: CtxRequest<Ctx, Reply, Body, Params, Query>;
    res: Response;
};

/**
 * Interface for `Suvidha` handlers,
 */
export interface Handlers {
    /**
     * Called when handler throws exception
     * it must not throw any exception, if it does application might crash
     * if no global error handlers are present
     *
     * @param err - exception thrown by the handler
     * @param conn - object contain express' request and response
     * @param next - express' next function
     */
    onErr(err: unknown, conn: Conn, next: NextFunction): Promise<void> | void;

    /**
     * Called when data validation fails
     * It must complete the error response
     *
     * @param err - ZodError thrown by zod schema
     * @param conn - object contain express' request and response
     */
    onSchemaErr(err: ZodError, conn: Conn): Promise<void> | void;

    /**
     * Called when handler function returns
     *
     * @param output - value returned by the handler function
     * @param conn - object contain express' request and response
     * @param next - express' next function
     */
    onComplete(
        output: unknown,
        conn: Conn,
        next: NextFunction,
    ): Promise<void> | void;

    /**
     * Called when handler returns the value(other than `undefined`) or throws exception
     * when `import('express').Request.headersSent` is `true`.
     *
     * It is way to detect if there has been any attempt to send response twice.
     *
     * @param outputOrErr - output or exception thrown by the handler
     * @param conn - object contain express' request and response
     * @param next - express' next function
     */
    onDualResponseDetected(
        outputOrErr: unknown,
        conn: Conn,
        next: NextFunction,
    ): Promise<void> | void;
}
