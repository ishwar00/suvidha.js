<p align="center">
  <h1 align="center">Suvidha</h1>
</p>

# Why one more package?

I work with [typescript](https://www.typescriptlang.org/) and [Express.js](https://expressjs.com/) a lot. There were couple of things I wanted,

-   **Type-safe** request handling.
-   Easy response handling.

And I was not looking for a solution that will Hack over Express.js like [Nest.js](https://nestjs.com/).
Something easy to plugin and unplug.

# Hence Suvidha.

Suvidha is a TypeScript library improves Express.js experience by providing:

-   Type-safe request handling using [Zod](https://zod.dev/)
-   Easy response handling

## Installation

```bash
npm install @waffles-lab/suvidha
```

## Quick Start

1. Type-safe request handling.

<details>

```typescript
import express, { NextFunction } from "express";
import bodyParser from "body-parser";
import { z, ZodError } from "zod";
import { Pipe, StatusCodes, Connection } from "@waffles-lab/suvidha";

export const app = express();

// When validation fails, onSchemaErr is called
const onSchemaErr = (err: ZodError, conn: Connection, next: NextFunction) => {
    conn.res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        data: "Data provided does not meet the required format.",
        meta: {
            reason: err.flatten(),
        },
    });
};

// Create a pipe factory
const pipe = () => new Pipe(onSchemaErr); // onSchemaErr is optional

app.use(bodyParser.json());

const bookSchema = z.object({ name: z.string() });
const bookId = z.object({ id: z.string() });

app.post(
    "/store/:id/books",
    // create a middleware to validate the request
    pipe()
        .body(bookSchema)
        .params(bookId)
        .validate(),
    // req is typed as Request<{ id: string }, any, { name: string }>
    (req, res) => {
        const { name } = req.body; // Type of body: { name: string }
        const { id } = req.params; // Type of params: { id: string }
        // do some stuff...
        res.status(200).json({
            data: {
                message: "book created successfully",
                book: {
                    name,
                    id,
                },
            },
            status: "success",
            meta: {},
        });
    },
);

app.listen(3000, () => console.log("Server running on port 3000"));
```
</details>

2. Type-safe request handling and easy response handling.

<details>

```typescript
import express from "express";
import { z } from "zod";
import { Suvidha, DefaultHandlers } from "@waffles-lab/suvidha";

const app = express();
app.use(express.json());

// Create a Suvidha factory
const suvidha = () => Suvidha.create(DefaultHandlers.create());

const bookSchema = z.object({ name: z.string() });
const bookId = z.object({ id: z.string() });

app.post(
    "/store/:id/books",
    // validation is similar to pipe
    suvidha()
        .body(bookSchema)
        .params(bookId)
        // req is typed as Request<{ id: string }, any, { name: string }>
        .prayog((req, _) => {
            const { name } = req.body; // Type of body: { name: string }
            const { id } = req.params; // Type of params: { id: string }
            // do some stuff...

            // return the body, rest will be handled by default handlers
            return {
                message: "book created successfully",
                book: {
                    name,
                    id,
                },
            };
        }),
);

app.listen(3000, () => console.log("Server running on port 3000"));
```

</details>

Both of the above examples produce the same output:

```json
{
    "status": "success",
    "data": {
        "message": "book created successfully",
        "book": {
            "name": "foo",
            "id": "bar"
        }
    },
    "meta": {}
}
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
