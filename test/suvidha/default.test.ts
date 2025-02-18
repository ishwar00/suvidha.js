import { BooksController } from "./controller";
import { onComplete, onSchemaErr } from "../utils";
import { app } from "./server";
import { BookSchema, IdSchema } from "../schema";

const request = require("supertest");
const books = new BooksController();

{
    const path = "/books";
    test(`GET ${path}`, async () => {
        const { status, body } = await request(app).get(path);

        const output = await books.get().catch((err) => {
            return err;
        });

        const expectedBody = onComplete(output);
        expect(status).toEqual(200);
        expect(body).toEqual(expectedBody);
    });
}

{
    const path = "/books";
    test(`POST ${path}`, async () => {
        const book = {
            nme: "name-10",
            author: "author-10",
        };
        const { status, body } = await request(app).post(path).send(book);

        const output = await BookSchema.parseAsync(book).catch((err) => {
            return onSchemaErr(err);
        });

        const expectedBody = onComplete(output);

        expect(status).toEqual(400);
        expect(body).toEqual(expectedBody);
    });
}

{
    const path = "/books";
    test(`POST ${path}`, async () => {
        const book = {
            name: "name-10",
            author: "author-10",
        };
        const { status, body } = await request(app).post(path).send(book);

        const output = await books.create(book).catch((err) => {
            return err;
        });
        const expectedBody = onComplete(output);

        expect(status).toEqual(200);
        expect(body).toEqual(expectedBody);
    });
}

{
    const path = "/books";
    test(`POST ${path}`, async () => {
        const book = {
            name: "name-10",
            author: "author-10",
        };
        const { status, body } = await request(app).post(path).send(book);

        const output = await books.create(book).catch((err) => {
            return err;
        });
        const expectedBody = onComplete(output);

        expect(status).toEqual(409);
        expect(body).toEqual(expectedBody);
    });
}

{
    const id = 0;
    const path = `/books/${id}`;
    test(`DELETE ${path}`, async () => {
        const { status, body } = await request(app).delete(path).send();

        const output = await books.delete(id).catch((err) => {
            return err;
        });
        const expectedBody = onComplete(output);

        expect(status).toEqual(200);
        expect(body).toEqual(expectedBody);
    });
}

{
    const id = 10020;
    const path = `/books/${id}`;
    test(`DELETE ${path}`, async () => {
        const { status, body } = await request(app).delete(path).send();

        const output = await books.delete(id).catch((err) => {
            return err;
        });
        const expectedBody = onComplete(output);

        expect(status).toEqual(400);
        expect(body).toEqual(expectedBody);
    });
}

{
    const id = "1r00@i";
    const path = `/books/${id}`;
    test(`DELETE ${path}`, async () => {
        const { status, body } = await request(app).delete(path).send();

        const output = await IdSchema.parseAsync({ id }).catch((err) => {
            return onSchemaErr(err);
        });
        const expectedBody = onComplete(output);

        expect(status).toEqual(400);
        expect(body).toEqual(expectedBody);
    });
}
