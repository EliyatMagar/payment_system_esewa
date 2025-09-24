import api from "./api";

export interface OrderItem {
  id: string;
  order_id: string;
  book_id: string;
  book: any; // You might want to define a proper Book interface
  quantity: number;
  price: number;
}

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "SHIPPED" | "DELIVERED";

export interface Order {
  id: string;
  user_id: string;
  user?: any; // You might want to define a proper User interface
  status: OrderStatus;
  total_price: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  items: {
    book_id: string;
    quantity: number;
    price: number;
  }[];
}

export interface UpdateOrderStatusRequest {
  status: "PENDING" | "PAID" | "CANCELLED";
}

// Create Order
export const createOrder = async (orderData: CreateOrderRequest): Promise<Order> => {
  const res = await api.post("/orders/", orderData);

  if (res.status >= 400) {
    throw new Error(`Failed to create order: ${res.statusText}`);
  }

  // Orders API returns nested data: { data: { order: {...} }, success: true }
  if (res.data?.data?.order) {
    return res.data.data.order as Order;
  }
  return res.data as Order;
};

// Get All Orders
export const getAllOrders = async (): Promise<Order[]> => {
  const res = await api.get("/orders/");

  if (res.status >= 400) {
    throw new Error(`Failed to fetch orders: ${res.statusText}`);
  }

  // Orders API returns nested data: { data: { orders: [...] }, success: true }
  if (res.data?.data?.orders) {
    return res.data.data.orders as Order[];
  }
  
  // Fallback: if it's directly an array
  if (Array.isArray(res.data)) {
    return res.data as Order[];
  }
  
  return res.data as Order[];
};

// Get Order By ID
export const getOrderById = async (id: string): Promise<Order> => {
  const res = await api.get(`/orders/${id}`);

  if (res.status >= 400) {
    throw new Error(`Failed to fetch order: ${res.statusText}`);
  }

  // Orders API returns nested data: { data: { order: {...} }, success: true }
  if (res.data?.data?.order) {
    return res.data.data.order as Order;
  }
  return res.data as Order;
};

// Update Order Status
export const updateOrderStatus = async (
  id: string,
  statusData: UpdateOrderStatusRequest
): Promise<Order> => {
  const res = await api.put(`/orders/${id}/status`, statusData);

  if (res.status >= 400) {
    throw new Error(`Failed to update order status: ${res.statusText}`);
  }

  // Orders API returns nested data: { data: { order: {...} }, success: true }
  if (res.data?.data?.order) {
    return res.data.data.order as Order;
  }
  return res.data as Order;
};

// Delete Order
export const deleteOrder = async (id: string): Promise<boolean> => {
  const res = await api.delete(`/orders/${id}`);
  
  if (res.status >= 400) {
    throw new Error(`Failed to delete order: ${res.statusText}`);
  }

  // Orders API returns { success: true } or similar
  return res.data?.success ?? (res.status === 200 || res.status === 204);
};

export default {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};