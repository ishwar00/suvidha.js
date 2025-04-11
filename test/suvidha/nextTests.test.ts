import express, { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { Suvidha } from "../../src/suvidha";
import { Handlers } from "../../src/Handlers";

const request = require("supertest");

describe("Suvidha Library - next() Middleware", () => {
    let app: express.Express;
    let mockHandlers: jest.Mocked<Handlers>;

    class UnreachableErr extends Error {}

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Mock Handlers implementation
        mockHandlers = {
            onSchemaErr: jest.fn().mockImplementation((err, conn, _) => {
                conn.res.status(400).json({ errors: err.errors });
            }),
            onComplete: jest.fn().mockImplementation((output, conn, _) => {
                conn.res.status(200).json(output);
            }),
            onErr: jest.fn().mockImplementation((err, conn, _) => {
                if (err instanceof UnreachableErr) {
                    throw err;
                }
                conn.res.status(500).json({ error: err.message });
            }),
            onPostResponse: jest.fn().mockImplementation((_errOrOutput, _) => {
                console.warn("Dual response detected: ", _errOrOutput);
                if (_errOrOutput instanceof UnreachableErr) {
                    throw _errOrOutput;
                }
                return _errOrOutput;
            }),
        };
    });

    const suvidha = () => Suvidha.create(mockHandlers);

    it("processes valid body and calls the next middleware", async () => {
        const nextMiddleware = jest.fn((req: Request, res: Response) => {
            res.status(201).json({ fromNext: (req.body as any).name });
        });
        app.post(
            "/test",
            suvidha()
                .body(z.object({ name: z.string() }))
                .next(),
            nextMiddleware,
        );

        const response = await request(app)
            .post("/test")
            .send({ name: "valid" })
            .expect(201);

        expect(response.body).toEqual({ fromNext: "valid" });
        expect(nextMiddleware).toHaveBeenCalledTimes(1);
    });

    it("processes valid query and calls the next middleware", async () => {
        const nextMiddleware = jest.fn((req: Request, res: Response) => {
            res.status(202).json({ fromNext: (req.query as any).id });
        });
        app.get(
            "/test",
            suvidha()
                .query(z.object({ id: z.coerce.number() }))
                .next(),
            nextMiddleware as any,
        );

        const response = await request(app).get("/test?id=123").expect(202);

        expect(response.body).toEqual({ fromNext: 123 });
        expect(nextMiddleware).toHaveBeenCalledTimes(1);
    });

    it("processes valid params and calls the next middleware", async () => {
        const nextMiddleware = jest.fn((req: Request, res: Response) => {
            res.status(203).json({ fromNext: (req.params as any).userId });
        });
        app.get(
            "/test/:userId",
            suvidha()
                .params(z.object({ userId: z.string() }))
                .next(),
            nextMiddleware,
        );

        const response = await request(app).get("/test/user123").expect(203);

        expect(response.body).toEqual({ fromNext: "user123" });
        expect(nextMiddleware).toHaveBeenCalledTimes(1);
    });

    it("calls onSchemaErr and does not call the next middleware for invalid body", async () => {
        const nextMiddleware = jest.fn();
        app.post(
            "/test",
            suvidha()
                .body(z.object({ name: z.string() }))
                .next(),
            nextMiddleware,
            (_, res) => res.status(500).send("Should not reach here"), // Fallback handler
        );

        const response = await request(app)
            .post("/test")
            .send({ name: 123 })
            .expect(400);

        expect(response.body.errors).toBeDefined();
        expect(mockHandlers.onSchemaErr).toHaveBeenCalledTimes(1);
        expect(nextMiddleware).not.toHaveBeenCalled();
    });

    it("calls onSchemaErr and does not call the next middleware for invalid query", async () => {
        const nextMiddleware = jest.fn();
        app.get(
            "/test",
            suvidha()
                .query(z.object({ id: z.coerce.number() }))
                .next(),
            nextMiddleware,
            (_, res) => res.status(500).send("Should not reach here"), // Fallback handler
        );

        const response = await request(app).get("/test?id=abc").expect(400);

        expect(response.body.errors).toBeDefined();
        expect(mockHandlers.onSchemaErr).toHaveBeenCalledTimes(1);
        expect(nextMiddleware).not.toHaveBeenCalled();
    });

    it("calls onSchemaErr and does not call the next middleware for invalid params", async () => {
        const nextMiddleware = jest.fn();
        app.get(
            "/test/:userId",
            suvidha()
                .params(z.object({ userId: z.string().uuid() }))
                .next(),
            nextMiddleware,
            (_, res) => res.status(500).send("Should not reach here"), // Fallback handler
        );

        const response = await request(app)
            .get("/test/invalid-uuid")
            .expect(400);

        expect(response.body.errors).toBeDefined();
        expect(mockHandlers.onSchemaErr).toHaveBeenCalledTimes(1);
        expect(nextMiddleware).not.toHaveBeenCalled();
    });

    it("processes middleware and then calls the next middleware", async () => {
        const middleware1 = jest.fn().mockImplementation(() => {
            return { middleware1: true };
        });
        const nextMiddleware = jest.fn((req: Request, res: Response) => {
            console.log("handlerContext: ", (req as any).context);
            res.status(200).json((req as any).context);
        });
        app.get("/test", suvidha().use(middleware1).next(), nextMiddleware);

        const response = await request(app).get("/test").expect(200);

        expect(response.body).toEqual({ middleware1: true });
        expect(middleware1).toHaveBeenCalledTimes(1);
        expect(nextMiddleware).toHaveBeenCalledTimes(1);
    });

    it("processes middleware that completes the response and does not call next", async () => {
        const middleware1 = jest.fn().mockImplementation((_, res) => {
            res.status(401).json({ completedByMiddleware: true });
            return {};
        });
        const nextMiddleware = jest.fn();
        const finalHandler = jest.fn((_, res) =>
            res.status(200).send("Should not reach"),
        );

        app.get(
            "/test",
            suvidha().use(middleware1).next(),
            nextMiddleware,
            finalHandler,
        );

        const response = await request(app).get("/test").expect(401);

        expect(response.body).toEqual({ completedByMiddleware: true });
        expect(middleware1).toHaveBeenCalledTimes(1);
        expect(nextMiddleware).not.toHaveBeenCalled();
        expect(finalHandler).not.toHaveBeenCalled();
    });

    it("processes validation and middleware in order before calling next", async () => {
        const middleware1 = jest.fn().mockImplementation((req) => {
            return { bodyName: (req.body as any).name };
        });
        const nextMiddleware = jest.fn((req: Request, res: Response) => {
            res.status(200).json((req as any).context);
        });
        app.post(
            "/test",
            suvidha()
                .body(z.object({ name: z.string() }))
                .use(middleware1)
                .next(),
            nextMiddleware,
        );

        const response = await request(app)
            .post("/test")
            .send({ name: "processed" })
            .expect(200);

        expect(response.body).toEqual({ bodyName: "processed" });
        expect(middleware1).toHaveBeenCalledTimes(1);
        expect(nextMiddleware).toHaveBeenCalledTimes(1);
    });
});
