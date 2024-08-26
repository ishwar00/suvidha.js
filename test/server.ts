import express, { RequestHandler } from "express";
import { defaultSuvidha } from "./prayog";
import bodyParser from "body-parser";

export const app = express();
app.use(bodyParser.json());

app.get(
  "/tests",
  defaultSuvidha.prayog({}, () => {
    return { message: "/tests" };
  }),
);
