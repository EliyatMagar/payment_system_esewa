import api from "./api";

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  stock: number;
  description: string;
  category_id: string;
  category?: any;
  created_at?: string;
  updated_at?: string;
}

export interface BookRequest {
  title: string;
  author: string;
  price: number;
  stock: number;
  description: string;
  category_id: string;
}

// Create Book
export const createBook = async (book: BookRequest): Promise<Book> => {
  const res = await api.post("/books", book);

  if (res.data?.data?.book) {
    return res.data.data.book as Book;
  }
  return res.data as Book;
};

// Get All Books
export const getAllBooks = async (): Promise<Book[]> => {
  const res = await api.get("/books");

  if (Array.isArray(res.data)) {
    return res.data as Book[];
  }
  if (res.data?.data?.books) {
    return res.data.data.books as Book[];
  }
  return res.data as Book[];
};

// Get Book By ID
export const getBookById = async (id: string): Promise<Book> => {
  const res = await api.get(`/books/${id}`);

  if (res.data?.data?.book) {
    return res.data.data.book as Book;
  }
  return res.data as Book;
};

// Update Book
export const updateBook = async (
  id: string,
  book: BookRequest
): Promise<Book> => {
  const res = await api.put(`/books/${id}`, book);

  if (res.data?.data?.book) {
    return res.data.data.book as Book;
  }
  return res.data as Book;
};

// Delete Book
export const deleteBook = async (id: string): Promise<boolean> => {
  const res = await api.delete(`/books/${id}`);
  return res.data?.success ?? true;
};

export default {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
};
