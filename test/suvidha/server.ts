import express, { Request } from "express";
import bodyParser from "body-parser";
import { Suvidha, DefaultHandlers } from "../../src";
import { Book, BookSchema, Id, IdSchema } from "../schema";
import { BooksController } from "./controller";

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

app.post(
    "/books",
    suvidha()
        .body(BookSchema)
        .prayog(async (req, _) => {
            const book = req.body;
            return await books.create(book);
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
