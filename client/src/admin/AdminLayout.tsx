import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useUser';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { data: user, isLoading: userLoading, error } = useCurrentUser();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/admin', 
      icon: '📊',
      current: location.pathname === '/admin' 
    },
    { 
      name: 'Books', 
      href: '/admin/books', 
      icon: '📚',
      current: location.pathname === '/admin/books' 
    },
    { 
      name: 'Categories', 
      href: '/admin/categories', 
      icon: '🏷️',
      current: location.pathname === '/admin/categories' 
    },
    { 
      name: 'Orders', 
      href: '/admin/orders', 
      icon: '📦',
      current: location.pathname.startsWith('/admin/orders') 
    },
    { 
      name: 'Users', 
      href: '/admin/users', 
      icon: '👥',
      current: location.pathname === '/admin/users' 
    },
    {
      name:'Transactions',
      href:'/admin/transactions',
      icon:'💳',
      current: location.pathname.startsWith('/admin/transactions')
    },
    { 
      name: 'Analytics', 
      href: '/admin/analytics', 
      icon: '📈',
      current: location.pathname === '/admin/analytics' 
    },
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: '⚙️',
      current: location.pathname === '/admin/settings' 
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Get user avatar based on name or use default
  const getUserAvatar = (userName?: string) => {
    if (!userName) return '👨‍💼';
    
    const nameParts = userName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return userName[0].toUpperCase();
  };

  // Get user role badge color
  const getRoleBadgeColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'superadmin': return 'bg-purple-100 text-purple-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format user name with fallback
  const getUserDisplayName = () => {
    if (userLoading) return 'Loading...';
    if (error || !user) return 'Admin User';
    return user.name || user.email?.split('@')[0] || 'User';
  };

  // Format user email with fallback
  const getUserEmail = () => {
    if (userLoading) return 'loading...';
    if (error || !user) return 'admin@bookstore.com';
    return user.email || 'No email provided';
  };

  // Get user role with fallback
  const getUserRole = () => {
    if (userLoading) return 'Loading...';
    if (error || !user) return 'Admin';
    return user.role || 'User';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar Navigation */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">BookStore Admin</h1>
                <p className="text-gray-400 text-xs">Management Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  item.current
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
                {item.current && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* User Info & Quick Stats */}
          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {getUserAvatar(user?.name)}
                </div>
                {user && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {getUserEmail()}
                </p>
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${getRoleBadgeColor(user?.role)}`}>
                  {getUserRole()}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-700 rounded-lg p-2 text-center">
                <div className="text-white font-semibold">
                  {userLoading ? '...' : user ? 'Online' : 'Offline'}
                </div>
                <div className={`flex items-center justify-center ${user ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className="w-2 h-2 rounded-full mr-1 bg-current"></span>
                  {user ? 'Active' : 'Inactive'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 rounded-lg p-2 text-white font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
                disabled={userLoading}
              >
                <span>🚪</span>
                <span>{userLoading ? '...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex justify-between items-center px-8 py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {navigation.find(item => item.current)?.name || 'Dashboard'}
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  {userLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600 mr-2"></span>
                      Loading user data...
                    </span>
                  ) : error ? (
                    'Welcome back!'
                  ) : (
                    `Welcome back, ${getUserDisplayName()}! Here's your overview.`
                  )}
                </p>
              </div>
              
              <div className="flex items-center space-x-6">
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <span className="text-xl">🔔</span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* User Profile Quick View */}
                <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {getUserAvatar(user?.name)}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500">{getUserRole()}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex space-x-3">
                  <Link 
                    to="/" 
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    <span>🏠</span>
                    <span>View Site</span>
                  </Link>
                  
                  <Link 
                    to="/admin/books/new" 
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    <span>➕</span>
                    <span>Add Book</span>
                  </Link>
                </div>
              </div>
            </div>
          </header>

          {/* Breadcrumb */}
          <div className="bg-gray-50 border-b border-gray-200 px-8 py-3">
            <nav className="flex text-sm">
              <Link to="/admin" className="text-indigo-600 hover:text-indigo-900 font-medium">
                Dashboard
              </Link>
              {navigation.find(item => item.current)?.name !== 'Dashboard' && (
                <>
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-600">{navigation.find(item => item.current)?.name}</span>
                </>
              )}
            </nav>
          </div>

          {/* Main Content */}
          <main className="flex-1 p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 px-8 py-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
                © 2024 BookStore Admin. All rights reserved.
              </div>
              <div className="flex space-x-4">
                <span>Version 2.1.0</span>
                <span className={`flex items-center ${user ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="w-2 h-2 rounded-full mr-1 bg-current animate-pulse"></span>
                  {user ? 'User Online' : 'User Offline'}
                </span>
                {userLoading && (
                  <span className="text-blue-600 flex items-center">
                    <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></span>
                    Syncing...
                  </span>
                )}
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile Menu Button (hidden on desktop) */}
      <div className="lg:hidden fixed bottom-4 right-4">
        <button className="w-14 h-14 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white text-xl hover:bg-indigo-700 transition-colors duration-200">
          ☰
        </button>
      </div>

      {/* Loading Overlay */}
      {userLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <span>Loading user information...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;