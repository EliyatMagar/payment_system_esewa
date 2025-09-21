import React, { useEffect, useState } from "react";
import { type Book, getAllBooks, deleteBook } from "../../api/bookApi";
import BookItem from "./BookItem";
import BookForm from "./BookForm";

const BookList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);

  const fetchBooks = async () => {
    const data = await getAllBooks();
    setBooks(data);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteBook(id);
    fetchBooks();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Books</h2>
      <BookForm onCreated={fetchBooks} />
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <BookItem key={book.id} book={book} onDelete={handleDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookList;
