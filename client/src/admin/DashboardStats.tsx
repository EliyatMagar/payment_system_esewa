import React from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import { useCategories } from '../hooks/useCategories';
import { useOrders } from '../hooks/useOrder';

const DashboardStats: React.FC = () => {
  const { data: books, isLoading: booksLoading } = useBooks();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: orders, isLoading: ordersLoading } = useOrders();

  if (booksLoading || categoriesLoading || ordersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }

  const totalBooks = books?.length || 0;
  const totalCategories = categories?.length || 0;
  const totalOrders = orders?.length || 0;
  const lowStockBooks = books?.filter(book => book.stock < 10).length || 0;
  const totalValue = books?.reduce((sum, book) => sum + (book.price * book.stock), 0) || 0;
  
  // Order statistics
  const pendingOrders = orders?.filter(order => order.status === 'PENDING').length || 0;
  const paidOrders = orders?.filter(order => order.status === 'PAID').length || 0;
  const shippedOrders = orders?.filter(order => order.status === 'SHIPPED').length || 0;
  const totalRevenue = orders
    ?.filter(order => order.status === 'PAID' || order.status === 'SHIPPED')
    ?.reduce((sum, order) => sum + order.total_price, 0) || 0;

  // Calculate percentage changes (mock data for demonstration)
  const getRandomChange = () => (Math.random() * 20 + 5).toFixed(1);
  const bookChange = `${getRandomChange()}%`;
  const revenueChange = `${getRandomChange()}%`;
  const orderChange = `${getRandomChange()}%`;

  const stats = [
    { 
      name: 'Total Books', 
      value: totalBooks, 
      change: bookChange,
      changeType: 'increase',
      icon: '📚',
      color: 'blue',
      link: '/admin/books',
      description: 'Books in inventory'
    },
    { 
      name: 'Total Categories', 
      value: totalCategories, 
      change: '+3.2%',
      changeType: 'increase',
      icon: '🏷️',
      color: 'green',
      link: '/admin/categories',
      description: 'Product categories'
    },
    { 
      name: 'Total Orders', 
      value: totalOrders, 
      change: orderChange,
      changeType: 'increase',
      icon: '📦',
      color: 'orange',
      link: '/admin/orders',
      description: 'All-time orders'
    },
    { 
      name: 'Pending Orders', 
      value: pendingOrders, 
      change: pendingOrders > 0 ? 'Needs attention' : 'All clear',
      changeType: pendingOrders > 0 ? 'decrease' : 'neutral',
      icon: '⏳',
      color: 'yellow',
      link: '/admin/orders?status=PENDING',
      description: 'Awaiting processing'
    },
    { 
      name: 'Paid Orders', 
      value: paidOrders, 
      change: '+12.5%',
      changeType: 'increase',
      icon: '💳',
      color: 'green',
      link: '/admin/orders?status=PAID',
      description: 'Ready to ship'
    },
    { 
      name: 'Low Stock Books', 
      value: lowStockBooks, 
      change: lowStockBooks > 0 ? 'Restock needed' : 'Well stocked',
      changeType: lowStockBooks > 0 ? 'decrease' : 'neutral',
      icon: '⚠️',
      color: 'red',
      link: '/admin/books',
      description: 'Below 10 units'
    },
    { 
      name: 'Inventory Value', 
      value: `$${totalValue.toLocaleString()}`, 
      change: '+8.2%',
      changeType: 'increase',
      icon: '💰',
      color: 'purple',
      description: 'Total stock value'
    },
    { 
      name: 'Total Revenue', 
      value: `$${totalRevenue.toLocaleString()}`, 
      change: revenueChange,
      changeType: 'increase',
      icon: '💵',
      color: 'green',
      description: 'All-time sales'
    },
  ];

  // Recent orders for activity section
  const recentOrders = orders?.slice(0, 5) || [];

  const statusConfig = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏳' },
    PAID: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '💳' },
    SHIPPED: { color: 'bg-green-100 text-green-800 border-green-200', icon: '🚚' },
    CANCELLED: { color: 'bg-red-100 text-red-800 border-red-200', icon: '❌' }
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 mt-2 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Live data updated in real-time
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Today's Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.slice(0, 4).map((stat) => (
          <div 
            key={stat.name} 
            className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 group-hover:scale-110 transition-transform`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                stat.changeType === 'increase' ? 'bg-green-100 text-green-800' :
                stat.changeType === 'decrease' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {stat.change}
              </span>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {stat.link ? (
                  <Link to={stat.link} className="hover:text-indigo-600 transition-colors duration-200">
                    {stat.value}
                  </Link>
                ) : (
                  stat.value
                )}
              </p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.slice(4).map((stat) => (
          <div 
            key={stat.name} 
            className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 group-hover:scale-110 transition-transform`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                stat.changeType === 'increase' ? 'bg-green-100 text-green-800' :
                stat.changeType === 'decrease' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {stat.change}
              </span>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {stat.link ? (
                  <Link to={stat.link} className="hover:text-indigo-600 transition-colors duration-200">
                    {stat.value}
                  </Link>
                ) : (
                  stat.value
                )}
              </p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
              <p className="text-gray-600 mt-1">Latest customer orders requiring attention</p>
            </div>
            <Link 
              to="/admin/orders" 
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
            >
              View All Orders
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => {
              const status = getStatusConfig(order.status);
              return (
                <div 
                  key={order.id} 
                  className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${status.color} border`}>
                        <span className="text-sm">{status.icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color} border`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {order.user?.name || 'Customer'} • {order.items?.length || 0} items
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${order.total_price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h4>
              <p className="text-gray-600">Orders will appear here as customers make purchases</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-indigo-600">{totalBooks}</div>
          <div className="text-sm text-gray-600">Books in Stock</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{totalOrders}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-purple-600">${totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;