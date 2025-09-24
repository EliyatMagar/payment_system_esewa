// src/hooks/useBooks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  createBook, 
  getAllBooks, 
  getBookById, 
  updateBook, 
  deleteBook, 
  type BookRequest, 
  type Book 
} from "../api/bookApi"; // Make sure this path matches your file structure

// All books
export const useBooks = () => {
  return useQuery<Book[], Error>({
    queryKey: ["books"],
    queryFn: getAllBooks,
  });
};

// Single book
export const useBook = (id: string) => {
  return useQuery<Book, Error>({
    queryKey: ["book", id],
    queryFn: () => getBookById(id),
    enabled: !!id,
  });
};

// Create book
export const useCreateBook = () => {
  const queryClient = useQueryClient();
  return useMutation<Book, Error, BookRequest>({
    mutationFn: createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
};

// Update book
export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  return useMutation<Book, Error, { id: string; data: BookRequest }>({
    mutationFn: ({ id, data }) => updateBook(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["book", variables.id] });
    },
  });
};

// Delete book
export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
};