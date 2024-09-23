import { Response } from "express";
import {
    controllerErrHandler,
    controllerResponseHandler,
    unexpectedErrHandler,
    validationErrHandler,
} from "./defaultHandlers";
import z from "zod";
import {
    RequestValidationKeys,
    TypedRequest,
    ValidationConfig,
} from "./typedRequest";

type Handler = <T extends ValidationConfig>(
    response: unknown,
    req: TypedRequest<T>,
    res: Response,
) => Promise<void>;

export class Suvidha {
    private responseHandler = controllerResponseHandler;
    private errHandler = controllerErrHandler;
    private validationHandler = validationErrHandler;
    private unexpectedErrHandler = unexpectedErrHandler;

    constructor() { }

    set controllerResponseHandler(handler: Handler) {
        this.responseHandler = handler;
    }

    set controllerErrorHandler(handler: Handler) {
        this.errHandler = handler;
    }

    set validationErrorHandler(handler: Handler) {
        this.errHandler = handler;
    }

    set unexpectedErrorHandler(handler: (err: unknown) => Promise<void>) {
        this.unexpectedErrHandler = handler;
    }

    private async runValidations<T extends ValidationConfig>(
        validations: T,
        req: TypedRequest<T>,
        res: Response,
    ) {
        try {
            for (const [_key, schema] of Object.entries(validations)) {
                const key = _key as keyof ValidationConfig;
                const rawData = req[key];
                const data = schema.parse(rawData);
                req[key] = data;
            }
        } catch (err: unknown) {
            await this.validationHandler(err, req, res);
            throw err;
        }
    }

    /**
     *
     *
     * */
    prayog<T extends ValidationConfig, R extends any = unknown>(
        validations: T,
        requestHandler: (req: TypedRequest<T>, res: Response) => R,
    ) {
        return async (req: TypedRequest<T>, res: Response): Promise<void> => {
            try {
                await this.runValidations(validations, req, res);

                const reply = await requestHandler(req, res);
                if (!res.writableEnded) {
                    await this.responseHandler(reply, req, res);
                }
            } catch (err: unknown) {
                try {
                    if (res.writableEnded) {
                        throw err;
                    }
                    await this.errHandler(err, req, res);
                } catch (err) {
                    await this.unexpectedErrHandler(err);
                }
            }
        };
    }
}
