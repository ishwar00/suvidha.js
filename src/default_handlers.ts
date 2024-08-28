import { Response } from "express";
import { JsTypes, TypedRequest, ValidationConfig } from "./types";
import { getReasonPhrase, StatusCodes as HttpStatus } from "http-status-codes";
import { ZodError } from "zod";
import { InternalServerError } from "./httpResponses/serverErr";
import { HttpErr } from "./httpResponses/HttpErr";
import { BadRequestErr } from "./httpResponses/clientErr";
import { HttpResponse } from "./httpResponses/HttpResponse";

export async function controllerResponseHandler<
    const T extends ValidationConfig,
>(response: unknown, _req: TypedRequest<T>, res: Response): Promise<void> {
    if (isInvalidResponse(response)) {
        throw new InternalServerError({
            cause: response,
            description: "controller has returned unexpected value.",
        });
    }

    if (response instanceof HttpResponse) {
        const data = {
            status: "success",
            data: response.body,
        };

        for (const [key, value] of Object.entries(response.headers)) {
            res.setHeader(key, value);
        }

        return void res.status(response.statusCode).json(data);
    }

    return void res
        .status(HttpStatus.OK)
        .json({ status: "success", data: response });
}

/// responses from controller that are not valid
function isInvalidResponse(reply: unknown): boolean {
    const invalidReply: string[] = [
        "bigint",
        "symbol",
        "function",
    ] satisfies JsTypes[]; // just to avoid typos

    return invalidReply.includes(typeof reply);
}

function isClientErr(statusCode: number) {
    return statusCode >= 400 && statusCode < 500;
}

export async function controllerErrHandler<const T extends ValidationConfig>(
    err: unknown,
    _req: TypedRequest<T>,
    res: Response,
): Promise<void> {
    if (err instanceof HttpErr) {
        const body = err.getBody() ?? { message: err.getMessage() };
        const statusCode = err.getStatus();
        return void res.status(statusCode).json({
            status: isClientErr(statusCode) ? "error" : "fail",
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

export async function validationErrHandler<const T extends ValidationConfig>(
    err: unknown,
    _req: TypedRequest<T>,
    _res: Response,
): Promise<void> {
    if (err instanceof ZodError) {
        const errData = {
            message: "Data provided does not meet the required format.",
            ...err.flatten(),
        };

        throw new BadRequestErr(errData);
    }

    throw new InternalServerError();
}

export async function unexpectedErrHandler(err: unknown) {
    console.log(JSON.stringify(err));
}
