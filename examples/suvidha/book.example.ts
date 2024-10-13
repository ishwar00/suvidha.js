import express from "express";
import { z } from "zod";
import { Suvidha, DefaultHandlers } from "@waffles-lab/suvidha";

const app = express();
app.use(express.json());

// Create a Suvidha factory
const suvidha = () => Suvidha.create(DefaultHandlers.create());

const bookSchema = z.object({ name: z.string() });
const bookId = z.object({ id: z.string() });

app.post(
    "/store/:id/books",
    // validation is similar to pipe
    suvidha()
        .body(bookSchema)
        .params(bookId)
        // req is typed as Request<{ id: string }, any, { name: string }>
        .prayog((req, _) => {
            const { name } = req.body; // Type of body: { name: string }
            const { id } = req.params; // Type of params: { id: string }
            // do some stuff...

            // return the body, rest will be handled by default handlers
            return {
                message: "book created successfully",
                book: {
                    name,
                    id,
                },
            };
        }),
);
