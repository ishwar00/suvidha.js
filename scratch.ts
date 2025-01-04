class Foo<T extends any> {
    bar<U extends any>(): Foo<T> {
        return new Foo<U>();
    }
}
