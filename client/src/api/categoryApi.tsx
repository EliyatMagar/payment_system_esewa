import api from "./api";

export interface Category {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  books?: any[];
}

export interface CategoryRequest {
  name: string;
}

// Create Category
export const createCategory = async (
  category: CategoryRequest
): Promise<Category> => {
  const res = await api.post("/categories", category);

  // handle both shapes
  if (res.data?.data?.category) {
    return res.data.data.category as Category;
  }
  return res.data as Category;
};

// Get All Categories
export const getAllCategories = async (): Promise<Category[]> => {
  const res = await api.get("/categories");

  if (Array.isArray(res.data)) {
    return res.data as Category[];
  }
  if (res.data?.data?.categories) {
    return res.data.data.categories as Category[];
  }
  return res.data as Category[];
};

// Get Category By ID
export const getCategoryById = async (id: string): Promise<Category> => {
  const res = await api.get(`/categories/${id}`);

  if (res.data?.data?.category) {
    return res.data.data.category as Category;
  }
  return res.data as Category;
};

// Update Category
export const updateCategory = async (
  id: string,
  category: CategoryRequest
): Promise<Category> => {
  const res = await api.put(`/categories/${id}`, category);

  if (res.data?.data?.category) {
    return res.data.data.category as Category;
  }
  return res.data as Category;
};

// Delete Category
export const deleteCategory = async (id: string): Promise<boolean> => {
  const res = await api.delete(`/categories/${id}`);
  return res.data?.success ?? true;
};

export default {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
