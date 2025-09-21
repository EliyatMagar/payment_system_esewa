import React from "react";
import Signup from './pages/signup';
import Login from './pages/login'; 
import Home from './pages/Home'; 
import Profile from './pages/profile';
import AdminDashboard from './pages/AdminDashboard';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />

          {/* Add trailing "*" to allow nested routes */}
          <Route path="/admin/*" element={<AdminDashboard />} />

          <Route path="*" element={<Navigate to="/admin/books" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
