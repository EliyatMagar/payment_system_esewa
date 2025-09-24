// src/components/Layout.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <div>
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold">BookStore</Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md ${
                  location.pathname === '/' ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
              >
                Home
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/profile" 
                    className={`px-3 py-2 rounded-md ${
                      location.pathname === '/profile' ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/admin" 
                    className={`px-3 py-2 rounded-md ${
                      location.pathname.startsWith('/admin') ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                  >
                    Admin
                  </Link>
                  <button 
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/";
                    }}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`px-3 py-2 rounded-md ${
                      location.pathname === '/login' ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className={`px-3 py-2 rounded-md ${
                      location.pathname === '/signup' ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};

export default Layout;