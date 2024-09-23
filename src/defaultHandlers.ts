import { Response } from "express";
import { JsTypes, TypedRequest, ValidationConfig } from "./typedRequest";
import { getReasonPhrase, StatusCodes as HttpStatus } from "http-status-codes";
import { ZodError } from "zod";
import { InternalServerError } from "./httpResponses/serverErr";
import { HttpErr } from "./httpResponses/HttpErr";
import { BadRequestErr } from "./httpResponses/clientErr";
import { HttpResponse } from "./httpResponses/HttpResponse";

export async function controllerResponseHandler<T extends ValidationConfig>(
    controllerResponse: unknown,
    req: TypedRequest<T>,
    res: Response,
): Promise<void> {
    if (isInvalidResponse(controllerResponse)) {
        throw new InternalServerError({
            cause: controllerResponse,
            description: "controller has returned unexpected value.",
        });
    }

    if (controllerResponse instanceof HttpResponse) {
        const data = {
            status: "success",
            data: controllerResponse.body,
        };

        for (const [key, value] of Object.entries(controllerResponse.headers)) {
            res.setHeader(key, value);
        }

        return void res.status(controllerResponse.statusCode).json(data);
    }

    return void res
        .status(HttpStatus.OK)
        .json({ status: "success", data: controllerResponse });
}

/// Responses from controller that are not valid
function isInvalidResponse(reply: unknown): boolean {
    const invalidReply: string[] = [
        "bigint",
        "symbol",
        "function",
    ] satisfies JsTypes[]; // Just to avoid typos

    return invalidReply.includes(typeof reply);
}

function isClientErr(statusCode: number) {
    return statusCode >= 400 && statusCode < 500;
}

export async function controllerErrHandler<T extends ValidationConfig>(
    err: unknown,
    _req: TypedRequest<T>,
    res: Response,
): Promise<void> {
    if (err instanceof HttpErr) {
        const body = err.body ?? { message: err.message };
        const statusCode = err.statusCode;
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

export async function validationErrHandler<T extends ValidationConfig>(
    err: unknown,
    req: TypedRequest<T>,
    res: Response,
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
