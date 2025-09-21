import React from "react";
import Dashboard from "../components/Dashboard/Dashboard";
import { Route, Routes } from "react-router-dom";
import BookList from "../components/books/BookList";
import CategoryList from "../components/categories/CategoryList";

const AdminDashboard: React.FC = () => {
  return (
    <Dashboard>
      <Routes>
        <Route path="books" element={<BookList />} />
        <Route path="categories" element={<CategoryList />} />
      </Routes>
    </Dashboard>
  );
};

export default AdminDashboard;
