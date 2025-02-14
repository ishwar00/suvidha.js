import { ZodError } from "zod";
import { Http, isProtocol } from "../src";

export function onSchemaErr(output: ZodError) {
    return Http.BadRequest.body(
        "Data provided does not meet the required format.",
    ).meta({
        description: "Data Validation Error",
        reason: output.flatten(),
    });
}

export function onComplete(output: unknown) {
    output =
        isProtocol(output) && !(output instanceof Http.End)
            ? new Http.End(output)
            : output;

    if (output instanceof Http.End) {
        const statusCode = output.getStatus();
        return {
            status: mapStatus(statusCode),
            data: output.getBody(),
            meta: output.getMeta(),
        };
    }

    switch (typeof output) {
        case "string":
        case "number":
        case "boolean":
        case "undefined":
        case "object": {
            return {
                status: "success",
                data: output ?? null,
                meta: {},
            };
        }
        default: {
            return output;
        }
    }
}

function mapStatus(statusCode: number) {
    if (statusCode >= 400 && statusCode < 500) {
        return "fail";
    }

    if (statusCode >= 500 && statusCode < 600) {
        return "error";
    }

    return "success";
}
