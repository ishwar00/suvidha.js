import express from "express";
import { z } from "zod";
import { Suvidha } from "../../src/suvidha";
import { Handlers } from "../../src/Handlers";
import { setTimeout } from "timers/promises";

const request = require("supertest");

describe("Suvidha Library", () => {
    let app: express.Express;
    let mockHandlers: jest.Mocked<Handlers>;

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
                conn.res.status(500).json({ error: err.message });
            }),
            onDualResponseDetected: jest
                .fn()
                .mockImplementation((_errOrOutput, _) => {
                    console.warn("Dual response detected: ", _errOrOutput);
                    return _errOrOutput;
                }),
        };
    });

    const suvidha = () => Suvidha.create(mockHandlers);

    describe("Request Validation", () => {
        it("validates body successfully", async () => {
            app.post(
                "/test",
                suvidha()
                    .body(z.object({ name: z.string() }))
                    .handler((req, _) => ({ received: req.body.name })),
            );

            const response = await request(app)
                .post("/test")
                .send({ name: "valid" })
                .expect(200);

            expect(response.body).toEqual({ received: "valid" });
        });

        it("rejects invalid body", async () => {
            app.post(
                "/test",
                suvidha()
                    .body(z.object({ name: z.string() }))
                    .handler((req, _) => ({ received: req.body.name })),
            );

            const response = await request(app)
                .post("/test")
                .send({ name: 123 })
                .expect(400);

            expect(response.body.errors).toBeDefined();
            expect(mockHandlers.onSchemaErr).toHaveBeenCalled();
        });

        // Similar tests for params and query...
    });

    describe("Middleware Context", () => {
        it("aggregates context from multiple use() calls", async () => {
            app.get(
                "/test",
                suvidha()
                    .use(() => ({ user: "alice" }))
                    .use(() => ({ role: "admin" }))
                    .handler((req, _) => req.context),
            );

            const response = await request(app).get("/test").expect(200);
            expect(response.body).toEqual({ user: "alice", role: "admin" });
        });

        it("handles async middleware", async () => {
            app.get(
                "/test",
                suvidha()
                    .use(async () => {
                        await setTimeout(10);
                        return { async: true };
                    })
                    .handler((req, _) => req.context),
            );

            const response = await request(app).get("/test").expect(200);
            expect(response.body).toEqual({ async: true });
        });
    });

    describe("Response Handling", () => {
        it("calls onComplete for returned data", async () => {
            app.get(
                "/test",
                suvidha().handler(() => ({ data: "test" })),
            );

            const response = await request(app).get("/test").expect(200);
            expect(response.body).toEqual({ data: "test" });
            expect(mockHandlers.onComplete).toHaveBeenCalled();
        });

        it("detects dual response", async () => {
            app.get(
                "/test",
                suvidha().handler((_, res) => {
                    res.status(200).json({ viaRes: true });
                    return { viaReturn: true };
                }),
            );

            const response = await request(app).get("/test").expect(200);
            expect(response.body).toEqual({ viaRes: true });

            expect(
                mockHandlers.onDualResponseDetected.mock.results[0]?.value,
            ).toEqual({ viaReturn: true });
        });
    });

    describe("Error Handling", () => {
        it("handles handler errors with onErr", async () => {
            app.get(
                "/test",
                suvidha().handler(() => {
                    throw new Error("Test error");
                }),
            );

            const response = await request(app).get("/test").expect(500);
            expect(response.body.error).toBe("Test error");
            expect(mockHandlers.onErr).toHaveBeenCalled();
        });

        it("handles errors after response sent", async () => {
            app.get(
                "/test",
                suvidha().handler((req, res) => {
                    res.json({ success: true });
                    throw new Error("Post-send error");
                }),
            );

            const response = await request(app).get("/test").expect(200);
            expect(response.body).toEqual({ success: true });

            expect(
                mockHandlers.onDualResponseDetected.mock.results[0]?.value,
            ).toEqual(new Error("Post-send error"));
        });
    });

    describe("Edge Cases", () => {
        it("stops parsing after first validation error", async () => {
            app.post(
                "/test/:id",
                suvidha()
                    .body(z.object({ name: z.string() }))
                    .params(z.object({ id: z.string().uuid() }))
                    .handler((_, res) => res.status(200).json({})),
            );

            const response = await request(app)
                .post("/test/invalid-uuid")
                .send({ name: 123 })
                .expect(400);

            // Error should be from body validation, not params
            expect(response.body.errors[0].path).toEqual(["name"]);
        });
    });
});
