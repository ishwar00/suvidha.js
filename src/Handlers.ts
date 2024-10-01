import { Request, Response } from "express";
import { ZodError } from "zod";

type Context = {
    req: Request;
    res: Response;
};

export interface Handlers {
    onErr(err: unknown, ctx: Context): Promise<void> | void;
    onSchemaErr(err: ZodError, ctx: Context): Promise<void> | void;
    onComplete(output: unknown, ctx: Context): Promise<void> | void;
    onUncaughtData(data: unknown, ctx: Context): Promise<void> | void;
}
