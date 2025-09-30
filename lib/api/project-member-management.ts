const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';

/**
 * Get project members
 * GET /api/projects/:project_id/members 🔒
 */
export const getProjectMembers = async (token: string, projectId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/members`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get project members:', response.status, response.statusText);
      console.error('Error response:', errorText);
      throw new Error(`Failed to get project members: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Network error getting project members:', error);
    throw error;
  }
};

/**
 * Invite member to project
 * POST /api/projects/:project_id/invite 🔒 (FormData)
 */
export const inviteMemberToProject = async (
  token: string, 
  projectId: string, 
  inviteData: {
    user_id: string;
    project_role_id: string;
  }
) => {
  try {
    const formData = new FormData();
    formData.append('user_id', inviteData.user_id);
    formData.append('project_role_id', inviteData.project_role_id);

    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/invite`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to invite member to project:', response.status, response.statusText);
      console.error('Error response:', errorText);
      throw new Error(`Failed to invite member to project: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Network error inviting member to project:', error);
    throw error;
  }
};

/**
 * Respond to project invitation
 * PUT /api/projects/:project_id/invitation/respond 🔒 (FormData)
 */
export const respondToProjectInvitation = async (
  token: string, 
  projectId: string, 
  responseData: {
    response: 'accept' | 'decline';
    message?: string;
  }
) => {
  try {
    const formData = new FormData();
    formData.append('response', responseData.response);
    
    if (responseData.message) {
      formData.append('message', responseData.message);
    }

    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/invitation/respond`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to respond to project invitation:', response.status, response.statusText);
      console.error('Error response:', errorText);
      throw new Error(`Failed to respond to project invitation: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Network error responding to project invitation:', error);
    throw error;
  }
};

/**
 * Remove member from project
 * DELETE /api/projects/:project_id/members/:user_id 🔒
 */
export const removeMemberFromProject = async (
  token: string, 
  projectId: string, 
  userId: string
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to remove member from project:', response.status, response.statusText);
      console.error('Error response:', errorText);
      throw new Error(`Failed to remove member from project: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Network error removing member from project:', error);
    throw error;
  }
};

// Additional convenience functions that might be useful

/**
 * Get project invitations for current user
 * GET /api/user/project-invitations 🔒
 * 
 * Returns invitations with detailed project and role information
 */
export const getUserProjectInvitations = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/project-invitations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get user project invitations:', response.status, response.statusText);
      console.error('Error response:', errorText);
      throw new Error(`Failed to get user project invitations: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Network error getting user project invitations:', error);
    throw error;
  }
};

/**
 * Get project member details
 * GET /api/projects/:project_id/members/:user_id 🔒
 */
export const getProjectMemberDetails = async (
  token: string, 
  projectId: string, 
  userId: string
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/members/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get project member details:', response.status, response.statusText);
      console.error('Error response:', errorText);
      throw new Error(`Failed to get project member details: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Network error getting project member details:', error);
    throw error;
  }
};

/**
 * Update project member role
 * PUT /api/projects/:project_id/members/:user_id/role 🔒 (FormData)
 */
export const updateProjectMemberRole = async (
  token: string, 
  projectId: string, 
  userId: string,
  roleData: {
    role_id: string;
  }
) => {
  try {
    const formData = new FormData();
    formData.append('role_id', roleData.role_id);

    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/members/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update project member role:', response.status, response.statusText);
      console.error('Error response:', errorText);
      throw new Error(`Failed to update project member role: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Network error updating project member role:', error);
    throw error;
  }
};
