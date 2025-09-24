// src/admin/UserManagement.tsx
import React from 'react';

const UserManagement: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add New User
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Users</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            User management functionality will be implemented here.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <p className="text-sm text-gray-500">
              This section will display user accounts, allow editing roles, and managing permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;