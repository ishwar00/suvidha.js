import { Response } from "express";
import { TypedRequest, ValidationConfig } from "./types";
import { getReasonPhrase, StatusCodes as HttpStatus } from "http-status-codes";
import { ZodError } from "zod";
import { InternalServerError } from "./httpResponses/serverErr";
import { HttpErr } from "./httpResponses/HttpErr";
import { BadRequestErr } from "./httpResponses/clientErr";

export async function controllerResponseHandler<
    const T extends ValidationConfig,
>(response: unknown, _req: TypedRequest<T>, res: Response): Promise<void> {
    switch (typeof response) {
        case "string":
        case "number":
        case "boolean":
        case "undefined":
        case "object": {
            const data = {
                status: "success",
                data: response ?? null,
            };

            return void res
                .status(HttpStatus.OK)
                .contentType("application/json")
                .json(data);
        }
        case "bigint":
        case "symbol":
        case "function":
    }

    throw new InternalServerError({
        cause: response,
        description: "controller has returned unexpected value.",
    });
}

function isApiUserErr(status: HttpStatus) {
    return [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND].includes(status);
}

export async function controllerErrHandler<const T extends ValidationConfig>(
    err: unknown,
    _req: TypedRequest<T>,
    res: Response,
): Promise<void> {
    if (err instanceof HttpErr) {
        const body = err.getBody() ?? { message: err.getMessage() };
        return void res.status(err.getStatus()).json({
            status: isApiUserErr(err.getStatus()) ? "error" : "fail",
            data: body,
        });
    }

    console.log(JSON.stringify(err, null, 2));
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: "fail",
        data: {
            message: getReasonPhrase(HttpStatus.INTERNAL_SERVER_ERROR),
        },
    });
}

export async function validationErrHandler(err: unknown): Promise<void> {
    if (err instanceof ZodError) {
        const errData = {
            message: getReasonPhrase(HttpStatus.BAD_REQUEST),
            ...err.flatten(),
        };

        throw new BadRequestErr(errData);
    }

    throw new InternalServerError();
}

export async function unexpectedErrHandler(err: unknown) {
    console.log(JSON.stringify(err));
}
