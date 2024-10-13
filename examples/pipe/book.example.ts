import express, { NextFunction } from "express";
import bodyParser from "body-parser";
import { z, ZodError } from "zod";
import { Pipe, StatusCodes, Connection } from "@waffles-lab/suvidha";

export const app = express();

// When validation fails, onSchemaErr is called
const onSchemaErr = (err: ZodError, conn: Connection, next: NextFunction) => {
    conn.res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        data: "Data provided does not meet the required format.",
        meta: {
            reason: err.flatten(),
        },
    });
};

// Create a pipe factory
const pipe = () => new Pipe(onSchemaErr); // onSchemaErr is optional

app.use(bodyParser.json());

const bookSchema = z.object({ name: z.string() });
const bookId = z.object({ id: z.string() });

app.post(
    "/store/:id/books",
    // create a middleware to validate the request
    pipe().body(bookSchema).params(bookId).validate(),
    // req is typed as Request<{ id: string }, any, { name: string }>
    (req, res) => {
        const { name } = req.body; // Type of body: { name: string }
        const { id } = req.params; // Type of params: { id: string }
        // do some stuff...
        res.status(200).json({
            data: {
                message: "book created successfully",
                book: {
                    name,
                    id,
                },
            },
            status: "success",
            meta: {},
        });
    },
);

app.listen(3000, () => console.log("Server running on port 3000"));
