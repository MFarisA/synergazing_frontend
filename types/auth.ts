export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: Record<string, unknown>;
    token?: string;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string; // Making phone optional
}