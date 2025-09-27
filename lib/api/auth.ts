import { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";


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

// Login a user
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    // Create FormData object since the backend expects form values, not JSON
    const formData = new FormData();
    formData.append('email', credentials.email);
    formData.append('password', credentials.password);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        // Don't set Content-Type for FormData - let the browser set it
      },
      body: formData,
    });
    
    const data = await safeJsonParse(response);
    
    if (!response.ok) {
      const errorObj = { 
        status: response.status,
        statusText: response.statusText,
        response: { data },
        url: response.url
      };
      throw errorObj;
    }
    
    return data;
  } catch (error: unknown) {
    // If it's our thrown error object, just re-throw it
    if (error && typeof error === 'object' && 'status' in error) {
      throw error;
    }
    
    // Re-throw with more context for network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw {
        message: 'Network error: Unable to connect to server. Please check your internet connection.',
        type: 'NETWORK_ERROR',
        originalError: error
      };
    }
    
    throw error;
  }
};

// Register a new user
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      // Create FormData object since the backend expects form values, not JSON
      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('phone', userData.phone || ''); // Provide empty string if phone is undefined
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          // Don't set Content-Type for FormData - let the browser set it
        },
        body: formData,
      });
      
      const data = await safeJsonParse(response);
      
      if (response.status === 401) {
        throw { 
          status: 401, 
          response: { 
            data: { 
              success: false, 
              message: 'Registration requires authentication. Please check with your backend developer.' 
            } 
          } 
        };
      } else if (!response.ok) {
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

// Register with OTP - Step 1: Initiate registration and send OTP
export const registerInitiate = async (userData: { name: string; email: string; password: string; phone: string }): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Sending registration initiate request to:', `${API_BASE_URL}/api/auth/register/initiate`);
    
    // Create FormData object since the backend expects form values
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('phone', userData.phone);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/register/initiate`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
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
    console.error('Registration initiate error:', error);
    throw error;
  }
};

// Register with OTP - Step 2: Complete registration with OTP code
export const registerComplete = async (userData: { name: string; email: string; password: string; phone: string; otp_code: string }): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Sending registration complete request to:', `${API_BASE_URL}/api/auth/register/complete`);
    
    // Create FormData object since the backend expects form values
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('phone', userData.phone);
    formData.append('otp_code', userData.otp_code);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/register/complete`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
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
    console.error('Registration complete error:', error);
    throw error;
  }
};
