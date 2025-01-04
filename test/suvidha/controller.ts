import { Http } from "../../src";
import { BookNotFound, Books, DuplicateBookError } from "../datasource";
import { Book } from "../schema";

export class BooksController {
    private books = new Books();

    constructor() {}

    private handleError(err: unknown): never {
        if (err instanceof DuplicateBookError) {
            throw Http.Conflict.body({ message: err.message });
        }
        if (err instanceof BookNotFound) {
            throw Http.BadRequest.body({ message: err.message });
        }
        throw err;
    }

    async get() {
        return this.books.get();
    }

    async create(book: Book) {
        const record = await this.books.create(book).catch((err) => {
            this.handleError(err);
        });

        return {
            body: record,
            status: 200,
            meta: {
                message: "book created successfully",
            },
        };
    }

    async update(id: number, book: Book) {
        await this.books.update(id, book).catch((err) => {
            this.handleError(err);
        });

        return {
            body: book,
            status: 200,
            meta: {
                message: "book updated successfully",
            },
        };
    }

    async delete(id: number) {
        await this.books.delete(id).catch((err) => {
            this.handleError(err);
        });

        return {
            status: 200,
            body: {
                message: "book deleted successfully",
            },
        };
    }
}
