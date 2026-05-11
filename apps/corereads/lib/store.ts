import { promises as fs } from "node:fs";
import path from "node:path";
import type { Book, BookRequest } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const BOOKS_PATH = path.join(DATA_DIR, "books.json");
const REQUESTS_PATH = path.join(DATA_DIR, "requests.json");

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(filePath: string, value: T): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

export async function getBooks(): Promise<Book[]> {
  return readJsonFile<Book[]>(BOOKS_PATH, []);
}

export async function getPublishedBooks(): Promise<Book[]> {
  const books = await getBooks();
  return books.filter((book) => book.status === "published");
}

export async function getBookById(id: string): Promise<Book | null> {
  const books = await getBooks();
  return books.find((book) => book.id === id) ?? null;
}

export async function addBook(book: Book): Promise<void> {
  const books = await getBooks();
  books.unshift(book);
  await writeJsonFile(BOOKS_PATH, books);
}

export async function addBookRequest(request: BookRequest): Promise<void> {
  const requests = await readJsonFile<BookRequest[]>(REQUESTS_PATH, []);
  requests.unshift(request);
  await writeJsonFile(REQUESTS_PATH, requests);
}
