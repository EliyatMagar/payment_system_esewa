import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <nav className="flex flex-col gap-2">
        <NavLink to="/admin/books" className="hover:bg-gray-700 p-2 rounded">
          Books
        </NavLink>
        <NavLink
          to="/admin/categories"
          className="hover:bg-gray-700 p-2 rounded"
        >
          Categories
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
