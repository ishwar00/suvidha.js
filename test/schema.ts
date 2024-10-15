import { z } from "zod";

export const BookSchema = z.object({
    name: z.string(),
    author: z.string(),
});

export const IdSchema = z.object({
    id: z.string().pipe(z.coerce.number()),
});

export type Book = z.infer<typeof BookSchema>;
export type Id = z.infer<typeof IdSchema>;
