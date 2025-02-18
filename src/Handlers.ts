import { NextFunction, Response } from "express";
import { ZodError } from "zod";
import { CtxRequest } from "./suvidha";
import { _Readonly } from "./utils.type";

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
    req: CtxRequest<Ctx, Params, Reply, Body, Query>;
    res: Response;
};

/**
 * Interface for `Suvidha` handlers,
 */
export interface Handlers {
    /**
     * Called when an error is thrown during middleware or handler execution
     * *before* any part of the response has been sent (headers or body).
     *
     * @param {unknown} err - The error object. This can be of any type.
     * @param {Conn} conn - The Conn object containing the request and response objects.
     * @param {NextFunction} next - The Express `next` function. Call `next(err)` to pass the error to the next error handling middleware or Express's default handler.
     */
    onErr(err: unknown, conn: Conn, next: NextFunction): Promise<void> | void;

    /**
     * Called when a Zod schema validation fails (e.g., request body, query parameters,
     * or path parameters do not match the defined schema).
     *
     * @param {ZodError} err - The ZodError object containing details about the validation failure.
     * @param {Conn} conn - The Conn object containing the request (`conn.req`) and response (`conn.res`) objects.  `conn.req` is a `CtxRequest`, which extends the Express `Request` with a `context` property.
     * @param {NextFunction} next - The Express `next` function. Call `next(err)` to pass the error to the next error handling middleware or Express's default handler.
     */
    onSchemaErr(
        err: ZodError,
        conn: Conn,
        next: NextFunction,
    ): Promise<void> | void;

    /**
     * Called when the handler function executes successfully *and* no
     * part of the response (headers or body) has been sent yet.
     *
     * @param {unknown} output - The value returned by the handler function. This can be of any type.
     * @param {Conn} conn - The `Conn` object containing the request and response objects.
     * @param {NextFunction} next - The Express `next` function.  While available, it's typically not needed in `onComplete`.
     */
    onComplete(
        output: unknown,
        conn: Conn,
        next: NextFunction,
    ): Promise<void> | void;

    /**
     * NOTE: `res.send()`, `res.json()` any method that sends the headers or body is
     * considered initiating the response.
     *
     * Called when something happens *after* a response has started (headers sent).
     * This can be:
     *  * Errors thrown by middleware *after* using `conn.res.send()`.
     *  * Errors thrown by the handler *after* using `res.send()`.
     *  * The handler returning a value *after* using `res.send()`. (This is primarily for bug detection).
     *
     * @param {unknown} outputOrErr - Either the error object (if an error occurred) or the returned value from the handler (if the handler returned a value after sending the response).  The type will be `unknown`.
     * @param {Conn} conn - The `Conn` object containing the request and response objects.
     * @param {NextFunction} next - The Express `next` function. While available, it's typically not needed in `onPostResponse`.
     */
    onPostResponse(
        outputOrErr: unknown,
        conn: Conn,
        next: NextFunction,
    ): Promise<void> | void;
}
