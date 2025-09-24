import api from "./api";

// ----- Types -----
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: "customer" | "admin";
}

export interface RegisterResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

// ----- API functions -----
export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const loginUser = async (data: LoginRequest): Promise<{ token: string }> => {
  const res = await api.post("/auth/login", data);
  return res.data.data;
};

// Update your getCurrentUser function in userApi.ts
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.log("No token found in localStorage");
      return null;
    }

    console.log("Making API call to /auth/me...");
    
    const res = await api.get("/auth/me");
    console.log("Full API Response:", res.data);
    
    // Handle the actual response structure from your backend
    if (res.data.data && res.data.data.user) {
      console.log("Found user data in res.data.data.user");
      return res.data.data.user;
    } else if (res.data.user) {
      console.log("Found user data in res.data.user");
      return res.data.user;
    } else if (res.data.data) {
      console.log("Found user data in res.data.data");
      return res.data.data;
    } else if (res.data) {
      console.log("Found user data directly in res.data");
      return res.data;
    } else {
      console.warn("No user data found in response");
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching current user:", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      console.log("Removed invalid token");
    }
    
    return null;
  }
};

