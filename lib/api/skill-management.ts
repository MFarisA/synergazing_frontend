const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';

// Get all available skills
export const getAllSkills = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/skills/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      console.error('Failed to fetch skills:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch skills: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Network error fetching skills:', error);
    throw error;
  }
};

// Get user skills
export const getUserSkills = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/skills`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.error('Failed to fetch user skills:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch user skills: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Network error fetching user skills:', error);
    throw error;
  }
};

// Add or update user skills
export const updateUserSkills = async (token: string, skills: { skill_name: string }[]) => {
  try {
    // Create FormData object
    const formData = new FormData();
    
    // Add each skill as separate field with same name and default proficiency
    skills.forEach((skillItem) => {
      formData.append('skill', skillItem.skill_name);
      formData.append('proficiencies', '75'); // Default proficiency of 75%
    });
    
    console.log('Sending skills data:');
    skills.forEach((skillItem, index) => {
      console.log(`  skill[${index}]: ${skillItem.skill_name}`);
      console.log(`  proficiencies[${index}]: 75 (default)`);
    });
    
    const response = await fetch(`${API_BASE_URL}/api/skills`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type header - let the browser set it for FormData
      },
      body: formData,
    });
    if (!response.ok) {
      console.error('Failed to update user skills:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to update user skills: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Network error updating user skills:', error);
    throw error;
  }
};

// Delete a user skill
export const deleteUserSkill = async (token: string, skillName: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/skills/user/${skillName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.error('Failed to delete user skill:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to delete user skill: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Network error deleting user skill:', error);
    throw error;
  }
};


