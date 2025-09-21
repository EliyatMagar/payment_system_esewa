import React, { useState } from "react";
import {type BookRequest, createBook } from "../../api/bookApi";

interface Props {
  onCreated: () => void;
}

const BookForm: React.FC<Props> = ({ onCreated }) => {
  const [form, setForm] = useState<BookRequest>({
    title: "",
    author: "",
    price: 0,
    stock: 0,
    description: "",
    category_id: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBook(form);
    onCreated();
    setForm({
      title: "",
      author: "",
      price: 0,
      stock: 0,
      description: "",
      category_id: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
      <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
      <input name="author" placeholder="Author" value={form.author} onChange={handleChange} />
      <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} />
      <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} />
      <input name="category_id" placeholder="Category ID" value={form.category_id} onChange={handleChange} />
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
      <button type="submit" className="bg-blue-600 text-white p-2 rounded">Add Book</button>
    </form>
  );
};

export default BookForm;
