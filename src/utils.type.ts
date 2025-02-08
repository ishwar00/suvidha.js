/**
 * Returns the keys of T that are present in U
 */
export type CommonKeys<T, U> = keyof Filter<{
    [P in keyof T]: P extends keyof U ? T[P] : never;
}>;

/**
 * Filters out keys from T that are never
 */
export type Filter<T> = {
    [P in keyof T as T[P] extends never ? never : P]: T[P];
};

/**
 * Merges two types just like spread operator
 */
export type Merge<T, U> = Compute<Omit<T, CommonKeys<T, U>> & U>;

/**
 * Force TS to resolve composed types
 * Use Case: for display purpose, we want to show all the properties of a type
 * ref: https://github.com/microsoft/vscode/issues/94679#issuecomment-755194161
 */
export type Compute<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export type _Readonly<T> = Compute<Readonly<T>>;
