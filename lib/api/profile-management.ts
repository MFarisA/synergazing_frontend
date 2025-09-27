const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';

// Fetch user profile
export const getProfile = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return response.json();
};

// Update user profile
export const updateProfile = async (token: string, profileData: FormData) => {
  const response = await fetch(`${API_BASE_URL}/api/update-profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: profileData,
  });
  if (!response.ok) {
    throw new Error('Failed to update profile');
  }
  return response.json();
};

// Get user profile by ID (for viewing other users)
export const getUserProfile = async (token: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile-ready`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      console.error('Failed to get user profile:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to get user profile: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Network error getting user profile:', error);
    throw error;
  }
};

// Delete CV file
export const deleteCv = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/cv`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      console.error('Failed to delete CV:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to delete CV: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Network error deleting CV:', error);
    throw error;
  }
};

// Delete profile picture
export const deleteProfilePicture = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/picture`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      console.error('Failed to delete profile picture:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to delete profile picture: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Network error deleting profile picture:', error);
    throw error;
  }
};