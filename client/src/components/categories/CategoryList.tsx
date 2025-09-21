import React, { useEffect, useState } from "react";
import { type Category, getAllCategories, deleteCategory } from "../../api/categoryApi";
import CategoryItem from "./CategoryItem";
import CategoryForm from "./CategoryForm";

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    const data = await getAllCategories();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    fetchCategories();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Categories</h2>
      <CategoryForm onCreated={fetchCategories} />
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <CategoryItem key={category.id} category={category} onDelete={handleDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryList;
