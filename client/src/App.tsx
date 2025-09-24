// src/App.tsx
import React from "react";
import Signup from './pages/signup';
import Login from './pages/login'; 
import Home from './pages/Home'; 
import BookDetails from './pages/BookDetails';
import Profile from './pages/profile';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import BookManagement from './admin/BookManagement';
import CategoryManagement from './admin/CategoryManagement';
import UserManagement from './admin/UserManagement';
import OrderManagement from './admin/OrderManagement';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Simple Protected Route - only checks for token
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Optional: Add an admin check later if you implement roles
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // For now, allow any authenticated user to access admin
  // Later you can add: const isAdmin = localStorage.getItem("userRole") === "admin";
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes - require login */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Admin routes - require login (and eventually admin role) */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="books" element={<BookManagement />} />
            <Route path="books/:id" element={<BookDetails />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="users" element={<UserManagement />} />

            <Route path="orders" element={<OrderManagement />} />
          </Route>
          
          {/* 404 Page */}
          <Route path="*" element={<div className="text-center py-20">Page not found</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;