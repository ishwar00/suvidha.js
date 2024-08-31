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

const body = z.object({ name: z.string() });
app.post(
    "/post",
    defaultSuvidha.prayog({ body }, (req, _) => {
        const _body = req.body; // type of body: { name: string }
        // do some stuff...
        return {
            message: "mission completed",
        };
    }),
);

function handler(req: Request<any, any, { name: string }>, res: Response) {
    // some stuff...
    return req.body;
}

app.post("/post/echo", defaultSuvidha.prayog({ body }, handler));
