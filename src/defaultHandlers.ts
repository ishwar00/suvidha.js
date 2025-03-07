import { ZodError } from "zod";
import { Conn, Handlers } from "./Handlers";
import { isProtocol, Http, StatusCodes, Meta } from "./http";
import util from "util";
import { NextFunction } from "express";

type ResonseFormat = {
    status: "error" | "success" | "fail";
    data: unknown;
    meta: unknown;
};

export type Formatter = (status: number, body: unknown, meta?: Meta) => any;

export const defaultFormatter: Formatter = (status, body, meta) => {
    const mapToStatus = (statusCode: number): ResonseFormat["status"] => {
        if (statusCode >= 400 && statusCode < 500) {
            // Client error
            return "fail";
        } else if (statusCode >= 500) {
            // Server error
            return "error";
        } else {
            return "success";
        }
    };

    return {
        status: mapToStatus(status),
        data: body,
        meta,
    } satisfies ResonseFormat;
};

export class DefaultHandlers implements Handlers {
    constructor(private readonly fmt: Formatter = defaultFormatter) {}

    static create(fmt?: Formatter) {
        return new DefaultHandlers(fmt);
    }

    private setHeaders(conn: Conn, headers: Record<string, string>): void {
        headers = {
            "Content-Type": "application/json",
            ...headers,
        };

        for (const [key, value] of Object.entries(headers)) {
            conn.res.setHeader(key, value);
        }
    }

    onErr(err: unknown, conn: Conn): Promise<void> | void {
        if (err instanceof Http.End) {
            const statusCode = err.getStatus();
            this.setHeaders(conn, err.getHeaders());

            return void conn.res
                .status(statusCode)
                .send(this.fmt(statusCode, err.getBody(), err.getMeta()));
        }

        const statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        conn.res
            .status(statusCode)
            .send(this.fmt(statusCode, "Internal Server Error", {}));
    }

    onSchemaErr(
        _err: ZodError,
        _conn: Conn,
        _next: NextFunction,
    ): Promise<void> | void {
        throw Http.BadRequest.body(
            "Data provided does not meet the required format.",
        );
    }

    onComplete(output: unknown, conn: Conn): Promise<void> | void {
        if (isProtocol(output) && !(output instanceof Http.End)) {
            output = new Http.End(output);
        }

        if (output instanceof Http.End) {
            const statusCode = output.getStatus();
            this.setHeaders(conn, output.getHeaders());

            return void conn.res
                .status(statusCode)
                .send(this.fmt(statusCode, output.getBody(), output.getMeta()));
        }

        switch (typeof output) {
            case "string":
            case "number":
            case "boolean":
            case "undefined":
            case "object": {
                return void conn.res
                    .status(StatusCodes.OK)
                    .send(this.fmt(StatusCodes.OK, output ?? null, {}));
            }
            default: {
                console.error({
                    cause: output,
                    description: `Suvidha: Can't proccess values of type ${typeof output}.`,
                });
                throw new Http.InternalServerError();
            }
        }
    }

    onPostResponse(data: unknown, _: Conn): Promise<void> | void {
        console.warn(
            `Suvidha(onPostResponse): ${util.inspect(data, { depth: 10 })}`,
        );
    }
}
