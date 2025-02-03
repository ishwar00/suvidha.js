import { ZodError } from "zod";
import { Connection, Handlers } from "./Handlers";
import { isProtocol, Http, StatusCodes } from "./http";

type ResonseFormat = {
    status: "error" | "success" | "fail";
    data: unknown;
    meta?: unknown;
};

export class DefaultHandlers implements Handlers {
    private constructor() { }

    private isClientErr(statusCode: number) {
        return statusCode >= 400 && statusCode < 500;
    }

    static create() {
        return new DefaultHandlers();
    }

    onErr(err: unknown, conn: Connection): Promise<void> | void {
        console.log(JSON.stringify(err));
        if (err instanceof Http.End) {
            const statusCode = err.getStatus();
            return void conn.res.status(statusCode).json({
                status: this.isClientErr(statusCode) ? "error" : "fail",
                data: err.getBody(),
                meta: err.getMeta(),
            } satisfies ResonseFormat);
        }

        const statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        conn.res.status(statusCode).json({
            status: "fail",
            data: "Internal Server Error",
            meta: {},
        } satisfies ResonseFormat);
    }

    onSchemaErr(err: ZodError) {
        throw Http.BadRequest.body(
            "Data provided does not meet the required format.",
        ).meta({
            description: "Data Validation Error",
            reason: err.flatten(),
        });
    }

    onComplete(output: unknown, conn: Connection): Promise<void> | void {
        output =
            isProtocol(output) && !(output instanceof Http.End)
                ? new Http.End(output)
                : output;

        if (output instanceof Http.End) {
            const headers = output.getHeaders();
            const statusCode = output.getStatus();

            for (const [key, value] of Object.entries(headers)) {
                conn.res.setHeader(key, value);
            }

            return void conn.res.status(statusCode).json({
                status: "success",
                data: output.getBody(),
                meta: output.getMeta(),
            } satisfies ResonseFormat);
        }

        switch (typeof output) {
            case "string":
            case "number":
            case "boolean":
            case "undefined":
            case "object": {
                return void conn.res.status(StatusCodes.OK).json({
                    status: "success",
                    data: output ?? null,
                    meta: {},
                } satisfies ResonseFormat);
            }
            default: {
                const err = {
                    cause: output,
                    description: `Suvidha: Can't proccess values of type ${typeof output}.`,
                };
                throw Http.InternalServerError.body(err);
            }
        }
    }

    onDualResponseDetected(data: unknown, _: Connection): Promise<void> | void {
        console.log(`Suvidha: UncaughtData ${JSON.stringify(data)}`);
    }
}
