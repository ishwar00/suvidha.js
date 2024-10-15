import express, { NextFunction } from "express";
import bodyParser from "body-parser";
import { Pipe, StatusCodes } from "../../src";
import { BookSchema, IdSchema } from "../schema";
import { BooksController } from "./controller";
import { ZodError } from "zod";
import { Connection } from "../../src/Handlers";

const onSchemaErr = (err: ZodError, conn: Connection, next: NextFunction) => {
    conn.res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        data: "Data provided does not meet the required format.",
        meta: {
            description: "Data Validation Error",
            reason: err.flatten(),
        },
    });
};

export const pipe = () => new Pipe(onSchemaErr);
export const app = express();

app.use(bodyParser.json());

const books = new BooksController();

app.get("/books", pipe().validate(), (...args) => books.get(...args));

app.post("/books", pipe().body(BookSchema).validate(), (...args) =>
    books.create(...args),
);

app.put(
    "/books/:id",
    pipe().body(BookSchema).params(IdSchema).validate(),
    (...args) => books.update(...args),
);

app.delete("/books/:id", pipe().params(IdSchema).validate(), (...args) =>
    books.delete(...args),
);

// app.listen(3040, () => console.log("Server running on port 3000"));
