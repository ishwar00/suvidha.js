<div align="center">
  <h1>Suvidha</h1>
  <p>Validation • Context • Control</p>
</div>

<div align="center">
<table>
<tr>
<td>
<h3>Type-Safe Middleware</h3>
<p>Chain middleware like LEGO blocks, with auto-typed context propagation.</p>
</td>
<td>
<h3>Data Validation</h3>
<p>Zod-powered type safety for body, params, and queries—without cluttering your routes.</p>
</td>
</tr>
<tr>
<td>
<h3>Framework Independence</h3>
<p>Keep your business logic clean—no Express.js baggage.</p>
</td>
<td>
<h3>Explicit Control</h3>
<p>Fine-grained control over the request/response lifecycle.</p>
</td>
</tr>
</table>
</div>

Suvidha (सुविधा - Hindi for 'facility') is a lightweight, type-safe Express.js library that adds powerful validation, middleware context management, and streamlined response handling.

- **No Rewrites** - Adopt incrementally in existing Express apps.
- **TypeScript Native** - Inferred types end "guess what's in `req`" games.

For full documentation, see the [Suvidha Documentation](https://na-5c045cf1.mintlify.app/introduction).

## Installation

```bash
npm install suvidha
```

## Quickstart

This example demonstrates a protected user creation endpoint with validation, authentication, and authorization.

### app.ts

```ts
import express from "express";
import { Suvidha, DefaultHandlers, Formatter } from "suvidha";
import { UserSchema } from "./dto";
import { authenticate, roleCheck } from "./middlewares";
import { createUserHandler } from "./controller";

const app = express();
app.use(express.json());

const suvidha = () => Suvidha.create(new DefaultHandlers());

app.post(
    "/users",
    suvidha()
        .use(authenticate)
        .use(roleCheck)
        .body(UserSchema)
        .handler(async (req) => {
            const newUser = req.body; // Type: z.infer<typeof UserSchema>
            const { role } = req.context.user; // Type: string
            return createUserHandler(newUser, role);
        }),
);

app.listen(3000);
```

### controller.ts

```ts
import { Http } from "suvidha";
import { UserDTO } from "./dto";

declare function createUser(
    user: UserDTO,
    role: string,
): Promise<{ id: string }>;

export async function createUserHandler(user: UserDTO, role: string) {
    try {
        const result = await createUser(user, role);
        return Http.Created.body(result);
    } catch (err: any) {
        if (err.code === "DUPLICATE_EMAIL") {
            throw Http.Conflict.body({ message: "Email already exists" });
        }
        throw err; // Propagate to Suvidha's onErr handler
    }
}
```

### middlewares.ts

```ts
import { Http, CtxRequest } from "suvidha";

interface User {
    role: string;
    // ... other user properties
}

const verify = async (token: string): Promise<User> => {
    // ... your authentication logic
    return { role: "admin" }; // Example
};

export const authenticate = async (req: CtxRequest) => {
    const token = req.headers["authorization"];
    if (!token) {
        throw new Http.Unauthorized();
    }
    const user = await verify(token).catch((_) => {
        throw new Http.Unauthorized();
    });
    return { user };
};

export const roleCheck = (req: CtxRequest<{ user: User }>) => {
    if (req.context.user.role !== "admin") {
        throw Http.Forbidden.body({ message: "Admin access required" });
    }
    return {};
};
```

### dto.ts

```ts
import { z } from "zod";

export const UserSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    age: z.number().min(13),
});

export type UserDTO = z.infer<typeof UserSchema>;
```

**Sample Response (201 Created)**

```json
{
    "status": "success",
    "data": {
        "id": "67adc39ea1ff4e9d60273236"
    }
}
```
