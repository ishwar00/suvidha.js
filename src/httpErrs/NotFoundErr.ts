import { HttpErr, HttpErrOptions } from "./HttpErr";
import { getReasonPhrase, StatusCodes as HttpStatus } from "http-status-codes";

const statusCode = HttpStatus.NOT_FOUND;
const errPhrase = getReasonPhrase(statusCode);

export class NotFoundErr extends HttpErr {
    constructor(
        messageOrResponse: string | Record<string, any> = errPhrase,
        errOptions?: HttpErrOptions,
    ) {
        super(messageOrResponse, statusCode, errOptions);
    }
}
