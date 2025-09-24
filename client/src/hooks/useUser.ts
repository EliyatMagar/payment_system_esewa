import { useMutation, useQuery } from "@tanstack/react-query";
import { registerUser, loginUser, getCurrentUser, type RegisterRequest, type LoginRequest, type User } from "../api/userApi";

// Register hook
export const useRegisterUser = () => useMutation({
  mutationFn: (data: RegisterRequest) => registerUser(data),
});

// Login hook
export const useLoginUser = () => useMutation({
  mutationFn: (data: LoginRequest) => loginUser(data),
});

// Current user hook
export const useCurrentUser = () => useQuery<User | null>({
  queryKey: ["currentUser"],
  queryFn: getCurrentUser,
  retry: false,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
