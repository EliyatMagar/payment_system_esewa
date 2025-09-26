// src/components/customer/FeaturedBooks.tsx
import React from 'react';
import { useBooks } from '../hooks/useBooks';
import { type Book } from '../api/bookApi';
import BookCard from './BookCard';

const FeaturedBooks: React.FC = () => {
  const { data: books, isLoading, error } = useBooks();

  // For demo purposes, show first 4 books as featured
  const featuredBooks = books?.slice(0, 4) || [];

  if (isLoading || error || !featuredBooks.length) {
    return null; // Don't show featured section if loading, error, or no books
  }

  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Books</h2>
          <p className="text-lg text-gray-600 mt-2">Discover our most popular titles</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredBooks.map((book: Book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks;