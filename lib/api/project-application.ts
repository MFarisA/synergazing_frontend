const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';

export const applyToProject = async (token: string, projectId: string, applicationData: {
    project_role_id: string;
    why_interested: string;
    skills_experience: string;
    contribution: string;
  }) => {
    try {
      const formData = new FormData();
      formData.append('project_role_id', applicationData.project_role_id);
      formData.append('why_interested', applicationData.why_interested);
      formData.append('skills_experience', applicationData.skills_experience);
      formData.append('contribution', applicationData.contribution);

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to apply to project:', response.status, response.statusText);
        console.error('Error response:', errorText);
        throw new Error(`Failed to apply to project: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error applying to project:', error);
      throw error;
    }
  }

  export const getProjectApplications = async (token: string, projectId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get project applications:', response.status, response.statusText);
        console.error('Error response:', errorText);
        throw new Error(`Failed to get project applications: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error getting project applications:', error);
      throw error;
    }
  }

  export const getUserApplications = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get user applications:', response.status, response.statusText);
        console.error('Error response:', errorText);
        throw new Error(`Failed to get user applications: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error getting user applications:', error);
      throw error;
    }
  }

  export const reviewApplication = async (token: string, applicationId: string, action: 'accept' | 'reject', reviewNotes?: string) => {
    try {
      const formData = new FormData();
      formData.append('action', action);
      if (reviewNotes) {
        formData.append('review_notes', reviewNotes);
      }

      const response = await fetch(`${API_BASE_URL}/api/projects/applications/${applicationId}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to review application:', response.status, response.statusText);
        console.error('Error response:', errorText);
        throw new Error(`Failed to review application: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error reviewing application:', error);
      throw error;
    }
  }

  export const getApplicationDetails = async (token: string, applicationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/applications/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get application details:', response.status, response.statusText);
        console.error('Error response:', errorText);
        throw new Error(`Failed to get application details: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error getting application details:', error);
      throw error;
    }
  }

  export const withdrawApplication = async (token: string, applicationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/applications/${applicationId}/withdraw`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to withdraw application:', response.status, response.statusText);
        console.error('Error response:', errorText);
        throw new Error(`Failed to withdraw application: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Network error withdrawing application:', error);
      throw error;
    }
  }