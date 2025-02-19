import express from "express";
import { z } from "zod";
import { Suvidha } from "../../src/suvidha";
import { Handlers } from "../../src/Handlers";
import { setTimeout } from "timers/promises";

const request = require("supertest");

describe("Suvidha Library", () => {
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
                    .handler(() => {
                        // Must not reach here
                        throw new UnreachableErr();
                    }),
            );

            const response = await request(app)
                .post("/test")
                .send({ name: 123 })
                .expect(400);

            expect(response.body.errors).toBeDefined();
            expect(mockHandlers.onSchemaErr).toHaveBeenCalled();
        });
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

        it("middleware completes the response", async () => {
            app.get(
                "/test",
                suvidha()
                    .use(() => {
                        return { role: "user" };
                    })
                    .use((req, res) => {
                        if (req.context.role !== "admin") {
                            res.status(403).json(req.context);
                        }
                        return {};
                    })
                    .handler(() => {
                        throw new UnreachableErr();
                    }),
            );

            const response = await request(app).get("/test").expect(403);
            expect(response.body).toEqual({ role: "user" });
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

            expect(mockHandlers.onPostResponse.mock.results[0]?.value).toEqual({
                viaReturn: true,
            });
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
                suvidha().handler((_, res) => {
                    res.json({ success: true });
                    throw new Error("Post-send error");
                }),
            );

            const response = await request(app).get("/test").expect(200);
            expect(response.body).toEqual({ success: true });

            expect(mockHandlers.onPostResponse.mock.results[0]?.value).toEqual(
                new Error("Post-send error"),
            );
        });
    });

    describe("middlewares execution order", () => {
        it("executes validations and middlewares in declared order", async () => {
            const executionOrder: string[] = [];

            app.post(
                "/test-order/:id",
                suvidha()
                    .body(z.object({ name: z.string() })) // 1. Body validation
                    .use(async () => {
                        executionOrder.push("middleware1");
                        return {};
                    })
                    .query(z.object({ page: z.coerce.number() })) // 3. Query validation
                    .params(z.object({ id: z.string() })) // 4. Params validation
                    .use(async () => {
                        executionOrder.push("middleware2");
                        return {};
                    })
                    .handler((_, res) => {
                        executionOrder.push("handler");
                        res.json({ order: executionOrder });
                    }),
            );

            const response = await request(app)
                .post("/test-order/123?page=1")
                .send({ name: "valid" });

            expect(response.body.order).toEqual([
                "middleware1", // After body validation
                "middleware2", // After params validation
                "handler",
            ]);
            expect(response.status).toBe(200);
        });

        it("validates modified data from middleware", async () => {
            app.post(
                "/test-modified-body",
                suvidha()
                    .use(async (req) => {
                        // Add field to body before validation
                        req.body = {
                            ...req.body,
                            addedByMiddleware: true,
                        };
                        return {};
                    })
                    .body(
                        z.object({
                            // Validation now expects the modified body
                            name: z.string(),
                            addedByMiddleware: z.boolean(),
                        }),
                    )
                    .handler((req, res) => {
                        res.json(req.body);
                    }),
            );

            const response = await request(app)
                .post("/test-modified-body")
                .send({ name: "test" }); // Original body lacks addedByMiddleware

            expect(response.body).toEqual({
                name: "test",
                addedByMiddleware: true,
            });
            expect(response.status).toBe(200);
        });

        it("stops execution on validation error", async () => {
            const executionOrder: string[] = [];

            app.post(
                "/test-error-stop",
                suvidha()
                    .body(z.object({ name: z.string() })) // Invalid (send number)
                    .use(() => {
                        executionOrder.push("middleware"); // Should never run
                        return {};
                    })
                    .handler(() => {
                        executionOrder.push("handler"); // Should never run
                        return {};
                    }),
            );

            const response = await request(app)
                .post("/test-error-stop")
                .send({ name: 123 });

            expect(executionOrder).toEqual([]);
            expect(response.status).toBe(400);
        });

        it("accumulates context across steps", async () => {
            app.get(
                "/test-context",
                suvidha()
                    .use(() => ({ key1: "A" })) // 1. Add key1
                    .query(z.object({ val: z.string() })) // 2. Validate query
                    .use((req) => ({
                        key2: `B-${req.context.key1}`, // Uses key1
                    }))
                    .handler((req, res) => {
                        res.json(req.context); // Should have key1 + key2
                    }),
            );

            const response = await request(app).get("/test-context?val=test");

            expect(response.body).toEqual({
                key1: "A",
                key2: "B-A",
            });
            expect(response.status).toBe(200);
        });

        it("middleware accesses validated body", async () => {
            app.post(
                "/test-access-validated-data",
                suvidha()
                    .body(z.object({ name: z.string() })) // Validate first
                    .use(async (req) => {
                        await setTimeout(100);
                        // Access parsed body
                        return { name: req.body.name.toUpperCase() };
                    })
                    .handler((req, res) => {
                        res.json(req.context);
                    }),
            );

            const response = await request(app)
                .post("/test-access-validated-data")
                .send({ name: "test" });

            expect(response.body).toEqual({ name: "TEST" });
            expect(response.status).toBe(200);
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
