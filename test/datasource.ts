type Book = {
    name: string;
    author: string;
    id: number;
};

export class DuplicateBookError extends Error {
    constructor(name: string) {
        super(`Book name already exists: ${name}`);
    }
}

export class BookNotFound extends Error {
    constructor(id: number) {
        super(`Book not found: ${id}`);
    }
}

export class Books {
    private books: Book[];
    constructor() {
        this.books = Array(10)
            .fill(0)
            .map((_, i) => {
                return {
                    id: i,
                    name: `book-${i}`,
                    author: `author-${i}`,
                } satisfies Book;
            });
    }

    private assertUniqueName(name: string) {
        const ok = this.books.every((b) => b.name !== name);
        if (!ok) {
            throw new DuplicateBookError(name);
        }
    }

    getNumberOfBooks() {
        return this.books.length;
    }

    async create(book: Omit<Book, "id">) {
        this.assertUniqueName(book.name);

        const id = this.books.length;
        const bookWithId = { id, ...book };
        this.books.push(bookWithId);
        return bookWithId;
    }

    async update(id: number, book: Omit<Book, "id">) {
        this.assertUniqueName(book.name);
        const index = this.books.findIndex((b) => b.id === id);
        if (index === -1) {
            throw new BookNotFound(id);
        }

        this.books[index] = { ...book, id };
    }

    async delete(id: number) {
        const index = this.books.findIndex((b) => b.id === id);
        if (index === -1) {
            throw new BookNotFound(id);
        }
        this.books.splice(index, 1);
    }

    get(): Book[];
    get(id: number): Book | undefined;
    get(id?: number): Book[] | Book | undefined {
        if (id === undefined) {
            return this.books;
        }
        const index = this.books.findIndex((b) => b.id === id);
        return this.books[index];
    }
}
