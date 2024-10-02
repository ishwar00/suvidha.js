import { Suvidha } from "../src";
import { DefaultHandlers } from "../src/defaultHandlers";

export function suvidha() {
    return Suvidha.create(DefaultHandlers.create());
}
