const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';

export const getAllProjectsPublic = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/all`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        console.error('Failed to fetch projects (public):', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error fetching projects (public):', error);
      throw error;
    }
  }

export const getAllProjects = async (token: string) => {
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
  }

  export const getCreatedProjects = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/created`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        console.error('Failed to fetch created projects:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch created projects: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error fetching created projects:', error);
      throw error;
    }
  }

  export const deleteProject = async (token: string, projectId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        console.error('Failed to delete project:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to delete project: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error deleting project:', error);
      throw error;
    }
  }

  export const getProjectById = async (projectId: string, token?: string) => {
    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        headers,
      });
      if (!response.ok) {
        console.error('Failed to fetch project by ID:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch project: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error fetching project by ID:', error);
      throw error;
    }
  }