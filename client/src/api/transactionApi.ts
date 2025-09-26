import api from "./api";

export type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
export type PaymentMethod = "ESEWA" | "CASH" | "CARD";

export interface Transaction {
  id: string;
  order_id: string;
  order: any;
  user_id: string;
  user?: any;
  payment_method: PaymentMethod;
  transaction_id: string;
  amount: number;
  status: TransactionStatus;
  payment_url: string;
  merchant_code: string;
  product_code: string;
  product_name: string;
  esewa_response: any;
  failure_reason: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionRequest {
  order_id: string;
  payment_method: PaymentMethod;
  amount: number;
}

export interface TransactionUpdateRequest {
  status: TransactionStatus;
  transaction_id?: string;
  failure_reason?: string;
  esewa_response?: string;
}

export interface EsewaPaymentRequest {
  amount: number;
  tax_amount?: number;
  product_code: string;
  product_name: string;
  product_service_charge?: number;
  product_delivery_charge?: number;
  success_url: string;
  failure_url: string;
  signed_field_names?: string;
  signature?: string;
}

export interface EsewaPaymentResponse {
  transaction_id: string;
  product_code: string;
  total_amount: string;
  status: string;
  message: string;
  ref_id: string;
}

export interface EsewaResponseData {
  transaction_code: string;
  status: string;
  total_amount: string;
  product_code: string;
  ref_id: string;
  message: string;
  signed_field_names?: string;
  signature?: string;
}

// Create Transaction
export const createTransaction = async (transactionData: CreateTransactionRequest): Promise<Transaction> => {
  try {
    const res = await api.post("/transactions", transactionData);

    if (res.status >= 400) {
      throw new Error(`Failed to create transaction: ${res.status} ${res.statusText}`);
    }

    if (res.data?.data) {
      return res.data.data as Transaction;
    }
    return res.data as Transaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get All Transactions (Admin only)
export const getAllTransactions = async (): Promise<Transaction[]> => {
  try {
    const res = await api.get("/transactions");

    if (res.status >= 400) {
      throw new Error(`Failed to fetch transactions: ${res.status} ${res.statusText}`);
    }

    if (res.data?.data?.transactions) {
      return res.data.data.transactions as Transaction[];
    }
    
    if (Array.isArray(res.data)) {
      return res.data as Transaction[];
    }
    
    if (res.data?.data && Array.isArray(res.data.data)) {
      return res.data.data as Transaction[];
    }
    
    console.warn('Unexpected API response structure:', res.data);
    return [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get Transaction By ID
export const getTransactionById = async (id: string): Promise<Transaction> => {
  try {
    const res = await api.get(`/transactions/${id}`);

    if (res.status >= 400) {
      throw new Error(`Failed to fetch transaction: ${res.status} ${res.statusText}`);
    }

    if (res.data?.data) {
      return res.data.data as Transaction;
    }
    return res.data as Transaction;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get User's Transactions
export const getUserTransactions = async (): Promise<Transaction[]> => {
  try {
    const res = await api.get("/transactions/user/my-transactions");

    if (res.status >= 400) {
      throw new Error(`Failed to fetch user transactions: ${res.status} ${res.statusText}`);
    }

    if (res.data?.data?.transactions) {
      return res.data.data.transactions as Transaction[];
    }
    
    if (Array.isArray(res.data)) {
      return res.data as Transaction[];
    }
    
    return res.data as Transaction[];
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get Transaction By Order ID
export const getTransactionByOrderId = async (orderId: string): Promise<Transaction> => {
  try {
    const res = await api.get(`/transactions/order/${orderId}`);

    if (res.status >= 400) {
      throw new Error(`Failed to fetch transaction by order: ${res.status} ${res.statusText}`);
    }

    if (res.data?.data) {
      return res.data.data as Transaction;
    }
    return res.data as Transaction;
  } catch (error) {
    console.error('Error fetching transaction by order:', error);
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Update Transaction Status (Admin only)
export const updateTransactionStatus = async (
  id: string,
  statusData: TransactionUpdateRequest
): Promise<Transaction> => {
  try {
    const res = await api.put(`/transactions/${id}/status`, statusData);

    if (res.status >= 400) {
      throw new Error(`Failed to update transaction status: ${res.status} ${res.statusText}`);
    }

    if (res.data?.data) {
      return res.data.data as Transaction;
    }
    return res.data as Transaction;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Initiate eSewa Payment
export const initiateEsewaPayment = async (
  transactionId: string,
  esewaData: EsewaPaymentRequest
): Promise<Transaction> => {
  try {
    const res = await api.post(`/transactions/esewa/initiate?transaction_id=${transactionId}`, esewaData);

    if (res.status >= 400) {
      throw new Error(`Failed to initiate eSewa payment: ${res.status} ${res.statusText}`);
    }

    if (res.data?.data) {
      return res.data.data as Transaction;
    }
    return res.data as Transaction;
  } catch (error) {
    console.error('Error initiating eSewa payment:', error);
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Verify eSewa Payment
export const verifyEsewaPayment = async (esewaResponse: EsewaResponseData): Promise<Transaction> => {
  try {
    const res = await api.post("/transactions/esewa/verify", esewaResponse);

    if (res.status >= 400) {
      throw new Error(`Failed to verify eSewa payment: ${res.status} ${res.statusText}`);
    }

    if (res.data?.data) {
      return res.data.data as Transaction;
    }
    return res.data as Transaction;
  } catch (error) {
    console.error('Error verifying eSewa payment:', error);
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Delete Transaction (Admin only)
export const deleteTransaction = async (id: string): Promise<boolean> => {
  try {
    const res = await api.delete(`/transactions/${id}`);
    
    if (res.status >= 400) {
      throw new Error(`Failed to delete transaction: ${res.status} ${res.statusText}`);
    }

    return res.data?.success ?? (res.status === 200 || res.status === 204);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export default {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getUserTransactions,
  getTransactionByOrderId,
  updateTransactionStatus,
  initiateEsewaPayment,
  verifyEsewaPayment,
  deleteTransaction,
};