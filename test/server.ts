import express, { Request, Response } from "express";
import { defaultSuvidha } from "./prayog";
import bodyParser from "body-parser";
import { z } from "zod";

export const app = express();
app.use(bodyParser.json());

app.get(
    "/tests",
    defaultSuvidha.prayog({}, () => {
        return { message: "/tests" };
    }),
);

const schema = z.object({ name: z.string() });

app.post(
    "/posts",
    defaultSuvidha.prayog({ body: schema }, (req, _) => {
        const post = req.body; // Type of body: { name: string }
        // do some stuff...
        return {
            message: "mission completed",
        };
    }),
);

function handler(req: Request<any, any, { name: string }>, res: Response) {
    // Some stuff...
    return req.body;
}

app.post("/echo", defaultSuvidha.prayog({ body: schema }, handler));
