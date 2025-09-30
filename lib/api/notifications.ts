// Notification types
export interface Notification {
  id: number;
  user_id: number;
  project_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  data: string; // JSON string with additional notification data
  created_at: string;
  updated_at: string;
  user?: any; // User object from API
  project?: any; // Project object from API
}

export interface NotificationResponse {
  data: {
    notifications: Notification[];
    limit: number;
    offset: number;
  };
  message: string;
  success: boolean;
}

export interface NotificationCountResponse {
  data: {
    count: number;
  };
  message: string;
  success: boolean;
}

export interface NotificationActionResponse {
  data: null;
  message: string;
  success: boolean;
}

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

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Get all notifications
export const getAllNotifications = async (): Promise<NotificationResponse> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await safeJsonParse(response);
    
    if (!response.ok) {
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
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
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Get unread notifications
export const getUnreadNotifications = async (): Promise<NotificationResponse> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/notifications/unread`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await safeJsonParse(response);
    
    if (!response.ok) {
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
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
    console.error('Error fetching unread notifications:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (): Promise<NotificationCountResponse> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/notifications/count`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await safeJsonParse(response);
    
    if (!response.ok) {
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
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
    console.error('Error fetching notification count:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: number): Promise<NotificationActionResponse> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Attempting to mark notification as read:', {
      notificationId,
      baseUrl: API_BASE_URL
    });

    // Based on chat API pattern, try PUT method first with /read endpoint
    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Mark as read response:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to mark notification as read:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: response.url
      });
      throw new Error(`Failed to mark notification as read: ${response.status} ${response.statusText}`);
    }

    const data = await safeJsonParse(response);
    console.log('Successfully marked notification as read:', data);
    return data;
    
  } catch (error: unknown) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<NotificationActionResponse> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to mark all notifications as read:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: response.url
      });
      throw new Error(`Failed to mark all notifications as read: ${response.status} ${response.statusText}`);
    }

    const data = await safeJsonParse(response);
    return data;
  } catch (error: unknown) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId: number): Promise<NotificationActionResponse> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await safeJsonParse(response);
    
    if (!response.ok) {
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
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
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Utility function to format notification time
export const formatNotificationTime = (createdAt: string): string => {
  const date = new Date(createdAt);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Utility function to get notification icon based on type
export const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'user_registered':
    case 'project_application':
      return '📋';
    case 'user_accepted':
    case 'user_rejected':
      return '✅';
    case 'project_update':
      return '🔄';
    case 'collaboration_invite':
      return '🤝';
    case 'message':
      return '💬';
    case 'system':
      return '⚙️';
    default:
      return '🔔';
  }
};