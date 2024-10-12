import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import { z, ZodError } from "zod";
import { Pipe, StatusCodes } from "../src";
import { Connection } from "../src/Handlers";

export const app = express();
const onSchemaErr = (err: ZodError, conn: Connection, next: NextFunction) => {
    conn.res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        data: "Data provided does not meet the required format.",
        meta: {
            reason: err.flatten(),
        },
    });
};

const pipe = () => new Pipe(onSchemaErr);

app.use(bodyParser.json());

app.get("/tests/use/jsValues", pipe().validate(), (_, res) => {
    res.json({
        status: "success",
        data: { message: "/tests/use/jsValues" },
        meta: {},
    });
});

const schema = z.object({ name: z.string() });

app.post("/posts", pipe().body(schema).validate(), (req, res) => {
    const { name } = req.body;
    // do some stuff...
    res.json({
        data: req.body,
        status: "success",
        meta: {},
    }).status(200);
});

// app.listen(3040, () => console.log("Server running on port 3040"));

const userSchema = z.object({
    name: z.string(),
    age: z.number().int().min(0),
});

function requestHandler(
    req: Request<any, any, { name: string; age: number }>,
    res: Response,
) {
    // Some stuff...
    const { name, age } = req.body;
    res.json({
        status: "success",
        data: req.body,
        meta: {},
    });
}

app.post("/echo", pipe().body(userSchema).validate(), requestHandler);
