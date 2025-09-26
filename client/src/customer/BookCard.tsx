// src/components/customer/BookCard.tsx
import React from 'react';
import { type Book } from '../api/bookApi';
import { Link } from 'react-router-dom';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const isOutOfStock = book.stock === 0;

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
      isOutOfStock ? 'opacity-70' : ''
    }`}>
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
            {book.title}
          </h3>
          <p className="text-gray-600 text-sm">by {book.author}</p>
        </div>

        <p className="text-gray-700 text-sm line-clamp-3 mb-4">
          {book.description}
        </p>

        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-2xl font-bold text-blue-600">${book.price}</span>
            <span className="text-sm text-gray-500 ml-1">USD</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isOutOfStock 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {isOutOfStock ? 'Out of Stock' : `${book.stock} in stock`}
          </div>
        </div>

        <div className="flex space-x-2">
          <Link
            to={`/books/${book.id}`}
            className="flex-1 bg-blue-500 text-white text-center py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            View Details
          </Link>
          <button
            disabled={isOutOfStock}
            className={`flex-1 py-2 px-4 rounded transition-colors ${
              isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;