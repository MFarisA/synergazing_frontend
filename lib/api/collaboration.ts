const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';

export const updateCollaborationStatus = async (token: string, status: string) => {
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
}

export const getCollaborators = async (token: string) => {
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
}