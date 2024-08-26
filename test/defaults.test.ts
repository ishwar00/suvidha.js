import { app } from "./server";

const request = require("supertest");

test("GET /tests", async () => {
  const { status, body } = await request(app).get("/tests").expect(200);

  expect(status).toEqual(200);
  expect(body).toEqual({ status: "success", data: { message: "/tests" } });
});
