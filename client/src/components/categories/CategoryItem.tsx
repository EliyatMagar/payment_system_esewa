import React from "react";
import { type Category } from "../../api/categoryApi";

interface Props {
  category: Category;
  onDelete: (id: string) => void;
}

const CategoryItem: React.FC<Props> = ({ category, onDelete }) => {
  return (
    <tr>
      <td>{category.name}</td>
      <td>
        <button onClick={() => onDelete(category.id)} className="text-red-600">
          Delete
        </button>
      </td>
    </tr>
  );
};

export default CategoryItem;
