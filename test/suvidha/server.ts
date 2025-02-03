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
    "/books",
    suvidha().prayog(() => {
        return books.get();
    }),
);

async function middlewareA<T extends Context>(conn: Connection<T>) {
    const { context } = conn.req;
    console.log("waiting for middleware A");
    await setTimeout(5000);
    console.log("middleware A done");
    return {
        ...context,
        aStuff: {
            a: 1,
        },
    };
}

async function middlewareB<T extends Context>(conn: Connection<T>) {
    console.log("waiting for middleware B");
    await setTimeout(1000);
    console.log("middleware B done");

    return {
        bStuff: {
            b: 2,
        },
    };
}

app.post(
    "/books",
    suvidha()
        .body(BookSchema)
        .use((_) => {
            return {
                user: {
                    name: "ishwar",
                },
                stuff: {
                    a: 1,
                },
                role: "admin",
            };
        })
        .use((conn) => {
            const { context } = conn.req;
            if (context.role !== "admin") {
                throw new Http.Unauthorized();
            }

            return {
                access: "granted",
                stuff: 3,
            } as const;
        })
        .prayog(async (req) => {
            const { name: bookName, author } = req.body;
            const { } = req.context;
            return await books.create({ name: bookName, author });
        }),
);

async function updateBook(req: Request<Id, any, Book>) {
    const book = req.body;
    const { id } = req.params;
    return await books.update(id, book);
}

app.put(
    "/books/:id",
    suvidha().body(BookSchema).params(IdSchema).prayog(updateBook),
);

app.delete(
    "/books/:id",
    suvidha()
        .params(IdSchema)
        .prayog(async (req, _) => {
            const { id } = req.params;

            return await books.delete(id);
        }),
);

// app.listen(3040, () => console.log("Server running on port 3000"));
