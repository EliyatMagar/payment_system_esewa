// src/admin/AdminDashboard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import { useCategories } from '../hooks/useCategories';
import { useOrders } from '../hooks/useOrder';

const AdminDashboard: React.FC = () => {
  const { data: books, isLoading: booksLoading } = useBooks();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: orders, isLoading: ordersLoading } = useOrders();

  if (booksLoading || categoriesLoading || ordersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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

  // Sales trend (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailySales = last7Days.map(date => {
    const dayOrders = orders?.filter(order => 
      order.created_at.split('T')[0] === date && 
      (order.status === 'PAID' || order.status === 'SHIPPED')
    ) || [];
    return {
      date,
      revenue: dayOrders.reduce((sum, order) => sum + order.total_price, 0),
      orders: dayOrders.length
    };
  });

  const quickActions = [
    {
      title: 'Manage Books',
      description: 'Add, edit, or remove books from your inventory',
      link: '/admin/books',
      linkText: 'Go to Books',
      icon: '📚',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Manage Categories',
      description: 'Organize books into categories',
      link: '/admin/categories',
      linkText: 'Go to Categories',
      icon: '🏷️',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Manage Orders',
      description: 'View and process customer orders',
      link: '/admin/orders',
      linkText: 'Go to Orders',
      icon: '📦',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      link: '/admin/users',
      linkText: 'Go to Users',
      icon: '👥',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const stats = [
    { 
      name: 'Total Books', 
      value: totalBooks, 
      change: '+12%', 
      changeType: 'increase',
      icon: '📚',
      color: 'blue',
      link: '/admin/books' 
    },
    { 
      name: 'Total Categories', 
      value: totalCategories, 
      change: '+5%', 
      changeType: 'increase',
      icon: '🏷️',
      color: 'green',
      link: '/admin/categories' 
    },
    { 
      name: 'Total Orders', 
      value: totalOrders, 
      change: '+23%', 
      changeType: 'increase',
      icon: '📦',
      color: 'orange',
      link: '/admin/orders' 
    },
    { 
      name: 'Pending Orders', 
      value: pendingOrders, 
      change: pendingOrders > 0 ? 'Attention needed' : 'All clear',
      changeType: pendingOrders > 0 ? 'decrease' : 'neutral',
      icon: '⏳',
      color: 'yellow',
      link: '/admin/orders?status=PENDING' 
    },
    { 
      name: 'Paid Orders', 
      value: paidOrders, 
      change: '+18%', 
      changeType: 'increase',
      icon: '💳',
      color: 'green',
      link: '/admin/orders?status=PAID' 
    },
    { 
      name: 'Low Stock Books', 
      value: lowStockBooks, 
      change: lowStockBooks > 0 ? 'Restock needed' : 'Well stocked',
      changeType: lowStockBooks > 0 ? 'decrease' : 'neutral',
      icon: '⚠️',
      color: 'red',
      link: '/admin/books' 
    },
    { 
      name: 'Inventory Value', 
      value: `$${totalValue.toFixed(2)}`, 
      change: '+8.2%', 
      changeType: 'increase',
      icon: '💰',
      color: 'purple'
    },
    { 
      name: 'Total Revenue', 
      value: `$${totalRevenue.toFixed(2)}`, 
      change: '+15.3%', 
      changeType: 'increase',
      icon: '💵',
      color: 'green'
    },
  ];

  // Recent orders for activity section
  const recentOrders = orders?.slice(0, 5) || [];

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PAID: 'bg-blue-100 text-blue-800 border-blue-200',
    SHIPPED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.slice(0, 4).map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.link ? (
                    <Link to={stat.link} className="hover:text-indigo-600 transition-colors">
                      {stat.value}
                    </Link>
                  ) : (
                    stat.value
                  )}
                </p>
                <p className={`text-xs mt-2 ${
                  stat.changeType === 'increase' ? 'text-green-600' : 
                  stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-50`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stats and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview (Last 7 Days)</h3>
          <div className="flex items-end justify-between h-48">
            {dailySales.map((day, index) => (
              <div key={day.date} className="flex flex-col items-center flex-1 mx-1">
                <div className="text-xs text-gray-500 mb-2">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div 
                  className="w-full bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t transition-all hover:from-indigo-600 hover:to-indigo-400"
                  style={{ height: `${Math.max((day.revenue / Math.max(...dailySales.map(d => d.revenue))) * 100, 10)}%` }}
                  title={`$${day.revenue.toFixed(2)}`}
                ></div>
                <div className="text-xs text-gray-500 mt-1">
                  ${day.revenue > 0 ? day.revenue.toFixed(0) : '0'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
          <div className="space-y-4">
            {[
              { status: 'Pending', count: pendingOrders, color: 'bg-yellow-500' },
              { status: 'Paid', count: paidOrders, color: 'bg-blue-500' },
              { status: 'Shipped', count: shippedOrders, color: 'bg-green-500' },
              { status: 'Total', count: totalOrders, color: 'bg-gray-500' }
            ].map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.status}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{item.count}</span>
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.slice(4).map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.link ? (
                    <Link to={stat.link} className="hover:text-indigo-600 transition-colors">
                      {stat.value}
                    </Link>
                  ) : (
                    stat.value
                  )}
                </p>
                <p className={`text-xs mt-2 ${
                  stat.changeType === 'increase' ? 'text-green-600' : 
                  stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-50`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.link}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${action.bgColor}`}>
                    <span className="text-2xl">{action.icon}</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">{action.title}</h4>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <Link 
                to="/admin/orders" 
                className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
              >
                View all orders →
              </Link>
            </div>
            
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        order.status === 'PAID' ? 'bg-green-500' :
                        order.status === 'PENDING' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}...</p>
                        <p className="text-sm text-gray-500">{order.user?.name || 'Customer'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[order.status as keyof typeof statusColors]}`}>
                        {order.status}
                      </span>
                      <p className="text-sm font-semibold text-gray-900 mt-1">${order.total_price.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📦</div>
                <p className="text-gray-500">No recent orders found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;