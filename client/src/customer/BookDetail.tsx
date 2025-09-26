import React from 'react';
import { useBook } from '../hooks/useBooks';
import { useParams, Link } from 'react-router-dom';

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: book, isLoading, error } = useBook(id || '');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Book Not Found</h2>
          <p className="text-red-500 mb-4">The book you're looking for doesn't exist or may have been removed.</p>
          <Link to="/books" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
            Back to Book Store
          </Link>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-600">Book not found</h2>
        <Link to="/books" className="text-blue-500 hover:text-blue-600 mt-4 inline-block">
          Return to book catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = book.stock === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="mb-6">
        <Link to="/books" className="text-blue-500 hover:text-blue-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Book Store
        </Link>
      </nav>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-1 p-8">
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                isOutOfStock 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {isOutOfStock ? 'Out of Stock' : 'Available'}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-blue-600">${book.price}</span>
              <span className="text-lg text-gray-500 ml-2">USD</span>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{book.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-sm text-gray-500">Stock</span>
                <p className="font-medium">{book.stock} units</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Category</span>
                <p className="font-medium">{book.category?.name || 'General'}</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                  isOutOfStock
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors">
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional book information */}
      <div className="mt-8 grid md:grid-cols-2 gap-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">About the Author</h3>
          <p className="text-gray-700">{book.author} is a talented author with a passion for storytelling.</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Shipping Information</h3>
          <p className="text-gray-700">Free shipping on orders over $50. Usually ships within 2-3 business days.</p>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;