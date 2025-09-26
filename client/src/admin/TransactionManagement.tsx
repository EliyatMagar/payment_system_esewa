import React, { useState, useEffect } from 'react';
import { useTransactions, useUpdateTransactionStatus, useDeleteTransaction } from '../hooks/useTransactions';
import { type TransactionStatus, type PaymentMethod, type Transaction } from '../api/transactionApi';

const TransactionManagement: React.FC = () => {
  const { data: transactions, isLoading, error, refetch } = useTransactions();
  const updateStatusMutation = useUpdateTransactionStatus();
  const deleteMutation = useDeleteTransaction();
  
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'ALL'>('ALL');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<PaymentMethod | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState<TransactionStatus>('PENDING');
  const [failureReason, setFailureReason] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Show notification and auto-hide
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Filter transactions based on selected filters
  const filteredTransactions = transactions?.filter(transaction => {
    const matchesStatus = filterStatus === 'ALL' || transaction.status === filterStatus;
    const matchesPaymentMethod = filterPaymentMethod === 'ALL' || transaction.payment_method === filterPaymentMethod;
    const matchesSearch = searchTerm === '' || 
      transaction.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPaymentMethod && matchesSearch;
  }) || [];

  const statusColors: Record<TransactionStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    SUCCESS: 'bg-green-100 text-green-800 border-green-200',
    FAILED: 'bg-red-100 text-red-800 border-red-200',
    CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const paymentMethodIcons: Record<PaymentMethod, string> = {
    ESEWA: '🏦',
    CASH: '💵',
    CARD: '💳'
  };

  const statusDisplayNames: Record<TransactionStatus | 'ALL', string> = {
    ALL: 'All',
    PENDING: 'Pending',
    SUCCESS: 'Success',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled'
  };

  const paymentMethodDisplayNames: Record<PaymentMethod, string> = {
    ESEWA: 'eSewa',
    CASH: 'Cash',
    CARD: 'Card'
  };

  const handleUpdateStatus = async (transactionId: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: transactionId,
        data: {
          status: newStatus,
          ...(newStatus === 'FAILED' && failureReason && { failure_reason: failureReason })
        }
      });
      setShowUpdateModal(false);
      setSelectedTransaction(null);
      setFailureReason('');
      setNotification({ type: 'success', message: 'Transaction status updated successfully!' });
    } catch (error) {
      console.error('Failed to update transaction status:', error);
      setNotification({ type: 'error', message: 'Failed to update transaction status.' });
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(transactionId);
        setNotification({ type: 'success', message: 'Transaction deleted successfully!' });
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        setNotification({ type: 'error', message: 'Failed to delete transaction.' });
      }
    }
  };

  const openDetailsModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const openUpdateModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setNewStatus(transaction.status);
    setFailureReason(transaction.failure_reason || '');
    setShowUpdateModal(true);
  };

  const closeModals = () => {
    setShowDetailsModal(false);
    setShowUpdateModal(false);
    setSelectedTransaction(null);
    setFailureReason('');
  };

  const getStatusChangeOptions = (currentStatus: TransactionStatus): TransactionStatus[] => {
    switch (currentStatus) {
      case 'PENDING':
        return ['SUCCESS', 'FAILED', 'CANCELLED'];
      case 'FAILED':
        return ['PENDING', 'SUCCESS', 'CANCELLED'];
      case 'CANCELLED':
        return ['PENDING', 'SUCCESS', 'FAILED'];
      case 'SUCCESS':
        return ['PENDING', 'FAILED', 'CANCELLED'];
      default:
        return ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'];
    }
  };

  // Safe status counter function
  const getStatusCount = (status: TransactionStatus | 'ALL'): number => {
    if (status === 'ALL') return transactions?.length || 0;
    return transactions?.filter(t => t.status === status).length || 0;
  };

  const statusOptions: (TransactionStatus | 'ALL')[] = ['ALL', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading transactions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600 text-center">
          <p className="text-lg font-semibold">Error loading transactions</p>
          <p className="text-sm">{error.message}</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">{notification.type === 'success' ? '✅' : '❌'}</span>
            {notification.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
        <p className="text-gray-600 mt-2">Manage and monitor all payment transactions</p>
      </div>

      {/* Stats Overview - FIXED */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {statusOptions.map((status) => {
          const count = getStatusCount(status);
          const colors = {
            ALL: 'bg-blue-50 text-blue-600 border border-blue-200',
            PENDING: 'bg-yellow-50 text-yellow-600 border border-yellow-200',
            SUCCESS: 'bg-green-50 text-green-600 border border-green-200',
            FAILED: 'bg-red-50 text-red-600 border border-red-200',
            CANCELLED: 'bg-gray-50 text-gray-600 border border-gray-200'
          };

          const icons = {
            ALL: '💳',
            PENDING: '⏳',
            SUCCESS: '✅',
            FAILED: '❌',
            CANCELLED: '🚫'
          };

          return (
            <div key={status} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{statusDisplayNames[status]} Transactions</p>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {transactions && transactions.length > 0 
                      ? `${Math.round((count / transactions.length) * 100)}% of total`
                      : '0% of total'
                    }
                  </p>
                </div>
                <div className={`p-3 rounded-full ${colors[status]}`}>
                  <span className="text-2xl">{icons[status]}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-2">
              Search Transactions
            </label>
            <input
              id="search-input"
              type="text"
              placeholder="Search by TXN ID, Order ID, User ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TransactionStatus | 'ALL')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label htmlFor="payment-method-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              id="payment-method-filter"
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value as PaymentMethod | 'ALL')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Methods</option>
              <option value="ESEWA">eSewa</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-end space-x-3">
            <button
              onClick={() => {
                setFilterStatus('ALL');
                setFilterPaymentMethod('ALL');
                setSearchTerm('');
              }}
              className="w-1/2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => refetch()}
              className="w-1/2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order & User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-lg font-medium mb-2">No transactions found</p>
                    <p className="text-sm">Try adjusting your filters or search terms</p>
                    {(filterStatus !== 'ALL' || filterPaymentMethod !== 'ALL' || searchTerm) && (
                      <button
                        onClick={() => {
                          setFilterStatus('ALL');
                          setFilterPaymentMethod('ALL');
                          setSearchTerm('');
                        }}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.transaction_id || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">${transaction.amount.toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Order: {transaction.order_id.slice(0, 8)}...
                        </p>
                        <p className="text-sm text-gray-500">
                          User: {transaction.user_id.slice(0, 8)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{paymentMethodIcons[transaction.payment_method]}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {paymentMethodDisplayNames[transaction.payment_method]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{transaction.product_name}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                        statusColors[transaction.status]
                      }`}>
                        {statusDisplayNames[transaction.status]}
                      </span>
                      {transaction.failure_reason && (
                        <p className="text-xs text-red-600 mt-1 truncate max-w-xs" title={transaction.failure_reason}>
                          {transaction.failure_reason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                      <br />
                      <span className="text-xs">
                        {new Date(transaction.created_at).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openDetailsModal(transaction)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors px-2 py-1 rounded hover:bg-indigo-50"
                        title="View details"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openUpdateModal(transaction)}
                        className="text-green-600 hover:text-green-900 transition-colors px-2 py-1 rounded hover:bg-green-50"
                        title="Update status"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-900 transition-colors px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete transaction"
                      >
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-labelledby="details-modal-title"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 id="details-modal-title" className="text-xl font-semibold text-gray-900">
                  Transaction Details
                </h3>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 text-lg">Basic Information</h4>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
                      <dd className="text-sm text-gray-900 font-mono">{selectedTransaction.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">External TXN ID</dt>
                      <dd className="text-sm text-gray-900 font-mono">{selectedTransaction.transaction_id || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Order ID</dt>
                      <dd className="text-sm text-gray-900 font-mono">{selectedTransaction.order_id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">User ID</dt>
                      <dd className="text-sm text-gray-900 font-mono">{selectedTransaction.user_id}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4 text-lg">Payment Details</h4>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Amount</dt>
                      <dd className="text-sm text-gray-900 font-bold">${selectedTransaction.amount.toFixed(2)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                      <dd className="text-sm text-gray-900 flex items-center">
                        <span className="text-lg mr-2">{paymentMethodIcons[selectedTransaction.payment_method]}</span>
                        {paymentMethodDisplayNames[selectedTransaction.payment_method]}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-sm">
                        <span className={`px-3 py-1 rounded-full border ${statusColors[selectedTransaction.status]}`}>
                          {statusDisplayNames[selectedTransaction.status]}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Product</dt>
                      <dd className="text-sm text-gray-900">{selectedTransaction.product_name}</dd>
                    </div>
                  </dl>
                </div>

                {selectedTransaction.failure_reason && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-3">Failure Reason</h4>
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                      {selectedTransaction.failure_reason}
                    </p>
                  </div>
                )}

                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-4 text-lg">Timestamps</h4>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created At</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(selectedTransaction.created_at).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Updated At</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(selectedTransaction.updated_at).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>

                {selectedTransaction.esewa_response && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-3">eSewa Response</h4>
                    <pre className="text-xs bg-gray-50 p-3 rounded-lg border border-gray-200 overflow-x-auto max-h-40">
                      {JSON.stringify(selectedTransaction.esewa_response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => openUpdateModal(selectedTransaction)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Update Status
                </button>
                <button
                  onClick={closeModals}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white rounded-xl shadow-lg max-w-md w-full"
            role="dialog"
            aria-labelledby="update-modal-title"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 id="update-modal-title" className="text-lg font-semibold text-gray-900">
                  Update Transaction Status
                </h3>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    id="status-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TransactionStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {getStatusChangeOptions(selectedTransaction.status).map(status => (
                      <option key={status} value={status}>
                        {statusDisplayNames[status]}
                      </option>
                    ))}
                  </select>
                </div>

                {newStatus === 'FAILED' && (
                  <div>
                    <label htmlFor="failure-reason" className="block text-sm font-medium text-gray-700 mb-2">
                      Failure Reason
                    </label>
                    <textarea
                      id="failure-reason"
                      value={failureReason}
                      onChange={(e) => setFailureReason(e.target.value)}
                      placeholder="Enter reason for failure..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => handleUpdateStatus(selectedTransaction.id)}
                    disabled={updateStatusMutation.isPending}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {updateStatusMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Status'
                    )}
                  </button>
                  <button
                    onClick={closeModals}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;