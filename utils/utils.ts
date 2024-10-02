export namespace utils {
    export function assert(value: unknown): asserts value is true {
        const ok = typeof value === "boolean" && value === true;
        if (!ok) {
            throw Error(`assertion failed on ${JSON.stringify(value)}`);
        }
    }
}
