// API client for interacting with the backend

// Use environment variable for API URL
const API_BASE_URL = 'https://synergazing.bahasakita.store' ;

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

  // Fetch user profile
  getProfile: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return response.json();
  },

  // Update user profile
  updateProfile: async (token: string, profileData: FormData) => {
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
  },

  // Get all skills
  getAllSkills: async (token: string) => {
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
  },

  // Get user skills
  getUserSkills: async (token: string) => {
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
  },

  // Add or update user skills
  updateUserSkills: async (token: string, skills: { skill_name: string, proficiency: number }[]) => {
    try {
      // Create FormData object
      const formData = new FormData();
      
      // Add each skill as separate field with same name
      skills.forEach((skillItem) => {
        formData.append('skill', skillItem.skill_name);
        formData.append('proficiencies', skillItem.proficiency.toString());
      });
      
      console.log('Sending skills data:');
      skills.forEach((skillItem, index) => {
        console.log(`  skill[${index}]: ${skillItem.skill_name}`);
        console.log(`  proficiencies[${index}]: ${skillItem.proficiency}`);
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
  },

  // Delete a user skill
  deleteUserSkill: async (token: string, skillName: string) => {
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
  },

  // Update collaboration status
  updateCollaborationStatus: async (token: string, status: string) => {
    try {
      // Create FormData object as the backend expects form values, not JSON
      const formData = new FormData();
      formData.append('status', status);
      
      console.log('Sending collaboration status request with FormData status:', status);
      
      const response = await fetch(`${API_BASE_URL}/api/profile/collaboration-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let the browser set it
        },
        body: formData,
      });
      
      if (!response.ok) {
        console.error('Failed to update collaboration status:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response details:', errorText);
        throw new Error(`Failed to update collaboration status: ${response.status} ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error updating collaboration status:', error);
      throw error;
    }
  },

  // Get collaborators with ready status
  getCollaborators: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/ready`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        console.error('Failed to fetch collaborators:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch collaborators: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error fetching collaborators:', error);
      throw error;
    }
  },

  // Project Creation API Functions
  
  // Stage 1: Create Project
  createProject: async (token: string, formData: FormData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/stage1`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let the browser set it
        },
        body: formData,
      });
      
      if (!response.ok) {
        console.error('Failed to create project:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to create project: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error creating project:', error);
      throw error;
    }
  },

  // Stage 2: Update Project Details
  updateProjectStage2: async (token: string, projectId: string, data: {
    duration: string;
    total_team: number;
    start_date: string;
    end_date?: string;
    location: string;
    budget?: string; // Changed from number to string
    registration_deadline: string;
  }) => {
    try {
      // Stage 2 expects FormData, not JSON
      const formData = new FormData();
      formData.append('duration', data.duration);
      formData.append('total_team', data.total_team.toString());
      formData.append('start_date', data.start_date);
      if (data.end_date) {
        formData.append('end_date', data.end_date);
      }
      formData.append('location', data.location);
      if (data.budget) {
        formData.append('budget', data.budget); // No longer converting to number
      }
      formData.append('registration_deadline', data.registration_deadline);

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/stage2`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let the browser set it
        },
        body: formData,
      });
      
      if (!response.ok) {
        console.error('Failed to update project stage 2:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to update project stage 2: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error updating project stage 2:', error);
      throw error;
    }
  },

  // Stage 3: Update Project Requirements
  updateProjectStage3: async (token: string, projectId: string, data: {
    time_commitment: string;
    required_skills: Array<{ name: string }>;
    conditions: Array<{ description: string }>;
  }) => {
    try {
      // Stage 3 expects FormData with JSON arrays as strings
      const formData = new FormData();
      formData.append('time_commitment', data.time_commitment);
      
      // Convert skill objects to array of skill names and stringify
      const skillNames = data.required_skills.map(skill => skill.name);
      formData.append('required_skills', JSON.stringify(skillNames));
      
      // Convert condition objects to array of descriptions and stringify
      const conditionDescriptions = data.conditions.map(condition => condition.description);
      formData.append('conditions', JSON.stringify(conditionDescriptions));

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/stage3`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let the browser set it
        },
        body: formData,
      });
      
      if (!response.ok) {
        console.error('Failed to update project stage 3:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to update project stage 3: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error updating project stage 3:', error);
      throw error;
    }
  },

  // Stage 4: Update Team & Roles
  updateProjectStage4: async (token: string, projectId: string, data: {
    roles: Array<{
      name: string;
      slots_available: number;
      description: string;
      skill_names: string[];
    }>;
    members: Array<{
      name: string;
      role_name: string;
      role_description: string;
      skill_names: string[];
    }>;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/stage4`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        console.error('Failed to update project stage 4:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to update project stage 4: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error updating project stage 4:', error);
      throw error;
    }
  },

  // Stage 5: Finalize Project
  updateProjectStage5: async (token: string, projectId: string, data: {
    benefits: Array<{ description: string }>;
    timeline: Array<{ title: string; status: string }>;
    tags: Array<{ name: string }>;
  }) => {
    try {
      // Stage 5 expects FormData with JSON arrays as strings
      const formData = new FormData();
      
      // Convert benefit objects to array of descriptions and stringify
      const benefitNames = data.benefits.map(benefit => benefit.description);
      formData.append('benefits', JSON.stringify(benefitNames));
      
      // Convert timeline objects to array of titles and stringify
      const timelineNames = data.timeline.map(timeline => timeline.title);
      formData.append('timeline', JSON.stringify(timelineNames));
      
      // Convert tag objects to array of names and stringify
      const tagNames = data.tags.map(tag => tag.name);
      formData.append('tags', JSON.stringify(tagNames));

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/stage5`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let the browser set it
        },
        body: formData,
      });
      
      if (!response.ok) {
        console.error('Failed to update project stage 5:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to update project stage 5: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error updating project stage 5:', error);
      throw error;
    }
  },

  // Delete CV file
  deleteCv: async (token: string) => {
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
  },

  // Delete profile picture
  deleteProfilePicture: async (token: string) => {
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
  },

  // Get all projects
  getAllProjects: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        console.error('Failed to fetch projects:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error fetching projects:', error);
      throw error;
    }
  },
};

export default api;