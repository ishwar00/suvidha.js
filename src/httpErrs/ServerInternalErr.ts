import { HttpErr, HttpErrOptions } from './HttpErr';
import { getReasonPhrase, StatusCodes as HttpStatus } from 'http-status-codes';

const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
const errPhrase = getReasonPhrase(statusCode);

export class ServerInternalErr extends HttpErr {
    constructor(
        errOptions?: HttpErrOptions,
        messageOrResponse: string | Record<string, any> = errPhrase,
    ) {
        super(messageOrResponse, statusCode, errOptions);
    }
}
