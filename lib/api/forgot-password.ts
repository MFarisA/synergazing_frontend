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

// Forgot Password - Send reset link to email
export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Sending forgot password request to:', `${API_BASE_URL}/api/auth/forgot-password`);
    
    // Create FormData object since the backend expects form values
    const formData = new FormData();
    formData.append('email', email);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
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
    console.error('Forgot password error:', error);
    throw error;
  }
};

// Reset Password - Update password with token
export const resetPassword = async (token: string, password: string, passwordConfirm: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Sending reset password request to:', `${API_BASE_URL}/api/auth/reset-password`);
    
    // Create FormData object since the backend expects form values
    const formData = new FormData();
    formData.append('token', token);
    formData.append('password', password);
    formData.append('passwordConfirm', passwordConfirm);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
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
    console.error('Reset password error:', error);
    throw error;
  }
};