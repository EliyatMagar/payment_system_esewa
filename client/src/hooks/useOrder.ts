import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  createOrder, 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus, 
  deleteOrder, 
  type CreateOrderRequest, 
  type UpdateOrderStatusRequest,
  type Order 
} from "../api/orderApi";

// All orders
export const useOrders = () => {
  return useQuery<Order[], Error>({
    queryKey: ["orders"],
    queryFn: getAllOrders,
  });
};

// Single order
export const useOrder = (id: string) => {
  return useQuery<Order, Error>({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });
};

// Create order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, CreateOrderRequest>({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, { id: string; data: UpdateOrderStatusRequest }>({
    mutationFn: ({ id, data }) => updateOrderStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
    },
  });
};

// Delete order
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// User's orders (if you want to filter by current user)
export const useUserOrders = (userId?: string) => {
  return useQuery<Order[], Error>({
    queryKey: ["orders", "user", userId],
    queryFn: getAllOrders,
    enabled: !!userId,
    select: (orders) => {
      if (!userId) return [];
      return orders.filter(order => order.user_id === userId);
    },
  });
};