import { app } from "./suvidha.server";

const request = require("supertest");

{
    const path = "/tests/use/jsValues";
    test(`GET ${path}`, async () => {
        const { status, body } = await request(app).get(path);

        expect(status).toEqual(200);
        expect(body).toEqual({
            status: "success",
            data: { message: path },
            meta: {},
        });
    });
}

{
    const path = "/posts";
    test(`POST ${path}`, async () => {
        const { status, body } = await request(app)
            .post(path)
            .send({ name: "warrrr" });

        expect(status).toEqual(200);
        expect(body).toEqual({
            status: "success",
            data: {
                name: "warrrr",
            },
            meta: {},
        });
    });
}

{
    const path = "/echo";
    test(`POST ${path}`, async () => {
        const bodyData = { name: "warrrr", age: 24 };
        const { status, body } = await request(app).post(path).send(bodyData);

        expect(status).toEqual(200);
        expect(body).toEqual({
            status: "success",
            data: bodyData,
            meta: {},
        });
    });
}
