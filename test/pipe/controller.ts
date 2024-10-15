import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "../../src";
import { BookNotFound, Books, DuplicateBookError } from "../datasource";
import { Book, Id } from "../schema";

export class BooksController {
    private books = new Books();

    constructor() {}

    private handleError(err: unknown, res: Response) {
        if (err instanceof DuplicateBookError) {
            return void res.status(StatusCodes.CONFLICT).json({
                status: "error",
                data: { message: err.message },
                meta: {},
            });
        }

        if (err instanceof BookNotFound) {
            return void res.status(StatusCodes.BAD_REQUEST).json({
                status: "error",
                data: { message: err.message },
                meta: {},
            });
        }

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: "error",
            data: { message: "Internal Server Error" },
            meta: { reason: err, description: "unknown error" },
        });
    }

    async get(_: Request, res: Response, _next: NextFunction) {
        res.status(200).json({
            status: "success",
            data: this.books.get(),
            meta: {},
        });
    }

    async create(
        req: Request<unknown, any, Book>,
        res: Response,
        _: NextFunction,
    ) {
        try {
            const book = req.body;
            const record = await this.books.create(book);
            res.status(200).json({
                status: "success",
                data: record,
                meta: {
                    message: "book created successfully",
                },
            });
        } catch (err) {
            this.handleError(err, res);
        }
    }

    async update(req: Request<Id, any, Book>, res: Response, _: NextFunction) {
        try {
            const book = req.body;
            const { id } = req.params;
            await this.books.update(id, book);
            res.status(200).json({
                status: "success",
                data: book,
                meta: {
                    message: "book updated successfully",
                },
            });
        } catch (err) {
            this.handleError(err, res);
        }
    }

    async delete(
        req: Request<Id, any, unknown>,
        res: Response,
        _: NextFunction,
    ) {
        try {
            const { id } = req.params;
            await this.books.delete(id);

            res.status(200).json({
                status: "success",
                data: {
                    message: "book deleted successfully",
                },
                meta: {},
            });
        } catch (err) {
            this.handleError(err, res);
        }
    }
}
