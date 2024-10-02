import { StatusCodes as HttpStatus } from "http-status-codes";
import { ZodError } from "zod";
import { InternalServerError } from "./http/serverErr";
import { HttpErr } from "./http/HttpErr";
import { BadRequestErr } from "./http/clientErr";
import { HttpResponse } from "./http/HttpResponse";
import { Context, Handlers } from "./Handlers";

export class DefaultHandlers implements Handlers {
    private constructor() {}

    private isClientErr(statusCode: number) {
        return statusCode >= 400 && statusCode < 500;
    }

    static create() {
        return new DefaultHandlers();
    }

    // Should I separate handler for schema errors?
    onErr(err: unknown, ctx: Context): Promise<void> | void {
        if (err instanceof HttpErr) {
            const { statusCode, message, body } = err;
            return void ctx.res.status(statusCode).json({
                status: this.isClientErr(statusCode) ? "error" : "fail",
                data: body ?? { message },
            });
        }

        throw new InternalServerError({ err });
    }

    onSchemaErr(err: ZodError) {
        const errData = {
            message: "Data provided does not meet the required format.",
            // TODO: Make it jsend compliant
            ...err.flatten(),
        };
        throw new BadRequestErr(errData);
    }

    onComplete(output: unknown, ctx: Context): Promise<void> | void {
        if (output instanceof HttpResponse) {
            const { headers, body, statusCode } = output;
            for (const [key, value] of Object.entries(headers)) {
                ctx.res.setHeader(key, value);
            }
            return void ctx.res.status(statusCode).json({
                status: "success",
                data: body,
            });
        }

        switch (typeof output) {
            case "string":
            case "number":
            case "boolean":
            case "undefined":
            case "object": {
                return void ctx.res.status(HttpStatus.OK).json({
                    status: "success",
                    data: output ?? null,
                });
            }
            default: {
                const err = {
                    cause: output,
                    description: `Suvidha: Can't proccess values of type ${typeof output}.`,
                };
                throw new InternalServerError(err);
            }
        }
    }

    onUncaughtData(data: unknown, _: Context): Promise<void> | void {
        console.log(`Suvidha: UncaughtData ${JSON.stringify(data)}`);
    }
}
