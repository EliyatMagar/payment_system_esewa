import React, { useState } from "react";
import {createCategory } from "../../api/categoryApi";

interface Props {
  onCreated: () => void;
}

const CategoryForm: React.FC<Props> = ({ onCreated }) => {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCategory({ name });
    setName("");
    onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        placeholder="Category Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-1 rounded"
      />
      <button type="submit" className="bg-green-600 text-white p-2 rounded">Add Category</button>
    </form>
  );
};

export default CategoryForm;
