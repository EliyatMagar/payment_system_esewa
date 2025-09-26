import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  createTransaction, 
  getAllTransactions, 
  getTransactionById, 
  getUserTransactions, 
  getTransactionByOrderId, 
  updateTransactionStatus, 
  initiateEsewaPayment, 
  verifyEsewaPayment, 
  deleteTransaction,
  type CreateTransactionRequest, 
  type TransactionUpdateRequest,
  type EsewaPaymentRequest,
  type EsewaResponseData,
  type Transaction 
} from "../api/transactionApi";

// All transactions (Admin only)
export const useTransactions = () => {
  return useQuery<Transaction[], Error>({
    queryKey: ["transactions"],
    queryFn: getAllTransactions,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Single transaction
export const useTransaction = (id: string) => {
  return useQuery<Transaction, Error>({
    queryKey: ["transaction", id],
    queryFn: () => getTransactionById(id),
    enabled: !!id,
    retry: (failureCount, error) => {
      // Don't retry for 404 errors
      if (error.message.includes('404')) return false;
      return failureCount < 3;
    },
  });
};

// User's transactions
export const useUserTransactions = () => {
  return useQuery<Transaction[], Error>({
    queryKey: ["transactions", "user"],
    queryFn: getUserTransactions,
    retry: 3,
    staleTime: 2 * 60 * 1000, // 2 minutes for user transactions
  });
};

// Transaction by order ID
export const useTransactionByOrderId = (orderId: string) => {
  return useQuery<Transaction, Error>({
    queryKey: ["transaction", "order", orderId],
    queryFn: () => getTransactionByOrderId(orderId),
    enabled: !!orderId,
    retry: 2,
  });
};

// Create transaction
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation<Transaction, Error, CreateTransactionRequest>({
    mutationFn: createTransaction,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "user"] });
    },
    onError: (error) => {
      console.error('Error creating transaction:', error);
    },
  });
};

// Update transaction status
export const useUpdateTransactionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<Transaction, Error, { id: string; data: TransactionUpdateRequest }>({
    mutationFn: ({ id, data }) => updateTransactionStatus(id, data),
    onSuccess: (updatedTransaction, variables) => {
      // Update the specific transaction in the cache
      queryClient.setQueryData(
        ["transaction", variables.id],
        updatedTransaction
      );
      
      // Update the transaction in the transactions list
      queryClient.setQueryData(
        ["transactions"],
        (old: Transaction[] | undefined) => 
          old?.map(t => t.id === variables.id ? updatedTransaction : t)
      );
      
      // Invalidate queries to refetch if needed
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "user"] });
      queryClient.invalidateQueries({ queryKey: ["transaction", variables.id] });
    },
    onError: (error) => {
      console.error('Error updating transaction status:', error);
    },
  });
};

// Initiate eSewa payment
export const useInitiateEsewaPayment = () => {
  const queryClient = useQueryClient();
  return useMutation<Transaction, Error, { transactionId: string; data: EsewaPaymentRequest }>({
    mutationFn: ({ transactionId, data }) => initiateEsewaPayment(transactionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions", "user"] });
      queryClient.invalidateQueries({ queryKey: ["transaction", variables.transactionId] });
    },
    onError: (error) => {
      console.error('Error initiating eSewa payment:', error);
    },
  });
};

// Verify eSewa payment
export const useVerifyEsewaPayment = () => {
  const queryClient = useQueryClient();
  return useMutation<Transaction, Error, EsewaResponseData>({
    mutationFn: verifyEsewaPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", "user"] });
    },
    onError: (error) => {
      console.error('Error verifying eSewa payment:', error);
    },
  });
};

// Delete transaction
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: deleteTransaction,
    onSuccess: (_, transactionId) => {
      // Remove the transaction from the cache
      queryClient.setQueryData(
        ["transactions"],
        (old: Transaction[] | undefined) => 
          old?.filter(t => t.id !== transactionId)
      );
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.removeQueries({ queryKey: ["transaction", transactionId] });
    },
    onError: (error) => {
      console.error('Error deleting transaction:', error);
    },
  });
};

// Helper hook to check if transaction is pending
export const useTransactionStatus = (transaction?: Transaction) => {
  const isPending = transaction?.status === "PENDING";
  const isSuccess = transaction?.status === "SUCCESS";
  const isFailed = transaction?.status === "FAILED";
  const isCancelled = transaction?.status === "CANCELLED";

  return {
    isPending,
    isSuccess,
    isFailed,
    isCancelled,
    canRetry: isFailed || isCancelled,
  };
};

// Helper hook for eSewa payment flow
export const useEsewaPaymentFlow = () => {
  const initiateMutation = useInitiateEsewaPayment();
  const verifyMutation = useVerifyEsewaPayment();

  const initiatePayment = async (transactionId: string, esewaData: EsewaPaymentRequest) => {
    return await initiateMutation.mutateAsync({ transactionId, data: esewaData });
  };

  const verifyPayment = async (esewaResponse: EsewaResponseData) => {
    return await verifyMutation.mutateAsync(esewaResponse);
  };

  return {
    initiatePayment,
    verifyPayment,
    isInitiating: initiateMutation.isPending,
    isVerifying: verifyMutation.isPending,
    initiationError: initiateMutation.error,
    verificationError: verifyMutation.error,
  };
};

// Helper hook for transaction statistics
export const useTransactionStats = () => {
  const { data: transactions } = useTransactions();
  
  if (!transactions) {
    return {
      total: 0,
      pending: 0,
      success: 0,
      failed: 0,
      cancelled: 0,
      totalAmount: 0,
      successAmount: 0,
    };
  }

  const total = transactions.length;
  const pending = transactions.filter(t => t.status === 'PENDING').length;
  const success = transactions.filter(t => t.status === 'SUCCESS').length;
  const failed = transactions.filter(t => t.status === 'FAILED').length;
  const cancelled = transactions.filter(t => t.status === 'CANCELLED').length;
  
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const successAmount = transactions
    .filter(t => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    total,
    pending,
    success,
    failed,
    cancelled,
    totalAmount,
    successAmount,
    successRate: total > 0 ? (success / total) * 100 : 0,
  };
};