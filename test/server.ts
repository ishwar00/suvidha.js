import express, { Request, Response } from "express";
import { suvidha } from "./suvidha";
import bodyParser from "body-parser";
import { z } from "zod";

export const app = express();
app.use(bodyParser.json());

app.get(
    "/tests",
    suvidha().handler(() => {
        return { message: "/tests" };
    }),
);

const schema = z.object({ name: z.string() });

app.post(
    "/posts",
    suvidha()
        .body(schema)
        .handler((req, _) => {
            const post = req.body; // Type of body: { name: string }
            // do some stuff...
            return {
                message: "mission completed",
            };
        }),
);

function requestHandler(req: Request<any, any, { name: string }>, _: Response) {
    // Some stuff...
    return req.body;
}

app.post("/echo", suvidha().body(schema).handler(requestHandler));
