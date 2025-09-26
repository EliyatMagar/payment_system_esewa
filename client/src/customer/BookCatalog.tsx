// src/components/customer/BookCatalog.tsx
import React from 'react';
import { useBooks } from "../hooks/useBooks"
import { type Book } from '../api/bookApi';
import BookCard from "./BookCard";

const BookCatalog: React.FC = () => {
  const { data: books, isLoading, error } = useBooks();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">Error loading books: {error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Book Store</h1>
        <p className="text-lg text-gray-600">Discover our amazing collection of books</p>
      </div>

      {books?.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-xl">No books available at the moment.</div>
          <p className="text-gray-400 mt-2">Please check back later.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              All Books ({books?.length || 0})
            </h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books?.map((book: Book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BookCatalog;