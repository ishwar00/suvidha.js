export namespace types {
    export type Expect<T extends true> = T;

    export type Equal<X, Y> =
        (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
            ? true
            : false;

    export type ExpectExtends<VALUE, EXPECTED> = EXPECTED extends VALUE
        ? true
        : false;

    export function assert<_ extends true>() {}
}
