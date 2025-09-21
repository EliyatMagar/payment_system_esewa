import api from "./api";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at?: string;
}

export interface RegisterResponseShape {
  data: {
    user: User;
  };
  success: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseShape {
  data: {
    token: string;
  };
  success: boolean;
}

// ------------------- API FUNCTIONS -------------------

// Register User -> returns created user
export const registerUser = async (
  data: RegisterRequest
): Promise<User> => {
  const response = await api.post<RegisterResponseShape>("/auth/register", data);
  return response.data.data.user;
};

// Login User -> returns token string
export const loginUser = async (
  credentials: LoginRequest
): Promise<string> => {
  const response = await api.post<LoginResponseShape>("/auth/login", credentials);

  console.log("Backend login response:", response.data);

  const token = response.data?.data?.token;

  if (token) {
    console.log("Saving token to localStorage:", token);
    localStorage.setItem("token", token);
  } else {
    throw new Error("No token returned from backend");
  }

  return token;
};

// Get Current Logged-in User
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<RegisterResponseShape>("/auth/me");
  return response.data.data.user;
};

// default export for convenience
export default {
  registerUser,
  loginUser,
  getCurrentUser,
};
