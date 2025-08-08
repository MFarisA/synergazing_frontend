// API client for interacting with the backend

// Use environment variable for API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';

// Type definitions for authentication
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string; // Making phone optional
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: any;
    token?: string;
  };
}

// Safely parse JSON or return text if parsing fails
const safeJsonParse = async (response: Response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn('Failed to parse response as JSON:', text);
    return {
      success: false,
      message: text || 'Unknown error occurred',
    };
  }
};

// API utilities for testing and debugging backend connectivity
export const apiUtils = {
  testConnection: async (): Promise<{ status: string; message: string; details?: any }> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout
      
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      // Get response text to check if it's valid JSON
      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { raw: responseText };
      }
      
      if (response.ok) {
        return {
          status: 'success',
          message: `Successfully connected to backend at ${API_BASE_URL}`,
          details: responseData
        };
      } else if (response.status === 401) {
        return {
          status: 'error',
          message: `Authentication required: Backend returned 401 Unauthorized`,
          details: {
            responseStatus: response.status,
            responseText: responseText,
            headers: Object.fromEntries(response.headers.entries())
          }
        };
      } else {
        return {
          status: 'error',
          message: `Backend responded with status ${response.status}: ${response.statusText}`,
          details: {
            responseStatus: response.status,
            responseText: responseText,
            headers: Object.fromEntries(response.headers.entries())
          }
        };
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          status: 'error',
          message: `Connection to ${API_BASE_URL} timed out. Server may be down or unreachable.`
        };
      }
      
      return {
        status: 'error',
        message: `Failed to connect to backend at ${API_BASE_URL}: ${error.message}`
      };
    }
  },
  
  // Test registration endpoint specifically
  testRegisterEndpoint: async (): Promise<{ status: string; message: string; details?: any }> => {
    try {
      // Send a basic OPTIONS request to check if the endpoint is accessible
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'OPTIONS',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin
        }
      });
      
      const headers = Object.fromEntries(response.headers.entries());
      
      if (response.ok || response.status === 204) {
        // OPTIONS request typically returns 204 No Content if successful
        return {
          status: 'success',
          message: 'Registration endpoint is accessible',
          details: {
            cors: headers['access-control-allow-origin'] ? 'Enabled' : 'Not detected',
            allowedMethods: headers['access-control-allow-methods'] || 'Not specified',
            allowedHeaders: headers['access-control-allow-headers'] || 'Not specified'
          }
        };
      } else if (response.status === 401) {
        return {
          status: 'error',
          message: 'Registration endpoint requires authentication',
          details: { headers }
        };
      } else {
        return {
          status: 'error',
          message: `Registration endpoint returned ${response.status}: ${response.statusText}`,
          details: { headers }
        };
      }
    } catch (error: any) {
      return {
        status: 'error',
        message: `Error testing registration endpoint: ${error.message}`
      };
    }
  }
};

// API client functions
export const api = {
  // Register a new user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      console.log('Sending registration request to:', `${API_BASE_URL}/api/auth/register`);
      console.log('With data:', userData);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Add API key or client ID if your backend requires it
          // 'X-API-Key': 'your-api-key-here',
          // Uncomment and modify if your backend uses a different auth header
          // 'Authorization': 'Bearer your-token-here',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await safeJsonParse(response);
      
      if (response.status === 401) {
        console.error('Authentication required for registration endpoint');
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
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Login a user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('Sending login request to:', `${API_BASE_URL}/api/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await safeJsonParse(response);
      
      if (!response.ok) {
        throw { 
          status: response.status, 
          response: { data } 
        };
      }
      
      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },
};

export default api;