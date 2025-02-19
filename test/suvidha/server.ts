import express, { Request } from "express";
import bodyParser from "body-parser";
import { Suvidha, DefaultHandlers, Http, Handlers, Conn } from "../../src";
import { Book, BookSchema, Id, IdSchema } from "../schema";
import { BooksController } from "./controller";
import { setTimeout } from "timers/promises";
import { CtxRequest } from "../../src/suvidha";

class CustomHandlers extends DefaultHandlers implements Handlers {
    override onComplete(output: unknown, conn: Conn): Promise<void> | void {
        conn.res.setHeader("X-Custom-Header", "Custom Header");
        return super.onComplete(output, conn);
    }
}

export const suvidha = () => Suvidha.create(new CustomHandlers());
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

async function authentication(_: CtxRequest) {
    await setTimeout(500);
    return {
        user: {
            role: "admin",
            username: "ishwar",
            nest: {
                role: "nest",
            },
        },
    };
}

const roleCheck = (req: CtxRequest<{ user: { role: string } }>) => {
    if (req.context.user.role !== "admin") {
        throw Http.Forbidden.body({ message: "Admin access required" });
    }
    return {};
};

app.post(
    "/books",
    suvidha()
        .body(BookSchema)
        .use(authentication)
        .use(roleCheck)
        .use((req) => {
            if (req.context.user.role !== "admin") {
                throw new Http.Unauthorized();
            }
            return {};
        })
        .handler(async (req) => {
            const { user: _ } = req.context;
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

// app.listen(3040, () => console.log("Server running on port 3040"));
