import { Response } from "express";
import {
    controllerErrHandler,
    controllerResponseHandler,
    unexpectedErrHandler,
    validationErrHandler,
} from "./default_handlers";
import z from "zod";
import { RequestValidationKeys, TypedRequest, ValidationConfig } from "./types";

type Handler = <const T extends ValidationConfig>(
    response: unknown,
    req: TypedRequest<T>,
    res: Response,
) => Promise<void>;

export class Suvidha {
    private responseHandler = controllerResponseHandler;
    private errHandler = controllerErrHandler;
    private validationHandler = validationErrHandler;
    private unexpectedErrHandler = unexpectedErrHandler;

    constructor() {}

    set controllerResponseHandler(handler: Handler) {
        this.responseHandler = handler;
    }

    set controllerErrHandler(handler: Handler) {
        this.errHandler = handler;
    }

    set validationErrHandler(handler: Handler) {
        this.errHandler = handler;
    }

    private async runValidations<const T extends ValidationConfig>(
        validations: T,
        req: TypedRequest<T>,
        _res: Response,
    ) {
        try {
            for (const [key, schema] of Object.entries(validations)) {
                const rawData = (req as any)[key];
                const data = schema.parse(rawData);
                (req as any)[key] = data;
            }
        } catch (err: unknown) {
            await this.validationHandler(err, req, _res);
            throw err;
        }
    }

    /**
     * An express middleware(kinda) that helps to add validation layer for incoming requests with
     * type inference and can handle sending of responses.
     *
     * @example
     * following example shows the use of schema and auto handling of response.
     * ```js
     * const router = Router();
     * const postSchema = z.object({ name: z.string() });
     * router.post(
     *     '/post/create',
     *     handler({ body: postSchema }, (req, res) => {
     *         const body = req.body; // type of body: { name: string }
     *         // do some stuff...
     *         return {
     *             message: 'post created successfully.',
     *         };
     *     }),
     * );
     * ```
     * */
    prayog<
        const T extends Partial<Record<RequestValidationKeys, z.ZodTypeAny>>,
        R extends any = unknown,
    >(
        validations: T,
        requestHandler: (req: TypedRequest<T>, res: Response) => R,
    ) {
        return async (_req: TypedRequest<T>, res: Response): Promise<void> => {
            try {
                await this.runValidations(validations, _req, res);

                const reply = await requestHandler(_req, res);
                if (!res.writableEnded) {
                    await this.responseHandler(reply, _req, res);
                }
            } catch (err: unknown) {
                try {
                    if (res.writableEnded) {
                        throw err;
                    }
                    await this.errHandler(err, _req, res);
                } catch (err) {
                    await this.unexpectedErrHandler(err);
                }
            }
        };
    }
}
