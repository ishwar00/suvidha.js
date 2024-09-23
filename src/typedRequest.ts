import { Request } from "express";
import { z } from "zod";
import { ExpectExtends, assert } from "../utils/types";

/// inspired from: https://dev.to/denniscual/typescript-hack-simple-utility-type-for-changing-type-of-keys-4bba
export type InferZodTypes<T extends ValidationConfig> = {
    [key in keyof T]: T[key] extends z.ZodTypeAny
        ? key extends RequestValidationKeys
            ? z.infer<T[key]>
            : never
        : never;
};

type RequestParams<A, B> = {
    [K in keyof B]: B[K] extends keyof A
        ? A[B[K]]
        : B[K] extends "query"
          ? qs.ParsedQs
          : unknown; // TODO: `never` ?
};

type Params<T extends ValidationConfig> = RequestParams<InferZodTypes<T>, Keys>;
export type TypedRequest<T extends ValidationConfig> = Request<
    Params<T>[0],
    any,
    Params<T>[1],
    Params<T>[2]
>;

type Keys = ["params", "body", "query"];
export type RequestValidationKeys = Keys[number];

assert<ExpectExtends<keyof Request, RequestValidationKeys>>();

export type ValidationConfig = Partial<
    Record<RequestValidationKeys, z.ZodTypeAny>
>;

/// This will return data types in JavaScript
function __JSTypesFn() {
    return typeof ({} as any);
}
export type JsTypes = ReturnType<typeof __JSTypesFn>;
