import React, { useEffect, useState } from 'react';
import {
  getAllBooks,
  createBook,
  deleteBook
} from '../api/bookApi';

import type {Book} from '../api/bookApi';
import {
  getAllCategories,
  createCategory,
  deleteCategory
} from '../api/categoryApi';

import type {Category} from '../api/categoryApi';
import { getCurrentUser } from '../api/userApi';

const AdminDashboard: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userRole, setUserRole] = useState<string>('');

  const [newBook, setNewBook] = useState({ title: '', author: '', price: 0, stock: 0, description: '', category_id: '' });
  const [newCategory, setNewCategory] = useState({ name: '' });

  useEffect(() => {
    const fetchData = async () => {
      const userRes = await getCurrentUser();
      setUserRole(userRes.data.user.role);

      const booksRes = await getAllBooks();
      setBooks(booksRes.books || booksRes.data?.books || []);

      const categoriesRes = await getAllCategories();
      setCategories(categoriesRes || categoriesRes.data?.categories || []);
    };

    fetchData();
  }, []);

  const handleCreateBook = async () => {
    if (!newBook.category_id) return;
    const createdBook = await createBook(newBook);
    setBooks([...books, createdBook]);
  };

  const handleDeleteBook = async (id: string) => {
    await deleteBook(id);
    setBooks(books.filter((b) => b.id !== id));
  };

  const handleCreateCategory = async () => {
    const createdCategory = await createCategory(newCategory);
    setCategories([...categories, createdCategory]);
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    setCategories(categories.filter((c) => c.id !== id));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Role: {userRole}</p>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Categories</h2>
        <ul>
          {categories.map((cat) => (
            <li key={cat.id} className="flex justify-between">
              {cat.name}
              {userRole === 'admin' && (
                <button onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
              )}
            </li>
          ))}
        </ul>
        {userRole === 'admin' && (
          <div className="mt-2">
            <input
              type="text"
              placeholder="Category Name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ name: e.target.value })}
            />
            <button onClick={handleCreateCategory}>Add Category</button>
          </div>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Books</h2>
        <ul>
          {books.map((book) => (
            <li key={book.id} className="flex justify-between">
              {book.title} - {book.author}
              {userRole === 'admin' && (
                <button onClick={() => handleDeleteBook(book.id)}>Delete</button>
              )}
            </li>
          ))}
        </ul>

        {userRole === 'admin' && (
          <div className="mt-2 flex flex-col gap-2">
            <input
              type="text"
              placeholder="Title"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Author"
              value={newBook.author}
              onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            />
            <input
              type="number"
              placeholder="Price"
              value={newBook.price}
              onChange={(e) => setNewBook({ ...newBook, price: parseFloat(e.target.value) })}
            />
            <input
              type="number"
              placeholder="Stock"
              value={newBook.stock}
              onChange={(e) => setNewBook({ ...newBook, stock: parseInt(e.target.value) })}
            />
            <input
              type="text"
              placeholder="Description"
              value={newBook.description}
              onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
            />
            <select
              value={newBook.category_id}
              onChange={(e) => setNewBook({ ...newBook, category_id: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button onClick={handleCreateBook}>Add Book</button>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;