const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';

export const createProject = async (token: string, formData: FormData) => {
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
  }

export const updateProjectStage2 = async (token: string, projectId: string, data: {
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
  }
  
  export const updateProjectStage3 = async (token: string, projectId: string, data: {
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
  }

  export const updateProjectStage4 = async (token: string, projectId: string, data: {
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
  }

  export const updateProjectStage5 = async (token: string, projectId: string, data: {
    benefits: Array<{ description: string }>;
    timeline: Array<{ name: string; status: string }>;
    tags: Array<{ name: string }>;
  }) => {
    try {
      // Stage 5 expects FormData with JSON arrays as strings
      const formData = new FormData();
      
      // Convert benefit objects to array of descriptions and stringify
      const benefitNames = data.benefits.map(benefit => benefit.description);
      formData.append('benefits', JSON.stringify(benefitNames));
      
      // Send timeline data as JSON string with proper structure
      formData.append('timeline', JSON.stringify(data.timeline));
      
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
  }