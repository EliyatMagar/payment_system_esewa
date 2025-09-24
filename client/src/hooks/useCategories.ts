import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  createCategory, 
  getAllCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory, 
  type CategoryRequest, 
  type Category 
} from "../api/categoryApi";

// All categories
export const useCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: getAllCategories,
  });
};

// Single category
export const useCategory = (id: string) => {
  return useQuery<Category, Error>({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(id),
    enabled: !!id,
  });
};

// Create category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, CategoryRequest>({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// Update category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, { id: string; data: CategoryRequest }>({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", variables.id] });
    },
  });
};

// Delete category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};