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
  const res = await api.post("/categories/", category);

  if (res.status >= 400) {
    throw new Error(`Failed to create category: ${res.statusText}`);
  }

  // Categories API returns data directly: { id, name, created_at, updated_at }
  return res.data as Category;
};

// Get All Categories
export const getAllCategories = async (): Promise<Category[]> => {
  const res = await api.get("/categories/");

  if (res.status >= 400) {
    throw new Error(`Failed to fetch categories: ${res.statusText}`);
  }

  // Categories API returns array directly: [{ id, name, ... }, ...]
  return res.data as Category[];
};

// Get Category By ID
export const getCategoryById = async (id: string): Promise<Category> => {
  const res = await api.get(`/categories/${id}`);

  if (res.status >= 400) {
    throw new Error(`Failed to fetch category: ${res.statusText}`);
  }

  // Categories API returns data directly: { id, name, ... }
  return res.data as Category;
};

// Update Category
export const updateCategory = async (
  id: string,
  category: CategoryRequest
): Promise<Category> => {
  const res = await api.put(`/categories/${id}`, category);

  if (res.status >= 400) {
    throw new Error(`Failed to update category: ${res.statusText}`);
  }

  // Categories API returns data directly: { id, name, ... }
  return res.data as Category;
};

// Delete Category
export const deleteCategory = async (id: string): Promise<boolean> => {
  const res = await api.delete(`/categories/${id}`);
  
  if (res.status >= 400) {
    throw new Error(`Failed to delete category: ${res.statusText}`);
  }

  return res.status === 200 || res.status === 204;
};

export default {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};