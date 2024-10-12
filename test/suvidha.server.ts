import express, { Request, Response } from "express";
import { suvidha } from "./suvidha";
import bodyParser from "body-parser";
import { z } from "zod";
import { StatusCodes } from "../src";

export const app = express();

app.use(bodyParser.json());

app.get(
    "/tests/use/jsValues",
    suvidha().prayog(() => {
        return {
            message: "/tests/use/jsValues",
        };
    }),
);

const schema = z.object({ name: z.string() });

app.post(
    "/posts",
    suvidha()
        .body(schema)
        .prayog((req, _) => {
            const { name } = req.body; // Type of body: { name: string }
            // do some stuff...
            return {
                body: req.body,
                status: 200,
            };
        }),
);

// app.listen(3040, () => console.log("Server running on port 3000"));

// Define your schema
const userSchema = z.object({
    name: z.string(),
    age: z.number().int().min(0),
});

function requestHandler(req: Request<any, any, { name: string; age: number }>) {
    // Some stuff...
    const { name, age } = req.body;
    return {
        status: StatusCodes.OK,
        body: req.body,
    };
}

app.post("/echo", suvidha().body(userSchema).prayog(requestHandler));
