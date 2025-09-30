const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';

// Send a new message
export const sendChatMessage = async (token: string, chatId: number, content: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      console.error('Failed to send message:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Network error sending message:', error);
    throw error;
  }
}

export const getChatWithUser = async (token: string, userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/with/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        console.error('Failed to get chat with user:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to get chat with user: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error getting chat with user:', error);
      throw error;
    }
  }

  export const getChatList = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        console.error('Failed to get chat list:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to get chat list: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error getting chat list:', error);
      throw error;
    }
  }

  export const getChatMessages = async (token: string, chatId: number, page: number = 1, limit: number = 50) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        console.error('Failed to get chat messages:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to get chat messages: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error getting chat messages:', error);
      throw error;
    }
  }

  export const markMessagesAsRead = async (token: string, chatId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        console.error('Failed to mark messages as read:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to mark messages as read: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error marking messages as read:', error);
      throw error;
    }
  }

  export const getUnreadNotifications = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        console.error('Failed to get unread notifications:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to get unread notifications: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error getting unread notifications:', error);
      throw error;
    }
  }

  export const getUnreadCount = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        console.error('Failed to get unread count:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to get unread count: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error getting unread count:', error);
      throw error;
    }
  }