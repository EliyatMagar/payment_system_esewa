import React from "react";
import {type Book } from "../../api/bookApi";

interface Props {
  book: Book;
  onDelete: (id: string) => void;
}

const BookItem: React.FC<Props> = ({ book, onDelete }) => {
  return (
    <tr>
      <td>{book.title}</td>
      <td>{book.author}</td>
      <td>${book.price}</td>
      <td>{book.stock}</td>
      <td>
        <button onClick={() => onDelete(book.id)} className="text-red-600">
          Delete
        </button>
      </td>
    </tr>
  );
};

export default BookItem;
