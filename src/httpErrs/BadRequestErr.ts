import { HttpErr, HttpErrOptions } from "./HttpErr";
import { getReasonPhrase, StatusCodes as HttpStatus } from "http-status-codes";

const statusCode = HttpStatus.BAD_REQUEST;
const errPhrase = getReasonPhrase(statusCode);

export class BadRequestErr extends HttpErr {
    constructor(
        messageOrResponse: string | Record<string, any> = errPhrase,
        errOptions?: HttpErrOptions,
    ) {
        super(messageOrResponse, statusCode, errOptions);
    }
}
