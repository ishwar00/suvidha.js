# Suvidha

Supercharge your [Express.js](https://expressjs.com/) experience with type-safe, validated request handlers!

Suvidha is a TypeScript library that enhances Express.js by providing:

-   Type-safe request handling
-   Built-in request validation using [Zod](https://zod.dev/)
-   Standardize request-response cycle

## Installation

```bash
npm install @waffles-lab/suvidha
# or
yarn add @waffles-lab/suvidha
# or
pnpm add @waffles-lab/suvidha
```

## Quick Start

```typescript
import express from "express";
import { z } from "zod";
import { Suvidha, DefaultHandlers } from "@waffles-lab/suvidha";

const app = express();
app.use(express.json());

// Create a Suvidha instance
const suvidha = () => Suvidha.create(DefaultHandlers.create());

// Define your schema
const userSchema = z.object({
    name: z.string(),
    age: z.number().int().min(0),
});

// Create your route
app.post(
    "/users",
    suvidha()
        .body(userSchema)
        .handler((req) => {
            const { name, age } = req.body; // Fully typed! { name: string, age: number }
            return {
                message: `Created user ${name} who is ${age} years old`,
            };
        }),
);

app.listen(3000, () => console.log("Server running on port 3000"));
```

# Features

## 1. Request Validation

Validate body, query parameters, and route parameters with [Zod](https://zod.dev/) schemas:

```typescript
const bodySchema = z.object({ name: z.string() });
const querySchema = z.object({ filter: z.enum(["active", "inactive"]) });
const paramsSchema = z.object({ id: z.string() });

app.get(
    "/users/:id",
    suvidha()
        .body(bodySchema)
        .query(querySchema)
        .params(paramsSchema)
        .handler((req) => {
            const { name } = req.body; // string
            const { filter } = req.query; // 'active' | 'inactive'
            const { id } = req.params; // string
            // Your logic here

            return { id, name, age: 45 };
        }),
);
```

## 2. Separate Handler Functions

Define your handlers separately for better organization:

```typescript
import { Request } from "express";

type UserBody = z.infer<typeof userSchema>;

function createUser(req: Request<any, any, UserBody>) {
    const { name, age } = req.body;
    // Create user logic
    return { id: 1, name, age };
}

app.post("/users", suvidha().body(userSchema).handler(createUser));
```

## 3. Built-in Error Handling

```typescript
import { NotFoundErr, BadRequestErr } from "@waffles-lab/suvidha";

app.get(
    "/users/:id",
    suvidha().handler((req) => {
        const user = findUser(req.params.id);
        if (!user) {
            throw new NotFoundErr("User not found"); // or BadRequestErr("User not found")
        }
        return user;
    }),
);
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
