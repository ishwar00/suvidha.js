import { z } from "zod";

/// inspired from: https://dev.to/denniscual/typescript-hack-simple-utility-type-for-changing-type-of-keys-4bba
export type TypedRequest<T extends ValidationConfig> = {
    [key in keyof T]: T[key] extends z.ZodTypeAny
        ? key extends keyof Request
            ? z.infer<T[key]>
            : T[key]
        : T[key];
} & Omit<Request, keyof T>;

export type ValidationConfig = Partial<Record<keyof Request, z.ZodTypeAny>>;

/// This will return data types in Javascript
function __JSTypesFn() {
    return typeof ({} as any);
}
export type JsTypes = ReturnType<typeof __JSTypesFn>;
