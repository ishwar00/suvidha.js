import express, { Request } from "express";
import bodyParser from "body-parser";
import { Suvidha, DefaultHandlers, Http } from "../../src";
import { Book, BookSchema, Id, IdSchema } from "../schema";
import { BooksController } from "./controller";
import { Connection } from "../../src/Handlers";
import { Context } from "../../src/suvidha";
import { setTimeout } from "timers/promises";

export const suvidha = () => Suvidha.create(DefaultHandlers.create());
export const app = express();

app.use(bodyParser.json());

const books = new BooksController();

app.get(
    "/",
    suvidha().handler(() => "Hello World"),
);

app.get(
    "/books",
    suvidha().handler(() => {
        return books.get();
    }),
);

async function middlewareA<T extends Context>(_: Connection<T>) {
    await setTimeout(500);
    return {
        foo: {
            bar: {
                harshit: "harshit",
            },
        },
    };
}

function middlewareB<T extends Connection>(_: T) {
    return {
        role: "admin",
        user: "ishwar",
    };
}

app.post(
    "/books",
    suvidha()
        .body(BookSchema)
        .use(middlewareA)
        .use(middlewareB)
        .use((conn) => {
            if (conn.req.context.role !== "admin") {
                throw new Http.Unauthorized();
            }
            return {};
        })
        .handler(async (req) => {
            const {
                foo: {
                    bar: { harshit: _ },
                },
            } = req.context;
            return books.create(req.body);
        }),
);

async function updateBook(req: Request<Id, any, Book>) {
    const book = req.body;
    const { id } = req.params;
    return await books.update(id, book);
}

app.put(
    "/books/:id",
    suvidha().body(BookSchema).params(IdSchema).handler(updateBook),
);

app.delete(
    "/books/:id",
    suvidha()
        .params(IdSchema)
        .handler(async (req, _) => {
            const { id } = req.params;

            return await books.delete(id);
        }),
);

// app.listen(3040, () => console.log("Server running on port 3000"));
