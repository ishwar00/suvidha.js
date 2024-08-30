## What this solves?

We add validation layer for incoming requests say using a middleware in **Express**. It's all good and nice, but types are not synced.
What I mean is if you change schema there is no way request handler will know nor does your compiler that request body(say) has changed.

let me explain through example

```ts
const params = z.object({ name: z.string() });
app.post(
    "/post/create",
    defaultSuvidha.prayog({ body: params }, (req, _) => {
        const body = req.body; // type of body: { name: string }
        // do some stuff...
    }),
);

// with request handler
function handler(req: Request<{ name: string }>, res: Response) {
    // some stuff...
}

app.post("/post/create", defaultSuvidha.prayog({ params }, handler));
```

It's little difficult to explain, it's a middleware? sort of, which adds a validation layer with type inference, not just that...(will add the rest of doc soon)
