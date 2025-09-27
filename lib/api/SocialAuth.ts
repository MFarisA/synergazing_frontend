// Social Authentication API functions
import { AuthResponse } from "@/types/auth";

// Use environment variable for API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';

// Safely parse JSON or return text if parsing fails
const safeJsonParse = async (response: Response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return {
      success: false,
      message: text || 'Unknown error occurred',
    };
  }
};

// Google Authentication - Get login URL
export const googleLogin = async (): Promise<{ url: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/google/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    const data = await safeJsonParse(response);
    
    if (!response.ok) {
      throw { 
        status: response.status, 
        response: { data } 
      };
    }
    
    return data;
  } catch (error: unknown) {
    throw error;
  }
};

// Handle Google callback (if needed for client-side processing)
export const googleCallback = async (code: string, state?: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ code, state }),
    });
    
    const data = await safeJsonParse(response);
    
    if (!response.ok) {
      throw { 
        status: response.status, 
        response: { data } 
      };
    }
    
    return data;
  } catch (error: unknown) {
    throw error;
  }
};